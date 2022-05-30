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
 * @logger {info,warn,error,debug,default}
 * @version  1.00
 * @param   {argument} optional string or object to print.
 * @return  {null} prints to the console.
 * 
 * @author  Esteban Camargo
 * @date    17 Jul 2021
 * @call    node . true true 25 70 80 1e5
 * @callParams verbose, check for changes in csv, t_amb, humidity, air_excess, p_amb
 * 
 * //TODO: No check is made for NaN or undefined input numbers.
 *
 *****************************************************************/

const logByLevel = (...stringsList) => {
  let finalText = "" + stringsList[1][0]
  for (var i = 1; i < stringsList[1].length; i++) {
    finalText += " " + stringsList[1][i]
  }
  switch (stringsList[0]) {
    case "DEBUG":
      if (options.verbose) console.debug(JSON.parse(`{"${stringsList[0]}": ${finalText}}`));
      break;
    case "INFO":
      console.info( `{ \x1b[32;1m${stringsList[0]}\x1b[0m: "${finalText}"}`);
      break;
    case "ERROR":
      console.error(`{ \x1b[31;1m${stringsList[0]}\x1b[0m: '${finalText}'}`);
      break;
    case "WARN":
      console.warn( `{ \x1b[35;1m${stringsList[0]}\x1b[0m: '${finalText}'}`);
      break;
    default:
      console.log(  `{ \x1b[34;1m${stringsList[0]}\x1b[0m: '${finalText}'}`);
      break;
  }
};
const logger = {
  info:   (...stringsList) => logByLevel("INFO", stringsList),
  warn:   (...stringsList) => logByLevel("WARN", stringsList),
  error:  (...stringsList) => logByLevel("ERROR", stringsList),
  debug:  (...stringsList) => logByLevel("DEBUG", stringsList),
  default:(...stringsList) => logByLevel("DEFAULT", stringsList),
};

/** Receives a function, optional the derivate, a seed and the options object, finally an identifier name */
const newtonRaphson = (f, fp, x0, nrOptions, name, noLog) => {
  let x1, y, yp, iter, yph, ymh, yp2h, ym2h;

  // Interpret variadic forms:
  if (typeof fp !== 'function') {
    noLog = name;
    name = nrOptions;
    nrOptions = x0;
    x0 = fp;
    fp = null;
  }

  const 
    opts = nrOptions || {},
    tol = opts.tolerance === undefined ? 1e-7 : opts.tolerance,
    eps = opts.epsilon === undefined ? 2.22e-15 : opts.epsilon,
    h = opts.h === undefined ? 1e-4 : opts.h,
    hr = 1 / h,
    maxIter = opts.maxIterations === undefined ? 20 : opts.maxIterations;

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
      logger.error(`Newton-Raphson (${name}): failed to converged due to nearly zero first derivative`);
      return false;
    }

    // Update the guess:
    x1 = x0 - y / yp;

    // Check for convergence:
    if (Math.abs(x1 - x0) <= tol * Math.abs(x1)) {
      if (!noLog) logger.debug(`"Newton-Raphson", "func":"${name}",`+
        ` "var converged to":${x1}, "iterations":${iter}`);
      return x1;
    }

    // Transfer update to the new guess:
    x0 = x1;
  }
  logger.error(`Newton-Raphson (${name}): Maximum iterations reached (${maxIter})`);

  return false;
};

/** Returns a linear function f(x)=y to approximate the value,
 * in case that the value is constant or there isn't data
 * about the changes, it can be called with only "y1"
 * to make a function that always return y1.
 */
const linearApprox = ({x1,x2,y1,y2}) => {
  if (typeof y1 !== "number") {
    logger.error(`call for linearApprox with incorrect value type for y1: ${y1}`)
    return () => 0;
  }
  if (x1 == x2 || x2 == undefined || y2 == undefined) 
    return () => y1;
  const m = (y2 - y1) / (x2 - x1);
  return (x) => m * (x - x1) + y1;
};

const viscosityApprox = ({t1,t2,v1,v2}) => {
  if (typeof v1 !== "number") {
    logger.error(`call for viscosityApprox with incorrect value type for v1: ${v1}`)
    return () => 0;
  }
  if (t1 == t2 || t2 == undefined || v2 == undefined) 
    return () => v1;
  const B = Math.log(v1/v2) / (1/t1 - 1/t2)
  const A = v1 * Math.exp(-B/t1);
  return (temp) => A * Math.exp(B/temp);
}


