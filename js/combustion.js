/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @combSection fuels, options, humidity, airExcess
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
const {newtonRaphson, options, logger, round, roundDict, units} = require('./utils');
const data = require('./data.json')
const dryAirN2Percentage = 79.05
const dryAirO2Percentage = 20.95

//TODO: expanse the use of the error in result dictionary
/** Check if the percentages of the fuels sums 100% 
* opt. 2 Check if all the components in the fuels are in the data filtered
*/
const checkFuelPercentage = (fuels, compounds, result = {}) => {
  // Check if the percentages of the fuels sums 100% 
  const fuelPercentage = Object.values(fuels).reduce((acc, value)=> acc + value)
  const tolerance = 3e-12
  const check1 = Math.abs(1 - fuelPercentage) <= tolerance
  if (!check1) result.err += `fuel percentage not equal to 100, fp: ${fuelPercentage*100}.`
  if (compounds == undefined) return check1
  // Check if all the components in the fuels are in the data filtered
  const badFuels = Math.abs(compounds.length - Object.keys(fuels).length)
  const check2 = badFuels === 0
  if (!check2) result.err += `some fuels aren't in the database, #badFuels: ${badFuels}`
  return check1 && check2
}

/** Normalize an object of fuels/products */
const normalize = (fuels) => {
  normalFuel = {...fuels}
  total = Object.values(normalFuel).reduce((acc, value)=> acc + value)
  for (const fuel in normalFuel) {
    normalFuel[fuel] = normalFuel[fuel]/total
  }
  return normalFuel
}

/** (kJ/kg K) to call returning function use Kelvin units 
  * if you want a result in (kJ/kmol K) units, multiply the
  * result by MW or call this with second argument set to true.
 */
const Cp0 = ({c0, c1, c2, c3, MW, Substance}, molResult) => {
  // Cp equation from table A.6 Van Wylen
  // Teta = T(Kelvin)
  return (teta) => {
    // Approximate equation valid from 250 K to 1200 K.
    if (teta < 250) {
      if (options.verbose) logger.warn(`temp [${round(teta)}] bellow range for Cp0 formula`)
    } else if (teta > 1200) {
    if (options.verbose) logger.warn(`temp [${round(teta)}] above range for Cp0 formula`)
    }
    if (c0 === "-") {
      logger.warn(`wrong use of Cp0, called for compound ${Substance}, no data found`)
      return 0
    }
    if (molResult) return MW*(c0 + c1*(teta*.001) + c2*(teta*.001)**2 + c3*(teta*.001)**3)
    return (c0 + c1*(teta*.001) + c2*(teta*.001)**2 + c3*(teta*.001)**3)
  }
}

/** (kJ/kg K) argument needs to be a fuel object,
* ie: { CH4: 0.323, ... }
* if you want a result in (kJ/kmol K) units, call it with 
* second argument set to true.
*/
const Cp_multicomp = (fuels, molResult) => {
  if (fuels.length === 0) return (t) => 0
  // making a deep copy and normalize if needed
  let normalFuel = JSON.parse(JSON.stringify(fuels));
  if (!checkFuelPercentage(fuels)) {
    normalFuel = normalize(normalFuel)
  }
  const fuelCompounds = data.filter( element => element.Formula in normalFuel )
  let i = 0
  const cps = []
  for (const fuel in normalFuel) {
    const compound = fuelCompounds.filter(element => element.Formula == fuel)[0]
    cps[i] = (t) => normalFuel[fuel] * Cp0(compound, molResult)(t)
    i++
  }
  
  return cps.reduce((acc, value) => ((t) => acc(t) + value(t)), (t) => 0)
}

