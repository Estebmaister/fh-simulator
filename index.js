/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @combustion fuels, options, humidity, airExcess
 * @version  1.00
 * @param   {fuels object} valid i.e. {'CH4': 1}.
 * @return  {result object} flows, products
 * 
 * @author  Esteban Camargo
 * @date    17 Jul 2021
 * @call    node . true true 25 70 80 1e5
 * @callParams verbose, check for changes in csv, t_amb, humidity, air_excess, p_amb
 * 
 * Note: No check is made for NaN or undefined input numbers.
 *
 *****************************************************************/
const updateData = (fromCSV) => {
  if (!fromCSV) return
  const fs = require('fs');
  const dataPaths = {
    csv: __dirname + "/data.csv",
    json: __dirname + "/js/data.json"
  }  
  const parse = require('csv-parse/lib/sync');
  logger.info("Starting data extraction for Simulator")
  const CompoundsArray = parse(fs.readFileSync(dataPaths.csv), {
    columns: true,
    skip_empty_lines: true,
    cast: true
  })

  fs.writeFileSync(dataPaths.json, JSON.stringify(CompoundsArray, null, 2))
  logger.info('JSON file successfully updated');
};
const {newtonRaphson, options, logger, round, units} = require('./js/utils');
updateData(options.processData)
const {combSection} = require('./js/combustion');
const {radSection} = require('./js/rad');
const {shieldSection} = require('./js/shield');

const combustion = (fuels, options, params) => {
  //TODO: create a function for this process
  // if params.o2Excess is set, start airExcess iteration
  if (params.o2Excess != 0) {
    const comb_o2 = (airExcess) => {
      combO2 = combSection(airExcess, fuels, params)
      logger.info( "O2%: " + combO2.flows['O2_%'] +
        " vs O2excess: " + params.o2Excess * 100)
      return combO2.flows['O2_%'] / 100 - params.o2Excess
    }
    const airExcess = newtonRaphson(comb_o2, .5, 
      params.NROptions, "o2_excess_to_air")
    if (airExcess != false) {
      params.airExcess = airExcess
    }
  } else {
    params.airExcess = options.airExcess
  }

  const comb_result = combSection(params.airExcess, fuels, params)
  const rad_result = radSection(params)
  logger.info( "Radiant section (K) Tg: " + rad_result.Tg)
  logger.info("Fuel mass (kmol) " + rad_result.m_fuel)
  /*
  shieldSection(params)
  convSection(params)
  // */

  return comb_result
}

let fuels = {
  // O2: 0,
  CH4: .5647,
  C2H6: .1515,
  C3H8: .0622,
  C4H10: .0176,
  iC4H10: .0075,
  C2H4: .0158,
  C3H6: .0277,
  CO: .0066,
  H2: .1142,
  N2: .0068,
  CO2: .0254,
}
// fuels ={
//   H2: .8,
//   O2: .2
// }

let params = {
  Cp_fluid: 2.5744 * 105.183, /** (kJ/kmol-K) */
  m_fluid: 225_700 / 105.183, /** (kmol/h) */

  // Mechanic variables for heater
  N: 60, /** - number of tubes in rad section */
  N_shld: 8, /** - number of shield tubes */
  L: 20.024, /** (m) effective tube length*/
  Do: 0.219, /** (m) external diameter rad section */
  CtoC: 0.394, /** (m) center to center distance of tube */
  F: 0.97, /** - emissive factor */
  alpha: 0.835, /** - alpha factor */
  alpha_shld: 1, /** - alpha shield factor */
  pi: Math.PI,

  p_atm: options.pAtm, /** Pa */

  // Temperatures
  t_in_conv: 210 + options.tempToK, // K (process in rad sect)
  t_air: options.tAmb, // K (atm)
  t_fuel: options.tAmb, // K (atm)
  t_amb: options.tAmb, // K
  
  // NewtonRaphson
  NROptions: options.NROptions,

  // Variables
  humidity: round(options.humidity), // %
  airExcess: options.airExcess, // % * 0.01
  o2Excess: options.o2Excess, // % * 0.01
  // t_out: 355 + options.tempToK, // K (process global)
  t_out: undefined, // 628.15 - 315 K (process global)
  m_fuel: 100, /** (kmol/h) */
  //TODO: let duty be a variable
  // t_in_rad: 250 + options.tempToK, // K (process in rad sect)
  // t_stack: 400 + options.tempToK, //TODO: (This isn't used) - K (flue gases out)
}

const result = combustion(fuels, options, params)
logger.debug(JSON.stringify(result, null, 2))

module.exports = {
  combustion
};