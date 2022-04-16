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

// TODO: delete options after internal tests are taken outside
const {options, initSystem} = require('./utils');
const unitSystem = initSystem(options.unitSystem);

/** radSection receives the parameters dictionary and
 * calculates the required mass fluid or the necessary
 * temperature change at the radiant section.
 * 
 * First assumption to start the calc is duty transferred
 * in radiant section = 70% of total duty
 * 
 * Q_in = Q_rls + Q_air + Q_fuel =
 * Q_out = Q_R + Q_shield + Q_losses + Q_flue
 * Q_in(tg_out) - Q_out(tg_out) ~= 0
 * 
 * Q_rad + Q_conv = Q_R = Q_fluid(out-in)
*/
const radSection = (params) => {
  let rad_result = {}
  // Failing in case of a wrong call
  if (params === null || params === undefined) {
    logger.error("wrong call for radiant section, no parameters set at call.")
    return rad_result
  }
  /** There two start cases A & B
   * Case A: given the fluid temp at teh exit point of heater.
   * Case B: given the flow mass of the fuel at the heater burners. 
   * */
  if (params.t_out !== undefined) {
    // Case A
    rad_result = radSection_full(undefined, params.t_out, params)
  } else if (params.m_fuel !== undefined) {
    // Case B
    rad_result = radSection_full(params.m_fuel, undefined, params)
  } else {
    // Failing case
    const err = "wrong call for radiant section, no seed for mass fuel or out temp."
    logger.error(err)
    params.err += `-${err}`
  }
  return rad_result
}

