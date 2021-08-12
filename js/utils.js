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

function newtonRaphson (f, fp, x0, options) {
  let x1, y, yp, tol, maxIter, iter, yph, ymh, yp2h, ym2h, h, hr, verbose, eps;

  // Interpret variadic forms:
  if (typeof fp !== 'function') {
    options = x0;
    x0 = fp;
    fp = null;
  }

  options = options || {};
  tol = options.tolerance === undefined ? 1e-7 : options.tolerance;
  eps = options.epsilon === undefined ? 2.220446049250313e-16 : options.epsilon;
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
          log("info", 'Newton-Raphson: failed to converged due to nearly zero first derivative');
      }
      return false;
      }

      // Update the guess:
      x1 = x0 - y / yp;

      // Check for convergence:
      if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
      if (verbose) {
          log("info", `Newton-Raphson: converged to x = ${x1} after ${iter} iterations`);
      }
      return x1;
      }

      // Transfer update to the new guess:
      x0 = x1;
  }

  if (verbose) {
      log("info", `Newton-Raphson: Maximum iterations reached (${maxIter})`);
  }

  return false;
}

const tempToK = 273.15
const tempAmbRef = tempToK + 25; // 298.15

/** Example for a call of this file: 
 * node . true true 25 70 80 1e5  */ 
const options = {
  // Entry arguments
  verbose: process.argv[2] == "true",
  processData: process.argv[3] == "true",
  tAmb: tempToK + parseFloat(process.argv[4]) || tempAmbRef - 4,
  humidity: parseFloat(process.argv[5]) || 70,
  airExcess: 0.01 * parseFloat(process.argv[6]) || 0.01 * 80,
  pAtm: parseFloat(process.argv[7]) || 1e5,

  // Newton Raphson arguments
  tolerance: 1e-2,
  epsilon: 3e-6,
  maxIterations: 20,
  h: 1e-4,

  // constants
  tempToK,
  tempAmbRef
}

if (options.verbose) log("debug",JSON.stringify(options, null, 2))

module.exports = {
  newtonRaphson,
  options,
  log
};