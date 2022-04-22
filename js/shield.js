/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @shieldSection (params)
 * @version  1.00
 * @param   {params object} valid params object.
 * @return  {rad_result} an object with all the section results
 * 
 * Q_fluid = m_fluid * Cp_fluid * (t_out - t_in) = Q_rad_sh + Q_conv
 * Q_fluid = Q_R
 * 
 * Q_conv = h_conv * At * ( Tb(tg_in, tg_out) - Tw(t_in, t_out) )
 * Q_conv = m_flue * Cp_flue * (tg_in - tg_out) = Q_flue
 *****************************************************************/
const {newtonRaphson, logger, LMTD, round, unitConv} = require('./utils');

const shieldSection = (params, noLog) => {
  let // Temperatures declaration
    tg_in = params.tg_rad,  // (K) Inlet flue gases temp.
    tg_out = 0,             // (K) Outlet flue gases temp.
    t_out = params.t_in_rad,// (K) Outlet fluid temp going to rad sect.

    // --- First estimation: duty equal to the one coming from convect sect
    t_in = (params.t_in_rad + params.t_in_conv)*0.5, // (K) Inlet fluid temp.
    t_in_calc = 0;  // (K) Recalculation for Inlet shld fluid temp.

  /** (K) bulk temp func (second arg default to shld outlet fluid temp) */
  const Tb = (tIn, tOut = t_out) => 0.5*(tIn + tOut);

  const // Process Variables
    m_fluid  = params.m_fluid, // (kg/h) Fluid mass flow.
    m_flue   = params.m_flue,  // (kg/h) Flue mass flow.
    Cp_fluid = (tIn,tOut=tIn) => params.Cp_fluid(Tb(tIn, tOut)), // (kJ/kg.K).
    Cp_flue  = (tG,tG_out=tG) => params.Cp_flue(Tb(tG, tG_out)), // (kJ/kg.K).
    kw_fluid = (temp) => params.kw_fluid(temp),// (kJ/h-m-C) fluid thermal cndct.
    kw_tube  = (temp) => params.kw_tube(temp),// (kJ/h-m-C ->J/s-m-C-3.6) tube thermal cndct.
    kw_flue  = (temp) => params.kw_flue(temp),// (kJ/h-m-C) flue thermal cndct.
    miu_fluid= (temp) => params.miu_fluid(temp),//(cP - g/m-s) fluid Viscosity.
    miu_flue = (temp) => params.miu_flue(temp); //(cP - g/m-s) flue Viscosity.

  const // Parameters
    Rfo = params.Rfo,   // (h-m2-C/kJ) external fouling factor.
    Rfi = params.Rfi,   // (h-m2-C/kJ) internal fouling factor.
    N  = params.N_shld, // - number of shld tubes.
    L  = params.L_shld, // (m) effective tube length.
    Do = params.Do_shld,// (m) external diameter shld section.
    Di = params.Do_shld - params.Sch_sh_cnv*2,// (m) int diameter shld sect.
    S_tube = params.Pitch_sh_cnv, // (m) Tube spacing.

    At = N *Math.PI *Do *L,   // (m2) Area of tubes in bank, total outside surface area, m2
    Ai = Math.PI *(Di**2) /2, // (m2) Inside tube surface area, m2
    An = N/2 *(S_tube -Do)*L, // Free area for flue flow at shld sect
    
    cnv_fact = 3_600 * 1e-3; // (g/s -> kg/h) secondsToHours * 1/k.

  const // Process Functions
    prandtl = (t) => miu_fluid(t)*cnv_fact *Cp_fluid(t)/kw_fluid(t),// (-) miu*Cp/kw.
    prandtl_flue = (t)=> miu_flue(t)*cnv_fact*Cp_flue(t)/kw_flue(t),// (-) miu_fle*Cp_flue/kw_flue.
    G = (m_fluid/cnv_fact) /Ai, // Fluid mass flow per area unit inside tubes.
    reynolds = (t) => G * Di/miu_fluid(t), // (-) G*Di/miu.
    Gn = (m_flue/cnv_fact) /An, // Gn it's the mass speed based on the free area for the gas flow.
    reynolds_flue = (t) => Gn * Do/miu_flue(t), // (-) Gn*Do/miu_flue.
      
    /** (kJ/m²h-°C) internal heat transfer coff */
    hi = (tB, tW = tB) => .023 *(kw_fluid(tB) /Di) *reynolds(tB)**.8 *
      prandtl(tB)**(1/3)*(miu_fluid(tB)/miu_fluid(tW))**.14,
    /** (kJ/m²h-°C) effective radiative coff wall tube */
    hr = (tG_b) => .092 * tG_b - 34,
    /** (kJ/m²h-°C) * film heat transfer coff */
    hc = (tG_b) => .33 *(kw_flue(tG_b) /Do) *prandtl_flue(tG_b)**(1/3) *reynolds_flue(tG_b)**.6,
    /** (kJ/m²h-°C) external heat transfer coff */
    ho = (tG_out, tG_in = tg_in) => 1/(1/(hc(Tb(tG_out, tG_in)) + hr(Tb(tG_out, tG_in))) +Rfo);
  
  const
    duty_sh = (tIn) => m_fluid *Cp_fluid(tIn) *(t_out -tIn),
    /** Average tube wall temp (K) */
    Tw = (tB, tW = tB, tIn = t_in) => (duty_sh(tIn)/At) *(Do/Di)*
      (Rfi +1/hi(tB,tW) +(Di *Math.log(Do/Di) /(2*kw_tube(tW))) ) +tB;

  const // Thermal Resistances (hr-ft2-F/Btu)
    R_int = (tB, tW) => Do / (Di * hi(tB,tW)) + (Do/Di)*Rfi, // Inside
    R_tube= (tW) => Do * Math.log(Do/Di) / (2*kw_tube(tW)),  // Tube wall
    R_ext = (tG_out, tG_in = tg_in) => 1/ho(tG_out, tG_in),  // Outside
    
    R_sum = (tG_out, tG_in, tB, tW) => R_ext(tG_out, tG_in) + R_tube(tW) + R_int(tB,tW),
    // Uo  = (tG_out, tG_in, tB, tW) => unitConv.hcENtohcSI(5.92) + 0*R_sum(tG_out, tG_in, tB, tW);
    Uo  = (tG_out, tG_in, tB, tW) => 1 / R_sum(tG_out, tG_in, tB, tW);
  
  const Q_rad = params.q_rad_sh;            // (kJ/h) Q_rad = σ*(α*Acp)*F*(Tg**4 - Tw**4)
  /** Q_conv = Uo . Ao . LMTD */
  const Q_conv = (tIn, tG_in, tG_out, tB, tW) => Uo(tG_out, tG_in, tB, tW)*At*LMTD(tIn, t_out, tG_in, tG_out)
  /** Q_R = Q_conv + Q_rad */
  const Q_R = (tIn, tG_in, tG_out, tB, tW) => Q_rad + Q_conv(tIn, tG_in, tG_out, tB, tW);
  /** Q_fluid =  M . Cp . deltaT */
  const Q_fluid = (tIn, tOut = t_out) => m_fluid * Cp_fluid(tIn, tOut) * (tOut - tIn);
  /** Q_flue =  M . Cp . deltaT */
  const Q_flue = (tG_in,tG_out=tg_out) => m_flue * Cp_flue(tG_in, tG_out) * (tG_in - tG_out);
  
  const tg_out_func = (tG_out) => Q_flue(tg_in, tG_out) + Q_rad - Q_fluid(t_in, t_out);
  // opt2 tg_out_func = (tG_out) => Q_conv(t_in, tg_in, tG_out, Tb(t_in), Tw(Tb(t_in))) - Q_flue(tg_in,tG_out);
  
  const Tin_sh_func = (tIn) => Q_fluid(tIn) - Q_R(tIn, tg_in, tg_out, Tb(tIn), Tw( Tb(tIn),Tw(Tb(tIn)) ));
  
  // -------- 1st estimation of tg_out   #.#.#.#.#
  tg_out = newtonRaphson(tg_out_func, (tg_in - 200), params.NROptions, "Tg_out_shield-1");
  t_in_calc = newtonRaphson(Tin_sh_func, t_in, params.NROptions, "T_in_shield-1");

  const 
    normalized_error = 1e-6, // 0.0001%
    normalized_diff = (tIn_calc, tIn = t_in) => Math.abs(tIn_calc - tIn) /tIn;
  let iterations = 0;
  while (normalized_diff(t_in_calc) > normalized_error) {
    if (!noLog) logger.debug(`"Tin_shield",  "t_in_sh_calc": ${round(t_in_calc)}, "t_in_sh_sup": ${round(t_in)}`)
    if (t_in_calc) {
      t_in = t_in_calc;
    } else {
      if (!noLog) logger.error("Invalid t_in_calc at shield sect");
      break;
    }
    
    t_in_calc = newtonRaphson(Tin_sh_func, t_in, params.NROptions, "T_in_shield-2");
    tg_out = newtonRaphson(tg_out_func, (tg_in - 58), params.NROptions, "Tg_out_shield-2");

    // Forced break of loop
    iterations++;
    if (iterations > 10) {
      if (!noLog) logger.info(`diff vs error: ${normalized_error}-${normalized_diff(t_in_calc)}`);
      if (!noLog) logger.error("Max iterations reached for inlet temp calc at shield sect");
      break;
    }
  }

  params.t_in_sh = t_in;
  params.tg_sh = tg_out;

  const shld_result = {
    m_flue:   m_flue,
    t_in_sup: (params.t_in_rad + params.t_in_conv)*0.5,
    t_in:     t_in,
    t_out:    t_out,
    Tb:       Tb(t_in),
    Tw:       Tw( Tb(t_in), Tw(Tb(t_in)) ),
    tg_out:   tg_out,
    tg_in:    tg_in,
    Tb_g:     Tb(tg_in, tg_out),
    LMTD:     LMTD(t_in, t_out, tg_in, tg_out),
    DeltaA:   (tg_in - t_out),
    DeltaB:   (tg_out - t_in),

    Q_flue:   Q_flue(tg_in, tg_out),
    Q_fluid:  Q_fluid(t_in),
    Q_R:      Q_R( t_in, tg_in, tg_out, Tb(t_in), Tw(Tb(t_in)) ),
    Q_rad:    Q_rad,
    Q_conv:   Q_conv( t_in, tg_in, tg_out, Tb(t_in), Tw(Tb(t_in)) ),

    Cp_fluid:  Cp_fluid(t_in,t_out),
    Cp_flue:   Cp_flue(tg_in,tg_out),
    miu_fluid:  miu_fluid(Tw(Tb(t_in))),

    duty:       duty_sh(t_in),
    "%":        round(100*duty_sh(t_in)/params.duty,2),
    duty_flux:  duty_sh(t_in)/At,

    kw_fluid:   kw_fluid(Tb(t_in)),
    kw_tube:    kw_tube(Tw(Tb(t_in))),
    kw_flue:    kw_flue(Tb(tg_in, tg_out)),

    Prandtl:    round(prandtl(Tb(t_out))),
    Reynolds:   round(reynolds(Tb(t_out))),
    PrandtlFlue: round(prandtl_flue(Tb(t_out))),
    ReynoldsFlue:round(reynolds_flue(Tb(t_out))),

    At:       At,
    Ai:       Ai,
    An:       An,
    Gn:       Gn,

    hi:         hi( Tb(t_in) ),
    hi_tw:      hi( Tb(t_in), Tw(Tb(t_in)) ),
    hr:         hr(tg_in),
    ho:         ho(tg_out),
    hc:         hc( Tb(tg_in, tg_out) ),

    Uo:         Uo(tg_out, tg_in, Tb(t_in), Tw( Tb(t_in),Tw(Tb(t_in)) ) ),
    R_int:      R_int( Tb(t_in), Tw( Tb(t_in),Tw(Tb(t_in)) ) ),
    R_tube:     R_tube( Tw( Tb(t_in),Tw(Tb(t_in)) ) ),
    R_ext:      R_ext(tg_out, tg_in),

    TUBING: {
      Material: params.Material,
      Nt:       params.Tpr_sh_cnv,
      N:        N,
      Sch:      params.Sch_sh_cnv,
      Do:       Do,
      L:        L,
      S_tube:   S_tube
    },
    
    FINING: "None"
  };
  shld_result.miu_flue = miu_flue(tg_out);
  
  if (!noLog) logger.default(`T_in_sh: ${round(t_in)} K, Tg_sh: ${round(tg_out)} K`)

  return shld_result
}

module.exports = {
  shieldSection
};