const radSection_full = (m_fuel_seed, t_out_seed, params) => {
  let 
    tg_out   = 0, // (K) Leaving/effective gas temp
    t_in  = 0, // (K) Inlet fluid temp
    t_out = params.t_out, // (K) Outlet fluid temp
    /** (kg/h) */
    m_fuel = m_fuel_seed || params.m_fuel;
  
  const // Temperatures
    t_air     = params.t_air,    // (K) Inlet air temp
    t_fuel    = params.t_fuel,   // (K) Inlet fuel temp
    t_amb     = params.t_amb,    // (K) Ambient temp
    t_in_conv = params.t_in_conv,// (K) Heater inlet fluid temp
    /** (K) bulk temp (second arg default to rad inlet fluid temp) */
    Tb = (tOut, tIn = t_in) => 0.5*(tIn + tOut);

  const // Fired heater parameters
    Rfi = params.Rfi,      // (h-m2-C/kJ) internal fouling factor
    N = params.N_rad,      // (-) number of tubes in rad sect
    N_shld = params.N_shld,// (-) number of tubes in shld sect
    L = params.L_rad,      // (m) effective tube length
    L_shld = params.L_shld,// (m) effective tube length
    Do = params.Do_rad,    // (m) external diameter rad section
    Di = params.Do_rad - params.Sch_rad,// (m) int diameter rad sect
    S_tube = params.Pitch_rad || 0.394, // (m) center to center distance of tube
    S_tube_shld = params.Pitch_sh_cnv,    // (m) center to center distance of tube
    h_conv = params.h_conv || 30.66, // (kJ/h-m2-C) Film convective heat transfer coff

    /** (ft) Mean Beam Length, dim ratio 1-2-1 to 1-2-4*/
    MBL = 2/3 * (params.Width_rad*params.Length_rad*params.Height_rad) **(1/3),
    /** (-) Ratio pitch/external_diameter of tubes */
    ratio_pitch_do_rad = params.Pass_number *S_tube /params.Do_rad,
    
    PL = (params.Ph2o + params.Pco2) * MBL,

    /** - alpha radiant factor */
    alpha = 1 + .49* ratio_pitch_do_rad /6 - 
      .09275* ratio_pitch_do_rad**2 + 
      .065  * ratio_pitch_do_rad**3 /6 + 
      .00025* ratio_pitch_do_rad**4,
    alpha_shld =  1, // (-) alpha shield factor
    
    Ar = Ar_calc(params.Width_rad, params.Length_rad, params.Height_rad), // (m2) Total refractory area
    Acp_shld = N_shld * S_tube_shld * L_shld, // (m2) Cold plane area of shield tube bank
    Acp = N * 2 * S_tube * L, // (m2) Cold plane area of tube bank
    At = N *Math.PI *Do *L, // (m2) Bank tube's external surface area
    Ai = Math.PI*(Di**2)/2, // (m2) Tube's inside flux area x2

    sigma = 2.041e-7, // (kJ/h-m^2-K^4) -> 5.67e-11 (W/m^2-K^4)
    cnv_fact = 3_600 * 1e-3; // (g/s -> kg/h) secondsToHours * 1/k

  // checking alfa logger.warn(`Alpha: ${round(alpha)}, Alpha_sh: ${round(alpha_shld)}`);
  logger.warn(`Acp: ${round(unitConv.m2toft2(Acp))} ft, Acp_shld: ${round(unitConv.m2toft2(Acp_shld))} ft`);
  
  const // Process Variables
    duty_rad_dist = params.duty_rad_dist         || .7,
    efficiency = params.efficiency               || .8,
    heat_loss_percent = params.heat_loss_percent || .015,
    NCV = params.NCV, // (kJ/kg) net calorific value
    m_fluid= params.m_fluid, // (kg/h) Fluid mass flow
    m_air  = (mFuel = m_fuel) => params.m_air_ratio*mFuel, // (kg/h) Air mass flow
    m_flue = (mFuel = m_fuel) => params.m_flue_ratio*mFuel,// (kg/h) Flue mass flow
    Cp_fuel = params.Cp_fuel(Tb(t_fuel, t_amb)), // (kJ/kg.K) Fuel mass heat
    Cp_air  = params.Cp_air( Tb(t_air, t_amb) ), // (kJ/kg.K) Air mass heat
    Cp_fluid = (tIn,tOut=tIn) => params.Cp_fluid(Tb(tIn, tOut)), // (kJ/kg.K)
    Cp_flue  = (tG,tG_out=tG) => params.Cp_flue(Tb(tG, tG_out)), // (kJ/kg.K)
    kw_fluid = (temp) => params.kw_fluid(temp),// (kJ/h-m-C) fluid thermal conductivity
    kw_tube  = (temp) => params.kw_tube(temp), // (kJ/h-m-C - J/s-m-C-3.6) tube thermal conductivity
    miu_fluid= (temp) =>params.miu_fluid(temp);//(cP - g/m-s) fluid Viscosity
  
  /** (kJ/h) Duty in the radiant section */
  let duty_rad = 0;
  const 
    /** Emissive (effectivity) factor as function of temp */
    F = (temp) => effectivity(PL, alpha, Acp, alpha_shld, Acp_shld, Ar)(unitConv.KtoF(temp)),
    //F = effectivity(PL, alpha, Acp, alpha_shld, Acp_shld, Ar),
    prandtl = (t) => miu_fluid(t)* Cp_fluid(t)*  cnv_fact/kw_fluid(t), // (miu*Cp/kw)
    G = (m_fluid/cnv_fact) /Ai, // Fluid mass speed inside radiant tubes
    reynolds = (t) => G * Di/miu_fluid(t); // (-) G*Di/miu

  /** (kJ/h-m2-C) internal heat transfer coff */
  const hi = (tB,tW = tB) => .023 * (kw_fluid(tB) / Di) * 
    reynolds(tB)**.8 * prandtl(tB)**(1/3) * (miu_fluid(tB)/miu_fluid(tW))**.14;
  /** Tw = Average tube wall temperature in Kelvin degrees */
  const Tw = (tB, tW = tB, dutyRad = duty_rad) => (dutyRad/At) * 
  (Do/Di) * (Rfi + 1/hi(tB,tW) + (Di*Math.log(Do/Di)/(2*kw_tube(tW))) ) + tB;

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

  // Calculating tg_out from the given variable (mass_fuel or temp_out)
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

    // Calculating tg_out (effective gas temp)
    const TgBalance_OutTemp = (tG) => m_fluid * Cp_fluid(t_in,t_out) * 
      (t_out - t_in) - (Q_rad(tG) + Q_conv(tG));

    flame = newtonRaphson(
      TgBalance_OutTemp, 1000, params.NROptions, "rad_Tg_Tout"
    );
    if (flame) tg_out = flame;

    // Calculating fuel mass
    const mFuelBalance = (mFuel) => Q_out(tg_out, t_out, mFuel) - Q_in(mFuel);

    const mass_fuel_seed = m_fluid * Cp_fluid(t_in_conv,t_out) * 
      (t_out - t_in_conv) / (NCV * efficiency);

    m_fuel = newtonRaphson(
      mFuelBalance, mass_fuel_seed, params.NROptions, "rad_mFuel"
    );
    if (m_fuel) params.m_fuel = m_fuel;

  } else if (m_fuel_seed !== undefined) { // Given mass_fuel
    // Duty effective from from q release by fuel
    duty = Q_rls(m_fuel_seed) * efficiency;

    // Calculate Tw with seed from 30-70 duty distribution
    duty_rad = duty * (duty_rad_dist);

    // Approximating t_in_rad and t_out with efficiency and duty dist
    t_in = t_in_conv + duty * (1 - duty_rad_dist) / (m_fluid * Cp_fluid(t_in_conv));

    t_out_seed = t_in_conv + duty / (m_fluid * Cp_fluid(t_in));

    // Calculating tg_out (effective gas temp)
    //TODO: t_out isn't set needs recalculate
    const TgBalance_MassFuel = (tG) => Q_out(tG, t_out_seed, m_fuel) - Q_in(m_fuel);

    flame = newtonRaphson(
      TgBalance_MassFuel, 1000, params.NROptions, "rad_Tg_mFuel"
    );
    if (flame) tg_out = flame;

    // Calculating t_out
    const tOutBalance = (tOut) => m_fluid * Cp_fluid(t_in,t_out_seed) * 
      (tOut - t_in) - ( Q_rad(tg_out) + Q_conv(tg_out) );

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

  //TODO: recalculation let t_out_recall = t_in - t_out + (Q_rad(tg_out) + Q_conv(tg_out)) / (m_fluid*Cp_fluid(t_in,t_out))

  // **************************************************
  params.t_out    = t_out;
  params.t_in_rad = t_in;
  params.tg_rad   = tg_out;
  params.duty_rad = duty_rad;
  params.q_rad_sh = Q_shld(tg_out);
  params.m_flue   = m_flue(m_fuel);

  const rad_result = {
    "m_fuel":   m_fuel,
    "t_in":     t_in,
    "t_out":    t_out,
    "Tw":       Tw(Tb(t_out), Tw(Tb(t_out))),
    "tg_out":   tg_out,

    "Q_in":     Q_in(m_fuel),
    "Q_rls":    Q_rls(m_fuel),
    "Q_air":    Q_air(m_fuel),
    "Q_fuel":   Q_fuel(m_fuel),
    
    "Q_out":    Q_out(tg_out, t_out, m_fuel),
    "Q_flue":   Q_flue(tg_out),
    "Q_losses": Q_losses(m_fuel),
    "Q_shld":   Q_shld(tg_out),
    "Q_conv":   Q_conv(tg_out),
    "Q_rad":    Q_rad(tg_out, t_out),

    "Q_R":      Q_R(tg_out),
    "Q_fluid":  Q_fluid(),

    "kw_fluid": kw_fluid(Tb(t_in)),
    "kw_tube":  kw_tube(Tw(Tb(t_in))),
    "kw_flue":  params.kw_flue(tg_out),

    "Cp_fluid": Cp_fluid(t_in,t_out),
    "Cp_fuel":  Cp_fuel,
    "Cp_air":   Cp_air,
    "Cp_flue":  Cp_flue(tg_out,t_amb),

    "At":       At,
    "Ar":       Ar,
    "Ai":       Ai,
    "Acp":      Acp,
    "Acp_sh":   Acp_shld,

    "duty":     duty,
    "duty_rad": duty_rad,
    "duty_flux":duty_rad/At,
    
    "hi":       hi( Tb(t_out) ),
    "hi_tw":    hi( Tb(t_out), Tw(Tb(t_out) ) ),
    "hi_tww":   hi( Tb(t_out), Tw(Tb(t_out), Tw(Tb(t_out))) ),
    "h_conv":   h_conv,

    "Prandtl":  round(prandtl(Tb(t_out))),
    "Reynolds": round(reynolds(Tb(t_out))),
    "Alpha":    round(alpha),
    "MBL":      round(MBL),
    "Pco2":     round(params.Pco2),
    "Ph2o":     round(params.Ph2o),
    "PL":       round(PL),
    "F":        round(F(tg_out)),
    "F_desired":0.635,

    TUBING: {
      Material:        'A-312 TP321',
      "No Tubes Wide": 2,
      "No Tubes":      N,
      OD:              unitSystem.length(Do),
      "Wall Thickness":unitSystem.length(params.Sch_rad),
      Length:          unitSystem.length(L),
      "Tube Spacing":  unitSystem.length(S_tube),
    },
    FINING: "None"
  }
  rad_result.miu_flue = params.miu_flue(tg_out);
  rad_result.miu_fluid = miu_fluid(Tb(t_out));
  
  return rad_result
}

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
  const Total_Acp = a_shld*Acp_shld + alpha*Acp; // Equivalent cp area
  const Aw = Ar - Total_Acp; // Effective refractory area
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

module.exports = {
  radSection
};