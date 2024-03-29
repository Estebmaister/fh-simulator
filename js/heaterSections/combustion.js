const { newtonRaphson, options, logger,
  round, roundDict, initSystem,
  normalize, flueViscosity, flueThermalCond
} = require('../utils');
const data = require('../../data/data.json');
const dryAirN2Percentage = 79.05;
const dryAirO2Percentage = 20.95;
const N2O2relation = dryAirN2Percentage/dryAirO2Percentage;
const dryAir = {
  O2: .01 * dryAirO2Percentage,
  N2: .01 * dryAirN2Percentage,
  H2O: 0
};

/** Check if the percentages of the fuels sums 100%.
 * In case of check fail an error will be attached to the result.
*/
const checkObjectFraction = (fuels, result = {}) => {
  const total = Object.values(fuels).reduce((acc, value)=> acc + value)
  const tolerance = 3e-12
  const check1 = Math.abs(1 - total) <= tolerance
  if (!check1) result.err += `[fuel fraction not equal to 1,` + 
    ` total: ${total}. fuels: ${Object.keys(fuels)}],`;
  return check1;
};

/** Check if all the components in the fuels are in the data filtered.
 * In case of a bad fuel entered an error will be attached to the result.
*/
const checkFuelData = (fuels, compounds, result = {}) => {
  const badFuels = Math.abs(compounds.length - 
    Object.keys(fuels).length);
  const check1 = badFuels === 0;
  if (!check1) {
    logger.error(`fuels not found in the database: ${badFuels}`);
    result.err += 
      `[some fuels aren't in the database, #badFuels: ${badFuels}],`;
  }
  return check1;
};

/** (kJ/kg K) to call returning function use Kelvin units 
  * if you want a result in (kJ/kmol K) units, multiply the
  * result by MW or call this with second argument set to true.
 */
const Cp0 = ({c0, c1, c2, c3, MW, Substance}, molResult, noLog) => {
  // Cp equation from table A.6 Van Wylen
  // temp = T [Kelvin]
  return (temp) => {
    // Approximate equation valid from 250 K to 1200 K.
    if (temp < 250 && !noLog) logger.debug(`"Cp0", "temp": "${round(temp)}",`+
      `"Msg": "${Substance} bellow range for Cp0 formula"`);
    if (temp > 1200&& !noLog) logger.debug(`"Cp0", "temp": "${round(temp)}",`+
      `"Msg": "${Substance} above range for Cp0 formula"`);
    if (c0 === "-") {
      logger.debug(`"Cp0", "Msg": "Wrong use, called for compound `+
      `${Substance}, no data found"`);
      return 0;
    }
    if (molResult) return MW *(
      c0 + c1*(temp*.001) + c2*(temp*.001)**2 + c3*(temp*.001)**3);
    return (c0 + c1*(temp*.001) + c2*(temp*.001)**2 + c3*(temp*.001)**3)
  }
};

/** (kJ/kg K) argument needs to be a fuel object,
* ie: { CH4: 0.323, ... }
* if you want a result in (kJ/kmol K) units, call it with 
* second argument set to true.
*/
const Cp_multicomp = (fuels, molResult, noLog) => {
  if (fuels.length === 0) return (_t) => 0
  // making a deep copy and normalize if needed
  let normalFuel = JSON.parse(JSON.stringify(fuels));
  if (!checkObjectFraction(fuels)) 
    normalFuel = normalize(normalFuel, "Cp_multicomp", noLog);
  const fuelComps = data.filter(elem => elem.Formula in normalFuel);
  const cps = [];
  let i = 0;
  for (const fuel in normalFuel) {
    cps[i] = (t) => normalFuel[fuel] * Cp0(
      fuelComps.filter(elem => elem.Formula == fuel)[0], molResult
    )(t);
    i++;
  }
  
  return cps.reduce((acc, val) => ((t) => acc(t) + val(t)), (_t) => 0);
};

/** (kg/kmol) argument needs to be a fuel object,
* ie: { CH4: 0.323, ... }
*/
const MW_multicomp = (fuels, noLog) => {
  if (fuels.length === 0) return (_t) => 0;
  // making a deep copy and normalize if needed
  let normalFuel = JSON.parse(JSON.stringify(fuels));
  if (!checkObjectFraction(fuels)) 
    normalFuel = normalize(normalFuel, "MW_multicomp", noLog);
  const fuelComps = data.filter(elem => elem.Formula in normalFuel);
  let MWs = 0;
  for (const fuel in normalFuel) {
    MWs += fuelComps.filter(elem => elem.Formula == fuel)[0].MW * 
    normalFuel[fuel];
  }
  return MWs;
};

