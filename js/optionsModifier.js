const {logger, unitConv} = require('./utils');

// Logic to modified default options for process fluid with data from browser
const optionsModifierFluid = (key, browserData, options) => {
  let optValue;
  switch (key) {
    case 'm_fluid':
      optValue = parseFloat(browserData[key])
      if (optValue > 0 && optValue < 175) 
        options.mFluid = unitConv.BPDtolb_h(optValue*1e3);
      break;
    case 't_in':
      optValue = parseFloat(browserData[key])
      if (optValue > 0) 
        options.tIn = optValue;
      break;
    case 't_out':
      optValue = parseFloat(browserData[key])
      if (optValue > 0) 
        options.tOut = optValue;
      break;
    case 'sp':
      
      break;
    case 'miu_in':
      
      break;
    case 'miu_out':
      
      break;
    case 'kw_in':
      
      break;
    case 'kw_out':
    
      break;
    case 'cp_in':
      
      break;
    case 'cp_out':
    
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
    case 't_amb':
      optValue = parseFloat(browserData[key])
      if (optValue < maxTamb) 
        options.tAir = unitConv.FtoK(optValue);
      break;
    case 'humidity':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxHumidity) 
        options.humidity = optValue;
      break;
    case 'p_atm':
      optValue = parseFloat(browserData[key])
      if (optValue > 1e-3 && optValue < maxPatm) 
        options.pAtm = optValue *options.pAtmRef;
      break;
    case 'air_excess':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxAirExcess) 
        options.airExcess = optValue * .01;
      break;
    case 'o2_excess':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxO2Excess) 
        options.o2Excess = optValue * .01;
      break;
    case 'o2_basis':
      
      break;
    default:
      break;
  }
}

// Logic to modified default options with data from browser
const optionsModifier = (key, browserData, options) => {
  let optValue;
  switch (key) {
    case 'project_title':
      if (browserData[key] != '') options.title = browserData[key]
      break;
    case 'project_n':
      if (browserData[key] != '') options.case = browserData[key]
      break;
    case 'revision_n':
      break;
    case 'date':
      if (browserData[key] != '') options.date = browserData[key]
      break;
    case 'fuel_percent':
      break;
    case 'heat_loss':
      optValue = parseFloat(browserData[key])
      if (optValue <= 15) 
        options.hLoss = optValue*1e-2;
      break;
    case 'efficiency':
      optValue = parseFloat(browserData[key])
      if (optValue >= 50) 
        options.effcy = optValue*1e-2;
      break;
    case 'rad_dist':
      optValue = parseFloat(browserData[key])
      if (optValue >= 50) {
        options.radDist = optValue*1e-2;
        options.runDistCycle = false;
      }
      break;
    case 't_fuel':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue) 
        options.tFuel = unitConv.FtoK(optValue);
      break;
    case 'unit_system':
      logger.debug(`"${key}", "value":"${browserData[key]}"`)
      options.unitSystem = browserData[key];
      break;
    default:
      optionsModifierFluid(key, browserData, options);
      optionsModifierAmbient(key, browserData, options);
      break;
  }
}

module.exports = {
	optionsModifier
};