/** (Tref1, Tref2, T1, T2, co-current) Returns the value of the
 * Logarithmic mean temperature difference.
 * 
 * counter-current by default, for co-current set the five argument as true.
 * */
const LMTD = (t_cold_in, t_cold_out, t_hot_in, t_hot_out, co_current) => {
  
  let // counter-current (default)
    delta_t1 = t_hot_in - t_cold_out,
    delta_t2 = t_hot_out - t_cold_in;
    
  if (co_current) { // co-current
    delta_t1 = t_hot_out - t_cold_in;
    delta_t2 = t_hot_in - t_cold_out;
  }
    
  // ( (t_hot_in - t_cold_out) - (t_hot_out - t_cold_in) ) / ln( (t_hot_in - t_cold_out) / (t_hot_out-t_cold_in) )
  return Math.abs((delta_t1 - delta_t2) /Math.log(Math.abs(delta_t1 / delta_t2)) );
};

const 
  tempToK = 273.15,
  pAtmRef = 101_325,
  barrelsToft3 = 5.6145833333,
  ft3Tolb = 62.371, // for Water @60°F
  tempAmbRef = tempToK + 15.55556; // 288.7 K

const unitConv = {
  RtoK: (n) => n*(5/9),
  KtoR: (n) => n*(9/5),
  KtoF: (n) => n*(9/5) - 459.67,
  CtoK: (n) => n+tempToK,
  CtoF: (n) => n*(9/5) + 32,
  FtoC: (n) => (n-32)*(5/9),
  FtoK: (n) => (n-32)*(5/9)+tempToK,

  kgtolb: (n) => n*2.20462,
  lbtokg: (n) => n/2.20462,
  BPDtolb_h:(n) => n*barrelsToft3*ft3Tolb/24*0.84,
  lb_htoBPD:(n) => n/barrelsToft3/ft3Tolb*24/0.84,

  kJtoBTU: (n) => n/1.05506,
  BTUtokJ: (n) => n*1.05506,

  fttom:  (n) => n/3.28084,
  ft2tom2:(n) => n/(3.28084**2),
  mtoft:  (n) => n*3.28084,
  m2toft2:(n) => n*(3.28084**2),
  intom:  (n) => n/39.3701,
  mtoin:  (n) => n*39.3701,

  CpENtoCpSI: (n) => n*1.05506/(5/9)*2.20462,     // (kJ/kg-C)
  kwENtokwSI: (n) => n*1.05506/(5/9)*3.28084,     // (kJ/h-m-C)
  RfENtoRfSI: (n) => n/(1.05506/(5/9)*3.28084**2),// (h-m2-C/kJ)
  hcENtohcSI: (n) => n*1.05506/(5/9)*3.28084**2,  // (kJ/h-m2-C)
  BtuHtoW: (n) => n/3.4121416331,
};

