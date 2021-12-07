/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @radSection (params)
 * @version  1.00
 * @param   {params object} valid params object.
 * @return  {rad_result object} 
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
const {newtonRaphson, logger, unitConv} = require('./utils');

// TODO: delete after testing inside
const {options, initSystem} = require('./utils');
const unitSystem = initSystem(options.unitSystem);

/** Calculates the required mass fluid and the necessary
 * temperature of the rad section
 * Q_in = Q_rls + Q_air + Q_fuel
 * Q_out = Q_R + Q_shield + Q_losses + Q_flue
 * Q_in(t_g) - Q_out(t_g) ~= 0
 * Q_rad + Q_conv = Q_fluid(out-in)
*/
const radSection = (params) => {
  let rad_result = {}
  // Calling the function according to the params given
  if (params.t_out !== undefined) {
    rad_result = radSection_full(undefined, params.t_out, params)
  } else if (params.m_fuel !== undefined) {
    rad_result = radSection_full(params.m_fuel, undefined, params)
  } else {
    params.err += "-wrong call for rad section, no seed for mass fuel or out temp."
  }
  return rad_result
}

const radSection_full = (m_fuel_seed, t_out_seed, params) => {
  let 
    /** Effective gas temperature in Kelvin degrees */
    t_g = 0,
    /** (K) of the fluid process in rad section */
    t_in = 0,
    /** (K) of the fluid process */
    t_out = t_out_seed || params.t_out,
    /** (kmol/h) */
    m_fuel = m_fuel_seed || params.m_fuel;
  
  if (params === null || params === undefined) params = {}
  const // Temperatures
    t_air = params.t_air, // (K)
    t_fuel = params.t_fuel, // (K)
    t_amb = params.t_amb, // (K)
    Tb = (tOut, tIn = t_in) => 0.5*(tIn + tOut);

    const // Fired heater parameters
    /** - number of tubes in rad section */
    N = params.N_rad || 42,
    /** - number of shield tubes */
    N_shld = params.N_shld || 16,
    /** (m) effective tube length*/
    L = params.L_rad || 20.024,
    /** (m) external diameter rad section */
    Do = params.Do_rad || 0.219,
    /** (m) internal diameter rad section */
    Di = params.Di_rad || 0.219,

    /** (m) center to center distance of tube */
    CtoC = params.CtoC || 0.394,
    /** (ft) Mean Beam Length */
    MBL = 2/3 * (params.Width_rad*
      params.Length_rad*
      params.Tall_rad) ** (1/3),

    // TODO: set this coffs
    Rfi = 0,  // internal fouling factor
    hi = 2992,   // (kJ/h-m2-C) internal heat transfer coff
    kw = params.kw_tube, // tube thermal conductivity
    /** - emissive factor */
    F = 0.6290,
    /** - alpha radiant factor */
    alpha = 0.904,
    /** - alpha shield factor */
    alpha_shld =  1,

    /** (kJ/h-m2-C) Film convective heat transfer coff */
    h_conv = params.h_conv || 30.66,
    pi = Math.PI || 3.14159,
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
  
  const // Process parameters
    efficiency = params.efficiency || 0.8,
    duty_conv_dist = params.duty_conv_dist || 0.3,
    /** (kmol/h) */
    m_fluid = params.m_fluid || 225_700,
    /** (kmol/h) */
    m_air = (mFuel = m_fuel) => params.m_air_ratio*mFuel,
    /** (kmol/h) */
    m_flue = (mFuel = m_fuel) => params.m_flue_ratio*mFuel,
    /** (kJ/kmol) net calorific value */
    NCV = params.NCV,
    /** (kJ/kmol-K) Molar heat of fuel */
    Cp_fuel = params.Cp_fuel((t_fuel + t_amb)*0.5),
    /** (kJ/kmol-K) Molar heat of air */
    Cp_air = params.Cp_air((t_air + t_amb)*0.5),
    /** (kJ/kmol.K) Molar heat of fluid */
    Cp_fluid = (tIn,tOut) => params.Cp_fluid((tIn + tOut)*0.5),
    /** (kJ/kmol-K) Molar heat of flue gases */
    Cp_flue = (tG, tAmb = t_amb) => params.Cp_flue((tG + tAmb)*0.5);  
  

  let duty_rad = 0
  /** Tw = Average tube wall temperature in Kelvin degrees */
  const Tw = (tOut, tIn = t_in, dutyRad = duty_rad) => (dutyRad/At) * 
  (Do/Di) * (Rfi + 1/hi + (Di*Math.log(Do/Di)/(2*kw)) ) + Tb(tOut,tIn);

  // ******* Heat input to the radiant section ********
  //
  /** Sensible heat of fluid Q_fluid = m_fluid * Cp_fluid(T_fluid_avg) * DeltaT */
  const Q_fluid = (tOut = t_out, tIn = t_in) =>
    m_fluid * Cp_fluid(tOut,tIn) * (tOut - tIn)

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
  //
  //TODO: factor de perdida (%)
  /** Heat losses through setting (5% of Q_release) */
  const Q_losses = (mFuel = m_fuel) => 0.015*Q_rls(mFuel);

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

  // Calculating t_g from the given variable (mass_fuel or temp_out)
  let flame = 0
  let duty = 0

  if (t_out_seed !== undefined) { // Given temp_out
    //TODO: calculate efficiency here?

    // Duty effective from t_out
    duty = m_fluid*Cp_fluid(params.t_in_conv,t_out)*(t_out - params.t_in_conv)
    duty_rad = duty * (1 - duty_conv_dist)

    // Approximating t_in_rad with assumption for 30-70 of duty distribution
    t_in = params.t_in_conv + duty * duty_conv_dist / (m_fluid*Cp_fluid(params.t_in_conv,t_out))

    // Calculating t_g (effective gas temp)
    const TgBalance_OutTemp = (tG) => m_fluid*Cp_fluid(t_in,t_out)*(t_out - t_in) - (Q_rad(tG) + Q_conv(tG))
    flame = newtonRaphson(TgBalance_OutTemp, 1000, params.NROptions, "rad_Tg_Tout")
    if (flame != false) t_g = flame

    // Calculating fuel mass
    const mFuelBalance = (mFuel) => Q_out(t_g, t_out, mFuel) - Q_in(mFuel)
    const mass_fuel_seed = m_fluid*Cp_fluid(params.t_in_conv,t_out)*(t_out - params.t_in_conv)/(NCV*efficiency)
    m_fuel = newtonRaphson(mFuelBalance, mass_fuel_seed, params.NROptions, "rad_mFuel")
    if (m_fuel != false) params.m_fuel = m_fuel

    logger.info(`vars with t_out given: {
    T_(inRad) from Duty estimation: ${unitSystem.tempC(t_in)}
    T_(out) from Duty estimation: ${unitSystem.tempC(t_out)}
    T_(w) from Duty estimation: ${unitSystem.tempC(Tw(t_out))}
    M_(seed): ${unitSystem['mass/mol'](mass_fuel_seed)}
  }`)
  } else if (m_fuel_seed !== undefined) { // Given mass_fuel
    // Duty effective from from q release by fuel
    duty = Q_rls(m_fuel_seed) * efficiency

    // Approximating t_in_rad and t_out with efficiency and duty dist
    t_in = params.t_in_conv + duty * duty_conv_dist / (m_fluid*Cp_fluid(params.t_in_conv))
    t_out_seed = params.t_in_conv + duty / (m_fluid*Cp_fluid(t_in))
    logger.info(`t_in_rad, seed: ${t_in} vs problem: ${params.t_in_rad}`)

    // Calculating t_g (effective gas temp)
    //TODO: t_out isn't set needs recalculate
    const TgBalance_MassFuel = (tG) => Q_out(tG, t_out_seed, m_fuel) - Q_in(m_fuel)
    flame = newtonRaphson(TgBalance_MassFuel, 1000, params.NROptions, "rad_Tg_mFuel")
    if (flame != false) t_g = flame

    // Calculating t_out
    const tOutBalance = (tOut) => m_fluid*Cp_fluid(t_in,t_out_seed)*(tOut - t_in) - (Q_rad(t_g) + Q_conv(t_g))
    t_out = newtonRaphson(tOutBalance, t_out_seed, params.NROptions, "rad_Tout")
    if (t_out != false) params.t_out = t_out

    // Discrepancies on recalculation
    logger.info(`t_out, seed: ${t_out_seed} vs calc: ${t_out}`)
    const duty_recalculated = m_fluid*Cp_fluid(t_in,t_out)*(t_out - params.t_in_conv)
    const t_in_recalculated = params.t_in_conv + duty_recalculated * duty_conv_dist / (m_fluid*Cp_fluid(t_in,t_out))
    logger.info(`t_in_rad, seed: ${t_in} vs calc: ${t_in_recalculated}`)
  } else {
    params.err += "-wrong call for rad section, no seed for mass fuel or out temp."
  }

  // TODO: Delete debugger
  logger.debug(`vars to check: {
    kw_tube:  ${unitSystem.thermal(kw)}
    kw_fluid:  ${unitSystem.thermal(params.kw_fluid(200))}
    h_conv:   ${unitSystem.convect(h_conv)}
    duty:     ${unitSystem.heat_flow(duty)}
    duty_rad: ${unitSystem.heat_flow(duty_rad)}
    At_rad:   ${unitSystem.area(At)}
    duty_flux:${unitSystem.heat_flux(duty_rad/At)}
    Do/Di:    ${Do/Di}
    factor_hi:${Rfi + 1/hi + (Di*Math.log(Do/Di)/(2*kw))}
  }`)

  // **************************************************
  params.t_out = t_out
  params.t_in_rad = t_in
  params.t_g = t_g

  const rad_result = {
    "m_fuel":   m_fuel,
    "Tw":       Tw(t_out),
    "t_out":    t_out,
    "t_in_rad": t_in,
    "t_g":      t_g,

    "Q_in":   Q_in(m_fuel),
    "Q_rls":  Q_rls(m_fuel),
    "Q_air":  Q_air(m_fuel),
    "Q_fuel": Q_fuel(m_fuel),
    
    "Q_out":  Q_out(t_g, t_out, m_fuel),
    "Q_losses": Q_losses(m_fuel),
    "Q_rad":  Q_rad(t_g, t_out),
    "Q_conv": Q_conv(t_g),
    "Q_shld": Q_shld(t_g),
    "Q_flue": Q_flue(t_g),
    
    "Q_fluid":  Q_fluid(),
    "Cp_fluid": unitSystem.cp(Cp_fluid(t_in,t_out)),
    "Cp_fuel":  Cp_fuel,
    "Cp_air":   Cp_air,
    "Cp_flue":  Cp_flue(t_g),
  }
  logger.info("debug", JSON.stringify(rad_result, null, 2))

  //let t_out_recall = t_in - t_out + (Q_rad(t_g) + Q_conv(t_g)) / (m_fluid*Cp_fluid(t_in,t_out))
  return rad_result
}

module.exports = {
  radSection
};