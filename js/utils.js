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

const unitConv = {
  RtoK: (n) => n*(5/9),
  CtoK: (n) => n+tempToK,
  CtoF: (n) => n*9/5 + 32,
  FtoC: (n) => (n-32)*5/9,

  LbtoKg: (n) => n/2.20462,
  KgtoLb: (n) => n*2.20462,

  KjtoBtu: (n) => n/1.05506,
  BtutoKj: (n) => n*1.05506,

  FttoM: (n) => n*3.28084,
  MtoFt: (n) => n/3.28084,
  IntoM: (n) => n*39.3701,
  MtoIn: (n) => n/39.3701,

  CpENtoCpSI: (n) => n*1.8/0.94781712,
  BtuHtoW: (n) => n/3.4121416331,
}

/** Example for a call of this file: 
 * node . false 26.6667 50 0 20 1.01325e5 SI
 * */ 
const getOptions = () => {
  const optObject = {
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
    },
  
    // constants
    tempToK,
    tempAmbRef
  }
  
  if (typeof process == 'undefined') return optObject;

  optObject.verbose =                process.argv[2] == "true";
  optObject.tAmb =tempToK+parseFloat(process.argv[3])     || tempAmbRef;
  optObject.humidity =    parseFloat(process.argv[4])     || 0;
  optObject.o2Excess =    parseFloat(process.argv[5])*.01 || .01 * 0;
  optObject.airExcess =   parseFloat(process.argv[6])*.01 || .01 * 0;
  optObject.pAtm =        parseFloat(process.argv[7])     || 1.01325e5;
  optObject.unitSystem =             process.argv[8];
  // Newton Raphson arguments
  optObject.NROptions.verbose =    process.argv[2] == "true";

  return optObject
};
const options = getOptions();

const round = (number) => (Math.round(number*1e3)/1e3).toFixed(3)
const roundDict = (object = {}) => {
  for (const [key, value] of Object.entries(object)) {
    if(!isNaN(value) && value !== "") object[key] = round(value);
  }
}

if (options.verbose) log("debug",JSON.stringify(options, null, 2))

const englishSystem = { //(US Customary)
  "energy/mol":   (n) => round(n * 0.94781712) + " Btu/mol",
  "mass/mol":     (n) => round(n * 2.2046244202) + " lb/lb-mol",
  heat_flow :     (n) => round(n * 3.4121416331) + " MMBtu/h",
  heat_flux:      (n) => round(n * 3.4121416331/10.763910417) + " Btu/h-ft2",
  fouling_factor: (n) => round(n * 10.763910417*1.8/0.94781712) + " h-ft2-°F/Btu",
  "energy/mass":  (n) => round(n * 0.94781712 / 2.2046244202) + " Btu/lb",
  "energy/vol":   (n) => round(n * 0.94781712 / 35.314666721) + " Btu/ft3",

  area:     (n) => round(n * 10.763910417)    + " ft2",
  length:   (n) => round(n * 3.280839895)     + " ft",
  temp:     (n) => round(n * 1.8)             + " °R",
  tempC:    (n) => round(unitConv.CtoF(n-tempToK)) + " °F",
  pressure: (n) => round(n * 0.0001450377)    + " psi",
  mass:     (n) => round(n * 2.2046244202e-3) + " lb",
  mass_flow:(n) => round(n * 2.2046244202)    + " lb/s",
  vol_flow: (n) => round(n * 35.314666721)    + " f3/h",
  cp:       (n) => round(n * 0.94781712/1.8)  + " Btu/lb-mol °F",
  power:    (n) => round(n * 3.4121416331)    + " Btu/h",
  moist:    (n) => round(n * 1e3)             + "x10^(-3) lb-H2O/lb",
  system:   {en: "English", es: "Inglés"}
}

const siSystem = {
  "energy/mol":   (n) => round(n * 1) + " kJ/mol",
  "mass/mol":     (n) => round(n * 1) + " kg/kmol",
  heat_flow:      (n) => round(n * 1) + " MW/h",
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
  mass_flow:(n) => round(n * 1)    + " kg/s",
  vol_flow: (n) => round(n * 1)    + " m3/h",
  cp:       (n) => round(n * 1)    + " kJ/kmol K",
  power:    (n) => round(n * 1)    + " W",
  moist:    (n) => round(n * 1e3)  + " g-H2O/kg",
  system:   {en: "SI", es: "SI"}
}

const initSystem = (unitSystem) => {
  if (typeof unitSystem !== "string") {
    log("warn", 
    `invalid type (${unitSystem}) for unit system, using default SI`)
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
  initSystem
};