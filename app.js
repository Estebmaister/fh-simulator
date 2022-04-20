/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @heaterFunc fuelsObject, options, humidity, airExcess
 * @version  1.00
 * @param   {fuelsObject object} valid i.e. {'CH4': 1}.
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
const {
  logger, 
  options, 
  unitConv, 
  initSystem,
  linearApprox, 
  newtonRaphson, 
  viscosityApprox,
  kw_tubes_A312_TP321
} = require('./js/utils');
const data = require('./data/data.json');
const {radSection} = require('./js/rad');
const {convSection} = require('./js/conv');
const {shieldSection} = require('./js/shield');
const {combSection} = require('./js/combustion');
const {browserProcess} = require('./js/browser');

const createParams = (opts) => {
  const
    m_fluid = unitConv.lbtokg(opts.mFluid), // kg/h
    t_in = unitConv.FtoK(opts.tIn), // (K)
    t_out= unitConv.FtoK(opts.tOut), // (K)
    miu_fluid_in = 1.45, // (cp)
    miu_fluid_out= 0.96, // (cp)
    cp_fluid_in = unitConv.CpENtoCpSI(0.676), // (kJ/kg-C)
    cp_fluid_out= unitConv.CpENtoCpSI(0.702), // (kJ/kg-C) 
    kw_fluid_in = unitConv.kwENtokwSI(0.038), // (kJ/h-m-C)
    kw_fluid_out= unitConv.kwENtokwSI(0.035); // (kJ/h-m-C)

  return {
    /** Inlet Amb Variables */
    p_atm:  opts.pAtm,         // (Pa) 
    t_fuel: opts.tFuel,        // (K) 
    t_air:  opts.tAir,         // (K)
    t_amb:  opts.tAmb,         // (K) ref
    humidity:  opts.humidity,  // (%) 
    airExcess: opts.airExcess, // (% *.01) 
    o2Excess:  opts.o2Excess,  // (% *.01) 
    
    /** Process Variables */
    t_in_conv:  t_in,       // (K) global process inlet
    t_out:      t_out,      // (K) global process outlet
    m_fluid:    m_fluid,    // (kg/h) 
    Rfi:                0,  // (h-m2-C/kJ) int. fouling factor
    Rfo:                0,  // (h-m2-C/kJ) ext. fouling factor
    efficiency: opts.effcy,         // (% *.01)
    duty_rad_dist: opts.radDist,    // (% *.01)
    heat_loss_percent: opts.hLoss,  // (% *.01)
    max_duty: unitConv.BTUtokJ(71.5276*1e3),// (kJ/h)
    miu_fluid: viscosityApprox({
      t1: t_in , v1: miu_fluid_in,
      t2: t_out, v2: miu_fluid_out
    }),                     // (cP)
    Cp_fluid: linearApprox({
      x1: t_in , y1: cp_fluid_in,
      x2: t_out, y2: cp_fluid_out
    }),                     // (kJ/kg-C) 
    kw_fluid: linearApprox({
      x1: t_in , y1: kw_fluid_in,
      x2: t_out, y2: kw_fluid_out
    }),                     // (kJ/h-m-C)

    /* 
    m_fuel: 100,     // (kg/h)
    t_out: undefined,// (K) global process out
    //*/
    
    /** Mechanic variables for heater */
    Material: 'A-312 TP321',
    h_conv: unitConv.hcENtohcSI(1.5),// (kJ/h-m2-C)
    kw_tube: kw_tubes_A312_TP321,    // (kJ/h-m-C)
    Pass_number: 2,          // - number of tube passes
    
    Pitch_rad: unitConv.intom(2*8),// (m) NPS * 2
    N_rad:  42,                    // - number of tubes 
    L_rad:  unitConv.fttom(62.094),// (m) tube effective length
    Do_rad: unitConv.intom(8.625), // (m) tube external diameter
    Sch_rad:unitConv.intom(0.322), // (m) Schedule thickness

    Width_rad:  17.50,            // (ft) width in rad sect
    Length_rad: 64.55,            // (ft) length in rad sect
    Height_rad: 27.00,            // (ft) height in rad sect
    
    N_shld: 16,                   // - number of tubes 
    L_shld: unitConv.fttom(60),   // (m) effective tube length
    Do_shld:unitConv.intom(6.625),// (m) external diameter 
    
    Pitch_sh_cnv: unitConv.intom(2*6),// (m) NPS * 2
    Sch_sh_cnv:unitConv.intom(0.28),  // (m) Schedule thickness
    Tpr_sh_cnv: 8,                    // - number of tubes per row

    N_conv: 40,                   // - number of tubes 
    L_conv: unitConv.fttom(60),   // (m) effective tube length
    Do_conv:unitConv.intom(6.625),// (m) external diameter 

    // Fin properties
    Nf:unitConv.mtoft(60),   // (#/m) Fin's number per meter
    Tf:unitConv.fttom(.005), // (m) Fin's thickness
    Lf:unitConv.fttom(0.08), // (m) Fin's height

    /** Miscellaneous */
    FinType: 'Solid',
    FinMaterial: '11.5-13.5Cr',
    FinArrange: 'Staggered Pitch',
    verbose: opts.verbose,       // True or False
    unitSystem: opts.unitSystem, // SI or English
    lang: opts.lang,             // EN or ES
    NROptions: opts.NROptions,   // {object options}
    units: initSystem(opts.unitSystem)
  }
}

const heaterFunc = (fuels, opts) => {
  const params = createParams(opts);
  //TODO: create a function for this process
  // if params.o2Excess is set, start airExcess iteration
  if (params.o2Excess != 0) {
    const comb_o2 = (airExcessVal) => {
      const combO2 = combSection(airExcessVal, fuels, params)
      logger.info( "O2%: " + combO2.flows['O2_%'] +
        " vs O2excess: " + params.o2Excess * 100)
      return combO2.flows['O2_%'] / 100 - params.o2Excess
    }
    const airExcess = newtonRaphson(comb_o2, .5, 
      params.NROptions, "o2_excess_to_air")
    if (airExcess) params.airExcess = airExcess;
  } else {
    params.airExcess = opts.airExcess
  }

  const comb_result = combSection(params.airExcess, fuels, params)
  comb_result.rad_result = radSection(params)
  comb_result.shld_result = shieldSection(params)
  comb_result.conv_result = convSection(params)
  /* calls to logs
  logger.info("Rad sect Tg: " + params.units.tempC(rad_result.t_g))
  logger.info("Fuel mass:   " + params.units.mass_flow(rad_result.m_fuel))
  //*/
  return comb_result
}

let fuelsObject = { 
  H2:     .1142, N2:   .0068, CO:   .0066, CO2: .0254, 
  CH4:    .5647, C2H6: .1515, C3H8: .0622, C4H10: .0176, 
  iC4H10: .0075, C2H4: .0158, C3H6: .0277,
}
// Fuel for debugging purpose
// fuelsObject ={
//   CH4: 1,
//   // H2: .7, O2: .2, N2: .1
// }

if (typeof window !== 'undefined') {
  browserProcess(fuelsObject, data, options, heaterFunc)
} else {
  /** 
  const result = heaterFunc(fuelsObject, options)
  logger.info(JSON.stringify(fuelsObject))
  logger.info(JSON.stringify(options))
  logger.debug(JSON.stringify(result, null, 2))
  */
  heaterFunc(fuelsObject, options)
}