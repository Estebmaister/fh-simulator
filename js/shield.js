/******************************************************************
 * Exported functions from this file
 ******************************************************************
 * @shieldSection (params)
 * @version  1.00
 * @param   {params object} valid params object.
 * @return  {number or false} a number is the iterations reach the result, 
 *          false if not.
 * Effective Gas Temperature after shield (Tg_sh)
 * 
 * Q_fluid_shld = m_fluid*Cp_fluid*(Tin_zr - Tin_zs) = Q_rad_shield + Q_conv_shield
 * Q_fluid_shld = Q_conv_shield
 * 
 * Q_conv_shield = h_conv*At*(tG - Tw(tIn,tOut))
 * Q_conv_shield = m_flue*Cp_flue*(tG - Tg_sh)
 *****************************************************************/
const {newtonRaphson, logger, LMTD, round, unitConv} = require('./utils');

// TODO: delete after testing inside
const {options, initSystem} = require('./utils');
const unitSystem = initSystem(options.unitSystem);

const shieldSection = (params) => {
  let // Temperatures
    /** (K) of the process fluid going to radiant section */
    t_out = params.t_in_rad,
    // ----- First estimation:
    /** (K) of the process fluid coming from convection section */
    t_in = (params.t_in_rad + params.t_in_conv) / 2,
    /** (K) of the flue gases from rad sect */
    Tg = params.t_g,
    // Initializing unknown temps
    /** (K) of the flue gases to conv sect */
    Tg_sh = 0,
    /** (K) of the process fluid coming from convection section */
    t_in_calc = 0;

    const normalized_error = 1e-5; // 0.001%
    const normalized_diff = (tIn_calc, tIn = t_in) => Math.abs(tIn_calc - tIn) /tIn;
    const duty_sh = (tIn) => m_fluid * Cp_fluid(tIn) * (t_out - tIn);

  const // Parameters
    /** (h-m2-C/kJ) external fouling factor */
    Rfo = params.Rfo || 0, 
    /** (h-m2-C/kJ) internal fouling factor */
    Rfi = params.Rfi || 0,
    /** (kJ/h-m-C) tube thermal conductivity */
    kw_tube = params.kw_tube,
    /** (K) Fluid bulk temperature */
    Tb = (tIn, tOut = t_out) => 0.5*(tIn + tOut),

    /** (kJ/h-m-C -- J/s-m-C-3.6) Molar heat of fluid */
    kw_fluid = (temp) => params.kw_fluid(temp),
    /** (cP -- g/m-s) fluid Viscosity */
    miu_fluid= (temp) => params.miu_fluid(temp),
    /** (cP -- g/m-s) flue Viscosity */
    miu_flue = (temp) => params.flueViscosity(temp),

    /** (kJ/h.m2.c) Film convective heat transfer coff */
    h_conv = params.h_conv || 30.66,
    /** - number of shield tubes */
    N_shld = params.N_shld || 8,
    /** (m) effective tube length*/
    L = params.L_shld || 20.024,
    /** (m) external diameter shld section */
    Do = params.Do_shld || 0.219,
    /** (m) internal diameter shld section */
    Di = params.Di_shld ||  params.Do_shld - params.Sch_rad,
    // calculated params
    pi = 3.14159,
    /** (m2) Cold plane area of shield tube bank */
    Acp_shld = N_shld * params.Pitch_shld * L,
    Ao = 1,
    /** (kJ/h-m2-K^4) */ //TODO: Unused value
    sigma = 2.041e-7, // 5.67e-11 (W.m-2.K-4)
    /** (m2) Area of tubes in bank */
    At = N_shld * pi * Do * L;

  logger.warn(`Acp_sh: ${round(unitConv.mtoft(Acp_shld)*unitConv.mtoft(1))}`);

  const
    /** (kJ/h) */
    Q_rad_sh = params.q_rad_sh,
    /** (kg/h) */
    m_flue = params.m_flue,
    /** (kg/h) */
    m_fluid = params.m_fluid,
    /** (kJ/kg.K) Weight heat of fluid */
    Cp_fluid = (tIn,tOut=t_out) => params.Cp_fluid((tIn + tOut)*0.5),
    /** (kJ/kg-K) Molar heat of flue gases */
    Cp_flue = (tG_sh, tG = Tg) => params.Cp_flue((tG + tG_sh)*0.5),
    /** Prandtl fluid value (miu*Cp/kw) of the fluid as function of temp */
    prandtl = (t) => miu_fluid(t) * Cp_fluid(t) *  3.6/kw_fluid(t), // 3.6 conversion factor
    /** Prandtl flue value (miu*Cp/kw) of the fluid as function of temp */  //TODO: must be kw_flue
    prandtl_flue = (t) => miu_flue(t) * Cp_flue(t) *  3.6/kw_fluid(t), // 3.6 conversion factor
    /** Fluid mass flow per area unit */
    G = (m_fluid/3.6/(pi*(Di**2))), // 3.6 conversion factor
    /** Reynolds value (G*Di/miu) of the fluid as function of temp */
    reynolds = (t) => G * Di/miu_fluid(t),
    /** Free area for flue flow at heater */ //TODO: determine this value
    At_square_shield = At**2 - At,
    /** Flue mass flow per area unit in shield section of the heater*/
    Gn = (m_flue/3.6) / At_square_shield, // 3.6 conversion factor
  
    /** (kJ/m²h-°C) internal heat transfer coff */
    hi = (tB, tW = tB) => .023 * (kw_fluid(tB) / Di) * 
      reynolds(tB)**.8 * prandtl(tB)**(1/3) * (miu_fluid(tB)/miu_fluid(tW))**.14,
    /** (kJ/m²h-°C) effective radiative coff wall tube */
    hr = (tG) => .092 * tG - 34,
    /** (kJ/m²h-°C) * film heat transfer coff */ //TODO: must be kw_flue and miu_flue
    hc = (tG_sh, tG = Tg) => .33 * (kw_tube /Do) * 
    (prandtl_flue(Tb(tG_sh,tG)))**(1/3) * (Do*Gn/miu_flue(Tb(tG_sh,tG)))**.6,
    // hc =.33*(kTg_b /Do) * (prandtl(Tg_b))**(1/3) * (reynolds(Tg_b) )**.6
    // Gn it's the mass speed based on the free area for the gas flow (the space between the tubes across the heater).
    /** (kJ/m²h-°C) external heat transfer coff */
    ho = (tG_sh, tG = Tg) => 1/( 1/(hc(tG_sh,tG)+hr(tG)) + Rfo );
  
    /** Tw = Average tube wall temperature in Kelvin degrees */
    const Tw = (tB, tW = tB, tIn = t_in) => (duty_sh(tIn)/At) * 
    (Do/Di) * (Rfi + 1/hi(tB,tW) + (Di*Math.log(Do/Di)/(2*kw_tube)) ) + tB;

  /** LMTD counter-current */
  const LMTD_Tin = (tIn) => LMTD(tIn, t_out, Tg)(Tg_sh)

  const
    R_int = (tB, tW) => Do / (Di * hi(tB,tW)) + (Do/Di)*Rfi,
    R_tube = Do * Math.log(Do/Di)/2 * kw_tube,
    R_ext = (tG_sh, tG = Tg) => 1/ho(tG_sh, tG),

    /** Resistance sum = R_ext + R_tube + R_int */
    R_sum = (tG, tG_sh, tB, tW) => 
      R_ext(tG, tG_sh) + R_tube + R_int(tB,tW),
    Uo  = (tG, tG_sh, tB, tW) => 1 / R_sum(tG, tG_sh, tB, tW);
    
  /** Q_sh = Uo . AO . LMTD + Q_rad_sh */
  const Q_sh = (tIn, tG, tG_sh, tB, tW) => 
    Uo(tG, tG_sh, tB, tW) * Ao * LMTD_Tin(tIn) + Q_rad_sh
  /** Q_fluid_sh =  M . Cp . deltaT */
  const Q_fluid_sh = (tIn, tOut = t_out) => 
    m_fluid * Cp_fluid(tIn) * (tOut - tIn);
  
  /*// TODO: Delete debugger
  logger.warn(`"vars to check in shield section",
    "t_in_sh":    "${unitSystem.tempC(t_in)} vs 1500F",
    "Q_fluid_sh": "${unitSystem.heat_flow( Q_fluid_sh(t_in))}",
    "Q_sh":       "${unitSystem.heat_flow( Q_sh( t_in,Tg, Tg_sh, (t_in+t_out)/2, Tw((t_in+t_out)/2) ) )}",
    "kw_fluid":   "${unitSystem.thermal(kw_fluid(Tb(t_in)))}",
    "h_conv":     "${unitSystem.convect(h_conv)}",
    "duty_rad":   "${unitSystem.heat_flow(duty_rad)}",
    "At_rad":     "${unitSystem.area(At)}",
    "Do/Di":      ${round(Do/Di)},
    "Tw":         "${unitSystem.temp(Tw(Tb(t_in)))}",
    "Tb":         "${unitSystem.temp(Tb(t_in))}",
    "miu/miu(tW)":"${ Math.pow(miu_fluid(Tb(t_in))/miu_fluid(Tw(Tb(t_in))),.9) }",
    "miu_fluid":  "${ miu_fluid(Tw(Tb(t_in))) }",
    "hi":         "${unitSystem.convect( hi(Tb(t_in) ) )}",
    "hi_complete":"${ hi( Tb(t_in) , Tw(Tb(t_in)) ) }",
    "hr:",        "${hr(Tg)}",
    "ho":         "${unitSystem.convect( ho(Tg_sh ) )}",
    "hc":         "${unitSystem.convect( hc(Tg_sh ) )}",
    "Uo":         "${Uo( Tg, Tg_sh, Tb(t_in), Tw(Tb(t_in)) )}",
    "R_ext":      "${R_ext(Tg, Tg_sh)}",
    "R_tube,int": "${R_tube}, ${R_int(Tb(t_in),Tw(Tb(t_in)))}",
    "kw's":       "${kw_fluid(Tb(t_in))}, ${kw_tube}"
  `) //*/
  
  const Tin_sh_func = (tIn) => 
    Q_fluid_sh(tIn) - Q_sh(tIn,Tg,Tg_sh,Tb(tIn),Tw(Tb(tIn)));

  const Tg_sh_func = (tG_sh) => Q_rad_sh + 
    m_flue *Cp_flue(tG_sh)*(Tg - tG_sh) -
    m_fluid*Cp_fluid(t_in)*(t_out - t_in);
  
  // -------- 1st estimation of Tg_sh   #.#.#.#.#
  Tg_sh = newtonRaphson(Tg_sh_func, (Tg - 58), params.NROptions, "Tg_shield");
  t_in_calc = newtonRaphson(Tin_sh_func, t_in, params.NROptions, "T_in_shield");

  let iterations = 0;
  while (normalized_diff(t_in_calc) > normalized_error) {
    logger.debug(`{ "t_in_sh_calc": ${t_in_calc}, "t_in_sh_sup": ${t_in} }`)
    if (t_in_calc) t_in = t_in_calc;
    t_in_calc = newtonRaphson(Tin_sh_func, t_in, params.NROptions, "T_in_shield");
    Tg_sh = newtonRaphson(Tg_sh_func, (Tg - 58), params.NROptions, "Tg_shield");

    // Forced break of loop
    iterations++;
    if (iterations > 10) {
      logger.info(`diff vs error: ${normalized_error}-${normalized_diff(t_in_calc)}`)
      logger.error("Max iterations reached for inlet temp calc at shield sect");
      break;
    }
  }

  params.t_in_sh = t_in;
  params.t_g_sh  = Tg_sh;

  logger.info("t_in_sh: ", t_in, "t_g_sh: ", Tg_sh)
}

module.exports = {
  shieldSection
};