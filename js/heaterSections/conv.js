const {logger, LMTD, round} = require('../utils');

const convSection = (params, noLog) => {
  let
    tg_in  = params.tg_sh,  // (K) Inlet gas temp coming from shld sect
    tg_out = 0,             // (K) Outlet gas temp
    t_out  = params.t_in_sh,// (K) Outlet fluid temp going to shld sect

    // --- First estimation: t_in equal to the one given
    t_in   = params.t_in_conv, // (K) Inlet process fluid temp
    t_in_calc = 0;  // (K) Recalculation for Inlet process fluid temp

  /** (K) bulk temp func (second arg default to conv outlet fluid temp) */
  const Tb = (tIn, tOut = t_out) => 0.5*(tIn + tOut);

  const // Process Variables
    m_fluid  = params.m_fluid, // (kg/h) Fluid mass flow
    m_flue   = params.m_flue,  // (kg/h) Flue mass flow
    Cp_fluid = (tIn,tOut=tIn) => params.Cp_fluid(Tb(tIn, tOut)), // (kJ/kg.K)
    Cp_flue  = (tG,tG_out=tG) => params.Cp_flue(Tb(tG, tG_out)), // (kJ/kg.K)
    kw_fluid = (temp) => params.kw_fluid(temp),//(kJ/h-m-C - J/s-m-C-3.6) fluid thermal conductivity
    kw_tube  = (temp) => params.kw_tube(temp),// (kJ/h-m-C ->J/s-m-C-3.6) tube thermal cndct
    kw_flue  = (temp) => params.kw_flue(temp),// (kJ/h-m-C) flue thermal cndct
    miu_fluid= (temp) =>params.miu_fluid(temp),//(cP - g/m-s) fluid Viscosity
    miu_flue = (temp) => params.miu_flue(temp);//(cP - g/m-s) flue Viscosity

  const // Parameters
    Rfo = params.Rfo, // (h-m2-C/kJ) external fouling factor
    Rfi = params.Rfi_conv,// (h-m2-C/kJ) internal fouling factor
    L  = params.L_conv, // (m) effective tube length
    Do = params.Do_conv,// (m) external diameter conv section
    Di = params.Do_conv - params.Sch_sh_cnv*2,// (m) int diameter conv sect
    S_tube = params.Pitch_sh_cnv, // (m) Tube spacing, 2*NPS
    N  = params.N_conv,        // (-) number of tubes convective sect
    N_tpr = params.Tpr_sh_cnv, // (-) Number of tube wide
    N_f = params.Nf,           // (1/m) Fin's number per meter
    L_fin = params.Lf,         // (m) Fin's height
    Th_fin = params.Tf,        // (m) Fin's thickness
    Ad = N_tpr*S_tube*L,       // Cross sectional area of box
    Ac = Do+2*L_fin*Th_fin*N_f,// Fin tube cross sectional area/ft, ft2/ft
    An  = Ad - Ac*L*N_tpr,     // Free area for flue flow
    Apo = Math.PI*Do*(1-N_f*Th_fin), // (m2) Outside prime tube surface area, m2/m
    Ao  = Math.PI*Do*(1-N_f*Th_fin) +Math.PI*N_f*(2*L_fin*(Do +L_fin) +Th_fin*(Do +2*L_fin)),
    Afo = Ao - Apo,            // (m2) Fin outside surface area, m2/m
    At  = N * Ao * L,          // (m2) Area of tubes in bank, total outside surface area, m2/m
    Ai  = Math.PI *(Di**2) /2, // (m2) Inside tube surface area, m2/m

    /** (ft) Mean Beam Length, dim ratio 1-2-1 to 1-2-4*/
    MBL = 2/3 * (params.Width_rad*params.Length_rad*params.Height_rad) **(1/3),
    PL = (params.Ph2o + params.Pco2) * MBL, // PP*MBL

    cnv_fact = 3_600 * 1e-3; // (g/s -> kg/h) secondsToHours * 1/k

  const // Process Functions
    prandtl = (t) => miu_fluid(t)*cnv_fact *Cp_fluid(t)/kw_fluid(t),// (-) miu*Cp/kw
    prandtl_flue = (t)=> miu_flue(t)*cnv_fact*Cp_flue(t)/kw_flue(t),// (-)
    G = (m_fluid/cnv_fact) /Ai, // Fluid mass flow per area unit inside tubes
    reynolds = (t) => G * Di/miu_fluid(t), // (-) G*Di/miu
    Gn = m_flue/An, // mass speed based on the free area for the gas flow
    reynolds_flue = (t) => Gn/cnv_fact *Do/miu_flue(t), // (-) G*Di/miu
    /** (kJ/m²h-°C) internal heat transfer coff */
    hi = (tB, tW = tB) => .023 *(kw_fluid(tB) /Di) *reynolds(tB)**.8 *prandtl(tB)**(1/3) *(miu_fluid(tB)/miu_fluid(tW))**.14;

  /** Q_fluid = M *Cp *deltaT */
  const Q_fluid = (tIn, tOut =t_out) => m_fluid *Cp_fluid(tIn, tOut) *(tOut -tIn);
  const duty_conv = (tIn) => Q_fluid(tIn);  // Duty in convective sect used for Tw calc

  /** Tw = Average tube wall temperature in Kelvin degrees */
  const Tw = (tB = Tb(t_out, t_in) , tW = tB, tIn = t_in) => (duty_conv(tIn) /At) *
    (Do/Di) *( Rfi +1/hi(tB,tW) +( Di *Math.log(Do/Di) /(2*kw_tube(tW)) ) ) +tB;

  const
    gr = (_tB, _tW) => 2.6*(0.29307107*cnv_fact), // (Btu/hr-ft2-F) Outside radiation factor //HACK: Find implementation
    hr = (tG_b, tW) => 2.2 *gr(tG_b, tW) *(PL)**.50 *(Apo/Ao)**.75; // (kJ/m²h-°C) effective radiative coff wall tube

  let hc = (tG_b, _tW) => .33 *(kw_flue(tG_b)/Do) *prandtl_flue(tG_b)**(1/3) *reynolds_flue(tG_b)**.6; // (kJ/m²h-°C)

  const
    ho = (tG_b, tW) => 1/( 1/(hc(tG_b, tW) +hr(tG_b,tW)) +Rfo ), // (kJ/m²h-°C) external heat transfer coff
    /** Fin's Efficiency */
    Kw_fin = 1.36* kw_tube(Tw(Tb(t_in,t_out), Tw(Tb(t_in,t_out)))), //HACK: Find theoretical implementation
    B = L_fin + (Th_fin /2),
    m = (ho(Tb(tg_in,tg_out), Tw(Tb(t_in,t_out), Tw(Tb(t_in,t_out)))) / (6 * Kw_fin * Th_fin))**0.5,
    x = Math.tanh(m * B) / (m * B),
    y = x * (0.7 + 0.3 * x),
    Df = Do + 2*L_fin,
    Ef  = y * (0.45 * Math.log(Df / Do) * (y - 1) + 1),    // (-) Fin efficiency
    he = (tG_b, tW) => ho(tG_b, tW) *(Ef*Afo + Apo) / Ao,  // (kJ/m²h-°C)
    j = (tG_b, tW) => colburnFactor(reynolds_flue, params, m, B)(tG_b, tW);   // Colburn factor

  hc = (tG_b, tW) => j(tG_b, tW) *Gn *Cp_flue(tG_b) *prandtl_flue(tG_b)**(-.67); // (kJ/m²h-°C) film heat transfer coff

  /** LMTD counter-current */
  const LMTD_Tin = (tIn) => LMTD(tIn, t_out, tg_in, tg_out);

  const // Thermal Resistances (hr-ft2-F/Btu)
    R_int = (tB, tW) => Do/Di * (1/hi(tB, tW) + Rfi),         // Inside
    R_tube =  (tW)  => Do * Math.log(Do/Di) / (2*kw_tube(tW)),// Tube wall
    R_ext = (tG_b, tW) => 1/he(tG_b, tW),                     // Outside

    R_sum = (tG_b, tB, tW) => R_ext(tG_b, tW) + R_tube(tW) + R_int(tB,tW),
    Uo  = (tG_b, tB, tW) => 1 / R_sum(tG_b, tB, tW);


  /** Q_flue  = M *Cp *deltaT */
  const Q_flue = (tG_in, tG_out) => m_flue*Cp_flue(tG_in,tG_out) *(tG_in -tG_out);

  /** Q_conv = Uo * Ao *LMTD */
  const Q_conv = (tIn, tG_in, tG_out) =>
    Uo( Tb(tG_out, tG_in), Tb(tIn), Tw(Tb(tIn),Tw(Tb(tIn))) ) *At *LMTD_Tin(tIn);

  const tg_out_func = (tIn, tG_out = tg_in*0.7) => tg_in - Q_fluid(tIn) /(m_flue * Cp_flue(Tb(tg_in,tG_out)));
  const err_diff = () => 100 *( Q_conv(t_in_calc, tg_in, tg_out) - Q_fluid(t_in_calc) ) /Q_fluid(t_in_calc);
  const err_tol_pass = () => Math.abs(err_diff()) < 0.001
  
  // -------- 1st estimation of tg_out   #.#.#.#.#
  tg_out = tg_out_func(t_in);
  t_in_calc = t_in;

  while ((tg_out - t_in_calc) < 0) {
    t_in_calc *= 1.002;
    tg_out = tg_out_func(t_in_calc);
  }

  let min, max;

  for (let iter = 0; iter < 100; iter++) {
    // console.warn(`iteration ${iter}, tg_out: ${round(tg_out,1)}, t_in: ${round(t_in_calc,1)},`+
    // ` min: ${round(min,1)}, max: ${round(max,1)}, err: ${round(err_diff(),1)}`)
    if (err_tol_pass()) {
      break
    }
    if ((tg_out - t_in_calc) < 0 || err_diff() <= 0) {
      min = t_in_calc;
      if (min && max) {
        t_in_calc = (min + max)/2
      } else {
        t_in_calc *= 1.001
      }
    } else {
      max = t_in_calc;
      if (min && max) {
        t_in_calc = (min + max)/2
      } else {
        t_in_calc *= 0.999
      }
    }
    tg_out = tg_out_func(t_in_calc);
  }
  
  t_in = t_in_calc;

  if (!noLog) logger.default(`CONV, T_in_calc: ${params.units.tempC(t_in_calc)}, ` +
    `T_in_given: ${params.units.tempC(params.t_in_conv)}, Tg_stack: ${params.units.tempC(tg_out)}`);

  params.t_in_conv_calc = t_in;
  params.tg_conv = tg_out;

  return {
    t_fin:        params.Ts( Tb(t_in), Tw( Tb(t_in), Tw(Tb(t_in)) )),
    t_fin_max:    t_out + Q_conv( t_in, tg_in, tg_out)/(At/(params.N_conv/ params.Tpr_sh_cnv)) *(Do/Di) 
      *( Rfi +1/hi(Tb(t_in),Tw( Tb(t_in), Tw(Tb(t_in)) )) +( Di *Math.log(Do/Di) /(2*kw_tube(Tw( Tb(t_in), Tw(Tb(t_in)) ))) ) ),
    t_in_given:   params.t_in_conv,
    t_in:         t_in,
    t_out:        t_out,
    Tb:           Tb(t_in),
    Tw:           Tw( Tb(t_in), Tw(Tb(t_in)) ),
    tg_out:       tg_out,
    tg_in:        tg_in,
    Tb_g:         Tb(tg_in, tg_out),

    rfi:          Rfi,
    rfo:          Rfo,

    LMTD:         LMTD_Tin(t_in),
    DeltaA:       (tg_in - t_out),
    DeltaB:       (tg_out - t_in),

    Q_flue:       Q_flue( tg_in, tg_out),
    Q_fluid:      Q_fluid(t_in),
    Q_conv:       Q_conv( t_in, tg_in, tg_out),
    Q_stack:      Q_flue( tg_out, params.t_air),

    duty:         Q_fluid(t_in),
    "%":          Q_fluid(t_in)/params.duty,
    duty_flux:    Q_fluid(t_in)/At,

    Cp_fluid:     Cp_fluid( t_in, t_out   ),
    Cp_flue:      Cp_flue(  tg_in, tg_out ),
    miu_fluid:    miu_fluid(Tw(Tb(t_in))  ) ,
    miu_flue:     miu_flue( tg_out        ),
    kw_fluid:     kw_fluid( Tb(t_in)      ),
    kw_tube:      kw_tube(  Tw(Tb(t_in))  ),
    kw_fin:       Kw_fin,
    kw_flue:      kw_flue(  Tb(tg_in, tg_out)),

    Prandtl:      round(prandtl(Tb(t_out))),
    Reynolds:     round(reynolds(Tb(t_out))),
    PrandtlFlue:  round(prandtl_flue(Tb(t_out))),
    ReynoldsFlue: round(reynolds_flue(Tb(t_out))),

    At:     At,
    Ai:     Ai,
    An:     An,
    Ao :    Ao,
    Apo:    Apo,
    Afo:    Afo,
    Ef :    Ef,
    Gn:     Gn/cnv_fact,

    hi:     hi( Tb(t_in),          Tw(Tb(t_in), Tw(Tb(t_in))) ),
    hr:     hr( Tb(tg_in, tg_out), Tw(Tb(t_in), Tw(Tb(t_in))) ),
    ho:     ho( Tb(tg_in, tg_out), Tw(Tb(t_in), Tw(Tb(t_in))) ),
    hc:     hc( Tb(tg_in, tg_out), Tw(Tb(t_in), Tw(Tb(t_in))) ),
    he:     he( Tb(tg_in, tg_out), Tw(Tb(t_in), Tw(Tb(t_in))) ),
    j:      j(  Tb(tg_in, tg_out), Tw(Tb(t_in), Tw(Tb(t_in))) ),
    gr:     gr( Tb(tg_in, tg_out), Tw(Tb(t_in), Tw(Tb(t_in))) ),

    Uo:     Uo( Tb(tg_in, tg_out), Tb(t_in), Tw(Tb(t_in)) ),
    R_int:  R_int(                 Tb(t_in), Tw(Tb(t_in))),
    R_tube: R_tube(                          Tw(Tb(t_in))),
    R_ext:  R_ext(Tb(tg_in, tg_out),         Tw(Tb(t_in))),

    TUBING: {
      Material: params.Material,
      Nt:       N_tpr,
      N:        N,
      Sch:      params.Sch_sh_cnv,
      Do:       Do,
      L:        L,
      S_tube:   S_tube
    },
    FINING: {
      Material:    params.FinMaterial,
      Type:        params.FinType,
      Height:      params.Lf,
      Thickness:   params.Tf,
      Dens:        params.Nf,
      Arrange:     params.FinArrange
    }
  };
}

