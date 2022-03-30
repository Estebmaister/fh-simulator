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
const {newtonRaphson, logger, round, unitConv} = require('./utils');

// TODO: delete after testing inside
const {options, initSystem} = require('./utils');
const unitSystem = initSystem(options.unitSystem);

/** returns emissivity(temp) function of temperature to calculate F */
const emissivity = (pl) => {
  // constants to calculate emissivity(temp) from PL
  const constants = {
    a: { A:  2.58e-08, B: -3.90e-08, C:  6.80e-09, D: -2.20e-10},
    b: { A: -1.19e-04, B:  5.60e-05, C: -4.10e-06, D: -7.20e-07},
    c: { A:  0.212580, B:  0.225800, C: -0.047351, D:  0.004165}
  };

  const factors = (factor, constant = constants) => {
    return ((temp) => 
    constant.a[factor]*temp**2 + 
    constant.b[factor]*temp + constant.c[factor]);
  };

  const 
    A = factors("A"),
    B = factors("B"),
    C = factors("C"),
    D = factors("D");

  return (temp) => A(temp) + B(temp)*pl + C(temp)*pl**2 + D(temp)*pl**3;
};
logger.warn(`{"emissivity": ${emissivity(5.207)(1498)}}`);

/** (m2) parameters must be in ft */
const Ar_calc = (width, length, height) => {
  const 
    base = length * width,
    wall_width  = height * width,
    wall_length = height * length;
  
  const Ar2 = 2*(22.7+5.3+1)*width + 2*wall_length + base;
  const Ar = 2*wall_width + 2*wall_length + 1.234*base;

  logger.warn(`{"Ar prev (ft)": ${Ar2},"Ar calc (ft)": ${Ar}}`);

  return unitConv.fttom(Ar)*unitConv.fttom(1);
};

