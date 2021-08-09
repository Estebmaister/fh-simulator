/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @newtonRaphson (f, fp, x0, options)
 * @version  1.00
 * @param   {f function} valid function to find the zero.
 * @param   {fp function} optional function derivate.
 * @param   {x0 number} valid number seed.
 * @param   {options object} valid options object.
 * @return  {number or false} a number is the iterations reach the result, 
 *          false if not.
 * 
 * @log (level, args)
 * @version  1.00
 * @param   {level} optional string like "error", "info" or "debug".
 * @return  {null} prints to the console.
 * 
 * @author  Esteban Camargo
 * @date    17 Jul 2021
 * @call    node . true true 25 70 80 1e5
 * @callParams verbose, check for changes in csv, t_amb, humidity, air_excess, p_amb
 * 
 * Note: No check is made for NaN or undefined input numbers.
 *
 *****************************************************************/
const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const {newtonRaphson, options, log} = require('./js/utils');

const dataPaths = {
  csv: __dirname + "/data.csv",
  json: __dirname + "/data.json"
}
const getData = (fromCSV) => {
  let CompoundsArray = []
  
  if (fromCSV) {
    log("info","Starting data extraction for Simulator")
    CompoundsArray = parse(fs.readFileSync(dataPaths.csv), {
      columns: true,
      skip_empty_lines: true,
      cast: true
    })

    fs.writeFileSync(dataPaths.json, JSON.stringify(CompoundsArray, null, 2))
    log("info",'JSON file successfully updated');
  } else {
    CompoundsArray = require(dataPaths.json)
  }
  return CompoundsArray
};

/** (kJ/kg K) to call returning function use Kelvin units 
 * if you want a result in (kJ/kmol K) units, multiply the
 * result by MW or call this with second argument set to true.
*/
const Cp0 = ({c0, c1, c2, c3, MW, Substance}, molResult) => {
  // Cp equation from table A.6 Van Wylen

  // Teta = T(Kelvin)
  return (teta) => {
    // Approximate equation valid from 250 K to 1200 K.
    if (teta < 250 || teta > 1200) {
      if (options.verbose) log("{WARN: Wrong range for Cp0 formula}")
    }
    if (c0 === "-") {
      log("warn", `Wrong Use of Cp0, called for compound ${Substance}`)
      return 0
    }
    if (molResult) return (c0 + c1*(teta*0.001) + c2*(teta*0.001)**2 + c3*(teta*0.001)**3)*MW
    return (c0 + c1*(teta*0.001) + c2*(teta*0.001)**2 + c3*(teta*0.001)**3)
  }
}

/** (kJ/kg K) argument needs to be a fuel object,
 * ie: { CH4: 0.323, ... }
 * if you want a result in (kJ/kmol K) units, call it with 
 * second argument set to true.
*/
const Cp_multicomp = (fuels, molResult) => {
  if (fuels.length === 0) return 0
  const fuelCompounds = data.filter( element => element.Formula in fuels )
  let i = 0
  const cps = []
  for (const fuel in fuels) {
    const compound = fuelCompounds.filter(element => element.Formula == fuel)[0]
    cps[i] = (t) => fuels[fuel] * Cp0(compound, molResult)(t)
    i++
  }
  
  return cps.reduce((acc, value) => ((t) => acc(t) + value(t)), (t) => 0)
}

/** Temperature should be in K, humidity %[0,100] */
const moistAirMolesPerO2 = (temperature, relativeHumidity) => {
  // Equation from Reference: Tetens, O., 1930
  temperature = temperature - options.tempToK
  // ps is the saturation vapour pressure, in pascals,
  // where t is the temperature in degrees Celsius.
  const ps = 610.78*Math.exp(temperature/(temperature+238.3)*17.2694)
  // pw is the actual water vapour pressure.
  const pw = ps * relativeHumidity * 0.01
  // w is the weight ratio of water vapour and dry air.
  const w = 0.018 * pw / ( 0.029 * (options.pAtm - pw ) ) 
  return w * 7.655
}

const checkFuelPercentage = (fuels, compounds) => {
  // Check if the percentages of the fuels sums 100% 
  const check1 = 1 === Object.values(fuels).reduce((acc, value)=> acc + value)
  // Check if all the components in the fuels are in the data filtered
  const check2 = compounds.length === Object.keys(fuels).length

  return check1 && check2
}

