/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @newtonRaphson (f, fp, x0, options)
 * @version  1.00
 * @param   {f function} valid function to find the zero.
 * @param   {fp function} optional function derivate.
 * @param   {x0 number} valid number seed.
 * @param   {options object} valid options object.
 * @return  {number or false} a number is the iterations reach the result, 
 *          false if not.
 * 
 * @log (level, args)
 * @version  1.00
 * @param   {level} optional string like "error", "info" or "debug".
 * @return  {null} prints to the console.
 * 
 * @author  Esteban Camargo
 * @date    17 Jul 2021
 * @call    node . true true 25 70 80 1e5
 * @callParams verbose, check for changes in csv, t_amb, humidity, air_excess, p_amb
 * 
 * Note: No check is made for NaN or undefined input numbers.
 *
 *****************************************************************/

const log = function(...arguments) {
  if (arguments.length === 0) return;

  switch (arguments[0]) {
    case "warn":
      for (var i = 1; i < arguments.length; i++) {
        console.log(`{"WARN": "${arguments[i]}"}`);
      }
      break;
    case "info":
      for (var i = 1; i < arguments.length; i++) {
        console.log(`{"INFO": "${arguments[i]}"}`);
      }
      break;
    case "error":
      for (var i = 1; i < arguments.length; i++) {
        console.error(`{"ERROR": "${arguments[i]}"}`);
      }
      break;
    case "debug":
      for (var i = 1; i < arguments.length; i++) {
        console.debug(`{"DEBUG": ${arguments[i]}}`);
      }
      break;
    default:
      for (var i = 0; i < arguments.length; i++) {
        console.log(`{"DEFAULT": "${arguments[i]}"}`);
      }
      break;
  }
}
const logByLevel = (...arguments) => {
  let argumentsText = ""
  for (var i = 1; i < arguments.length; i++) {
    argumentsText += arguments[i]
  }
  console.log(`{'${arguments[0]}': '${argumentsText}'}`);
}
const logger = {
  info: (...arguments) => logByLevel("INFO", arguments),
  warn: (...arguments) => logByLevel("WARN", arguments),
  error: (...arguments) => logByLevel("ERROR", arguments),
  debug: (...arguments) => logByLevel("DEBUG", arguments),
  default: (...arguments) => logByLevel("DEFAULT", arguments),
}

/** Receives a function, optional the derivate, a seed and the options object, finally an identifier name */
function newtonRaphson (f, fp, x0, options, name) {
  let x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;

  // Interpret variadic forms:
  if (typeof fp !== 'function') {
    name = options;
    options = x0;
    x0 = fp;
    fp = null;
  }

  options = options || {};
  tol = options.tolerance === undefined ? 1e-7 : options.tolerance;
  eps = options.epsilon === undefined ? 2.22e-15 : options.epsilon;
  maxIter = options.maxIterations === undefined ? 20 : options.maxIterations;
  h = options.h === undefined ? 1e-4 : options.h;
  verbose = options.verbose === undefined ? false : options.verbose;
  hr = 1 / h;

  iter = 0;
  while (iter++ < maxIter) {
      // Compute the value of the function:
      y = f(x0);

      if (fp) {
      yp = fp(x0);
      } else {
      // Needs numerical derivatives:
      yph = f(x0 + h);
      ymh = f(x0 - h);
      yp2h = f(x0 + 2 * h);
      ym2h = f(x0 - 2 * h);

      yp = ((ym2h - yp2h) + 8 * (yph - ymh)) * hr / 12;
      }

      // Check for badly conditioned update (extremely small first deriv relative to function):
      if (Math.abs(yp) <= eps * Math.abs(y)) {
      if (verbose) {
          log("info", `Newton-Raphson (${name}): failed to converged due to nearly zero first derivative`);
      }
      return false;
      }

      // Update the guess:
      x1 = x0 - y / yp;

      // Check for convergence:
      if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
      if (verbose) {
          log("info", `Newton-Raphson (${name}): converged to x = ${x1} after ${iter} iterations`);
      }
      return x1;
      }

      // Transfer update to the new guess:
      x0 = x1;
  }

  if (verbose) {
      log("info", `Newton-Raphson (${name}): Maximum iterations reached (${maxIter})`);
  }

  return false;
}

const tempToK = 273.15
const tempAmbRef = tempToK + 25; // 298.15

/** Example for a call of this file: 
 * node . false 26.6667 50 0 20 1.01325e5 SI */ 
