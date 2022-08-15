const {logger, unitConv} = require('./../utils');
const {draw} = require('./graphicDraw');
const loader = document.getElementById('output-sect');

const graphicData = ( comb, fuel, opt ) => {

  // Shut down loggers to avoid console overload during graphic drawing
  const savedLogger = {...logger};
  logger.error  = () => 0;
  logger.default= () => 0;
  logger.info   = () => 0;
  logger.debug  = () => 0;

  opt.unitSystem = 'english'
  const browserResult = [];

  const CASE = `${opt.title}_graph`;
  // Checking local storage to avoid repeating calculations
  let prevResult;
  let localResult = JSON.parse(localStorage.getItem(CASE));
  const threeDays = 1e3*60*60*24*3;
  if (localResult) {
    if (
      Object.keys(localResult).length > 5 || 
      !localResult.time || 
      Date.now() - localResult.time.date > threeDays
    ) {
      localStorage.removeItem(CASE);
      localResult = {};
    } else {
      prevResult = localResult[`${window.location.search}`];
    }
  }
  if (prevResult) {
    draw(prevResult, opt);
    savedLogger.debug(`"Drawing stored case: ${CASE}"`);
    if (loader) loader.remove();
    return;
  }

  let graphVar;
  opt.graphRange *= 1e-2;
  switch (opt.graphVar) {
    case 'humidity':
      graphVar = 'humidity';
      opt.graphRange *= 1e2;
      break;
    case 'air_excess':
      graphVar = 'airExcess';
      break;
    case 'o2_excess':
      graphVar = 'o2Excess';
      break;
    case 'm_fluid':
      graphVar = 'mFluid';
      opt.graphRange *= 1e5;
      break;
    default:
      graphVar = 'tOut';
      opt.graphRange *= 1e2;
      break;
  }

  const points = opt.graphPoints, range = opt.graphRange;
  let initVar = opt[graphVar] - range/2;
  if (initVar < 0) initVar = 0;
  savedLogger.info(`Var: ${graphVar}, centerValue: ${opt[graphVar]}, range: ${range}, points: ${points}`);
  for (let index = 0; index < points; index++) {
    opt[graphVar] = initVar + index*range/points;
    const runResult = comb(fuel, opt);
    browserResult[index] = {

      // --- Input vars
      m_fluid:    unitConv.lb_htoBPD(unitConv.kgtolb(runResult.rad_result.m_fluid))*1e-3,
      t_out: unitConv.KtoF(runResult.rad_result.t_out),
      
      o2_excess:  runResult.flows['O2_%'] < 11 ? runResult.flows['O2_%'] : 11,
      air_excess: runResult.flows['air_excess_%'] > 0 ? runResult.flows['air_excess_%'] : 0,
      humidity:   runResult.debug_data['humidity_%'],
      
      // --- Output vars
      rad_tg_out: unitConv.KtoF(runResult.rad_result.tg_out),
      cnv_tg_out: unitConv.KtoF(runResult.conv_result.tg_out),
      
      // m_flue:     runResult.shld_result.m_flue ? runResult.shld_result.m_flue : 0,
      m_fuel:     runResult.rad_result.m_fuel ? 
        unitConv.kgtolb(runResult.rad_result.m_fuel) : 0,
      efficiency: runResult.rad_result.eff_thermal_val ? 
        runResult.rad_result.eff_thermal_val : 0,
      // duty_total: runResult.rad_result.duty_total,
      rad_dist:   runResult.rad_result['%'] < 1  ? 
        Math.round(1e5*runResult.rad_result['%'])/1e3 : 0,
      cnv_dist:   runResult.conv_result['%'] < 1 ? 
        Math.round(1e5*runResult.conv_result['%'])/1e3 :0,
      rad_cnv_dist: runResult.conv_result['%'] != 0 ? 
        runResult.rad_result['%'] / runResult.conv_result['%'] : 0,
      // shl_duty:  runResult.shld_result.duty,
      co2_emiss: Math.round(1e2 *
        runResult.products["CO2"] * (44.01 / runResult.flows["fuel_MW"]) *
        runResult.rad_result.m_fuel * (1e-3 * 24 * 365)
      ) / 1e2,

    }
  }
  
  if (!localResult) localResult = {};
  localResult[`${window.location.search}`] = browserResult;
  localResult.time = {date: Date.now()};
  localStorage.setItem(CASE, JSON.stringify(localResult));
  console.log(browserResult);
  draw(browserResult, opt);
  if (loader) loader.remove();
}

module.exports = {
	graphicData
};