/** (kg/kmol) argument needs to be a fuel object,
* ie: { CH4: 0.323, ... }
*/
const MW_multicomp = (fuels) => {
  if (fuels.length === 0) return (t) => 0
  // making a deep copy and normalize if needed
  let normalFuel = JSON.parse(JSON.stringify(fuels));
  if (!checkFuelPercentage(fuels)) {
    normalFuel = normalize(normalFuel)
  }
  const fuelCompounds = data.filter( element => element.Formula in normalFuel )
  let MWs = 0
  for (const fuel in normalFuel) {
    const compound = fuelCompounds.filter(element => element.Formula == fuel)[0]
    MWs += compound.MW * normalFuel[fuel]
  }
  return MWs
}

/** (Pa) Temperature should be in K, humidity %[0,100] */
const pressureH2OinAir = (temperature, relativeHumidity) => {
  // Equation from Reference: Tetens, O., 1930

  // This eq uses temp in °C
  const temp = temperature - options.tempToK
  // ps is the saturation vapour pressure, in pascals,
  const ps = 610.78*Math.exp(temp/(temp+238.3)*17.2694)
  // result pw is the actual water vapour pressure.
  return ps * relativeHumidity * 0.01
}

/** Temperature should be in K, humidity %[0,100] */
const moistAirMolesPerO2 = (temperature, relativeHumidity) => {
  const pw = pressureH2OinAir(temperature, relativeHumidity)
  // w is the weight ratio of water vapour and dry air. (kg-w_vap/kg-dry_a)
  // simplification 0.62 * 1e-5 * pw
  const w = 0.018 * pw / ( 0.029 * (options.pAtm - pw ) )
  // weight ratio converted to water per oxygen in air
  return w * 7.655
}

/** (kJ/kmol), Enthalpy of formation plus delta enthalpy 
  * returns a function if no temp is passed */
const deltaH = (compound, t) => {
  if (compound.Cp0 === '-') {
    if (compound.h0 === '-') {
      if (options.verbose) 
        logger.warn(`wrong use of deltaH func, called for compound ${compound.Substance} without data`)
      if (t === undefined) return () => 0
      return 0
    }
    if (t === undefined) return () => compound.h0
    return compound.h0
  }
  // hf0 + deltaH(tempAmbRef -> t)
  if (t === undefined) return (t) => 
    compound.h0 + compound.MW * Cp0(compound)((options.tempAmbRef+t)/2) * (t-options.tempAmbRef)
  return compound.h0 + compound.MW * Cp0(compound)((options.tempAmbRef+t)/2) * (t-options.tempAmbRef)
}

/** (kJ/kmol), Enthalpy of combustion for a certain compound 
  * returns a function if no temp is passed */
const combustionH = (compound, t, tIni, liquidWater) => {
  // hrp = HP − HR // H = H0 + deltaH  // H0 = n(hf)
  // SR ni*(hf + deltaH)i = SP ne*(hf + deltaH)e

  const co2_H = deltaH(data[6])
  const so2_H = deltaH(data[34])
  const o2_H = deltaH(data[2])
  let h2o_H = deltaH(data[31]) // gas lower heating value 
  // higher heating value
  if (liquidWater === true) h2o_H = deltaH(data[32]); // liq
  // making tIni equal to t_amb if not specified
  if (tIni === undefined) tIni = options.tAmb

  if (t === undefined) return (t) => compound.CO2*co2_H(t) + compound.SO2*so2_H(t)
    + compound.H2O*h2o_H(t) - deltaH(compound)(tIni) - compound.O2*o2_H(tIni)
  
  // SR ni*(hf + deltaH)i = SP ne*(hf + deltaH)e
  return ( compound.CO2*co2_H(t) + compound.SO2*so2_H(t) + compound.H2O*h2o_H(t)
    - deltaH(compound)(tIni) - compound.O2*o2_H(tIni) )
}

/** (kJ/kmol) Enthalpy of combustion for a certain fuel mix */
const ncv = (fuels, products, compounds, tAmb) => {
  let value = 0
  for (const fuel in fuels) {
    if (fuel in products) continue
    const compound = compounds.filter(element => element.Formula == fuel)[0]
    value += fuels[fuel]*combustionH(compound)(tAmb)
    //logger.info(`H of combustion for ${fuel}: ` +
    // `${combustionH(compound)(tAmb)/compound.MW} KJ/Kg` )
  }
  return value
}