/** (Pa) Temperature should be in K, humidity %[0,100] */
const pressureH2OinAir = (temperature, relativeHumidity) => {
  // Equation from Reference: Tetens, O., 1930

  // This eq uses temp in °C
  const temp = temperature - options.tempToK;
  // ps is the saturation vapour pressure, in pascals,
  let ps = 610.78*Math.exp(temp/(temp+238.3)*17.2694);
  // correction for ice temperature:
  if (temp <= 0) ps = -4.86 + 0.855*ps + 0.000244*ps**2;
  // result pw is the actual water vapour pressure.
  return ps * relativeHumidity * 0.01;
};

/** Temperature should be in K, humidity %[0,100] */
const moistAirWeightRatio = (temperature, relativeHumidity) => {
  const pw = pressureH2OinAir(temperature, relativeHumidity)
  // returned value is the weight ratio of water vapour and dry air. 
  // (kg-w_vap/kg-dry_a)
  return data[31].MW * pw / 
  ( MW_multicomp(dryAir) * (options.pAtm - pw ) );
  // a simplification can be: 0.62 * 1e-5 * pw
  
  /* weight ratio converted to water per oxygen in air
  const w = data[31].MW * pw / 
    ( MW_multicomp(dryAir) * (options.pAtm - pw ) );
  return w * 7.655;
  //*/
};

/** (kJ/kmol), Enthalpy of formation plus delta enthalpy 
  * returns a function if no temp is passed */
const deltaH = (compound, t) => {
  if (compound.Cp0 === '-') {
    if (compound.h0 === '-') {
      logger.warn(`wrong use of deltaH func,`+
        ` called for compound ${compound.Substance} without data`);
      if (t === undefined) return () => 0;
      return 0;
    }
    if (t === undefined) return () => compound.h0
    return compound.h0;
  }
  // hf0 + deltaH(tempAmbRef -> t)
  if (t === undefined) return (temp) => compound.h0 +(temp-options.tempAmbRef)*
    Cp0(compound,true, true)((options.tempAmbRef+temp)/2);

  return compound.h0 + (t-options.tempAmbRef)*
    Cp0(compound,true, true)((options.tempAmbRef+t)/2);
};

/** (kJ/kmol), Enthalpy of combustion for a certain compound 
  * returns a function if no temp is passed */
const combustionH = (compound, t, tIni, liquidWater = false) => {
  // hrp = HP - HR // H = H0 + deltaH  // H0 = n(hf)
  // SumR n_i*(hf + deltaH)_i = SumP n_e*(hf + deltaH)_e

  const 
    co2_H = deltaH( data[6]  ),
    so2_H = deltaH( data[34] ),
    o2_H  = deltaH( data[2]  );
  let h2o_H = deltaH(data[31]); // gas lower heating value 
  // higher heating value
  if (liquidWater === true) h2o_H = deltaH(data[32]); // liq
  // making tIni equal to t_amb if not specified
  if (tIni === undefined) tIni = options.tAmb;

  if (t === undefined) return (tempParam) => compound.CO2*co2_H(tempParam) 
    + compound.SO2*so2_H(tempParam) +compound.H2O*h2o_H(tempParam)
    - deltaH(compound)(tIni) - compound.O2*o2_H(tIni);
  
  // SumR n_i*(hf + deltaH)_i = SumP n_e*(hf + deltaH)_e
  return ( compound.CO2*co2_H(t) +compound.SO2*so2_H(t) +compound.H2O*h2o_H(t)
    - deltaH(compound)(tIni) - compound.O2*o2_H(tIni) );
};

/** (kJ/kg) Enthalpy of combustion for a certain fuel mix */
const ncv = (fuels, products, compounds, tAmb, gcv = false) => {
  let value = 0;
  for (const fuel in fuels) {
    if (fuel in products) continue;
    const compound = compounds.filter(elem => elem.Formula == fuel)[0]
    value += fuels[fuel]*combustionH(compound, undefined, tAmb, gcv)(tAmb);
    //logger.info(`H of combustion for ${fuel}: ` +
    // `${combustionH(compound)(tAmb)/compound.MW} KJ/Kg` )
  }
  return value;
};

