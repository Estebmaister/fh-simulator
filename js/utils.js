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

/** Returns a linear function to approximate the value,
 * in case that the value is constant or there isn't data
 * about the changes, it can be called with only "y1"
 * to make a function that always return y1.
 */
const linearApprox = ({x1,x2,y1,y2}) => {
  if (typeof y1 !== "number") {
    logger.error(`call for linearApprox with bad value: ${y1}`)
    return () => 0;
  }
  if (x1 == x2 || x2 == undefined || y2 == undefined) 
    return () => y1;
  const m = (y2 - y1) / (x2 - x1);
  return (x) => m * (x - x1) + y1;
}


const tempToK = 273.15
const tempAmbRef = tempToK + 25; // 298.15

const unitConv = {
  RtoK: (n) => n*(5/9),
  KtoR: (n) => n*(9/5),
  CtoK: (n) => n+tempToK,
  CtoF: (n) => n*(9/5) + 32,
  FtoC: (n) => (n-32)*(5/9),
  FtoK: (n) => (n-32)*(5/9)+tempToK,

  kgtolb: (n) => n*2.20462,
  lbtokg: (n) => n/2.20462,

  kJtoBTU: (n) => n/1.05506,
  BTUtokJ: (n) => n*1.05506,

  fttom: (n) => n/3.28084,
  mtoft: (n) => n*3.28084,
  intom: (n) => n/39.3701,
  mtoin: (n) => n*39.3701,

  CpENtoCpSI: (n) => n*1.05506/(5/9)*2.20462,
  kwENtokwSI: (n) => n*1.05506/(5/9)*3.28084,
  BtuHtoW: (n) => n/3.4121416331,
}

/** Example for a call of this file: 
 * node . false SI 26.6667 50 0 20 1.01325e5
 * */ 
const getOptions = () => {
  const optObject = {
    // constants
    tempToK,
    tempAmbRef,

    // Entry default arguments
    verbose:    true,       // boolean
    tAmb:       tempAmbRef, // K
    humidity:   0,          // %
    o2Excess:   .01 * 0,    // fr
    airExcess:  .01 * 0,    // fr
    pAtm:       101_325,    // Pa
    unitSystem: "SI",       // string
    lang:       "en",       // string
  
    // Newton Raphson arguments
    NROptions: {
      tolerance: 1e-4,
      epsilon: 3e-8,
      maxIterations: 20,
      h: 1e-4,
      verbose: true
    }
  };
  
  if (typeof process == 'undefined') return optObject;

  optObject.verbose =                process.argv[2] == "true";
  optObject.unitSystem =             process.argv[3];
  optObject.tAmb =tempToK+parseFloat(process.argv[4]) || tempAmbRef;
  optObject.humidity =    parseFloat(process.argv[5]) || 0;
  optObject.o2Excess =.01*parseFloat(process.argv[6]) || .01 * 0;
  optObject.airExcess=.01*parseFloat(process.argv[7]) || .01 * 0;
  optObject.pAtm =        parseFloat(process.argv[8]) || 1.01325e5;
  // Newton Raphson arguments
  optObject.NROptions.verbose =      process.argv[2] == "true";

  return optObject;
};
const options = getOptions();

const round = (number) => (Math.round(number*1e3)/1e3).toFixed(3);
const roundDict = (object = {}) => {
  for (const [key, value] of Object.entries(object)) {
    if(!isNaN(value) && value !== "") object[key] = round(value);
  };
};

if (options.verbose) log("debug",JSON.stringify(options, null, 2));

