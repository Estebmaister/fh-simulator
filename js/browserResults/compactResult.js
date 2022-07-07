const {
    stringCompactResult
} = require('./resultsToString');
const {logger} = require('./../utils');

const compactResult = ( comb, fuel, opt, defaultOpt ) => {

    const result = comb(fuel, opt);

    localStorage.setItem(`${opt.title}`, JSON.stringify({result, opt}));

    let baseResult, modResult;
    let baseOpt, modOpt;
    let localResult;
    switch (opt.title) {
        case 'base':
            baseOpt = opt;
            baseResult = result;
            localResult = JSON.parse(localStorage.getItem(`modified`));
            modOpt = localResult ? localResult.opt : {};
            modResult = localResult ? localResult.result : {};
            break;
        default:
            modOpt = opt;
            modResult = result;
            localResult = JSON.parse(localStorage.getItem(`base`));
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

module.exports = {
	compactResult
};