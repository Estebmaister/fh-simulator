
const {logger} = require('./utils');
const {stringRadResult, stringShldResult, stringConvResult} = require('./resultsToString');

// Extracts the data from the URL
const extractURIdata = (argumentsArray) => {
	if (argumentsArray == "") return {};
	let resultObject = {};
  for (const iterator of argumentsArray) {
    const argumentPair = iterator.split('=', 2);
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
// Logic to modified default options for process fluid with data from browser
const optionsModifierFluid = (key, browserData, options) => {
  let optValue;
  switch (key) {
    case "m_fluid":
      optValue = parseFloat(browserData[key])
      if (optValue > 0) 
        options.mFluid = optValue*1e3;
      break;
    case "t_in":
      optValue = parseFloat(browserData[key])
      if (optValue > 0) 
        options.tIn = optValue;
      break;
    case "t_out":
      optValue = parseFloat(browserData[key])
      if (optValue > 0) 
        options.tOut = optValue;
      break;
    case "sp":
      
      break;
    case "miu_in":
      
      break;
    case "miu_out":
      
      break;
    case "kw_in":
      
      break;
    case "kw_out":
    
      break;
    case "cp_in":
      
      break;
    case "cp_out":
    
      break;
    default:
      break;
  }
}


// Logic to modified default options with data from browser
const optionsModifierAmbient = (key, browserData, options) => {
  const
    maxAirExcess = 300,
    maxHumidity = 100,
    maxO2Excess = 30,
    maxTamb = 1e2,
    maxPatm = 2;
  let optValue;
  switch (key) {
    case "t_amb":
      optValue = parseFloat(browserData[key])
      if (optValue < maxTamb) 
        options.tAir = optValue +options.tempToK;
      break;
    case "humidity":
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxHumidity) 
        options.humidity = optValue;
      break;
    case "p_atm":
      optValue = parseFloat(browserData[key])
      if (optValue > 1e-3 && optValue < maxPatm) 
        options.pAtm = optValue *options.pAtmRef;
      break;
    case "air_excess":
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxAirExcess) 
        options.airExcess = optValue * .01;
      break;
    case "o2_excess":
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxO2Excess) 
        options.o2Excess = optValue * .01;
      break;
    case "o2_basis":
      
      break;
    default:
      break;
  }
}

// Logic to modified default options with data from browser
const optionsModifier = (key, browserData, options) => {
  let optValue;
  switch (key) {
    case "project_title":
      // TODO: not set yet
      break;
    case "project_n":
      break;
    case "revision_n":
      break;
    case "date":
      break;
    case "fuel_percent":
      break;
    case "heat_loss":
      optValue = parseFloat(browserData[key])
      if (optValue <= 15) 
        options.hLoss = optValue*1e-2
      break;
    case "efficiency":
      optValue = parseFloat(browserData[key])
      if (optValue >= 50) 
        options.effcy = optValue*1e-2
      break;
    case "rad_dist":
      optValue = parseFloat(browserData[key])
      if (optValue >= 50) 
        options.radDist = optValue*1e-2
      break;
    case "t_fuel":
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue) 
        options.tFuel = optValue +options.tempToK;
      break;
    case "unit_system":
      logger.debug(`"${key}", "value":"${browserData[key]}"`)
      options.unitSystem = browserData[key];
      break;
    default:
      optionsModifierFluid(key, browserData, options);
      optionsModifierAmbient(key, browserData, options);
      break;
  }
}

// Modify the fuels and options object with the Browser Data
const insertBrowserData = (browserData, fuels, data, options) => {
	const browserFuels = {}
	const fuelCompounds = data.filter(element => element.Formula in browserData)

	for (const key in browserData) {
		const compoundArray = fuelCompounds.filter(element => element.Formula==key)
		if (compoundArray.length === 1 && browserData[key] !== "") {
			const fuelFrac = parseFloat(browserData[key])
			if (fuelFrac > 0 && fuelFrac <= 100) {
				browserFuels[key] = fuelFrac/100
			} else {
				logger.error(`fuel fraction invalid (${fuelFrac}) for ${key}`)
			}
		} else if (browserData[key] !== "" && browserData[key] !== undefined) {
      // Case when the key is not empty and isn't a fuel either
			optionsModifier(key, browserData, options);
		}
	}

	if (Object.keys(browserFuels).length !== 0) fuels = browserFuels;
}