const englishSystem = { //(US Customary)
  "energy/mol":   (n) => round(unitConv.kJtoBTU(n)) + " Btu/mol",
  "mass/mol":     (n) => round(n * 2.2046244202) + " lb/lb-mol",
  heat_flow :     (n) => round(unitConv.kJtoBTU(n)*1e-6) + " MMBtu/h",
  heat_flux:      (n) => round(unitConv.kJtoBTU(n)/unitConv.mtoft(1)**2) + " Btu/h-ft2",
  fouling_factor: (n) => round(n * 10.763910417*1.8/0.94781712) + " h-ft2-°F/Btu",
  "energy/mass":  (n) => round(unitConv.kJtoBTU(n)/unitConv.kgtolb(1)) + " Btu/lb",
  "energy/vol":   (n) => round(unitConv.kJtoBTU(n)/unitConv.mtoft(1)**3) + " Btu/ft3",

  area:     (n) => round(n * 10.763910417)    + " ft2",
  length:   (n) => round(unitConv.mtoft(n))   + " ft",
  temp:     (n) => round(unitConv.KtoR(n))    + " °R",
  tempC:    (n) => round(unitConv.CtoF(n-tempToK)) + " °F",
  pressure: (n) => round(n * 0.0001450377)    + " psi",
  mass:     (n) => round(n * 2.2046244202e-3) + " lb",
  mass_flow:(n) => round(unitConv.kgtolb(n))  + " lb/h",
  vol_flow: (n) => round(unitConv.mtoft(n)**3)+ " f3/h",
  cp:       (n) => round(n * 0.238845896627)  + " Btu/lb-mol °F",
  power:    (n) => round(n * 3.4121416331)    + " Btu/h",
  moist:    (n) => round(n * 1e3)             + "x10^(-3) lb-H2O/lb",
  thermal:  (n) => round( unitConv.kJtoBTU(n) /
    unitConv.KtoR(1)/unitConv.mtoft(1) )      + " BTU/h-ft-F",
  convect:  (n) => round( unitConv.kJtoBTU(n) /
    unitConv.KtoR(1)/(unitConv.mtoft(1)**2) ) + " BTU/h-ft2-F",
  system:   {en: "English", es: "Inglés"}
}

const siSystem = {
  "energy/mol":   (n) => round(n * 1) + " kJ/mol",
  "mass/mol":     (n) => round(n * 1) + " kg/kmol",
  heat_flow:      (n) => round(n*1e-6)+ " MJ/h",
  heat_flux:      (n) => round(n * 1) + " W/m2",
  fouling_factor: (n) => round(n * 1) + " m2-K/W",

  "energy/mass":  (n) => round(n * 1) + " kJ/kg",
  "energy/vol":   (n) => round(n * 1) + " kJ/m3",
  area:     (n) => round(n * 1)    + " m2",
  length:   (n) => round(n * 1)    + " m",
  tempC:    (n) => round(n * 1-tempToK) + " °C",
  temp:     (n) => round(n * 1)    + " K",
  pressure: (n) => round(n * 1e-3) + " kPa",
  mass:     (n) => round(n * 1e-3) + " kg",
  mass_flow:(n) => round(n * 1)    + " kg/h",
  vol_flow: (n) => round(n * 1)    + " m3/h",
  cp:       (n) => round(n * 1)    + " kJ/kmol K",
  power:    (n) => round(n * 1)    + " W",
  moist:    (n) => round(n * 1e3)  + " g-H2O/kg",
  thermal:  (n) => round(n * 1)    + " kJ/h-m-C",
  convect:  (n) => round(n * 1)    + " kJ/h-m2-C",
  system:   {en: "SI", es: "SI"}
}

const initSystem = (unitSystem) => {
  if (typeof unitSystem !== "string") {
    if (options.verbose) log("warn", 
    `invalid type (${unitSystem}) for unit system, using default SI`);
    return siSystem
  }
  switch (unitSystem.toLowerCase()) {
    case "si":
      return siSystem;
    case "english":
      return englishSystem;
    default:
      log("warn", 
      unitSystem.toLowerCase() + 
      ' - invalid unit system, using default SI')
      return siSystem;
  }
}

module.exports = {
  newtonRaphson,
  options,
  log,
  logger,
  unitConv,
  round,
  roundDict,
  linearApprox,
  initSystem
};