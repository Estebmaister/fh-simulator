const {optionsModifier} = require('./optionsModifier');
const {graphicData} = require('./graphicData');
const {logger} = require('./utils');
const {
  stringRadResult, 
  stringShldResult, 
  stringConvResult,
  stringCombResult
} = require('./resultsToString');

// Extracts the data from the URL
const extractURIdata = (argumentsArray) => {
	if (argumentsArray == '') return {};
	let resultObject = {};
  for (const iterator of argumentsArray) {
    const argumentPair = iterator.split('=', 2);
		if (argumentPair.length == 1) {
			resultObject[argumentPair[0]] = '';
		}
		else {
			resultObject[argumentPair[0]] = decodeURIComponent(
				argumentPair[1].replace(/\+/g, ' ')
				);
		}
  }
	return resultObject;
}

// Modify the fuels and options object with the Browser Data
const insertBrowserData = (browserData, fuels, data, options) => {
	const browserFuels = {}
	const fuelCompounds = data.filter(element => element.Formula in browserData)

	for (const key in browserData) {
		const compoundArray = fuelCompounds.filter(element => element.Formula==key)
		if (compoundArray.length === 1 && browserData[key] !== '') {
			const fuelFrac = parseFloat(browserData[key])
			if (fuelFrac > 0 && fuelFrac <= 100) {
				browserFuels[key] = fuelFrac/100
			} else {
				logger.error(`fuel fraction invalid (${fuelFrac}) for ${key}`)
			}
		} else if (browserData[key] !== '' && browserData[key] !== undefined) {
      // Case when the key is not empty and isn't a fuel either
			optionsModifier(key, browserData, options);
		}
	}

	if (Object.keys(browserFuels).length !== 0) fuels = browserFuels;
  return fuels
}

const outputData = (result, browserData, lang, unitSystem) => {
  logger.debug(JSON.stringify(browserData, null, 2))
  const loader = document.getElementById('loader-wrapper');
  if (loader) loader.remove();
  
  const outComb = document.getElementById('output-combustion');
  if (outComb) outComb.textContent = stringCombResult(lang, result, unitSystem);
  
  const outRad = document.getElementById('output-radiant'   );
  if (outRad) outRad.textContent = stringRadResult(lang, result.rad_result, unitSystem);
  const outShl = document.getElementById('output-shield'    );
  if (outShl) outShl.textContent = stringShldResult(lang, result.shld_result, unitSystem);
  const outCnv = document.getElementById('output-convective');
  if (outCnv) outCnv.textContent = stringConvResult(lang, result.conv_result, unitSystem);
};

// Process the data and start the combustion algorithm
const browserProcess = (fuels, data, options, combustion) => {

  let lang = 'en';  
  const browserPath = window.location.pathname.split('/'); // ex ',fh-simulator,en,result.html'}
  if (browserPath.length > 0) browserPath.forEach(item => {
    if (item == 'es' || item == 'es_graph') lang = 'es'
  });
  options.lang = lang;

  const browserData = extractURIdata(window.location.search.substring(1).split('&'));
  if (browserData !== {}) fuels = insertBrowserData(browserData, fuels, data, options);
  
  if (browserPath[1].includes('_graph') || browserPath[2].includes('_graph')) {
    graphicData(combustion, fuels, options);
  } else {
    const result = combustion(fuels, options);
    outputData(result, browserData, lang, options.unitSystem);
  }
};

module.exports = {
	browserProcess
};