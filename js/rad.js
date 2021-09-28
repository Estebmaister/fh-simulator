/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @radSection (params)
 * @version  1.00
 * @param   {params object} valid params object.
 * @return  {number or false} a number is the iterations reach the result, 
 *          false if not.
 * Effective Gas Temperature (Tg)
 * 
 * @author  Esteban Camargo
 * @date    17 Jul 2021
 * @call    node . true true 25 70 80 1e5
 * @callParams verbose, check for changes in csv, t_amb, humidity, air_excess, p_amb
 * 
 * Q_total = Uc * A * LMTD
 * For a "well mixed" radiant section this temperature is assumed 
 * to be equal to the bridgewall temperature, i.e. the exit temperature 
 * of the flue gases leaving the radiant section.
 * Q_in = Q_out
 * Q_in = Q_rls + Q_air + Q_fuel
 * Q_out = Q_R + Q_shield + Q_losses + Q_flue_gases
 * Q_R = Q_rad + Q_conv = Q_fluid(out-in) = m_fluid*Cp_fluid(t_out - t_in)
 *****************************************************************/
const {newtonRaphson, log} = require('./utils');

/** Calculates the required mass fluid and the necessary
 * temperature of the rad section
 * Q_in = Q_rls + Q_air + Q_fuel
 * Q_out = Q_R + Q_shield + Q_losses + Q_flue
 * Q_in(Tg) - Q_out(Tg) ~= 0
 * Q_rad + Q_conv = Q_fluid(out-in)
*/
const radSection = (params) => {
  let rad_result = {}
  if (params.t_out !== undefined) {
    rad_result = radSection_full(undefined, params.t_out, params)
  } else if (params.m_fuel !== undefined) {
    rad_result = radSection_full(params.m_fuel, undefined, params)
  } else {
    params.err += "-wrong call for rad section, no seed for mass fuel or out temp."
  }
  // radSection_nr = (t_out) => {
  //     [t_difference, rad_result] = radSection_full(null, t_out, params)
  //     return t_difference
  // }
  // const mass_fluid = newtonRaphson(radSection_nr, params.m_fuel_seed, params.NROptions)
  return rad_result
}

