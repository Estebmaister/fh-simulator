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
const {newtonRaphson, options, logger, linearApprox, unitConv, initSystem} = require('./js/utils');
const {combSection} = require('./js/combustion');
const {radSection} = require('./js/rad');
const {shieldSection} = require('./js/shield');
const {browserProcess} = require('./js/browser');
const data = require('./data/data.json');

const createParams = (options) => {
  const params = {
    /** Inlet Amb Variables */
    p_atm: options.pAtm,          // (Pa) 
    t_air: options.tAmb,          // (K) (atm) 
    t_fuel: options.tAmb,         // (K) (atm) 
    t_amb: options.tAmb,          // (K) 
    humidity: options.humidity,   // (%) 
    airExcess: options.airExcess, // (% * .01) 
    o2Excess: options.o2Excess,   // (% * .01) 
    
    /** Process Variables */
    Rfi:                0,  // (h-m2-C/kJ)
    duty_conv_dist:    .3,  // (-)
    efficiency:        .8,  // (-)
    heat_loss_percent: .015,// (% * .01)
    max_duty: 
      unitConv.BTUtokJ(
        71.5276 * 1e3),     // (kJ/h)
    m_fluid: 500_590,       // (kg/h) 
    miu_fluid: linearApprox({
      x1:unitConv.FtoK(678),y1:1.45,
      x2:unitConv.FtoK(772),y2:0.96
    }),                     // (cP)
    Cp_fluid: linearApprox({
      x1:unitConv.FtoK(678),y1:unitConv.CpENtoCpSI(0.676),
      x2:unitConv.FtoK(772),y2:unitConv.CpENtoCpSI(0.703)
    }),                     // (kJ/kg-C) 
    kw_fluid: linearApprox({
      x1:unitConv.FtoK(678),y1:unitConv.kwENtokwSI(0.038),
      x2:unitConv.FtoK(772),y2:unitConv.kwENtokwSI(0.035)
    }),                     // (kJ/h-m-C)

    t_in_conv:unitConv.FtoK(678), // (K) 
    t_out:    unitConv.FtoK(772), // (K) global process out
    /* 
    m_fuel: 100,      // (kg/h)
    t_out: undefined, // (K) global process out
    */
    
   /** Mechanic variables for heater */
   //TODO: This value for CtoC should not be used. 
    CtoC: unitConv.intom(2),  // (m) center to c tube distance
    h_conv: unitConv.BTUtokJ(1.5) /unitConv.RtoK(1)/ 
      (unitConv.fttom(1)**2), // (kJ/h-m2-C)
    kw_tube: unitConv.BTUtokJ(11.508) / unitConv.RtoK(1) /
      unitConv.fttom(1),      // (kJ/h-m-C)
    Pass_number: 2,           // - number of tube passes

    Pitch_rad: unitConv.intom(8), // (m) NPS
    N_rad: 42,                    // - number of tubes 
    L_rad: unitConv.fttom(60),    // (m) tube effective length
    Do_rad: unitConv.intom(8.625),// (m) tube external diameter
    Sch_rad:unitConv.intom(0.322),// (m) Schedule thickness
    Di_rad: unitConv.intom(8.625 - 0.322),// (m) tube internal diameter

    Width_rad:  17.50,            // (ft) width in rad sect
    Length_rad: 64.55,            // (ft) length in rad sect
    Height_rad: 27.00,            // (ft) height in rad sect
    
    N_cnv: 40,                    // - number of tubes 
    L_cnv: unitConv.fttom(60),    // (m) effective tube length
    Do_cnv:unitConv.intom(6.625), // (m) external diameter 
    Sch_cnv:unitConv.intom(0.28), // (m) Schedule thickness
    
    Pitch_shld: unitConv.intom(6),// (m) NPS
    N_shld: 16,                   // - number of tubes 
    L_shld: unitConv.fttom(60),   // (m) effective tube length
    Do_shld:unitConv.intom(6.625),// (m) external diameter 

    /** Miscellaneous */
    unitSystem: options.unitSystem, // SI or English
    lang: options.lang,             // EN or ES
    NROptions: options.NROptions,   // {object options}
    units: initSystem(options.unitSystem)
  }
  return params
}

const combustion = (fuels, options) => {
  const params = createParams(options);
  //TODO: create a function for this process
  // if params.o2Excess is set, start airExcess iteration
  if (params.o2Excess != 0) {
    const comb_o2 = (airExcess) => {
      const combO2 = combSection(airExcess, fuels, params)
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
  /*
  logger.info("Rad sect Tg: " + params.units.tempC(rad_result.t_g))
  logger.info("Fuel mass:   " + params.units.mass_flow(rad_result.m_fuel))
  shieldSection(params)
  convSection(params)
  // */
  return comb_result
}

let fuels = { 
  H2:     .1142, N2:   .0068, CO:   .0066, CO2: .0254, 
  CH4:    .5647, C2H6: .1515, C3H8: .0622, C4H10: .0176, 
  iC4H10: .0075, C2H4: .0158, C3H6: .0277,
}
// fuels ={
//   CH4: 1,
//   // H2: .7, O2: .2, N2: .1
// }

if (typeof window !== 'undefined') {
  browserProcess(fuels, data, options, combustion)
} else {
  // logger.info(JSON.stringify(fuels))
  // logger.info(JSON.stringify(options))
  const result = combustion(fuels, options)
  logger.debug(JSON.stringify(result, null, 2))
}