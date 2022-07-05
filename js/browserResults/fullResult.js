const {
    stringRadResult, 
    stringShldResult, 
    stringConvResult,
    stringCombResult
} = require('./resultsToString');
const {logger} = require('./../utils');

const outputFullData = (result, browserData, lang, unitSystem) => {
    logger.debug(JSON.stringify(browserData, null, 2))
    const loader = document.getElementById('loader-wrapper');
    if (loader) loader.remove();

    const outComb = document.getElementById('output-combustion');
    if (outComb) outComb.textContent = stringCombResult(lang, result, unitSystem);

    const outRad = document.getElementById('output-radiant');
    if (outRad) outRad.textContent = stringRadResult(lang, result.rad_result, unitSystem);

    const outShl = document.getElementById('output-shield');
    if (outShl) outShl.textContent = stringShldResult(lang, result.shld_result, unitSystem);

    const outCnv = document.getElementById('output-convective');
    if (outCnv) outCnv.textContent = stringConvResult(lang, result.conv_result, unitSystem);
};

module.exports = {
	outputFullData
};