const radSection_full = (m_fuel_seed, t_out_seed, params) => {
  let 
    /** Effective gas temperature in Kelvin degrees */
    Tg = 0,
    /** (K) of the fluid process */
    t_out = t_out_seed || 600,
    /** (K) of the fluid process in rad section */
    t_in = params.t_in_rad,
    /** (kmol/h) */
    m_fuel = m_fuel_seed || params.m_fuel;
  
  if (params === null || params === undefined) params = {}
  const // Temperatures
    t_air = params.t_air, // (K)
    t_fuel = params.t_fuel, // (K)
    t_amb = params.t_amb, // (K)
    /** Tw = Average tube wall temperature in Kelvin degrees */
    Tw = (tOut, tIn = t_in) => 100 + 0.5*(tIn + tOut);

  const // Process parameters
    /** (kmol/h) */
    m_fluid = params.m_fluid || 225_700,
    /** (kmol/h) */
    m_air = (mFuel = m_fuel) => params.m_air_ratio*mFuel,
    /** (kmol/h) */
    m_flue = (mFuel = m_fuel) => params.m_flue_ratio*mFuel,
    /** (kJ/kmol) net calorific value */
    NCV = params.ncv || 927_844.41,
    /** (kJ/kmol.K) */
    Cp_fluid = params.Cp_fluid,
    /** (kJ/kmol-K) */
    Cp_fuel = params.Cp_fuel((t_fuel + t_amb)*0.5) || 39.26,
    /** (kJ/kmol-K) */
    Cp_air = params.Cp_air((t_air + t_amb)*0.5) || 29.142,
    /** (kJ/kmol-K) Molar heat of flue gases */
    Cp_flue = (tG, tAmb = t_amb) => params.Cp_flue((tG + tAmb)*0.5);

  const // Fired heater parameters
    /** - number of tubes in rad section */
    N = params.tubes_rad || 60,
    /** - number of shield tubes */
    N_shld = params.shld_tubes_rad || 8,
    /** (m) effective tube length*/
    L = params.tube_l_rad || 20.024,
    /** (m) external diameter rad section */
    Do = params.do_rad || 0.219,
    /** (m) center to center distance of tube */
    CtoC = params.cToC_rad || 0.394,
    /** - emissive factor */
    F = params.emissive_factor || 0.97,
    /** - alpha factor */
    alpha = params.alpha_factor || 0.835,
    /** - alpha shield factor */
    alpha_shld = params.shld_alpha_factor || 1,
    /** (kJ/h.m2.c) Film convective heat transfer coff */
    h_conv = params.h_conv_rad || 30.66,
    pi = params.pi || 3.14159,
    // calculated params
    /** (m2) Cold plane area of tube bank */
    Acp = N*CtoC*L,
    /** (m2) Cold plane area of shield tube bank */
    Acp_shld = N_shld*CtoC*L,
    /** (kJ/h.m2.K4) */
    sigma = 2.041e-7,
    //sigma = 5.67e-11, // (W.m-2.K-4)
    /** (m2) Area of tubes in bank */
    At = N*pi*Do*L;

  // ******* Heat input to the radiant section ********
  /** Sensible heat of fluid Q_fluid = m_fluid * Cp_fluid(T_fluid_avg) * DeltaT */
  const Q_fluid = (tOut = t_out, tIn = t_in) =>
    m_fluid * Cp_fluid * (tOut - tIn)
  /** Sensible heat of air Q_air = m_air * Cp_air * (tAir - tAmb) */
  const Q_air = (mFuel, tAir = t_air, tAmb = t_amb) => 
    m_air(mFuel)*Cp_air*(tAir - tAmb);
  /** Combustion heat of fuel Q_rls = m_fuel * NCV */
  const Q_rls = (mFuel) => mFuel*NCV;
  /** Sensible heat of fuel Q_fuel = m_fuel * Cp_fuel * (tFuel - tAmb) */
  const Q_fuel = (mFuel, tFuel = t_fuel, tAmb = t_amb) => 
    mFuel*Cp_fuel*(tFuel - tAmb);
  /** Heat input Q_in = Q_rls + Q_air(tAir, tAmb) + Q_fuel(tFuel, tAmb) */
  const Q_in = (mFuel, tAir = t_air, tFuel = t_fuel, tAmb = t_amb) => 
    Q_rls(mFuel) + Q_air(mFuel, tAir, tAmb) + Q_fuel(mFuel, tFuel, tAmb)

  // ******* Heat taken out of radiant section ********
  /** Heat losses through setting (5% of Q_release) */
  const Q_losses = (mFuel = m_fuel) => 0.05*Q_rls(mFuel);
  /** Radiant heat transfer = sigma*(alpha*Acp)*F*(tG**4 - Tw(tIn,tOut)**4)*/
  const Q_rad = (tG, tOut = t_out, tIn = t_in) => 
    sigma*(alpha*Acp)*F*(tG**4 - Tw(tOut,tIn)**4)
  /** Convective heat transfer = h_conv*At*(tG - Tw(tOut,tIn))*/
  const Q_conv = (tG, tOut = t_out, tIn = t_in) => 
    h_conv*At*(tG - Tw(tOut,tIn))
  /** Heat absorbed by radiant tubes = Q_rad + Q_conv */
  const Q_R = (tG, tOut = t_out, tIn = t_in) => 
    Q_rad(tG,tOut,tIn) + Q_conv(tG,tOut,tIn)
  /** Shield radiant heat transfer (a variation of Q_rad) */
  const Q_shld = (tG, tOut = t_out, tIn = t_in) => 
    sigma*(alpha_shld*Acp_shld)*F*(tG**4 - Tw(tOut,tIn)**4)
  /** Sensible heat of flue gases = m_flue*Cp_flue(tG,tAmb)*(tG - tAmb) */
  const Q_flue = (tG, mFuel = m_fuel, tAmb = t_amb) => 
    m_flue(mFuel)*Cp_flue(tG,tAmb)*(tG - tAmb)
  /** Q_out = Q_R + Q_shld + Q_losses + Q_flue */
  const Q_out = (tG, tOut = t_out, mFuel = m_fuel, tIn = t_in, tAmb = t_amb) => 
    Q_R(tG, tOut, tIn) + Q_shld(tG, tOut, tIn) + Q_losses(mFuel) + Q_flue(tG, mFuel, tAmb)

  // **************************************************

  // Calculating Tg from the given variable (mass_fuel or temp_out)
  let flame = 0
  let duty = 0
  if (t_out_seed !== undefined) { // Given temp_out
    duty = m_fluid*Cp_fluid*(t_out_seed - params.t_in_conv)
    // Approximating t_in_rad with assumption for 30% of duty
    t_in = params.t_in_conv + duty * 0.3 / (m_fluid*Cp_fluid)
    log(`${t_in} vs ${params.t_in_rad}`)
    // Calculating Tg
    const TgBalance_OutTemp = (tG) => m_fluid*Cp_fluid*(t_out - t_in) - (Q_rad(tG) + Q_conv(tG))
    flame = newtonRaphson(TgBalance_OutTemp, 1000, params.NROptions, "rad_Tg_Tout")
    if (flame != false) Tg = flame
    // Calculating fuel mass
    const mFuelBalance = (mFuel) => Q_out(Tg, t_out, mFuel) - Q_in(mFuel)
    const mass_fuel_seed = m_fluid*Cp_fluid*(t_out_seed - params.t_in_conv)/(NCV*0.75)
    m_fuel = newtonRaphson(mFuelBalance, mass_fuel_seed, params.NROptions, "rad_mFuel")
    if (m_fuel != false) params.m_fuel = m_fuel

  } else if (m_fuel_seed !== undefined) { // Given mass_fuel
    duty = Q_rls(m_fuel_seed) * 0.8
    // Approximating t_in_rad and t_out with efficiency
    t_in = params.t_in_conv + duty * 0.3 / (m_fluid*Cp_fluid)
    t_out_seed = params.t_in_conv + duty / (m_fluid*Cp_fluid)
    log(`t_in_rad, seed: ${t_in} vs problem: ${params.t_in_rad}`)
    // Calculating Tg
    //TODO: t_out isn't set needs recalculate
    const TgBalance_MassFuel = (tG) => Q_out(tG, t_out_seed, m_fuel) - Q_in(m_fuel)
    flame = newtonRaphson(TgBalance_MassFuel, 1000, params.NROptions, "rad_Tg_mFuel")
    if (flame != false) Tg = flame
    // Calculating t_out
    const tOutBalance = (tOut) => m_fluid*Cp_fluid*(tOut - t_in) - (Q_rad(Tg) + Q_conv(Tg))
    t_out = newtonRaphson(tOutBalance, t_out_seed, params.NROptions, "rad_Tout")
    if (t_out != false) params.t_out = t_out

    // Discrepancies
    log(`t_out, seed: ${t_out_seed} vs calculated: ${t_out}`)
    duty = m_fluid*Cp_fluid*(t_out - params.t_in_conv)
    t_in_2 = params.t_in_conv + duty * 0.3 / (m_fluid*Cp_fluid)
    log(`t_in_rad, seed: ${t_in} vs calc: ${t_in_2}`)
  } else {
    params.err += "-wrong call for rad section, no seed for mass fuel or out temp."
  }

  // **************************************************
  params.t_out = t_out
  params.t_in_rad = t_in
  params.Tg = Tg

  const rad_result = {
    "Tw": Tw(t_out),
    "m_fuel": m_fuel,
    "t_out": t_out,
    "Tg": Tg,

    "Q_in": Q_in(m_fuel),
    "Q_rls": Q_rls(m_fuel),
    "Q_air": Q_air(m_fuel),
    "Q_fuel": Q_fuel(m_fuel),
    
    "Q_out": Q_out(Tg, t_out, m_fuel),
    "Q_losses": Q_losses(m_fuel),
    "Q_rad": Q_rad(Tg, t_out),
    "Q_conv": Q_conv(Tg),
    "Q_shld": Q_shld(Tg),
    "Q_flue": Q_flue(Tg),
    
    "Q_fluid": Q_fluid(),
    "Cp_fluid": Cp_fluid,
    "Cp_fuel": Cp_fuel,
    "Cp_air": Cp_air,
    "Cp_flue": Cp_flue(Tg),
  }
  //log("debug", JSON.stringify(rad_result, null, 2))

  //let t_out_recall = t_in - t_out + (Q_rad(Tg) + Q_conv(Tg)) / (m_fluid*Cp_fluid)
  return rad_result
}

module.exports = {
  radSection
};