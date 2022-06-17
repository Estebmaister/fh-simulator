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
const {newtonRaphson, logger, round, unitConv} = require('../utils');

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
const radSection = (params, noLog) => {
  /** There are two starting cases A & B
   * Case A: given the fluid temp at the exit point of heater.
   * Case B: given the flow mass of the fuel at the heater burners. 
   * */
  let 
    tg_out = 0, // (K) Leaving/effective gas temp
    t_in   = 0, // (K) Inlet fluid temp
    t_out  = params.t_out,  // (K) Outlet fluid temp
    m_fuel = params.m_fuel; // (kg/h)

  let 
    duty_total  = 0, // (kJ/h) Duty in the hole fired heater
    duty_rad = 0; // (kJ/h) Duty in the radiant section
  
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
    MBL = (2/3)*(params.Width_rad*params.Length_rad*params.Height_rad)**(1/3),
    PL  = (params.Ph2o + params.Pco2) * MBL, // atm-ft
    alpha = 1 +.49*(S_tube/Do)/6 -.09275*(S_tube/Do)**2 +.065*(S_tube/Do)**3/6 +.00025*(S_tube/Do)**4,
    alpha_shld =  1, // (-) alpha shield factor
    
    At = N *Math.PI *Do *L, // (m2) Bank tube's external surface area
    Acp = N * S_tube * L,   // (m2) Cold plane area of radiant tube bank
    Acp_shld = N_shld/2 *S_tube_shld*L_shld, // (m2) Cold plane area of shield tube bank
    Ar = Ar_calc(params),   // (m2) Total refractory area
    {Aw, Aw_aAcp} = Aw_calc(alpha, Acp, alpha_shld, Acp_shld, Ar), // (m2)
    Ai = Math.PI*(Di**2)/2, // (m2) Tube's inside flux area x2
    cnv_fact = 3_600 *1e-3, // (g/s -> kg/h) secondsToHours * 1/k

    sigma = 5.670374e-8 *cnv_fact, // (W/m2-K4) -> (kJ/h-m2-K4)
    F = (temp) => effectivity(PL, alpha, Acp, alpha_shld, Acp_shld, Ar)(unitConv.KtoF(temp));// (-)

  const // Process Variables
    duty_rad_dist = params.duty_rad_dist         || .7,   // (-) % *.01
    efficiency = params.efficiency               || .8,   // (-) % *.01
    heat_loss_percent = params.heat_loss_percent || .015, // (-) % *.01
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
    miu_fluid= (temp) =>params.miu_fluid(temp),//(cP - g/m-s) fluid Viscosity
    G = (m_fluid/cnv_fact) /Ai, // Fluid mass speed inside radiant tubes
    prandtl = (t) => miu_fluid(t)*Cp_fluid(t)*cnv_fact/kw_fluid(t), // (miu*Cp/kw)
    reynolds = (t) => G * Di/miu_fluid(t); // (-) G*Di/miu
  
  const 
    /** (kJ/h-m2-C) internal heat transfer coff */
    hi = (tB,tW = tB) => .023 *(kw_fluid(tB) /Di) *reynolds(tB)**.8 *
      prandtl(tB)**(1/3) *(miu_fluid(tB)/miu_fluid(tW))**.14,
    /** Average tube wall temp (K) */
    Tw = (tB, tW = tB, dutyRad = duty_rad) => (dutyRad/At) *(Do/Di)* 
      (Rfi +1/hi(tB,tW) +(Di*Math.log(Do/Di)/(2*kw_tube(tW))) ) +tB;

  const // ******* Heat input to the radiant section ********
    Q_air   = (mFuel) => m_air(mFuel) *Cp_air *(t_air -t_amb), // Sensible heat of air
    Q_fuel  = (mFuel) => mFuel * Cp_fuel*(t_fuel -t_amb), // Sensible heat of fuel
    Q_rls   = (mFuel) => mFuel * NCV, // Combustion heat of fuel
    Q_in    = (mFuel) => Q_rls(mFuel) + Q_air(mFuel) + Q_fuel(mFuel); // Heat input
  
  const // ******* Heat taken out of radiant section ********
    Q_flue = (tG, mFuel) => m_flue(mFuel)*Cp_flue(tG,t_amb)*(tG-t_amb), // Flue gases's sensible heat 
    Q_losses = (mFuel) => Q_rls(mFuel) *heat_loss_percent,    // Heat losses through setting
    Q_conv = (tG, tW) => h_conv * At * (tG - tW),             // Convective heat transfer
    Q_rad  = (tG, tW) => F(tG)*sigma*alpha*Acp*(tG**4-tW**4), // Radiant heat transfer
    Q_shld = (tG, tW) => F(tG)*sigma*alpha_shld*Acp_shld*(tG**4-tW**4), // Shld_rad heat transfer
    Q_R = (tG, tW) => Q_rad(tG,tW) + Q_conv(tG,tW), // Heat absorbed by radiant tubes
    Q_out = (tG, mFuel=m_fuel, tW = Tw(Tb(t_out), Tw(Tb(t_out)))) => 
    Q_R(tG, tW) + Q_shld(tG, tW) + Q_losses(mFuel) + Q_flue(tG, mFuel);

  const Q_fluid = (tOut, tIn) => m_fluid*Cp_fluid(tIn,tOut)*(tOut -tIn); // Fluid's sensible heat

  // **************************************************

  /* Calculating tg_out the option missing from given variables (mass_fuel or temp_out) */

  if (t_out !== 0) { // Given temp_out
    duty_total = Q_fluid(t_out,t_in_conv); // Duty effective from t_out
    duty_rad = duty_total * duty_rad_dist; // Calculate Tw with seed from 30-70 duty distribution
    // Approximating t_in_rad with assumption from duty distribution
    t_in = t_in_conv + duty_total*(1 -duty_rad_dist)/(m_fluid*Cp_fluid(t_in_conv,t_out));

    // Calculating tg_out (effective gas temp)
    const tg_out_func = (tG) => Q_fluid(t_out,t_in) -Q_R(tG,Tw(Tb(t_out),Tw(Tb(t_out))));
    const flame = newtonRaphson(tg_out_func, 1000, 
      params.NROptions, "Tg_Tout-seed_radiant", noLog);
    if (flame) tg_out = flame;

    // Calculating fuel mass
    const m_fuel_func = (mFuel) => Q_in(mFuel) -Q_out(tg_out,mFuel,Tw(Tb(t_out),Tw(Tb(t_out))));
    let mass_fuel_seed = Q_fluid(t_out,t_in_conv) /(NCV*efficiency);
    if (!noLog) logger.debug(`"mass_fuel_seed", "value": "${mass_fuel_seed}"`);
    mass_fuel_seed = newtonRaphson(m_fuel_func, mass_fuel_seed,
      params.NROptions, "M-fuel_T-seed_radiant", noLog);
    if (mass_fuel_seed) m_fuel = mass_fuel_seed;

    duty_rad = Q_R(tg_out,Tw( Tb(t_out), Tw(Tb(t_out)) ));

  } else { // Given mass_fuel
    duty_total = Q_rls(m_fuel) *efficiency; // Duty effective from from q release by fuel
    duty_rad = duty_total *duty_rad_dist; // Calculate Tw with seed from 30-70 duty distribution
    // Approximating t_in_rad and t_out with efficiency and duty dist
    t_in = t_in_conv + duty_total*(1 -duty_rad_dist) /(m_fluid*Cp_fluid(t_in_conv));
    let t_out_seed = t_in_conv + duty_total /(m_fluid*Cp_fluid(t_in));

    // Calculating tg_out (effective gas temp) //TODO: t_out isn't set needs recalculate
    const tg_out_func = (tG) => Q_in(m_fuel) -Q_out(tG,m_fuel,Tw(Tb(t_out_seed),Tw(Tb(t_out_seed))));
    const flame = newtonRaphson(tg_out_func, 1000, 
      params.NROptions, "Tg_mFuel-seed_radiant", noLog);
    if (flame) tg_out = flame;

    // Calculating t_out 
    const t_out_func = (tOut) => Q_fluid(tOut,t_in) -Q_R(tg_out,Tw(Tb(tOut),Tw(Tb(tOut))));

    t_out_seed = newtonRaphson(t_out_func, t_out_seed, 
      params.NROptions, "Tout_mFuel-seed_radiant", noLog);
    if (t_out_seed) t_out = t_out_seed;

    //TODO: recalculation let t_out_recall = t_in - t_out + (Q_rad(tg_out) + Q_conv(tg_out)) / (m_fluid*Cp_fluid(t_in,t_out))
    const duty_recalculated = m_fluid*Cp_fluid(t_in,t_out)*(t_out -t_in_conv);
    const t_in_recalculated = params.t_in_conv + duty_recalculated*(1 -duty_rad_dist)/(m_fluid*Cp_fluid(t_in,t_out));  
    // Discrepancies on recalculation
    if (!noLog) logger.info(`t_out, seed: ${t_out_seed} vs calc: ${t_out}`);
    if (!noLog) logger.info(`t_in_rad, seed: ${t_in} vs calc: ${t_in_recalculated}`);
  }

  // **************************************************
  if (!noLog) logger.default(`RADI, T_in_calc: ${params.units.tempC(t_in)},`+
    ` M_fuel: ${params.units.mass_flow(m_fuel)}, Tg_out: ${params.units.tempC(tg_out)}`);

  params.t_in_rad = t_in;
  params.t_out    = t_out;
  params.tg_rad   = tg_out;
  params.duty     = duty_total;
  params.m_flue   = m_flue(m_fuel);
  params.t_w_rad  = Tw( Tb(t_out), Tw(Tb(t_out)) );
  params.q_rad_sh = Q_shld(tg_out, params.t_w_rad);

  const rad_result = {
    m_fuel:   m_fuel,
    m_fluid:  m_fluid,
    t_in:     t_in,
    t_out:    t_out,
    Tw:       params.t_w_rad,
    tg_out:   tg_out,

    Q_in:     Q_in(m_fuel),
    Q_rls:    Q_rls(m_fuel),
    Q_air:    Q_air(m_fuel),
    Q_fuel:   Q_fuel(m_fuel),
    
    Q_out:    Q_out(tg_out, m_fuel),
    Q_flue:   Q_flue(tg_out, m_fuel),
    Q_losses: Q_losses(m_fuel),
    Q_shld:   Q_shld(tg_out, params.t_w_rad ),
    Q_conv:   Q_conv(tg_out, params.t_w_rad ),
    Q_rad:    Q_rad( tg_out, params.t_w_rad ),

    Q_R:      Q_R(tg_out, params.t_w_rad),
    Q_fluid:  Q_fluid(t_out,t_in),

    At:       At,
    Ar:       Ar,
    Ai:       Ai,
    Aw:       Aw,
    Aw_aAcp:  Aw_aAcp,
    Acp:      Acp,
    aAcp:     alpha*Acp,
    Acp_sh:   Acp_shld,

    hi:       hi( Tb(t_out), params.t_w_rad ),
    h_conv:   h_conv,

    duty_total:duty_total,
    duty:      duty_rad,
    "%":       duty_rad/duty_total,
    eff_total: duty_total/Q_rls(m_fuel) > 1 ? 100 : 100*duty_total/Q_rls(m_fuel),
    duty_flux: duty_rad/At,

    Alpha:    alpha,
    MBL:      round(MBL),
    Pco2:     round(params.Pco2),
    Ph2o:     round(params.Ph2o),
    PL:       round(PL),
    F:        round(F(tg_out)),
    emiss:    round(emissivity(PL)(tg_out)),

    kw_tube:  kw_tube(Tw(Tb(t_in))),
    kw_fluid: kw_fluid(Tb(t_in)),
    kw_flue:  params.kw_flue(tg_out),

    Cp_fluid: Cp_fluid(t_in,t_out),
    Cp_flue:  Cp_flue(tg_out,t_amb),
    Cp_fuel:  Cp_fuel,
    Cp_air:   Cp_air,

    Prandtl:  round(prandtl(Tb(t_out))),
    Reynolds: round(reynolds(Tb(t_out))),

    TUBING: {
      Material: params.Material,
      Nt:       2,
      N:        N,
      Sch:      params.Sch_rad,
      Do:       Do,
      L:        L,
      S_tube:   S_tube
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
const Ar_calc = (prams) => {
  const
    ExitArea = unitConv.m2toft2(prams.Pitch_sh_cnv*prams.Tpr_sh_cnv*prams.L_shld),
    Base       = prams.Length_rad * prams.Width_rad,
    WallWidth  = prams.Height_rad * prams.Width_rad,
    WallLength = prams.Height_rad * prams.Length_rad,
    WidthConv   = unitConv.mtoft(prams.Pitch_sh_cnv * prams.Tpr_sh_cnv),
    RoofDeclined_X = (prams.Width_rad - WidthConv)/2,
    RoofDeclined_Z = unitConv.mtoft( 4 * prams.Pitch_rad ),
    RoofDeclined_Y = Math.sin( Math.acos(RoofDeclined_X/RoofDeclined_Z) ) * RoofDeclined_Z,
    RoofDeclined   = 2*RoofDeclined_X*RoofDeclined_Y + 2*WidthConv*RoofDeclined_Y,
    Burners = 13 * (Math.PI/4)*2.24**2;
    
  const Ar  = 2*WallWidth + 2*WallLength + 2*Base - ExitArea - RoofDeclined - Burners;
  // console.warn(`
  // ExitArea   : ${ExitArea}
  // Base       : ${Base      }
  // WallWidth  : ${WallWidth }
  // WallLength : ${WallLength}
  // WidthConv  : ${WidthConv  }
  // Burners    : ${Burners}
  // Angle      : ${Math.acos(RoofDeclined_X/RoofDeclined_Z)}
  // RoofDeclined_X : ${RoofDeclined_X}
  // RoofDeclined_Z : ${RoofDeclined_Z}
  // RoofDeclined_Y : ${RoofDeclined_Y}
  // RoofDeclined   : ${RoofDeclined  }
  // `)
  // Several references
  // const Ar_calc = 2*(22.7+5.3+1)*prams.Width_rad + 2*WallLength + Base;
  // const Ar_W = 2*WallWidth + 2*wall_length + 1.234*base; //WinHeat
  // logger.warn(`{"RoofDeclined_X (ft)": ${RoofDeclined_X},"RoofDeclined_Y (ft)": ${RoofDeclined_Y}, "RoofDeclined_Z (ft)": ${RoofDeclined_Z}}`);
  // check logger.warn(`{"Ar prev (ft)": ${Ar2},"Ar calc (ft)": ${Ar}, "Ar esteem (ft)": ${Ar_esteem}}`);

  return unitConv.ft2tom2(Ar);
};

/** returns {Aw (m2), Aw_aAcp (-)} */
const Aw_calc = (alpha, Acp, a_shld, Acp_shld, Ar) => {
  const Total_Acp = a_shld*Acp_shld + alpha*Acp; // Equivalent cp area
  const Aw = Ar - Total_Acp; // Effective refractory area
  const Aw_aAcp = Aw / Total_Acp;
  return {Aw, Aw_aAcp};
}
/** returns effectivity(temp) function of temperature to use as F */
const effectivity = (pl, alpha, Acp, a_shld, Acp_shld, Ar) => {
  const {Aw_aAcp} = Aw_calc(alpha, Acp, a_shld, Acp_shld, Ar);
  const emiss = emissivity(pl);
  // debug logger.warn(`{"Aw (ft)": ${unitConv.m2toft2(Aw)},"Aw_aAcp (-)": ${Aw_aAcp}}`);

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
  // log logger.debug(`"Aw/aAcp", "value": "${round(Aw_aAcp)}",`+
  // `"A": "${round(A(Aw_aAcp))}", "B": "${round(B(Aw_aAcp))}", "C": "${round(C(Aw_aAcp))}"`);

  return (temp) => A(Aw_aAcp) + B(Aw_aAcp)*emiss(temp) + C(Aw_aAcp)*emiss(temp)**2;
};

module.exports = {
  radSection
};