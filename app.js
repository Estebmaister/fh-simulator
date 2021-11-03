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
const {newtonRaphson, options, logger, round, units} = require('./js/utils');
const {combSection} = require('./js/combustion');
const {radSection} = require('./js/rad');
const {shieldSection} = require('./js/shield');
const data = require('./data/data.json');


const createParams = (options) => {
  const params = {
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
  return params
}

const combustion = (fuels, options) => {
  const params = createParams(options)
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
  H2: .1142,
  N2: .0068,
  CO: .0066,
  CO2: .0254,
  CH4: .5647,
  C2H6: .1515,
  C3H8: .0622,
  C4H10: .0176,
  iC4H10: .0075,
  C2H4: .0158,
  C3H6: .0277,
}
// fuels ={
//   H2: .8,
//   O2: .2
// }

if (typeof window !== 'undefined') {

  const extractURIdata = (argumentsArray) => {
    if (argumentsArray == "") return {};
    let resultObject = {};
    for (let i = 0; i < argumentsArray.length; ++i)
    {
      const argumentPair = argumentsArray[i].split('=', 2);
      if (argumentPair.length == 1) {
        resultObject[argumentPair[0]] = "";
      }
      else {
        resultObject[argumentPair[0]] = decodeURIComponent(
          argumentPair[1].replace(/\+/g, " ")
          );
      }
    }
    return resultObject;
  }
  const insertBrowserData = (browserData, fuels, data, options) => {
    const browserFuels = {}
    const fuelCompounds = data.filter( element => element.Formula in browserData )
    for (const key in browserData) {
      const compoundArray = fuelCompounds.filter(element => element.Formula == key)
      if (compoundArray.length === 1 && browserData[key] !== "") {
        const fuelFrac = parseFloat(browserData[key])
        if (fuelFrac > 0 && fuelFrac <= 100) {
          browserFuels[key] = fuelFrac/100
        } else {
          logger.error(`fuel fraction invalid (${fuelFrac}) for ${key}`)
        }
      } else if (browserData[key] !== "") {
        let optValue
        switch (key) {
          case "project_title":
            
            break;
          case "project_n":
            
            break;
          case "revision_n":
            
            break;
          case "date":
            
            break;
          case "t_amb":
            logger.debug(key, browserData[key])
            optValue = parseFloat(browserData[key])
            if (optValue > -options.tempToK && optValue < 100) 
              options.tAmb = optValue +options.tempToK;
            break;
          case "humidity":
            logger.debug(key, browserData[key])
            optValue = parseFloat(browserData[key])
            if (optValue >= 0 && optValue <= 100) 
              options.humidity = optValue;
            break;
          case "p_atm":
            logger.debug(key, browserData[key])
            optValue = parseFloat(browserData[key])
            if (optValue > 1e-3 && optValue < 1e3) 
              options.pAtm = optValue *1e3;
            break;
          case "air_excess":
            logger.debug(key, browserData[key])
            optValue = parseFloat(browserData[key])
            if (optValue >= 0 && optValue <= 300) 
              options.airExcess = optValue * .01;
            break;
          case "o2_excess":
            logger.debug(key, browserData[key])
            optValue = parseFloat(browserData[key])
            if (optValue >= 0 && optValue <= 30) 
              options.o2Excess = optValue * .01;
            break;
          case "o2_basis":
            
            break;
          case "t_fuel":
            
            break;
          case "fuel_percent":
            
            break;
          default:
            break;
        }
      }
    }

    if (Object.keys(browserFuels).length !== 0) fuels = browserFuels
  }
  const browserData = extractURIdata(window.location.search.substr(1).split('&'));
  if (browserData !== {}) insertBrowserData(browserData, fuels, data, options)

  const result = combustion(fuels, options)
  logger.debug(JSON.stringify(result, null, 2))
  logger.debug(JSON.stringify(browserData, null, 2))

  document.getElementById("loader-wrapper").remove();
  document.getElementById("output-data").textContent = JSON.stringify({...result}, null, 2);
} else {
  const result = combustion(fuels, options)
  logger.debug(JSON.stringify(result, null, 2))
}

module.exports = {
  combustion
};