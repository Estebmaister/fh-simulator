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
      options.tIn = unitConv.FtoK(optValue);
      break;
    case 'si_t_in':
      options.tIn = unitConv.CtoK(optValue);
      break;
    case 't_out':
      options.tOut = unitConv.FtoK(optValue);
      break;
    case 'si_t_out':
      options.tOut = unitConv.CtoK(optValue);
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
    maxTamb = 120,
    maxTambSI = 50,
    maxPatm = 2,
    maxPatmSI = 2*1e2,
    minPatm = 1e-2;
  let optValue = parseFloat(browserData[key]);
  switch (key) {
    case 't_amb':
      if (optValue <= maxTamb) 
        options.tAir = unitConv.FtoK(optValue);
      break;
    case 'si_t_amb':
      if (optValue <= maxTambSI) 
        options.tAir = unitConv.CtoK(optValue);
      break;
    case 'humidity':
      if (optValue >= 0 && optValue <= maxHumidity) 
        options.humidity = optValue;
      break;
    case 'p_atm':
      if (optValue >= minPatm && optValue < maxPatm) 
        options.pAtm = optValue *options.pAtmRef;
      break;
    case 'si_p_atm':
      if (optValue >= minPatm && optValue < maxPatmSI) 
        options.pAtm = optValue *1e3;
      break;
    case 'air_excess':
      if (optValue >= 0 && optValue <= maxAirExcess) 
        options.airExcess = optValue * .01;
      break;
    case 'o2_excess':
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
      if (optValue >= 0) options.rfi = unitConv.RfENtoRfSI(optValue);
      break;
    case 'si_rfi':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfi = optValue/3_600;
      break;
    case 'rfo':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) {
        options.rfoConv = unitConv.RfENtoRfSI(optValue);
        options.rfoShld = unitConv.RfENtoRfSI(optValue);
      }
      break;
    case 'si_rfo':
    optValue = parseFloat(browserData[key])
    if (optValue >= 0) {
      options.rfoConv = optValue/3_600;
      options.rfoShld = optValue/3_600;
    }
    break;
    case 'rfi_conv':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfiConv = unitConv.RfENtoRfSI(optValue);
      break;
    case 'rfo_conv':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfoConv = unitConv.RfENtoRfSI(optValue);
      break;
    case 'rfi_shld':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfiShld = unitConv.RfENtoRfSI(optValue);
      break;
    case 'rfo_shld':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) options.rfoShld = unitConv.RfENtoRfSI(optValue);
      break;
    case 't_fuel':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) 
        options.tFuel = unitConv.FtoK(optValue);
      break;
    case 'si_t_fuel':
      optValue = parseFloat(browserData[key])
      if (optValue >= 0) 
        options.tFuel = unitConv.CtoK(optValue);
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