const colburnFactor = (reynoldsFlue, parm, m, B) => {
  const
    C1 = (tB_g) => .25 *reynoldsFlue(tB_g)**(-.35), // Reynolds number correction

    Lf = parm.Lf,                         // (m) Fins height
    Sf = 1/parm.Nf - parm.Tf,             // (m) Fin spacing
    C3 = .35 +.65 * Math.exp(-.25*Lf/Sf), // Geometry correction (Solid, staggered pattern)

    Pl = parm.Pitch_sh_cnv,            // (m) Longitudinal tube pitch
    Pt = parm.Pitch_sh_cnv,            // (m) Transverse tube pitch
    Nr = parm.N_conv/ parm.Tpr_sh_cnv, // (-) Tube row's number
    C5 = .7 + (.7 -.8 *Math.exp(-.15*Nr**2)) *Math.exp(-Pl/Pt), // Non-equilateral & row correction

    Df_Do = (2*parm.Lf + parm.Do_conv) / (parm.Do_conv), // (m) Ratio fin's Do per tube's Do

    Ts = (tB_g, tW) => tB_g + (tW - tB_g) / ( ( Math.exp(1.4142*m*B) + Math.exp(-1.4142*m*B) )/2 );// (K) Average fin temp
  parm.Ts = Ts;
  return (tB_g, tW) => C1(tB_g) *C3 *C5 *(Df_Do)**.5 *(tB_g/Ts(tB_g, tW))**.25;
};

/** Auxiliary functions used at development process
 * const t_in_func = (tG_out) => t_out -Q_conv(t_in,tg_in,tG_out)/(m_fluid*Cp_fluid(t_in,t_out));
 * const tg_out_func = (tG_out) => Q_fluid(t_in) - Q_flue(tg_in, tG_out);
 * const Tin_conv_func = (tIn) => Q_fluid(tIn) - Q_conv(tIn, tg_in, tg_out);
 */

module.exports = {
  convSection
};