/** Units (kJ/kmol) */
const deltaH = (compound, t) => {
  // Enthalpy of formation plus delta enthalpy

  if (compound.Cp0 === '-') {
    if (compound.h0 === '-') {
      if (options.verbose) 
        log("warn",`Wrong Use of deltaH, called for compound ${compound.Substance}`)
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

/** (kJ/kmol) Enthalpy of combustion for a certain compound */
const combustionH = (compound, t, tIni, liquidWater) => {
  // hrp = HP − HR // H = H0 + deltaH  // H0 = n(hf)
  // SR ni*(hf + deltaH)i = SP ne*(hf + deltaH)e

  const co2_H = deltaH(data[6])
  const so2_H = deltaH(data[34])
  const o2_H = deltaH(data[2])
  let h2o_H = deltaH(data[31]) // gas lower heating value 
  // higher heating value
  if (liquidWater === true) h2o_H = deltaH(data[32]); // liq

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
    //log("info",`H of combustion for ${fuel}: ${combustionH(compound)(tAmb)/compound.MW} KJ/Kg` )
  }
  return value
}

const adFlame = (fuels, products, tIni, o2required) => {
  // Temp unit K
  // Internal units (kJ/kmol)
  // Function to crate the adiabatic flame equation
  const fuelCompounds = data.filter( 
    (element) => element.Formula in fuels
  )
  const o2_H = deltaH(data[2])
  const n2_H = deltaH(data[3])
  const co2_H = deltaH(data[6])
  const h2o_H = deltaH(data[31])
  const so2_H = deltaH(data[34])
  if (tIni === undefined) tIni = options.tAmb
  if (o2required === undefined) o2required = 0

  const pEnthalpy = (t) => products.CO2*co2_H(t) + products.SO2*so2_H(t)
  + products.H2O*h2o_H(t) + products.O2*o2_H(t) + products.N2*n2_H(t)
  - products.N2*n2_H(tIni) - o2required*o2_H(tIni)
  
  let i = 0
  const enthalpy = []
  for (const fuel in fuels) {
    const compound = fuelCompounds.filter(element => element.Formula == fuel)[0]
    enthalpy[i] = fuels[fuel]*deltaH(compound)(tIni)
    i++
  }
  
  // SR ni*(hf + deltaH)i = SP ne*(hf + deltaH)e
  return (t) => pEnthalpy(t) - enthalpy.reduce((acc, value)=> acc + value)
}

const molesOfCombustion = (fuels, tIniCalc, humidity, airExcess) => {

  const compounds = data.filter( 
    (element, i, arr) => element.Formula in fuels
  )

  if (!checkFuelPercentage(fuels, compounds)) return {}

  log("info",`H2O moles per O2 in air ${humidity}% RH):  ${moistAirMolesPerO2(tIniCalc, humidity)}`)

  const products = {
    O2: 0,
    H2O: 0,
    CO2: 0,
    SO2: 0,
    N2: 0, // This is defined later, used here to avoid null
  }

  for (const element of compounds) {
    // Calculating the products of combustion
    for (const product in products) {
      // log("info", element['Formula'] + ' req = ' 
      // + product + element[product]*fuels[element['Formula']])
      products[product] += element[product]*fuels[element['Formula']]
    }
  }

  const o2excess = products['O2'] * (1 + airExcess)

  products['O2'] = o2excess - products['O2']
  products['N2'] += o2excess * (0.79/0.21)
  products['H2O'] += o2excess * moistAirMolesPerO2(tIniCalc, humidity)

  log("info", "NCV (kJ/kmol): " + ncv(fuels, products, compounds, tIniCalc))
  //log(adFlame(fuels, products)(1371))
  log("info", "adiabatic flame (K): " + 
    newtonRaphson(adFlame(fuels, products, tIniCalc, o2excess), 1000, options)
  )

  let total = 0; totalDry = 0
  for (const product in products) {
    total += products[product]
    if (product !== 'H2O') totalDry += products[product]
  }
  const flows = {
    TOTAL: total,
    DRY_TOTAL: totalDry,
    AC: o2excess * (1 + (0.79/0.21)),
  }

  flows['O2%_DRY'] = 100*products['O2']/totalDry
  flows['CO2%_DRY'] = 100*products['CO2']/totalDry
  flows['N2%_DRY'] = 100*products['N2']/totalDry

  flows['O2%_WET'] = 100*products['O2']/total
  flows['CO2%_WET'] = 100*products['CO2']/total
  flows['N2%_WET'] = 100*products['N2']/total

  return {flows, products}
}

var data = getData(options.processData)
let fuels = {
  CH4: 0.323,
  O2: 0.003,
  N2: 0.048,
  H2: 0.519,
  CO: 0.055,
  CO2: 0.02,
  C3H8: 0.032,
}
/*
log(combustionH(data[7]).toString())
log(deltaH(data[7])(options.tempAmbRef))
log(
  combustionH(data[7],500,true) / data[7].MW,
  combustionH(data[7],500) / data[7].MW
)
log(data[7].Substance, data[7].h0)
*/
log("info", `${data[33].Substance} Cp0(kJ/kmol-K): ${Cp0(data[33], true)( (options.tAmb + 15+273.15)*0.5 )}`)
log("info", `Cp_fuel (kJ/kmol-K): ${Cp_multicomp(fuels, true)(300)}`)

log(molesOfCombustion(fuels, options.tAmb, options.humidity, options.airExcess))

module.exports = {
  newtonRaphson,
  options,
  log
};