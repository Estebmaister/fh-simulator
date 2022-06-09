const {logger, unitConv} = require('./utils');

const graphicData = ( comb, fuel, opt ) => {

  // Shut down loggers to avoid console overload during graphic drawing
  const savedLogger = {...logger};
  logger.error  = () => 0;
  logger.default= () => 0;
  logger.info   = () => 0;
  logger.debug  = () => 0;

  opt.unitSystem = 'english'
  const browserResult = [];

  // Checking local storage to avoid repeating calculations
  let prevResult;
  let localResult = JSON.parse(localStorage.getItem(`${opt.title}`));
  if (localResult) {
    prevResult = localResult[`${window.location.search}`];
    if (Object.keys(localResult).length > 5)
      localStorage.clear();
  }
  if (prevResult) {draw(prevResult, opt); return;}

  let graphVar
  switch (opt.graphVar) {
    case 'humidity':
      graphVar = 'humidity';
      break;
    case 'air_excess':
      graphVar = 'airExcess';
      opt.graphRange = opt.graphRange*1e-2;
      break;
    case 'o2_excess':
      graphVar = 'o2Excess';
      opt.graphRange = opt.graphRange*1e-2;
      break;
    case 'm_fluid':
      graphVar = 'mFluid';
      opt.graphRange = unitConv.BPDtolb_h(opt.graphRange*1e3);
      break;
    default:
      graphVar = 'tOut';
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
      duty_total: runResult.rad_result.duty_total,

      // t_in:  unitConv.KtoF(runResult.conv_result.t_in),
      t_out: unitConv.KtoF(runResult.rad_result.t_out),

      o2_excess:  runResult.flows['O2_%'],
      air_excess: runResult.flows['air_excess_%'] > 0 ? runResult.flows['air_excess_%'] : 0,
      humidity:   runResult.debug_data['humidity_%'],

      // --- Output vars
      // rad_tg_out: runResult.rad_result.tg_out,
      // shl_tg_out: runResult.shld_result.tg_out,
      cnv_tg_out: unitConv.KtoF(runResult.conv_result.tg_out),

      // m_flue:     runResult.shld_result.m_flue ? runResult.shld_result.m_flue : 0,
      m_fuel:     runResult.rad_result.m_fuel ? unitConv.kgtolb(runResult.rad_result.m_fuel) : 0,
      efficiency: runResult.rad_result.eff_total ? runResult.rad_result.eff_total : 0,
      rad_dist:   runResult.rad_result['%'] < 1  ? 100*runResult.rad_result['%'] : 0,
      // shl_dist:  runResult.shld_result['%'] ? 100*runResult.shld_result['%']: 0,
      // cnv_dist:  runResult.conv_result['%'] ? 100*runResult.conv_result['%']: 0,

      // rad_duty:  runResult.rad_result.duty,
      // shl_duty:  runResult.shld_result.duty,
      // cnv_duty:  runResult.conv_result.duty,

      // rad_alpha: runResult.rad_result.Alpha,
      // rad_t_in:  runResult.rad_result.t_in,
      // shl_t_in:  runResult.shld_result.t_in,
    }
  }
  
  if (!localResult) localResult = {};
  localResult[`${window.location.search}`] = browserResult;
  localStorage.setItem(`${opt.title}`, JSON.stringify(localResult));
  console.log(browserResult);
  draw(browserResult, opt);
}

module.exports = {
	graphicData
};