/** returns effectivity(temp) function of temperature to use as F */
const effectivity = (pl, alpha, Acp, a_shld, Acp_shld, Ar) => {
  const Total_Acp = a_shld*Acp_shld + alpha*Acp;
  const Aw = Ar - Total_Acp;
  const Aw_aAcp = Aw / Total_Acp;
  const emiss = emissivity(pl);

  // constants to calculate effectivity(temp) from Aw/aAcp
  const constants = {
    a: { A: -0.0005, B:  0.0072, C: -0.0062 },
    b: { A:  0.0022, B: -0.1195, C:  0.1168 },
    c: { A:  0.0713, B:  0.5333, C: -0.6473 },
    d: { A: -0.0152, B:  1.0577, C: -0.1540 }
  };

  const factors = (factor, constant = constants) => {
    return ((Aw_a_Acp) => 
    constant.a[factor]*Aw_a_Acp**3 + 
    constant.b[factor]*Aw_a_Acp**2 + 
    constant.c[factor]*Aw_a_Acp + constant.d[factor]);
  };

  const 
    A = factors("A"),
    B = factors("B"),
    C = factors("C");
  // log logger.debug(`Aw/aAcp: ${round(Aw_aAcp)}, A: ${round(A(Aw_aAcp))}, B: ${round(B(Aw_aAcp))}, C: ${round(C(Aw_aAcp))}`);

  return (temp) => A(Aw_aAcp) + B(Aw_aAcp)*emiss(temp) + C(Aw_aAcp)*emiss(temp)**2;
};

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
    t_out =   params.t_out,    // (K)
    /** (kg/h) */
    m_fuel = m_fuel_seed || params.m_fuel;
  
  if (params === null || params === undefined) params = {}
  const // Temperatures
    t_air     = params.t_air,    // (K)
    t_fuel    = params.t_fuel,   // (K)
    t_amb     = params.t_amb,    // (K)
    t_in_conv = params.t_in_conv,// (K)
    // (K) Fluid bulk temperature
    Tb = (tOut, tIn = t_in) => 0.5*(tIn + tOut);

    const // Fired heater parameters
    /** (-) number of tubes in rad section */
    N = params.N_rad || 42,
    /** (-) number of shield tubes */
    N_shld = params.N_shld || 16,
    /** (m) effective tube length*/
    L = params.L_rad || 20.024,
    /** (m) external diameter rad section */
    Do = params.Do_rad || 0.219,
    /** (m) internal diameter rad section */
    Di = params.Di_rad ||  params.Do_rad - params.Sch_rad,
    /** (m) center to center distance of tube */
    CtoC = params.Pitch_rad || 0.394,
    /** (kJ/h-m2-C) Film convective heat transfer coff */
    h_conv = params.h_conv || 30.66,

    /** (ft) Mean Beam Length, dim ratio 1-2-1 to 1-2-4*/
    MBL = 2/3 * (params.Width_rad*
      params.Length_rad*
      params.Height_rad) ** (1/3),
    
    /** (-) Ratio pitch/external_diameter of tubes */
    ratio_pitch_do_rad = params.Pass_number * 
    params.Pitch_rad / params.Do_rad,

    /** (-) Ratio pitch/external_diameter of tubes */
    //TODO: unused ratio_pitch_do_shld = params.Pass_number * params.Pitch_shld / params.Do_shld,
    
    /** (h-m2-C/kJ) internal fouling factor */
    Rfi =     params.Rfi,
    /** (kJ/h-m-C) tube thermal conductivity */
    kw_tube = params.kw_tube,

    PL = (params.Ph2o + params.Pco2) * MBL,

    /** - alpha radiant factor */
    alpha = 1 + .49* ratio_pitch_do_rad /6 - 
      .09275* ratio_pitch_do_rad**2 + 
      .065  * ratio_pitch_do_rad**3 /6 + 
      .00025* ratio_pitch_do_rad**4,
    /** - alpha shield factor */
    alpha_shld =  1,
    
    // Calculated params
    pi = Math.PI || 3.14159,
    /** (m2) Total refractory area */
    Ar = Ar_calc(params.Width_rad,
      params.Length_rad, params.Height_rad),
    /** (m2) Cold plane area of tube bank */
    Acp = N * 2 * CtoC * L,
    /** (m2) Cold plane area of shield tube bank */
    Acp_shld = N_shld * params.Pitch_shld * L,
    /** (kJ/h-m2-K^4) */
    sigma = 2.041e-7, // 5.67e-11 (W.m-2.K-4)
    /** (m2) Area of tubes in bank */
    At = N * pi * Do * L;
    logger.warn(`Acp: ${round(unitConv.mtoft(Acp)*unitConv.mtoft(1))}, Acp_sh: ${round(unitConv.mtoft(Acp_shld)*unitConv.mtoft(1))}`);
  
  const // Process Variables
    duty_rad_dist = params.duty_rad_dist         || .7,
    efficiency = params.efficiency               || .8,
    heat_loss_percent = params.heat_loss_percent || .015,
    /** (kg/h) */
    m_fluid = params.m_fluid                  || 225_700,
    /** (kg/h) */
    m_air =   (mFuel = m_fuel) => params.m_air_ratio*mFuel,
    /** (kg/h) */
    m_flue =  (mFuel = m_fuel) => params.m_flue_ratio*mFuel,
    /** (kJ/kg) net calorific value */
    NCV =     params.NCV,
    /** (kJ/kg-K) Molar heat of fuel */
    Cp_fuel = params.Cp_fuel( (t_fuel + t_amb) * 0.5 ),
    /** (kJ/kg-K) Molar heat of air */
    Cp_air =  params.Cp_air( (t_air + t_amb) * 0.5 ),
    /** (kJ/kg-K) Molar heat of flue gases */
    Cp_flue = (tG, tAmb = t_amb) => params.Cp_flue((tG + tAmb)*0.5), 
    /** (kJ/kg.K) Weight heat of fluid */
    Cp_fluid = (tIn,tOut=tIn) => params.Cp_fluid((tIn + tOut)*0.5),
    /** (kJ/h-m-C -- J/s-m-C-3.6) Molar heat of fluid */
    kw_fluid = params.kw_fluid,
    /** (cP -- g/m-s) fluid Viscosity */
    miu =      params.miu_fluid;
  
  /** (kJ/h) Duty in the radiant section */
  let duty_rad = 0;
  const 
    /** Emissive (effectivity) factor as function of temp */
    F = (temp) => effectivity(PL, alpha, Acp, alpha_shld, Acp_shld, Ar)(unitConv.KtoF(temp)),
    //F = effectivity(PL, alpha, Acp, alpha_shld, Acp_shld, Ar),
    /** Prandtl value (miu*Cp/kw) of the fluid as function of temp */
    prandtl = (t) => miu(t) * Cp_fluid(t) *  3.6/kw_fluid(t),
    /** Mass flow per area unit */
    G = (m_fluid/3.6/(pi*(Di**2))), // 3.6 conversion factor
    /** Reynolds value (G*Di/miu) of the fluid as function of temp */
    reynolds = (t) => G * Di/miu(t);

  /** (kJ/h-m2-C) internal heat transfer coff */
  const hi = (tB,tW = tB) => .023 * (kw_fluid(tB) / Di) * 
    reynolds(tB)**.8 * prandtl(tB)**(1/3) * (miu(tB)/miu(tW))**.14;
  /** Tw = Average tube wall temperature in Kelvin degrees */
  const Tw = (tB, tW = tB, dutyRad = duty_rad) => (dutyRad/At) * 
  (Do/Di) * (Rfi + 1/hi(tB,tW) + (Di*Math.log(Do/Di)/(2*kw_tube)) ) + tB;

  // ******* Heat input to the radiant section ********
  //
  /** Sensible heat of fluid Q_fluid = m_fluid * Cp_fluid(T_fluid_avg) * DeltaT */
  const Q_fluid = (tOut = t_out, tIn = t_in) =>
    m_fluid * Cp_fluid(tOut,tIn) * (tOut - tIn)

  /** Sensible heat of air Q_air = m_air * Cp_air * (tAir - tAmb) */
  const Q_air = (mFuel, tAir = t_air, tAmb = t_amb) => 
    m_air(mFuel) * Cp_air * (tAir - tAmb);

  /** Combustion heat of fuel Q_rls = m_fuel * NCV */
  const Q_rls = (mFuel) => mFuel * NCV;

  /** Sensible heat of fuel Q_fuel = m_fuel * Cp_fuel * (tFuel - tAmb) */
  const Q_fuel = (mFuel, tFuel = t_fuel, tAmb = t_amb) => 
    mFuel*Cp_fuel*(tFuel - tAmb);

  /** Heat input Q_in = Q_rls + Q_air(tAir, tAmb) + Q_fuel(tFuel, tAmb) */
  const Q_in = (mFuel, tAir = t_air, tFuel = t_fuel, tAmb = t_amb) => 
    Q_rls(mFuel) + Q_air(mFuel, tAir, tAmb) + Q_fuel(mFuel, tFuel, tAmb)

  // ******* Heat taken out of radiant section ********
  //
  /** Heat losses through setting (1.5% of Q_release) */
  const Q_losses = (mFuel = m_fuel) => heat_loss_percent * Q_rls(mFuel);

  /** Radiant heat transfer = sigma*(alpha*Acp)*F*(tG**4 - Tw**4)*/
  const Q_rad = (tG, tOut = t_out, tIn = t_in) => sigma * F(tG) * (alpha * 
    Acp) * (tG**4 - Tw( Tb(tOut,tIn), Tw(Tb(tOut,tIn)) )**4);

  /** Convective heat transfer = h_conv*At*(tG - Tw)*/
  const Q_conv = (tG, tOut = t_out, tIn = t_in) => 
    h_conv * At * (tG - Tw( Tb(tOut,tIn), Tw(Tb(tOut,tIn)) ));

  /** Heat absorbed by radiant tubes = Q_rad + Q_conv */
  const Q_R = (tG, tOut = t_out, tIn = t_in) => 
    Q_rad(tG,tOut,tIn) + Q_conv(tG,tOut,tIn);

  /** Shield radiant heat transfer (a variation of Q_rad) */
  const Q_shld = (tG, tOut = t_out, tIn = t_in) => sigma * F(tG) * (alpha_shld * 
    Acp_shld) * (tG**4 - Tw( Tb(tOut,tIn), Tw(Tb(tOut,tIn)) )**4);

  /** Sensible heat of flue gases = m_flue * Cp_flue(tG,tAmb) * (tG-tAmb) */
  const Q_flue = (tG, mFuel = m_fuel, tAmb = t_amb) => 
    m_flue(mFuel) * Cp_flue(tG,tAmb) * (tG - tAmb);

  /** Q_out = Q_R + Q_shld + Q_losses + Q_flue */
  const Q_out = (tG, tOut=t_out, mFuel=m_fuel, tIn=t_in, tAmb=t_amb) => 
    Q_R(tG, tOut, tIn) + Q_shld(tG, tOut, tIn) + 
    Q_losses(mFuel) + Q_flue(tG, mFuel, tAmb);

  // **************************************************

  // Calculating t_g from the given variable (mass_fuel or temp_out)
  /** (K) Flame arc temperature */
  let flame = 0;
  /** (kJ/h) Duty in the hole fired heater */
  let duty = 0;

  if (t_out_seed !== undefined) { // Given temp_out
    // Duty effective from t_out
    duty = m_fluid * Cp_fluid(t_in_conv, t_out) * (t_out - t_in_conv);

    // Calculate Tw with seed from 30-70 duty distribution
    duty_rad = duty * (duty_rad_dist);

    // Approximating t_in_rad with assumption from duty distribution
    t_in = t_in_conv + duty * (1 - duty_rad_dist) / 
      ( m_fluid * Cp_fluid(t_in_conv, t_out) );

    // Calculating t_g (effective gas temp)
    const TgBalance_OutTemp = (tG) => m_fluid * Cp_fluid(t_in,t_out) * 
      (t_out - t_in) - (Q_rad(tG) + Q_conv(tG));

    flame = newtonRaphson(
      TgBalance_OutTemp, 1000, params.NROptions, "rad_Tg_Tout"
    );
    if (flame) t_g = flame;

    // Calculating fuel mass
    const mFuelBalance = (mFuel) => Q_out(t_g, t_out, mFuel) - Q_in(mFuel);

    const mass_fuel_seed = m_fluid * Cp_fluid(t_in_conv,t_out) * 
      (t_out - t_in_conv) / (NCV * efficiency);

    m_fuel = newtonRaphson(
      mFuelBalance, mass_fuel_seed, params.NROptions, "rad_mFuel"
    );
    if (m_fuel) params.m_fuel = m_fuel;

    logger.info(`vars with t_out given",
    "T_(in) given":           "${unitSystem.tempC(t_in_conv)}",
    "T_(out) given":          "${unitSystem.tempC(t_in)}",
    "T_(inRad) from Duty est":"${unitSystem.tempC(t_in)}",
    "T_(out) from Duty est":  "${unitSystem.tempC(t_out)}",
    "T_(w) from Duty est":    "${unitSystem.tempC(Tw(Tb(t_out)))}",
    "M_(seed)": "${unitSystem.mass_flow(mass_fuel_seed)}",
    "Prandtl":  ${round(prandtl(Tb(t_out)))},
    "Reynolds": ${round(reynolds(Tb(t_out)))},
    "Alpha":    ${round(alpha)},
    "MBL":      ${round(MBL)},
    "Pco2":     ${round(params.Pco2)},
    "Ph2o":     ${round(params.Ph2o)},
    "PL":       ${round(PL)},
    "F(Tg)":    ${round(F(t_g))},
    "F_desired":"${0.635}`);

  } else if (m_fuel_seed !== undefined) { // Given mass_fuel
    // Duty effective from from q release by fuel
    duty = Q_rls(m_fuel_seed) * efficiency;

    // Calculate Tw with seed from 30-70 duty distribution
    duty_rad = duty * (duty_rad_dist);

    // Approximating t_in_rad and t_out with efficiency and duty dist
    t_in = t_in_conv + duty * (1 - duty_rad_dist) / (m_fluid * Cp_fluid(t_in_conv));

    t_out_seed = t_in_conv + duty / (m_fluid * Cp_fluid(t_in));

    // Calculating t_g (effective gas temp)
    //TODO: t_out isn't set needs recalculate
    const TgBalance_MassFuel = (tG) => Q_out(tG, t_out_seed, m_fuel) - Q_in(m_fuel);

    flame = newtonRaphson(
      TgBalance_MassFuel, 1000, params.NROptions, "rad_Tg_mFuel"
    );
    if (flame) t_g = flame;

    // Calculating t_out
    const tOutBalance = (tOut) => m_fluid * Cp_fluid(t_in,t_out_seed) * 
      (tOut - t_in) - ( Q_rad(t_g) + Q_conv(t_g) );

    t_out = newtonRaphson(
      tOutBalance, t_out_seed, params.NROptions, "rad_Tout"
    );
    if (t_out) params.t_out = t_out;

    // Discrepancies on recalculation
    logger.info(`t_out, seed: ${t_out_seed} vs calc: ${t_out}`)

    const duty_recalculated = m_fluid*Cp_fluid(t_in,t_out)*(t_out - t_in_conv)

    const t_in_recalculated = params.t_in_conv + duty_recalculated * (1 - duty_rad_dist) / (m_fluid*Cp_fluid(t_in,t_out))

    logger.info(`t_in_rad, seed: ${t_in} vs calc: ${t_in_recalculated}`)

  } else {
    params.err += "-wrong call for rad section, no seed for mass fuel or out temp."
  }

  // TODO: Delete debugger
  logger.warn(`"vars to check in rad section",
    "tG":         "${unitSystem.tempC(t_g)} vs 1500F",
    "kw_tube":    "${unitSystem.thermal(kw_tube)}",
    "kw_fluid":   "${unitSystem.thermal(kw_fluid(Tb(t_out)))}",
    "h_conv":     "${unitSystem.convect(h_conv)}",
    "duty":       "${unitSystem.heat_flow(duty)}",
    "duty_rad":   "${unitSystem.heat_flow(duty_rad)}",
    "At_rad":     "${unitSystem.area(At)}",
    "duty_flux":  "${unitSystem.heat_flux(duty_rad/At)}",
    "Do/Di":      ${round(Do/Di)},
    "hi refer":   "${unitSystem.convect( 2992 )}",
    "hi post 1":  "${unitSystem.convect( hi(Tb(t_out) ) )}",
    "hi post 2":  "${unitSystem.convect( hi(Tb(t_out),Tw(Tb(t_out)) ) )}",
    "hi post 3":  "${unitSystem.convect( hi(Tb(t_out),Tw(Tb(t_out),Tw(Tb(t_out)) ) ) )}",
    "factor_hi pre": ${Rfi + 1/2992                        + (Di*Math.log(Do/Di)/(2*kw_tube))},
    "factor_hi post":${Rfi + 1/hi(Tb(t_out),Tw(Tb(t_out))) + (Di*Math.log(Do/Di)/(2*kw_tube))}
  `)

  // **************************************************
  params.t_out    = t_out;
  params.t_in_rad = t_in;
  params.t_g      = t_g;
  params.duty_rad = duty_rad;
  params.q_rad_sh = Q_shld(t_g);
  params.m_flue   = m_flue(m_fuel);

  const rad_result = {
    "m_fuel":   m_fuel,
    "t_in_rad": t_in,
    "t_out":    t_out,
    "Tw":       Tw(Tb(t_out), Tw(Tb(t_out))),
    "t_g":      t_g,

    "Q_in":     Q_in(m_fuel),
    "Q_rls":    Q_rls(m_fuel),
    "Q_air":    Q_air(m_fuel),
    "Q_fuel":   Q_fuel(m_fuel),
    
    "Q_out":    Q_out(t_g, t_out, m_fuel),
    "Q_flue":   Q_flue(t_g),
    "Q_losses": Q_losses(m_fuel),
    "Q_shld":   Q_shld(t_g),
    "Q_conv":   Q_conv(t_g),
    "Q_rad":    Q_rad(t_g, t_out),

    "Q_R":      Q_R(t_g),
    "Q_fluid":  Q_fluid(),

    "Cp_fluid": unitSystem.cp(Cp_fluid(t_in,t_out)),
    "Cp_fuel":  Cp_fuel,
    "Cp_air":   Cp_air,
    "Cp_flue":  Cp_flue(t_g),
  }
  logger.warn(`{
    "m_fuel":   "${unitSystem.mass_flow( m_fuel )}",
    "t_in_rad": "${unitSystem.tempC( t_in )}",
    "t_out":    "${unitSystem.tempC( t_out )}",
    "Tw":       "${unitSystem.tempC( Tw(Tb(t_out), Tw(Tb(t_out))) )}",
    "t_g":      "${unitSystem.tempC( t_g )}",
    "Q_in":     "${unitSystem.heat_flow( Q_in(m_fuel) )}",
    "Q_rls":    "${unitSystem.heat_flow( Q_rls(m_fuel) )}",
    "Q_air":    "${unitSystem.heat_flow( Q_air(m_fuel) )}",
    "Q_fuel":   "${unitSystem.heat_flow( Q_fuel(m_fuel) )}",
    "Q_out":    "${unitSystem.heat_flow( Q_out(t_g, t_out, m_fuel) )}",
    "Q_flue":   "${unitSystem.heat_flow( Q_flue(t_g) )}",
    "Q_losses": "${unitSystem.heat_flow( Q_losses(m_fuel) )}",
    "Q_shld":   "${unitSystem.heat_flow( Q_shld(t_g) )}",
    "Q_conv":   "${unitSystem.heat_flow( Q_conv(t_g) )}",
    "Q_rad":    "${unitSystem.heat_flow( Q_rad(t_g, t_out) )}",
    "Q_R":      "${unitSystem.heat_flow( Q_R(t_g) )}",
    "Q_fluid":  "${unitSystem.heat_flow( Q_fluid() )}",
    "Cp_fluid": "${unitSystem.cp( Cp_fluid(t_in,t_out) )}",
    "Cp_fuel":  "${unitSystem.cp( Cp_fuel )}",
    "Cp_air":   "${unitSystem.cp( Cp_air )}",
    "Cp_flue":  "${unitSystem.cp( Cp_flue(t_g) )}",
    "Vs_flue":  "${unitSystem.viscosity( params.flueViscosity(t_g) )}"}
  `);
  //logger.info("debug", JSON.stringify(rad_result, null, 2))

  // recalculation let t_out_recall = t_in - t_out + (Q_rad(t_g) + Q_conv(t_g)) / (m_fluid*Cp_fluid(t_in,t_out))
  return rad_result
}

module.exports = {
  radSection
};