/** Example call from terminal: node . false ENGLISH 26.6667 50 0 20 1.01325e5 */ 
const getOptions = () => {
  const optObject = {
    // constants
    tempToK,
    tempAmbRef,
    pAtmRef,

    // Entry default arguments
    runDistCycle: true,     // boolean
    verbose:    true,       // boolean
    tAmb:       tempAmbRef, // K
    tAir:       tempAmbRef, // K
    tFuel:      tempAmbRef, // K
    humidity:   0,          // %
    o2Excess:   .01 * 0,    // fr
    airExcess:  .01 * 0,    // fr
    radDist:    .01 * 70,   // % *.01
    hLoss:      .01 * 1.5,  // % *.01
    effcy:      .01 * 80,   // % *.01
    rfi:        0,          // hr.ft².°F/Btu
    rfo:        0,          // hr.ft².°F/Btu
    tIn:        678,        // F
    tOut:       772,        // F
    mFluid:     unitConv.BPDtolb_h(90e3),  // lb/h
    pAtm:       pAtmRef,    // Pa
    unitSystem: "SI",       // string
    lang:       "en",       // string
    title:      "heater_sim",
    graphVar:   "t_out",    // string
    graphRange: 50,         // number > 0
    graphPoints:100,         // number > 0
  
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
if (options.verbose) logger.debug(`"options","args":${JSON.stringify(options, null, 2)}`);

const round = (number, dec = 3) => (Math.round(number*10**dec)/10**dec).toFixed(dec);
const roundDict = (object = {}) => {
  for (const [key, value] of Object.entries(object)) {
    if(!isNaN(value) && value !== "") object[key] = round(value);
  }
};

/** Normalize an object of fuels/products */
const normalize = (fuels, name, noLog) => {
  const normalFuel = {...fuels};
  const total = Object.values(normalFuel).reduce((acc, value)=> acc + value);
  for (const fuel in normalFuel) {
    normalFuel[fuel] = normalFuel[fuel]/total;
  }
  if (!noLog) 
    logger.debug(`"normalize", "name": "${name}", "total": ${total}`);
  return normalFuel;
};

/** Thermal Cond equation func(temp [K]) for certain substance in data */
const kw = ({k0, k1, k2, Substance}) => {
  // Thermal Cond equation from NIST data with polynomial approx. R2=1
  // k2*T^2 + k1*T + k0  (valid from 300K to 1350K)* SO2 only to 500K
  if (k0 == 0 || k0 == "-") {
    logger.debug(`"Thermal Cond func called for '${Substance}' without coffs"`);
    return () => 0;
  }
  const cnv_fact = 3_600 * 1e-3; // Therm. Cond. (W/m*K) -> (kJ/h*m*K)
  return (temp) => (k0 + k1* temp + k2* temp**2)*cnv_fact;
};

/** returns a Thermal Cond function of temp for certain flue composition.
 * 
 * Should be called in the combustion section after flue composition 
 * is determined.
*/
const flueThermalCond = (data, flue) => {
  const 
    normalFlue = normalize(flue, "flueThermalCond"),
    so2_kw = kw(data[34]),
    h2o_kw = kw(data[31]),
    co2_kw = kw(data[6] ),
    n2_kw  = kw(data[3] ),
    o2_kw  = kw(data[2] );

  return (t) => normalFlue.CO2*co2_kw(t) + normalFlue.SO2*so2_kw(t)
  + normalFlue.H2O*h2o_kw(t) + normalFlue.O2*o2_kw(t) + normalFlue.N2*n2_kw(t);
};

/** Viscosity equation func(temp [K]) for certain substance in data */
const miu = ({u0, u1, u2, Substance}) => {
  // Viscosity equation from NIST data with polynomial approx. R2=0.99998
  // u2*T^2 + u1*T + u0  (valid from 300K to 1350K)* SO2 only to 500K
  if (u0 == 0 || u0 == "-") {
    logger.debug(`"Viscosity func called for '${Substance}' without coffs"`);
    return () => 0;
  }
  return (temp) => u0 + u1* temp + u2* temp**2;
};

/** returns a Viscosity function of temp for certain flue composition.
 * 
 * Should be called in the combustion section after flue composition 
 * is determined.
*/
const flueViscosity = (data, flue) => {
  const 
    normalFlue = normalize(flue, "flueViscosity"),
    so2_v = miu(data[34]),
    h2o_v = miu(data[31]),
    co2_v = miu(data[6] ),
    n2_v  = miu(data[3] ),
    o2_v  = miu(data[2] );

  return (t) => normalFlue.CO2*co2_v(t) + normalFlue.SO2*so2_v(t)
  + normalFlue.H2O*h2o_v(t) + normalFlue.O2*o2_v(t) + normalFlue.N2*n2_v(t);
};

/** returns a Thermal conductivity function of temp for tubes A312‐TP321 
 * temp should be used in Kelvin, value returned in (kJ/h-m-C)
*/
const kw_tubes_A312_TP321 = (t) => {
  const 
    temp = t - tempToK, // transforms temp from Kelvin to Celsius
    conv_factor = 3_600 * 1e-3, // (J/s -> kJ/h)
    c0 = 14.643,
    c1 = 1.64e-2,
    c2 = -2e-6;

  return (c0 + c1*temp + c2*temp**2)*conv_factor;
};

const englishSystem = { //(US Customary)
  "energy/mol":   (n) => round(unitConv.kJtoBTU(n)) + " Btu/mol",
  "mass/mol":     (n) => round(n) + " lb/lb-mol",
  heat_flow :     (n) => round(unitConv.kJtoBTU(n)*1e-6) + " MBtu/h",
  heat_flux:      (n) => round(unitConv.kJtoBTU(n)/unitConv.mtoft(1)**2) + " Btu/h-ft²",
  fouling_factor: (n) => round(n * 10.763910417*1.8/0.94781712) + " h-ft²-°F/Btu",
  "energy/mass":  (n) => round(unitConv.kJtoBTU(n)/unitConv.kgtolb(1)) + " Btu/lb",
  "energy/vol":   (n) => round(unitConv.kJtoBTU(n)/unitConv.mtoft(1)**3) + " Btu/ft³",

  area:     (n) => round(n * 10.763910417)     + " ft²",
  length:   (n) => round(unitConv.mtoft(n))    + " ft",
  lengthC:  (n) => round(unitConv.mtoin(n))    + " in",
  lengthInv:(n) => round(n /unitConv.mtoft(1)) + " 1/ft",
  temp:     (n) => round(unitConv.KtoR(n))     + " °R",
  tempC:    (n) => round(unitConv.CtoF(n-tempToK))+" °F",
  pressure: (n) => round(n * 0.0001450377)     + " psi",
  mass:     (n) => round(n * 2.2046244202e-3)  + " lb",
  mass_flow:(n) => round(unitConv.kgtolb(n))   + " lb/h",
  barrel_flow:(n)=>round(unitConv.kgtolb(n)/unitConv.BPDtolb_h(1)/1000) + " x10³ BPD",
  vol_flow: (n) => round(n*unitConv.mtoft(1)**3)+" ft³/h",
  cp:       (n) => round(n * 0.238845896627)   + " Btu/lb-°F",
  cp_mol:   (n) => round(n * 0.238845896627)   + " Btu/lb-mol-°F",
  power:    (n) => round(n * 3.4121416331)     + " Btu/h",
  moist:    (n) => round(n * 1e3)              + " ÷10³ lb-H2O/lb",
  thermal:  (n) => round(n *unitConv.kJtoBTU(1)/
    unitConv.KtoR(1)/unitConv.mtoft(1) )       + " BTU/h-ft-°F",
  convect:  (n) => round(n *unitConv.kJtoBTU(1)/
    unitConv.KtoR(1)/(unitConv.mtoft(1)**2) )  + " BTU/h-ft²-°F",
  viscosity:(n) => round(n * 1)                + " cP",
  system:   {en: "English", es: "Inglés"}
};

const siSystem = {
  "energy/mol":   (n) => round(n * 1) + " kJ/mol",
  "mass/mol":     (n) => round(n * 1) + " kg/kmol",
  heat_flow:      (n) => round(n*1e-6)+ " MJ/h",
  heat_flux:      (n) => round(n * 1) + " W/m²",
  fouling_factor: (n) => round(n * 1) + " m²-K/W",

  "energy/mass":  (n) => round(n * 1) + " kJ/kg",
  "energy/vol":   (n) => round(n * 1) + " kJ/m³",
  area:     (n) => round(n * 1)    + " m²",
  length:   (n) => round(n * 1)    + " m",
  lengthC:  (n) => round(n * 1e2)  + " cm",
  lengthInv:(n) => round(n * 1)    + " 1/m",
  tempC:    (n) => round(n * 1-tempToK) + " °C",
  temp:     (n) => round(n * 1)    + " K",
  pressure: (n) => round(n * 1e-3) + " kPa",
  mass:     (n) => round(n * 1e-3) + " kg",
  mass_flow:(n) => round(n * 1)    + " kg/h",
  barrel_flow:(n)=>round(unitConv.kgtolb(n)/unitConv.BPDtolb_h(1)/1000) + " x10³ BPD",
  vol_flow: (n) => round(n * 1)    + " m³/h",
  cp:       (n) => round(n * 1)    + " kJ/kg-K",
  cp_mol:   (n) => round(n * 1)    + " kJ/kmol-K",
  power:    (n) => round(n * 1)    + " W",
  moist:    (n) => round(n * 1e3)  + " g-H2O/kg",
  thermal:  (n) => round(n * 1)    + " kJ/h-m-C",
  convect:  (n) => round(n * 1)    + " kJ/h-m²-C",
  viscosity:(n) => round(n * 1)    + " cP",
  system:   {en: "SI", es: "SI"}
};

const initSystem = (unitSystem) => {
  if (typeof unitSystem !== "string") {
    if (options.verbose) logger.warn( 
    `invalid type (${unitSystem}) for unit system, using default SI`);
    return siSystem
  }
  switch (unitSystem.toLowerCase()) {
    case "si":
      return siSystem;
    case "english":
      return englishSystem;
    case "en":
      return englishSystem;
    default:
      logger.warn(unitSystem.toLowerCase() + 
      ' - invalid unit system, using default SI')
      return siSystem;
  }
};

module.exports = {
  options,
  unitConv,
  newtonRaphson,
  logger,
  round,
  roundDict,
  linearApprox,
  viscosityApprox,
  initSystem,
  normalize,
  flueViscosity,
  flueThermalCond,
  kw_tubes_A312_TP321,
  LMTD
};