/**Temp unit (K)
* Internal units (kJ/kmol)
* Function to create the adiabatic flame equation 
* used in the newton raphson method to find adFlame temp */
const adFlame = (fuels, products, tIni, o2required) => {
  const fuelCompounds = data.filter( (element) => element.Formula in fuels )
  const o2_H = deltaH(data.filter(element => element.Formula == "O2")[0])
  const n2_H = deltaH(data.filter(element => element.Formula == "N2")[0])
  const co2_H = deltaH(data.filter(element => element.Formula == "CO2")[0])
  const h2o_H = deltaH(data.filter(element => element.Formula == "H2O")[0])
  const so2_H = deltaH(data.filter(element => element.Formula == "SO2")[0])
  if (tIni === undefined) tIni = options.tAmb
  if (o2required === undefined) o2required = 0

  // enthalpy of the products at the new temp minus dry air inlet
  const pEnthalpy = (t) => products.CO2*co2_H(t) + products.SO2*so2_H(t)
  + products.H2O*h2o_H(t) + products.O2*o2_H(t) + products.N2*n2_H(t)
  - products.N2*n2_H(tIni) - o2required*o2_H(tIni)
  
  // initial enthalpy of the fuel
  const enthalpy = []
  let i = 0
  for (const fuel in fuels) {
    const compound = fuelCompounds.filter(element => element.Formula == fuel)[0]
    enthalpy[i] = fuels[fuel]*deltaH(compound)(tIni)
    i++
  }
  
  // SR ni*(hf + deltaH)i = SP ne*(hf + deltaH)e
  return (t) => pEnthalpy(t) - enthalpy.reduce((acc, value)=> acc + value)
}

