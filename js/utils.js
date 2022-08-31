/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @newtonRaphson (f, fp, x0, options, name, noLog)
 * @version  1.00
 * @param   {f function} valid function to find the zero.
 * @param   {fp function} optional function derivate.
 * @param   {x0 number} valid number seed.
 * @param   {options object} valid options object.
 * @return  {number or false} a number is the iterations reach the result, 
 *          false if not.
 * //TODO: No check is made for NaN or undefined input numbers.
 * 
 * @logger  {info, warn, error, debug, default}
 * @param   {argument} optional string or object to print.
 * @return  {null} prints to the console.
 *
 *****************************************************************/

const logByLevel = (...stringsList) => {
  let finalText = "" + stringsList[1][0]
  for (let i = 1; i < stringsList[1].length; i++) {
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
        ` "var_converged_to":"${x1}", "iterations":"${iter}"`);
      return x1;
    }

    // Transfer update to the new guess:
    x0 = x1;
  }
  logger.error(`Newton-Raphson (${name}): Maximum iterations reached (${maxIter})`);

  return false;
};

const 
  tempToK = 273.15,
  pAtmRef = 101_325,
  /* ATT: Changes here must be done at webInput too. */
  barrelsToft3 = 5.6145833333,
  ft3Tolb = 62.371, // for Water @60°F
  spGrav = 0.84, // for current fluid
  tempAmbRef = tempToK + 15.55556; // 288.7 K

const unitConv = {
  RtoK: (n=1) => n*(5/9),
  KtoR: (n=1) => n*(9/5),
  KtoF: (n=1) => n*(9/5) - 459.67,
  CtoK: (n=1) => n+tempToK,
  CtoF: (n=1) => n*(9/5) + 32,
  FtoC: (n=1) => (n-32)*(5/9),
  FtoK: (n=1) => (n-32)*(5/9)+tempToK,

  kgtolb: (n=1) => n*2.20462,
  lbtokg: (n=1) => n/2.20462,
  m3ToBarrels: (n=1) => n/(0.158987295),
  BPDtolb_h:(n=1,spG=spGrav) => n*barrelsToft3*ft3Tolb/24*spG,
  lb_htoBPD:(n=1,spG=spGrav) => n/barrelsToft3/ft3Tolb*24/spG,

  kJtoBTU: (n=1) => n/1.05506,
  BTUtokJ: (n=1) => n*1.05506,

  fttom:  (n=1) => n/3.28084,
  ft2tom2:(n=1) => n/(3.28084**2),
  mtoft:  (n=1) => n*3.28084,
  m2toft2:(n=1) => n*(3.28084**2),
  intom:  (n=1) => n/39.3701,
  mtoin:  (n=1) => n*39.3701,

  CpENtoCpSI: (n=1) => n*1.05506/(5/9)*2.20462,     // (kJ/kg-C)
  kwENtokwSI: (n=1) => n*1.05506/(5/9)*3.28084,     // (kJ/h-m-C)
  RfENtoRfSI: (n=1) => n/(1.05506/(5/9)*3.28084**2),// (h-m2-C/kJ)
  hcENtohcSI: (n=1) => n*1.05506/(5/9)*3.28084**2,  // (kJ/h-m2-C)
  BtuHtoW: (n=1) => n/3.4121416331,
};

