const {newtonRaphson, logger, LMTD, round, unitConv} = require('./utils');

// TODO: delete after testing inside
const {options, initSystem} = require('./utils');
const unitSystem = initSystem('EN');

const convSection = (params) => {
  // Failing in case of a wrong call
  if (params === null || params === undefined) {
    logger.error("wrong call for convection section, no parameters set at call.")
    return {};
  }

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
    Rfi = params.Rfi, // (h-m2-C/kJ) internal fouling factor
    N  = params.N_conv, // - number of conv tubes
    L  = params.L_conv, // (m) effective tube length
    Do = params.Do_conv,// (m) external diameter conv section 
    Di = params.Do_conv - params.Sch_sh_cnv*2,// (m) int diameter conv sect
    S_tube = params.Pitch_sh_cnv, // (m) Tube spacing, NPS
    Nr = params.N_conv/ params.Tpr_conv, // (-) Number of tube rows //TODO: implement
    
    Acp = N * S_tube * L,    // (m2) Cold plane area of shld tube bank //TODO: use convective equation
    At = N *Math.PI *Do *L,  // (m2) Area of tubes in bank, total outside surface area, m2/m
    Ai = Math.PI *(Di**2) /2,// (m2) Inside tube surface area, m2/m
    An = ((N/Nr)*(S_tube - Do) + S_tube/2)*L , // Free area for flue flow at shld sect
    
    Afo = 1,  // (m2) Fin outside surface area, m2/m // TODO: implement
    Apo = At, // (m2) Outside tube surface area, m2/m
    Ef  = 1,  // (-) Fin efficiency

    /** (ft) Mean Beam Length, dim ratio 1-2-1 to 1-2-4*/
    MBL = 2/3 * (params.Width_rad*params.Length_rad*params.Height_rad) **(1/3), //TODO: implement
    PL = (params.Ph2o + params.Pco2) * MBL, // PP*MBL
    
    cnv_fact = 3_600 * 1e-3; // (g/s -> kg/h) secondsToHours * 1/k

  logger.warn(`Acp_conv: ${ round( unitConv.m2toft2(Acp) ) } ft`);

  const // Process Functions
    prandtl = (t) => miu_fluid(t)*cnv_fact *Cp_fluid(t)/kw_fluid(t),// (-) miu*Cp/kw
    prandtl_flue = (t)=> miu_flue(t)*cnv_fact*Cp_flue(t)/kw_flue(t),// (-)
    G = (m_fluid/cnv_fact) /Ai, // Fluid mass flow per area unit inside tubes
    reynolds = (t) => G * Di/miu_fluid(t), // (-) G*Di/miu
    // Gn it's the mass speed based on the free area for the gas flow (the space between the tubes across the heater).
    Gn = (m_flue/cnv_fact) /An,
    reynolds_flue = (t) => Gn * Do/miu_flue(t), // (-) G*Di/miu

    j = (tG_b) => colburnFactor(reynolds_flue, Tw, params)(tG_b),
    gr = (_tB, _tW) => 3.5*cnv_fact, // (Btu/hr-ft2-F) Outside radiation factor //TODO: implement and convert

    /** (kJ/m²h-°C) internal heat transfer coff */
    hi = (tB, tW = tB) => .023 *(kw_fluid(tB) /Di) *reynolds(tB)**.8 *
      prandtl(tB)**(1/3) *(miu_fluid(tB)/miu_fluid(tW))**.14,
    /** (kJ/m²h-°C) effective radiative coff wall tube */
    hr = (tG_b, tW) => 2.2 *gr(tG_b, tW) *(PL)**.50 *(Apo/At)**.75,
    /** (kJ/m²h-°C) * film heat transfer coff */
    hc = (tG_b) => j(tG_b) *Gn *Cp_flue(tG_b) *prandtl_flue(tG_b)**(-.67), // hc =.33*(kt_g_b /Do) * (prandtl(t_g_b))**(1/3) * (reynolds(t_g_b) )**.6
    /** (kJ/m²h-°C) external heat transfer coff */
    ho = (tG_b, tW) => 1/( 1/(hc(tG_b) +hr(tG_b,tW)) +Rfo ),
    he = (tG_b, tW) => ho(tG_b, tW) *(Ef*Afo + Apo) / At; //TODO: check fin area calc

    
  /** Q_fluid = M *Cp *deltaT */
  const Q_fluid = (tIn, tOut = t_out) => m_fluid *Cp_fluid(tIn, tOut) *(tOut -tIn);
  const duty_conv = (tIn) => Q_fluid(tIn);

  /** Tw = Average tube wall temperature in Kelvin degrees */
  const Tw = (tB = Tb(t_out, t_in) , tW = tB, tIn = t_in) => (duty_conv(tIn) /At) * 
    (Do/Di) *( Rfi +1/hi(tB,tW) +( Di *Math.log(Do/Di) /(2*kw_tube(tW) )) ) +tB;

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

  /** Q_conv = Uo *AO *LMTD + Q_rad_conv */
  const Q_conv = (tIn, tG_in, tG_out) => 
    Uo( Tb(tG_out, tG_in), Tb(tIn), Tw(Tb(tIn),Tw(Tb(tIn))) ) * At * LMTD_Tin(tIn);

  const tg_out_func = (tG_out) => Q_flue(tg_in, tG_out) - Q_fluid(t_in, t_out);
  const Tin_conv_func = (tIn) => Q_fluid(tIn) - Q_conv(tIn, tg_in, tg_out);

  // -------- 1st estimation of tg_out   #.#.#.#.#
  tg_out = newtonRaphson(tg_out_func, (tg_in - 58), params.NROptions, "Tg_out_convective-1");
  t_in_calc = newtonRaphson(Tin_conv_func, t_in, params.NROptions, "T_in_convective-1");


  // TODO: Delete debugger
  logger.warn(`"vars to check in shld section",
    "t_in_conv":  "${unitSystem.tempC(t_in_calc)} vs ${unitSystem.tempC(t_in)}"`)
  //*/
  
  const
    normalized_error = 1e-6, // .0001%
    normalized_diff = (tIn_calc, tIn = t_in) => Math.abs(tIn_calc - tIn) /tIn;
  let iterations = 0;
  while (normalized_diff(t_in_calc) > normalized_error) {
    logger.debug(`"Tin_convective", "t_in_cnv_calc": ${t_in_calc}, "t_in_cnv_sup": ${t_in}`)
    if (t_in_calc) {
      t_in = t_in_calc;
    } else {
      logger.error("Invalid t_in_calc at convective sect");
      break;
    }
    
    tg_out = newtonRaphson(tg_out_func, (tg_in - 58), params.NROptions, "Tg_out_convective-2");
    t_in_calc = newtonRaphson(Tin_conv_func, t_in, params.NROptions, "T_in_convective-2");

    // Forced break of loop
    iterations++;
    if (iterations > 10) {
      logger.info(`diff vs error: ${normalized_error}-${normalized_diff(t_in_calc)}`)
      logger.error("Max iterations reached for inlet temp calc at convective sect");
      break;
    }
  }

  const conv_result = {
    "t_in_given":params.t_in_conv,
    "t_in":     t_in,
    "t_out":    t_out,
    "Tb":       Tb(t_in),
    "Tw":       Tw( Tb(t_in), Tw(Tb(t_in)) ),
    "tg_out":   tg_out,
    "tg_in":    tg_in,
    "Tb_g":     Tb(tg_in, tg_out),
    "LMTD":     LMTD_Tin(t_in),
    "DeltaA":   (tg_in - t_out),
    "DeltaB":   (tg_out - t_in),

    "Q_flue":   Q_flue(tg_in, tg_out),
    "Q_fluid":  Q_fluid(t_in),
    "Q_conv":   Q_conv(t_in, tg_in, tg_out),

    "Cp_fluid": Cp_fluid(t_in,t_out),
    "Cp_flue":  Cp_flue(tg_in,tg_out),
    "miu_fluid":  miu_fluid(Tw(Tb(t_in))) ,

    "kw_fluid":   kw_fluid(Tb(t_in)),
    "kw_tube":    kw_tube(Tw(Tb(t_in))),
    "kw_flue":    kw_flue(Tb(tg_in, tg_out)),

    "Prandtl":    round(prandtl(Tb(t_out))),
    "Reynolds":   round(reynolds(Tb(t_out))),
    "PrandtlFlue": round(prandtl_flue(Tb(t_out))),
    "ReynoldsFlue":round(reynolds_flue(Tb(t_out))),

    "At":         At,
    "Ai":         Ai,
    "An":         An,

    "hi":         hi( Tb(t_in) ) ,
    "hi_tw":      hi( Tb(t_in),         Tw(Tb(t_in), Tw(Tb(t_in))) ),
    "hr":         hr( Tb(tg_out,tg_in), Tw(Tb(t_in), Tw(Tb(t_in))) ),
    "hc":         hc( Tb(tg_in, tg_out) ),
    "ho":         ho( Tb(tg_in, tg_out),Tw(Tb(t_in), Tw(Tb(t_in))) ),
    "he":         he( Tb(tg_in, tg_out),Tw(Tb(t_in), Tw(Tb(t_in))) ),
    "j":          j( Tb(tg_out,tg_in) ) ,

    "Uo":         Uo( Tb(tg_in, tg_out), Tb(t_in), Tw(Tb(t_in)) ),
    "R_int":      R_int(                 Tb(t_in), Tw(Tb(t_in))),
    "R_tube":     R_tube(                          Tw(Tb(t_in))),
    "R_ext":      R_ext(Tb(tg_in, tg_out),         Tw(Tb(t_in))),

    TUBING: {
      Material:        'A-312 TP321',
      "No Tubes Wide": params.Tpr_conv,
      "No Tubes":      N,
      "Wall Thickness":unitSystem.length(params.Sch_sh_cnv),
      "Outside Di":    unitSystem.length(Do),
      "Ef. Length":    unitSystem.length(L),
      "Tran Pitch":    unitSystem.length(S_tube),
      "Long Pitch":    unitSystem.length(S_tube)
    },
    FINING: {
      Material:    '11.5-13.5Cr',
      Type:        'Solid',
      "Height":    unitSystem.length(params.Lf),
      "Thickness": unitSystem.length(params.Tf),
      Dens:        params.Nf + " 1/m",
      Arrange:     "Staggered Pitch" 
    }
  };
  conv_result.miu_flue = miu_flue(tg_out);

  logger.default(`T_in_given: ${unitSystem.tempC(params.t_in_conv)}, T_in_calc: ${unitSystem.tempC(t_in_calc)}, Tg_out_conv: ${unitSystem.tempC(tg_out)}`);

  params.t_in_conv_calc = t_in;
  params.tg_conv = tg_out;

  return conv_result;
}