const getOptions = () => {
  const optObject = {
    // Entry default arguments
    verbose: true,          // boolean
    tAmb: tempAmbRef,     // K
    humidity: 0,            // %
    o2Excess: .01 * 0,      // fr
    airExcess: .01 * 0,     // fr
    pAtm: 101_325,          // Pa
    unitSystem: "SI",       // string
  
    // Newton Raphson arguments
    NROptions: {
      tolerance: 1e-4,
      epsilon: 3e-8,
      maxIterations: 20,
      h: 1e-4,
      verbose: true
    },
  
    // constants
    tempToK,
    tempAmbRef
  }
  
  if (typeof process == 'undefined') return optObject;

  optObject.verbose = process.argv[2] == "true";
  optObject.tAmb = tempToK + parseFloat(process.argv[3]) || tempAmbRef;
  optObject.humidity = 1e-10 + parseFloat(process.argv[4]) || 0;
  optObject.o2Excess = .01 * parseFloat(process.argv[5]) || .01 * 0;
  optObject.airExcess = 1e-10 + .01 * parseFloat(process.argv[6]) || .01 * 0;
  optObject.pAtm = parseFloat(process.argv[7]) || 1e5;
  optObject.unitSystem = process.argv[8];
  // Newton Raphson arguments
  optObject.NROptions.verbose = process.argv[2] == "true";

  return optObject
};
const options = getOptions();

const round = (number) => (Math.round(number*1e3)/1e3).toFixed(3)
const roundDict = (object = {}) => {
  for (const [key, value] of Object.entries(object)) {
    if(!isNaN(value)) object[key] = round(value);
  }
}

if (options.verbose) log("debug",JSON.stringify(options, null, 2))

const englishSystem = { //(US Customary)
  "energy/mol": (number) => round(number * 0.9478171203) + " Btu/mol",
  "mass/mol": (number) => round(number * 2.2046244202) + " lb/kmol",
  heat_flow : (number) => round(number * 3.4121416331) + " MMBtu/h",
  heat_flux: (number) => round(number * 3.4121416331/10.763910417) + " Btu/h-ft2",
  //TODO: change default
  fouling_factor: (number) => round(number * 1) + " h-ft2-°F/Btu",

  //TODO: change default
  "energy/mass": (number) => round(number * 1) + " kJ/kg",
  "energy/vol": (number) => round(number * 1) + " kJ/m3",
  area: (number) => round(number * 10.763910417) + " ft2",
  length: (number) => round(number * 3.280839895) + " ft",
  temp: (number) => round(number * 1.8) + " °R",
  tempC: (number) => round((number-tempToK)*9/5 + 32) + " °F",
  pressure: (number) => round(number * 0.0001450377) + " psi",
  mass: (number) => round(number * 2.2046244202e-3) + " lb",
  mass_flow: (number) => round(number * 2.2046244202) + " lb/s",
  vol_flow: (number) => round(number * 35.314666721) + " f3/h",
  //TODO: change default
  cp: (number) => round(number * 1) + " kJ/kmol K",
  power: (number) => round(number * 3.4121416331) + " Btu/h",
  moist: (number) => round(number * 1) + " lb-H2O/lb",
  system: "ENGLISH"
}

const siSystem = {
  "energy/mol": (number) => round(number * 1) + " kJ/mol",
  "mass/mol": (number) => round(number * 1) + " kg/kmol",
  heat_flow: (number) => round(number * 1) + " MW/h",
  heat_flux: (number) => round(number * 1) + " W/m2",
  fouling_factor: (number) => round(number * 1) + " m2-K/W",

  "energy/mass": (number) => round(number * 1) + " kJ/kg",
  "energy/vol": (number) => round(number * 1) + " kJ/m3",
  area: (number) => round(number * 1) + " m2",
  length: (number) => round(number * 1) + " m",
  tempC: (number) => round(number * 1 - tempToK) + " °C",
  temp: (number) => round(number * 1) + " K",
  pressure: (number) => round(number * 1e-3) + " kPa",
  mass: (number) => round(number * 1e-3) + " kg",
  mass_flow: (number) => round(number * 1) + " kg/s",
  vol_flow: (number) => round(number * 1) + " m3/h",
  cp: (number) => round(number * 1) + " kJ/kmol K",
  power: (number) => round(number * 1) + " W",
  moist: (number) => round(number * 1) + " kg-H2O/kg",
  system: "SI"
}

const initSystem = (options) => {
  if (typeof options.unitSystem !== "string") {
    log("warn", 
    `invalid type (${options.unitSystem}) for unit system, using default SI`)
    return siSystem
  }
  switch (options.unitSystem.toLowerCase()) {
    case "si":
      return siSystem;
    case "english":
      return englishSystem;
    default:
      log("warn", 
      options.unitSystem.toLowerCase() + 
      ' - invalid unit system, using default SI')
      return siSystem;
  }
}
const units = initSystem(options)

module.exports = {
  newtonRaphson,
  options,
  log,
  logger,
  round,
  roundDict,
  units
};