/**Temp unit (K)
* Internal units (kJ/kmol)
* Function to create the adiabatic flame equation 
* used in the newton raphson method to find adFlame temp */
const adFlame = (normalFuels, products, tIni, o2required) => {
  if (tIni === undefined) tIni = options.tAmb;
  if (o2required === undefined) o2required = 0;
  const 
    fuelCompounds = data.filter(elem => elem.Formula in normalFuels),
    // ..._H = (t) => hf0 + MW * Cp(t_prom) * (t - t_amb)
    o2_H =  deltaH(data.filter(elem => elem.Formula == "O2")[0]),
    n2_H =  deltaH(data.filter(elem => elem.Formula == "N2")[0]),
    co2_H = deltaH(data.filter(elem => elem.Formula == "CO2")[0]),
    h2o_H = deltaH(data.filter(elem => elem.Formula == "H2O")[0]),
    so2_H = deltaH(data.filter(elem => elem.Formula == "SO2")[0]);

  // Products enthalpy at the new temp minus dry air inlet
  const pEnthalpy = (t) => products.O2*o2_H(t) + products.SO2*so2_H(t) +
    products.H2O*h2o_H(t) + products.CO2*co2_H(t) + 
    products.N2*n2_H(t) - products.N2*n2_H(tIni) - o2required*o2_H(tIni);
  
  // Reactants enthalpy (fuel)
  const rEnthalpy = [];
  let i = 0;
  for (const fuel in normalFuels) {
    // fuelFraction * [hf0 + MW * Cp(t_prom) * (tIni - t_amb)]
    rEnthalpy[i] = normalFuels[fuel]*deltaH(
      fuelCompounds.filter(elem => elem.Formula == fuel)[0]
    )(tIni);
    i++;
  }
  
  // SR ni*(hf + deltaH)i = SP ne*(hf + deltaH)e
  return (t) => pEnthalpy(t) - rEnthalpy.reduce((acc, value)=> acc + value);
};

/** For every element in the fuel compounds 
 * calculates every product of combustion per fuel element
 * filling the product object.
*/
const combPerFuelCompound = (compounds, products, normalFuel) => {
  for (const elem of compounds) {
    for (const product in products) {
      if (product == 'N2') {
        if (elem['Formula'] == 'N2' || elem['Formula'] =='"N2a') {
          products[product] += normalFuel[elem['Formula']];
          continue;
        }
        products[product] += elem['O2']*normalFuel[elem['Formula']]*N2O2relation;
        continue;
      }
      products[product] += elem[product]*normalFuel[elem['Formula']];
      // logger.default(`${elem['Formula']} req = ${product} ` +
      //   `${elem[product]*normalFuel[elem['Formula']]}` )
    }
  }
}