/** In this process the params object will be updated
*  in every function call with the combustion data
*/
const combSection = (airExcess, fuels, params) => {
  logger.debug("airExcess in call: " + airExcess)
  const result = {err: ""}
  const compounds = data.filter((element, i, arr) => element.Formula in fuels)
  if (!checkFuelPercentage(fuels, compounds, result)) return result
  const products = {
    O2: 0,
    H2O: 0,
    CO2: 0,
    SO2: 0,
    N2: 0,
  };

  const air = {
    O2: .01 * dryAirO2Percentage,
    N2: .01 * dryAirN2Percentage,
    H2O: 0
  };

  const debug_data = {
    ambTemperature: units.tempC(params.t_amb),
    "humidity_%":  round(params.humidity),
    "dryAirN2_%": round(dryAirN2Percentage),
    "dryAirO2_%": round(dryAirO2Percentage),
    atmPressure: units.pressure(params.p_atm),
  };

  // for every element in the fuel compounds
  for (const element of compounds) {
    // calculating every product of combustion per fuel element
    for (const product in products) {
      //logger.default(`${element['Formula']} req = ${product} ` +
      //  `${element[product]*fuels[element['Formula']]}` )
      products[product] += element[product]*fuels[element['Formula']]
    }
  }

  /** Percentage of O2 in excess 100% + x% airExcess */
  if (airExcess - 0.000001 < 0) airExcess = 0
  if (params.humidity - 0.000001 < 0) params.humidity = 0
  let o2required = products['O2']
  let o2excess = o2required * (1 + airExcess)
  // If O2 requirements are negative 
  if (products['O2'] <= 0) {
    logger.error('o2 in fuel is greater than needed, airExcess set to 0')
    o2excess = 0
    o2required = 0
    products['N2'] = 0
    products['O2'] = -products['O2']
  } else {
    const waterPressure = pressureH2OinAir(params.t_amb, params.humidity)
    const dryAirPressure = params.p_atm - waterPressure
    air.N2 = .01 * dryAirN2Percentage * dryAirPressure / params.p_atm
    air.O2 = .01 * dryAirO2Percentage * dryAirPressure / params.p_atm
    air.H2O = waterPressure / params.p_atm
    
    debug_data.dryAirPressure = units.pressure(dryAirPressure)
    debug_data.waterPressure = units.pressure(waterPressure)
    debug_data["H2OPressure_%"] = 100 * air.H2O
    debug_data["N2Pressure_%"] = 100 * air.N2
    debug_data["O2Pressure_%"] = 100 *air.O2
    debug_data.unitSystem = units.system

    products['O2'] = o2excess - products['O2'] // Subtracting the O2 used in combustion
    products['N2'] += products['O2'] * (air.N2/air.O2)
    products['H2O'] += products['N2']* (waterPressure / (air.N2*params.p_atm))
    //moistAirMolesPerO2(params.t_amb, params.humidity)
  }


  params.NCV = -ncv(fuels, products, compounds, params.t_amb)
  // logger.info( "NCV (kJ/kmol): " + params.NCV)
  params.adFlame = newtonRaphson(
    adFlame(fuels, products, params.t_amb, o2excess),
    1400, params.NROptions, "fuel_adFlame")
  // logger.info( "Adiabatic flame temp (K): " + params.adFlame)

  let totalPerMol = 0; totalPerM_Dry = 0
  for (const product in products) {
    totalPerMol += products[product]
    if (product !== 'H2O') totalPerM_Dry += products[product]
  }
  const flows = {
    total_flow: round(totalPerMol),
    dry_total_flow: round(totalPerM_Dry), 
    // 'O2%_DRY': round(100*products['O2']/totalPerM_Dry),
    // 'CO2%_DRY': round(100*products['CO2']/totalPerM_Dry),
    // 'N2%_DRY': round(100*products['N2']/totalPerM_Dry),
    'N2_%': round(100*products['N2']/totalPerMol),
    'H2O_%': round(100*products['H2O']/totalPerMol),
    'CO2_%': round(100*products['CO2']/totalPerMol),
    'O2_%': round(100*products['O2']/totalPerMol),

    'air_excess_%': round(100 * params.airExcess),
    AC: round(o2excess / air.O2),
    AC_mass: round( o2excess / air.O2 * MW_multicomp(air) / MW_multicomp(fuels) ),
    AC_mass_theor: round( o2required / air.O2 * MW_multicomp(air) / MW_multicomp(fuels) ),

    fuel_MW: units["mass/mol"](MW_multicomp(fuels)),
    fuel_Cp: units.cp(Cp_multicomp(fuels, true)(params.t_fuel)),
    flue_MW: units["mass/mol"](MW_multicomp(products)),
    flue_Cp_Tamb: units.cp(Cp_multicomp(products, true)(params.t_amb)),
    NCV: units["energy/mol"](params.NCV)
  }

  params.m_fuel_seed = 120; /** (kmol/h) */
  params.m_flue_ratio = flows.total_flow;
  params.m_air_ratio = flows.AC;
  /** Function of temp (kJ/kmol-K) */
  params.Cp_flue = Cp_multicomp(products, true);
  /** Function of temp (kJ/kmol-K) */
  params.Cp_air = Cp_multicomp(air, true);
  /** Function of temp (kJ/kmol-K) */
  params.Cp_fuel = Cp_multicomp(fuels, true);

  roundDict(products)
  return {flows, products, debug_data}
}

// Testing logs
// logger.info( `Cp_dry_${data[33].Substance} Cp0(kJ/kmol-K): `+
//     `${Cp0(data[33], true)( (options.tAmb + 15+273.15)*0.5 )}`)
// logger.info(`H2O-mol per O2-mol in air ${params.humidity}% RH): `+
//   `${moistAirMolesPerO2(params.t_amb, params.humidity)}`)

// logger.default(combustionH(data[7]).toString())
// logger.default(deltaH(data[7])(options.tempAmbRef))
// logger.default(combustionH(data[7],500,true) / data[7].MW)
// logger.default(combustionH(data[7],500) / data[7].MW)
// logger.default(data[7].Substance, " h0: ", data[7].h0)


module.exports = {
  combSection
};