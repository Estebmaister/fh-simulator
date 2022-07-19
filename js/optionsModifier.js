const {logger, unitConv} = require('./utils');

// Logic to modified default options for graph function
const optionsModifierGraph = (key, browserData, options) => {
  let optValue;
  switch (key) {
    case 'graph_var':
      options.graphVar = browserData[key]
      break;
    case 'graph_range':
      optValue = parseFloat(browserData[key])
      if (optValue > 0) 
        options.graphRange = optValue;
      break;
    case 'graph_points':
      optValue = parseFloat(browserData[key])
      if (optValue > 0 && optValue <= 200) 
        options.graphPoints = optValue;
      break;
  }
}

// Logic to modified default options for process fluid with data from browser
const optionsModifierFluid = (key, browserData, options) => {
  let optValue = parseFloat(browserData[key]);
  if (optValue <= 0) return; // every value here should be greater than 0
  switch (key) {
    case 'm_fluid':
      options.mFluid = optValue;
      break;
    case 't_in':
      options.tIn = optValue;
      break;
    case 't_out':
      options.tOut = optValue;
      break;
    case 'sp_grav':
      options.spGrav = optValue;
      break;
    case 'miu_in':
      options.miuFluidIn = optValue;
      break;
    case 'miu_out':
      options.miuFluidOut = optValue;
      break;
    case 'kw_in':
      options.kwFluidIn = optValue;
      break;
    case 'kw_out':
      options.kwFluidOut = optValue;
      break;
    case 'cp_in':
      options.cpFluidIn = optValue;
      break;
    case 'cp_out':
      options.cpFluidOut = optValue;
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
    maxTamb = 1.2e2,
    maxPatm = 2,
    minPatm = 1e-2;
  let optValue;
  switch (key) {
    case 't_amb':
      optValue = parseFloat(browserData[key])
      if (optValue <= maxTamb) 
        options.tAir = unitConv.FtoK(optValue);
      break;
    case 'humidity':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0 && optValue <= maxHumidity) 
        options.humidity = optValue;
      break;
    case 'p_atm':
      optValue = parseFloat(browserData[key])
      if (optValue >= minPatm && optValue < maxPatm) 
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
      // TODO: Not configured
      break;
    default:
      break;
  }
}

// Logic to modified default options with data from browser
const optionsModifier = (key, browserData, options) => {
  const
    minRadDist = 40,
    maxRadDist = 100,
    maxHeatLosses = 5;
  let optValue;
  switch (key) {
    case 'project_title':
      if (browserData[key]) options.title = browserData[key]
      break;
    case 'fuel_percent':
      // Not configured
      break;
    case 'heat_loss':
      optValue = parseFloat(browserData[key])
      if (optValue <= maxHeatLosses) 
        options.hLoss = optValue*1e-2;
      break;
    case 'rad_dist':
      optValue = parseFloat(browserData[key])
      if (optValue >= minRadDist && optValue <= maxRadDist) {
        options.radDist = optValue*1e-2;
        options.runDistCycle = false;
      }
      break;
    case 'rfi':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfi = optValue;
      break;
    case 'rfo':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) {
        options.rfoConv = optValue;
        options.rfoShld = optValue;
      }
      break;
    case 'rfi_conv':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfiConv = optValue;
      break;
    case 'rfo_conv':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfoConv = optValue;
      break;
    case 'rfi_shld':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfiShld = optValue;
      break;
    case 'rfo_shld':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfoShld = optValue;
      break;
    case 't_fuel':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) 
        options.tFuel = unitConv.FtoK(optValue);
      break;
    case 'unit_system':
      logger.debug(`"${key}", "value":"${browserData[key]}"`)
      options.unitSystem = browserData[key];
      break;
    default:
      optionsModifierGraph(key, browserData, options);
      optionsModifierFluid(key, browserData, options);
      optionsModifierAmbient(key, browserData, options);
      break;
  }
}

module.exports = {
	optionsModifier
};