const colburnFactor = (reynoldsFlue, tW, parm) => {
  const
    C1 = (tB_g) => .25 *reynoldsFlue(tB_g)**(-.35), // Reynolds number correction

    Lf = parm.Lf,                         // (m) Fins height
    Sf = 1/parm.Nf -parm.Tf,              // (m) Fin spacing 
    C3 = .35 +.65 * Math.exp(-.25*Lf/Sf), // Geometry correction (Solid, staggered pattern)

    Pl = parm.Pitch_sh_cnv,     // (m) Longitudinal tube pitch
    Pt = parm.Pitch_sh_cnv,     // (m) Transverse tube pitch
    Nr = parm.N_conv/ parm.Tpr_conv, // (-) Tube row's number
    C5 = .7 + (.7 -.8 *Math.exp(-.15*Nr**2)) *Math.exp(-Pl/Pt), // Non-equilateral & row correction
    
    Df_Do = (2*parm.Lf + parm.Do_conv) / (parm.Do_conv), // (m) Ratio fin's Do per tube's Do
    
    Ts = () => tW();// (K) Average fin temperature  //TODO: implement
  
  return (tB_g) => C1(tB_g) *C3 *C5 *(Df_Do)**.5 *(tB_g/Ts())**.25; // .0055
};

module.exports = {
  convSection
};