/** Example call from terminal: node . false ENGLISH 26.6667 50 0 20 1.01325e5 */ 
const getOptions = () => {
  const optObject = {
    // constants
    tempToK,
    tempAmbRef,
    pAtmRef,
    spGrav,

    // Entry default arguments
    runDistCycle: true,     // boolean
    verbose:    true,       // boolean
    tAmb:       tempAmbRef, // K
    tAir:       tempAmbRef, // K
    tFuel:      tempAmbRef, // K
    humidity:   50.0,       // %
    o2Excess:   .01 * 0,    // fr
    airExcess:  .01 * 20,   // fr
    radDist:    .01 * 64,   // % *.01
    hLoss:      .01 * 1.5,  // % *.01
    effcy:      .01 * 80,   // % *.01
    rfi:        0.000,      // hr.ft².°F/Btu
    rfiConv:    0.000,      // hr.ft².°F/Btu
    rfoConv:    0.000,      // hr.ft².°F/Btu
    rfiShld:    0.000,      // hr.ft².°F/Btu
    rfoShld:    0.000,      // hr.ft².°F/Btu
    tIn:        unitConv.FtoK(678),// K
    tOut:       unitConv.FtoK(772),// K
    mFluid:     90e3,       // BPD
    miuFluidIn: 1.45,       // cp
    miuFluidOut:.960,       // cp
    cpFluidIn:  unitConv.CpENtoCpSI(.676), // kJ/kg-C
    cpFluidOut: unitConv.CpENtoCpSI(.702), // kJ/kg-C 
    kwFluidIn:  .038,       // Btu/h-ft-F
    kwFluidOut: .035,       // Btu/h-ft-F
    pAtm:       pAtmRef,    // Pa
    unitSystem: "SI",       // string SI or EN
    lang:       "en",       // string EN or ES
    title:      "base",     // string
    graphVar:   "t_out",    // string one of four
    graphRange: 50,         // uInt
    graphPoints:100,        // uInt
  
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

const round = (number, dec = 3) => number !== undefined ? (number).
  toLocaleString(undefined,{minimumFractionDigits: dec, maximumFractionDigits: dec}) : NaN;
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

const dualSystem = (onlyUnit, noUnit, decimal=3 ,units="", number=0) => {
  if (onlyUnit) return ` ${units}`;
  return round(number, decimal) + (noUnit ? "" : ` ${units}`);
}

const englishSystem = { //(US Customary)
  "energy/mol":   (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/mol", unitConv.kJtoBTU(n)),
  "mass/mol":     (n,d,nU,oU) => dualSystem(oU,nU,d,"lb/lbmol", n),
  heat_flow :     (n,d,nU,oU) => dualSystem(oU,nU,d,"MMBtu/h", unitConv.kJtoBTU(n)*1e-6),
  heat_flux:      (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/h-ft²",unitConv.kJtoBTU(n) /unitConv.m2toft2()),
  fouling_factor: (n,d,nU,oU) => dualSystem(oU,nU,d,"h-ft²-°F/Btu", unitConv.m2toft2(n)*unitConv.KtoR()/unitConv.kJtoBTU()),
  "energy/mass":  (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/lb", unitConv.kJtoBTU(n) / unitConv.kgtolb()),
  "energy/vol":   (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/ft³", unitConv.kJtoBTU(n) / unitConv.mtoft()**3),

  area:     (n,d,nU,oU) => dualSystem(oU,nU,d,"ft²", unitConv.m2toft2(n)),
  length:   (n,d,nU,oU) => dualSystem(oU,nU,d,"ft", unitConv.mtoft(n)),
  lengthC:  (n,d,nU,oU) => dualSystem(oU,nU,d,"in", unitConv.mtoin(n)),
  lengthInv:(n,d,nU,oU) => dualSystem(oU,nU,d,"1/ft",n/unitConv.mtoft()),
  temp:     (n,d,nU,oU) => dualSystem(oU,nU,d,"°R", unitConv.KtoR(n)),
  tempC:    (n,d,nU,oU) => dualSystem(oU,nU,d,"°F", unitConv.CtoF(n-tempToK)),
  pressure: (n,d,nU,oU) => dualSystem(oU,nU,d,"psi", n *1.450377e-4),
  mass:     (n,d,nU,oU) => dualSystem(oU,nU,d,"lb", unitConv.kgtolb(n)),
  mass_flow:(n,_d,nU,oU) => dualSystem(oU,nU,0,"lb/h", unitConv.kgtolb(n)),
  barrel_flow:(n,d,nU,oU,spG = spGrav) => dualSystem(oU,nU,d,"x10³ BPD", unitConv.kgtolb(n)/ unitConv.BPDtolb_h(1,spG) /1e3),
  barrel_flowC:(n,d,nU,oU) => dualSystem(oU,nU,d,"BPD", n),
  vol_flow: (n,d,nU,oU) => dualSystem(oU,nU,d,"ft³/h", unitConv.mtoft(n)**3),
  cp:       (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/lb-°F", n *.238845896627),
  cp_mol:   (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/lb-mol-°F", n *.238845896627),
  power:    (n,d,nU,oU) => dualSystem(oU,nU,d,"Btu/h", n *3.4121416331),
  moist:    (n,d,nU,oU) => dualSystem(oU,nU,d,"÷10³ lb H2O/lb", n*1e3),
  thermal:  (n,d,nU,oU) => dualSystem(oU,nU,d,"BTU/h-ft-°F", unitConv.kJtoBTU(n)/unitConv.KtoR()/unitConv.mtoft()),
  convect:  (n,d,nU,oU) => dualSystem(oU,nU,d,"BTU/h-ft²-°F", unitConv.kJtoBTU(n)/unitConv.KtoR()/(unitConv.mtoft()**2)),
  viscosity:(n,d,nU,oU) => dualSystem(oU,nU,d,"cP", n),
  system:   {en: "English", es: "Inglés"}
};

const siSystem = {
  "energy/mol":   (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/mol", n),
  "mass/mol":     (n,d,nU,oU) => dualSystem(oU,nU,d,"kg/kmol", n),
  heat_flow:      (n,d,nU,oU) => dualSystem(oU,nU,d,"MW", n*1e-6 /3.6),
  heat_flux:      (n,d,nU,oU) => dualSystem(oU,nU,d,"W/m²", n /3600),
  fouling_factor: (n,d,nU,oU) => dualSystem(oU,nU,d,"m²-K/W ÷10³", n*3.6e3),

  "energy/mass":  (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/kg", n),
  "energy/vol":   (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/m³", n),
  area:       (n,d,nU,oU)  => dualSystem(oU,nU,d,"m²", n),
  length:     (n,d,nU,oU)  => dualSystem(oU,nU,d,"m", n),
  lengthC:    (n,d,nU,oU)  => dualSystem(oU,nU,d,"cm", n*1e2),
  lengthInv:  (n,d,nU,oU)  => dualSystem(oU,nU,d,"1/m", n),
  tempC:      (n,_d,nU,oU) => dualSystem(oU,nU,0,"°C", n -tempToK),
  temp:       (n,d,nU,oU)  => dualSystem(oU,nU,d,"K", n),
  pressure:   (n,d,nU,oU)  => dualSystem(oU,nU,d,"kPa", n *1e-3),
  mass:       (n,d,nU,oU)  => dualSystem(oU,nU,d,"kg", n *1e-3),
  mass_flow:  (n,d,nU,oU)  => dualSystem(oU,nU,d,"kg/s", n /3600),
  barrel_flow:(n,d,nU,oU,spG = spGrav) => englishSystem.barrel_flow(n,d,nU,oU,spG),
  barrel_flowC:(n,d,nU,oU) => dualSystem(oU,nU,d,"m³/d", n/unitConv.m3ToBarrels()),
  vol_flow: (n,d,nU,oU) => dualSystem(oU,nU,d,"m³/s", n /3600),
  cp:       (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/kg-K", n),
  cp_mol:   (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/kmol-K", n),
  power:    (n,d,nU,oU) => dualSystem(oU,nU,d,"W", n /3.6),
  moist:    (n,d,nU,oU) => dualSystem(oU,nU,d,"g H2O/kg", n *1e3),
  thermal:  (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/h-m-C", n),
  convect:  (n,d,nU,oU) => dualSystem(oU,nU,d,"kJ/h-m²-C", n),
  viscosity:(n,d,nU,oU) => dualSystem(oU,nU,d,"cP", n),
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