const outputData = (result, browserData, lang, unitSystem) => {
	// log logger.info(JSON.stringify(result, null, 2))
  logger.debug(JSON.stringify(browserData, null, 2))

  let outputString = ''
  if (lang == 'es') {
    outputString += `
Datos de entrada
  (en caso de no haber sido introducidos, tomará el predeterminado)

  Sistema de unidades:      ${result.debug_data["unitSystem"]}
  Presión atmosférica:      ${result.debug_data["atmPressure"]}
  Temperatura ref:          ${result.debug_data["ambTemperature"]}
  Temperatura aire:         ${result.debug_data["airTemperature"]}
  Temperatura comb:         ${result.debug_data["fuelTemperature"]}

  Humedad:                  ${result.debug_data["humidity_%"]} %
  N2 en aire seco:          ${result.debug_data["dryAirN2_%"]} %
  O2 en aire seco:          ${result.debug_data["dryAirO2_%"]} %

  Presión de aire seco:     ${result.debug_data["dryAirPressure"]}
  Presión de vapor de agua: ${result.debug_data["waterPressure"]}

  Presión parcial de H2O:    ${result.debug_data["H2OPressure_%"]} 10^(-2)
  Presión parcial de N2:    ${result.debug_data["N2Pressure_%"]} 10^(-2)
  Presión parcial de O2:    ${result.debug_data["O2Pressure_%"]} 10^(-2)
  Contenido húmedo (w):     ${result.debug_data["moisture"]}-AireSeco

Moles de gases de combustión total y porcentajes por cada mol de combustible

  Flujo total: ${result.flows["total_flow"]}
  Flujo seco:  ${result.flows["dry_total_flow"]}

  N2:  ${result.products["N2"]}
  O2:  ${result.products["O2"]}
  H2O: ${result.products["H2O"]}
  CO2: ${result.products["CO2"]}
  SO2: ${result.products["SO2"]}

  Porcentajes en base húmeda
    N2:  ${result.flows["N2_%"]} %
    H2O: ${result.flows["H2O_%"]} %
    CO2: ${result.flows["CO2_%"]} %
    O2:  ${result.flows["O2_%"]} %

  Exceso de aire usado: ${result.flows["air_excess_%"]} %
  Moles O2 requeridos/mol de combustible (teórico): ${result.flows["O2_mol_req_theor"]}

  Relación A/C molar húmeda:  ${result.flows["AC"]}
  Relación A/C másica húmeda: ${result.flows["AC_mass"]}
  Relación A/C molar (aire seco, teórica):    ${result.flows["AC_theor_dryAir"]}
  Relación A/C másica (aire húmedo, teórica): ${result.flows["AC_mass_theor_moistAir"]}

  Peso molecular del combustible: ${result.flows["fuel_MW"]}
  Cp(t_comb) del combustible:  ${result.flows["fuel_Cp"]}
  NCV: ${result.flows["NCV"]}

  Peso molecular de los gases de combustión: ${result.flows["flue_MW"]}
  Cp(t_amb) de los gases de combustión: ${result.flows["flue_Cp_Tamb"]}
`;
  } else {
    outputString += `
Input Data 
  (in case of no input, default values will be taken)

  Unit System:          ${result.debug_data["unitSystem"]}
  Atmospheric Pressure: ${result.debug_data["atmPressure"]}
  Ref Temperature:      ${result.debug_data["ambTemperature"]}
  Air Temperature:      ${result.debug_data["airTemperature"]}
  Fuel Temperature:     ${result.debug_data["fuelTemperature"]}

  Humidity:             ${result.debug_data["humidity_%"]} %
  N2 en aire seco:      ${result.debug_data["dryAirN2_%"]} %
  O2 en aire seco:      ${result.debug_data["dryAirO2_%"]} %

  Dry Air Pressure:     ${result.debug_data["dryAirPressure"]}
  Water Vapor Pressure: ${result.debug_data["waterPressure"]}

  Partial Pressure H2O: ${result.debug_data["H2OPressure_%"]} 10^(-2)
  Partial Pressure N2 : ${result.debug_data["N2Pressure_%"]} 10^(-2)
  Partial Pressure O2 : ${result.debug_data["O2Pressure_%"]} 10^(-2)
  Moisture content (w): ${result.debug_data["moisture"]}-dryAir

Total flue gas moles and percentage (per fuel mol)

  Flow total: ${result.flows["total_flow"]}
  Dry total:  ${result.flows["dry_total_flow"]}

  N2:  ${result.products["N2"]}
  O2:  ${result.products["O2"]}
  H2O: ${result.products["H2O"]}
  CO2: ${result.products["CO2"]}
  SO2: ${result.products["SO2"]}

  Moist basis percentage
    N2:  ${result.flows["N2_%"]} %
    H2O: ${result.flows["H2O_%"]} %
    CO2: ${result.flows["CO2_%"]} %
    O2:  ${result.flows["O2_%"]} %

  Air excess used : ${result.flows["air_excess_%"]} %
  Moles O2 required/fuel-mol (theoretical): ${result.flows["O2_mol_req_theor"]}

  A/C molar moist relation:   ${result.flows["AC"]}
  A/C mass moist relation:    ${result.flows["AC_mass"]}
  A/C molar relation (dry air, theoretical):   ${result.flows["AC_theor_dryAir"]}
  A/C mass relation (moist air, theoretical):  ${result.flows["AC_mass_theor_moistAir"]}

  Fuel mol weight: ${result.flows["fuel_MW"]}
  Fuel Cp(t_fuel): ${result.flows["fuel_Cp"]}
  NCV:             ${result.flows["NCV"]}

  Flue gas mol weight: ${result.flows["flue_MW"]}
  Flue gas Cp(t_amb):  ${result.flows["flue_Cp_Tamb"]}
`;
  }
  
  document.getElementById("loader-wrapper").remove();
  document.getElementById("output-combustion").textContent = outputString;
  document.getElementById("output-radiant").textContent = stringRadResult(lang, result.rad_result, unitSystem);
  document.getElementById("output-shield").textContent = stringShldResult(lang, result.shld_result, unitSystem);
  document.getElementById("output-convective").textContent = stringConvResult(lang, result.conv_result, unitSystem);
};

// Process the data and start the combustion algorithm
const browserProcess = (fuels, data, options, combustion) => {

  let lang = 'en';  
  const browserLang = window.location.pathname.split('/'); // ex ',en,result.html'}
  if (browserLang.length > 0) browserLang.forEach(element => {if (element == 'es') lang = 'es'});
  options.lang = lang;

  const browserData = extractURIdata(window.location.search.substr(1).split('&'));
  if (browserData !== {}) insertBrowserData(browserData, fuels, data, options);
  
  const result = combustion(fuels, options);
	outputData(result, browserData, lang, options.unitSystem);
};

module.exports = {
	browserProcess
};