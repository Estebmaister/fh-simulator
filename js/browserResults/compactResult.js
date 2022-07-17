const {stringCompactResult} = require('./resultsToString');
const {logger} = require('./../utils');
const BASE = 'base', MODIFIED = 'modified';

const compactResult = ( comb, fuel, opt, defaultOpt ) => {

  const result = comb(fuel, opt);
  const time = {date: Date.now()};
  localStorage.setItem(`${opt.title}`, JSON.stringify({result, opt, time}));

  let baseResult, modResult;
  let baseOpt, modOpt;
  let localResult;
  switch (opt.title) {
    case BASE:
      baseOpt = opt;
      baseResult = result;
      localResult = JSON.parse(localStorage.getItem(MODIFIED));
      clearOldResult(localResult, MODIFIED);
      modOpt = localResult ? localResult.opt : {};
      modResult = localResult ? localResult.result : {};
      break;
    default:
      modOpt = opt;
      modResult = result;
      localResult = JSON.parse(localStorage.getItem(BASE));
      clearOldResult(localResult, BASE);
      if (!localResult) {
        const defaultResult = comb(fuel, defaultOpt);
        localResult = {result:defaultResult, opt:defaultOpt};
      }
      baseOpt = localResult ? localResult.opt : {};
      baseResult = localResult ? localResult.result : {};
      break;
  }
  
  const loader = document.getElementById('loader-wrapper');
  if (loader) loader.remove();

  const outComb = document.getElementById('output-com');
  if (outComb) outComb.innerHTML = stringCompactResult(opt.unitSystem, baseResult, baseOpt, modResult, modOpt);
}

const clearOldResult = ( storageResult, caseName ) => {
  if (!storageResult || !storageResult.time) return true;
  
  const timeDiff = Date.now() - storageResult.time.date;

  if (timeDiff > 1e3*60*60*24*3) { // > 3 days
    logger.info(`Deleting ${caseName} old result`)
    localStorage.removeItem(caseName);
    return true;
  }

  return false
}


module.exports = {
	compactResult
};