/** In this process the params object will be updated
*  in every function call with the combustion data
*/
const combSection = (airExcess, fuels, params, onlyO2) => {
  if (!onlyO2) logger.debug(`"airExcess", "value": ${airExcess}`);
  const units = initSystem(params.unitSystem);
  const moisture_val = moistAirWeightRatio(
    params.t_air, params.humidity
  );
  const debug_data = {
    err: "",
    atmPressure:     units.pressure(params.p_atm),
    fuelTemperature: units.tempC(params.t_fuel,0),
    ambTemperature:  units.tempC(params.t_amb,0),
    airTemperature:  units.tempC(params.t_air,0),
    "humidity_%": params.humidity,
    "dryAirN2_%": round(dryAirN2Percentage,2),
    "dryAirO2_%": round(dryAirO2Percentage,2),
    moisture:   units.moist(moisture_val),
    spGrav: params.sp_grav,
    cpFluidTb: units.cp(params.Cp_fluid((params.t_in_conv + params.t_out) /2)),
    unitSystem: units.system[params.lang]
  };
  const compounds = data.filter((elem, _i, _arr) => elem.Formula in fuels)

  let normalFuel = {...fuels};
  if (!checkObjectFraction(fuels, debug_data)) 
    normalFuel = normalize(fuels, "combSection");
  checkFuelData(normalFuel, compounds, debug_data);

  const products = {O2:0, N2:0, H2O:0, CO2:0, SO2:0}, air = {...dryAir};

  // filling products object with stoichiometric ratio
  combPerFuelCompound(compounds, products, normalFuel);

  // air excess and humidity shouldn't be less than 0
  if (airExcess - 0.000001 < 0) airExcess = 0;
  if (params.humidity - 0.000001 < 0) params.humidity = 0;
  /** Percentage of O2 in excess = 100% + x% airExcess */
  let o2required = products['O2'];
  let o2excess = o2required * (1 + airExcess);
  // If O2 requirements are negative 
  if (products['O2'] <= 0 || products['N2'] < 0) {
    logger.error(`airExcess set to 0, O2 in fuel >= O2 needed.`+
    ` Products: {O2:${products['O2']}, N2:${products['N2']}}`);
    o2excess   = 0;
    o2required = 0;
    products['N2'] = normalFuel['N2'];
    products['O2'] = -products['O2'];
  } else {
    const 
      waterPressure  = pressureH2OinAir(params.t_air, params.humidity),
      dryAirPressure = params.p_atm - waterPressure;
    air.N2  = .01* dryAirN2Percentage* dryAirPressure / params.p_atm;
    air.O2  = .01* dryAirO2Percentage* dryAirPressure / params.p_atm;
    air.H2O = waterPressure / params.p_atm;
    
    debug_data.dryAirPressure = units.pressure(dryAirPressure);
    debug_data.waterPressure  = units.pressure(waterPressure);
    debug_data["H2OPressure_%"] = round(100 * air.H2O);
    debug_data["N2Pressure_%"]  = round(100 * air.N2);
    debug_data["O2Pressure_%"]  = round(100 *air.O2);

    products['O2'] = o2excess -products['O2']; // Subs O2 used in combustion
    products['N2']  += products['O2']*(air.N2/air.O2);
    products['H2O'] += products['N2']*(waterPressure/(air.N2*params.p_atm));
  }

  let totalPerMol = 0, totalPerM_Dry = 0;
  for (const product in products) {
    totalPerMol += products[product];
    if (product !== 'H2O') totalPerM_Dry += products[product];
  }
  debug_data["CO2"]  = products["CO2"]
  const flows = {
    total_flow: totalPerMol,
    dry_total_flow: totalPerM_Dry,
    // 'O2%_DRY': 100*products['O2'] /totalPerM_Dry,
    // 'CO2%_DRY':100*products['CO2']/totalPerM_Dry,
    // 'N2%_DRY': 100*products['N2'] /totalPerM_Dry,
    'N2_%': 100*products['N2'] /totalPerMol,
    'H2O_%':100*products['H2O']/totalPerMol,
    'CO2_%':100*products['CO2']/totalPerMol,
    'O2_%': 100*products['O2'] /totalPerMol,
    
    moisture_val,

    O2_mol_req_theor: o2required,
    O2_mass_req_theor:units.mass(o2required * data[2].MW),
    'air_excess_%':   100 * params.airExcess,
    AC:               o2excess / air.O2,
    AC_theor_dryAir:  o2required / (.01 * dryAirO2Percentage),
    AC_mass:          o2excess / air.O2 * 
      MW_multicomp(air)/MW_multicomp(normalFuel),
    AC_mass_theor_moistAir: o2required / air.O2 * 
      MW_multicomp(air)/MW_multicomp(normalFuel),

    fuel_MW: MW_multicomp(normalFuel),
    Cp_fuel: Cp_multicomp(normalFuel),

    flue_MW: MW_multicomp(products,onlyO2),
    Cp_flue: Cp_multicomp(products,false,onlyO2)
  };

  if (onlyO2) return {flows, products, debug_data};

  /** Adding results in parameters to be used in following sections */

  params.m_flue_ratio = totalPerMol * 
    flows.flue_MW/MW_multicomp(normalFuel);  // kg/h
  params.m_air_ratio  = o2excess / air.O2 * 
    MW_multicomp(air)/MW_multicomp(normalFuel); // kg/h

  params.Pco2 = products['CO2']/totalPerMol; // fraction
  params.Ph2o = products['H2O']/totalPerMol; // fraction

  // Functions of temp (kJ/kg-K)
  params.Cp_air  = Cp_multicomp(air);
  params.Cp_fuel = Cp_multicomp(normalFuel);
  params.Cp_flue = flows.Cp_flue;
  params.miu_flue= flueViscosity( data, products );
  params.kw_flue = flueThermalCond(data, products);
  flows.Cp_fuel_val  = flows.Cp_fuel(params.t_fuel);
  flows.Cp_fuel  = units.cp(flows.Cp_fuel_val);
  flows.Cp_flue  = units.cp(flows.Cp_flue(params.t_air));
  flows.flue_MW  = units["mass/mol"](flows.flue_MW);

  params.NCV = -ncv(normalFuel, products, compounds, params.t_amb)/
    MW_multicomp(normalFuel); // kJ/kg
  params.GCV = -ncv(normalFuel, products, compounds, params.t_amb, true)/
    MW_multicomp(normalFuel); // kJ/kg
  flows.NCV = units["energy/mass"](params.NCV,0);
  flows.GCV = units["energy/mass"](params.GCV,0);
  flows.NCV_val = params.NCV;
  flows.GCV_val = params.GCV;

  params.adFlame = newtonRaphson(
    adFlame(normalFuel, products, params.t_amb, o2excess),
    2000, params.NROptions, "fuel_adFlame");
  logger.info( `Adiabatic flame temp: [${round(params.adFlame)} K]`+
    ` ${units.tempC(params.adFlame)}`);
  flows.adFlame = params.adFlame;

  roundDict(products);
  if (debug_data.err == "") delete debug_data.err;
  return {flows, products, debug_data, fuel: normalFuel};
};

module.exports = {
  combSection
};