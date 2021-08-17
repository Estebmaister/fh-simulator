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
const {newtonRaphson, options, log} = require('./utils');

/** Calculates the required mass fluid and the necessary
 * temperature of the rad section
 * Q_in = Q_rls + Q_air + Q_fuel
 * Q_out = Q_R + Q_shield + Q_losses + Q_flue
 * Q_in(Tg) - Q_out(Tg) ~= 0
 * Q_rad + Q_conv = Q_fluid(out-in)
*/
const radSection = (params) => {
    let rad_result = {}, mass_difference = 0
    const mass_radSection = (m_fuel) => {
        [mass_difference, rad_result] = mass_radSection_full(m_fuel, params)
        return mass_difference
    }
    const mass_fluid = newtonRaphson(mass_radSection, params.m_fuel_seed, options)
    return [mass_fluid, rad_result]
}
const mass_radSection_full = (m_fuel_seed, params) => {
    let Tg = 0; // Effective gas temperature in Kelvin degrees
    if (params === null || params === undefined) params = {}
    const // Temperatures
        t_in = params.t_in_rad, // K
        t_out = params.t_out, // K
        t_air = params.t_air, // K
        t_fuel = params.t_fuel, // K
        t_amb = params.t_amb, // K
        /** Tw = Average tube wall temperature in Kelvin degrees */
        Tw = (tIn = params.t_in_rad, tOut = params.t_out) => 100 + 0.5*(tIn + tOut);
    const // Process parameters
        /** (kJ/kmol) net calorific value */
        /** (kmol/h) */
        m_fluid = params.m_fluid || 225_700,
        /** (kmol/h) */
        m_fuel = m_fuel_seed || 120,
        /** (kmol/h) */
        m_air = params.m_air_ratio*m_fuel_seed || 1_589.014,
        /** (kmol/h) */
        m_flue = params.m_flue_ratio*m_fuel_seed || 1_720.9,
        /** (kJ/kmol) */
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
        // calculated params
        /** (m2) Cold plane area of tube bank */
        Acp = N*CtoC*L,
        /** (m2) Cold plane area of shield tube bank */
        Acp_shld = N_shld*CtoC*L,
        /** (kJ/h.m2.K4) */
        sigma = 2.041e-7,
        //sigma = 5.67e-11, // (W.m-2.K-4)
        pi = 3.14159,
        /** (m2) Area of tubes in bank */
        At = N*pi*Do*L;

    // ******* Heat input to the radiant section ********
    /** Sensible heat of fluid Q_fluid = m_fluid * Cp_fluid(T_fluid_avg) * DeltaT */
    const Q_fluid = (tIn = t_in, tOut = t_out) =>
        m_fluid * Cp_fluid * ((tOut - tIn))
    /** Sensible heat of air Q_air = m_air * Cp_air * (tAir - tAmb) */
    const Q_air = (tAir = t_air, tAmb = t_amb) => 
        m_air*Cp_air*(tAir - tAmb);
    /** Combustion heat of fuel Q_rls = m_fuel * NCV */
    const Q_rls = m_fuel*NCV;
    /** Sensible heat of fuel Q_fuel = m_fuel * Cp_fuel * (tFuel - tAmb) */
    const Q_fuel = (tFuel = t_fuel, tAmb = t_amb) => 
        m_fuel*Cp_fuel*(tFuel - tAmb);
    /** Heat input Q_in = Q_rls + Q_air(tAir, tAmb) + Q_fuel(tFuel, tAmb) */
    const Q_in = (tAir = t_air, tFuel = t_fuel, tAmb = t_amb,  tIn = t_in) => 
        Q_rls + Q_air(tAir, tAmb) + Q_fuel(tFuel, tAmb)

    // ******* Heat taken out of radiant section ********
    /** Heat losses through setting (5% of Q_release) */
    const Q_losses = 0.05*Q_rls;
    /** Radiant heat transfer = sigma*(alpha*Acp)*F*(tG**4 - Tw(tIn,tOut)**4)*/
    const Q_rad = (tG, tIn = t_in, tOut = t_out) => 
        sigma*(alpha*Acp)*F*(tG**4 - Tw(tIn,tOut)**4)
    /** Convective heat transfer = h_conv*At*(tG - Tw(tIn,tOut))*/
    const Q_conv = (tG, tIn = t_in, tOut = t_out) => 
        h_conv*At*(tG - Tw(tIn,tOut))
    /** Heat absorbed by radiant tubes = Q_rad + Q_conv */
    const Q_R = (tG, tIn = t_in, tOut = t_out) => 
        Q_rad(tG,tIn,tOut) + Q_conv(tG,tIn,tOut)
    /** Shield radiant heat transfer (a variation of Q_rad) */
    const Q_shld = (tG, tIn = t_in, tOut = t_out) => 
        sigma*(alpha_shld*Acp_shld)*F*(tG**4 - Tw(tIn,tOut)**4)
    /** Sensible heat of flue gases = m_flue*Cp_flue(tG,tAmb)*(tG - tAmb) */
    const Q_flue = (tG, tAmb = t_amb) => 
        m_flue*Cp_flue(tG,tAmb)*(tG - tAmb)
    /** Q_out = Q_R + Q_shld + Q_losses + Q_flue */
    const Q_out = (tG, tAmb = t_amb, tIn = t_in, tOut = t_out) => 
        Q_R(tG, tIn, tOut) + Q_shld(tG, tIn, tOut) + Q_losses + Q_flue(tG, tAmb)

    // **************************************************    
    const y2 = (Tg) => Q_out(Tg) - Q_in()
    flame = newtonRaphson(y2, 1000, options)
    if (flame != false) Tg = flame
    //log(`Flame temp: ${Tg.toExponential(2)}K with fuel ${m_fluid}`)
    let rad_result = {
        "Tw": Tw(),
        "Tg": Tg,

        "Q_in": Q_in(),
        "Q_rls": Q_rls,
        "Q_air": Q_air(),
        "Q_fuel": Q_fuel(),
        
        "Q_out": Q_out(Tg),
        "Q_losses": Q_losses,
        "Q_rad": Q_rad(Tg),
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

    let t_out_recall = t_in - t_out + (Q_rad(Tg) + Q_conv(Tg)) / (m_fluid*Cp_fluid)
    return [t_out_recall, rad_result]
}

module.exports = {
    radSection
  };

/** Unused equations
    const t_stack = params.t_stack, // K
    // Output:
    const A = Q_in() - Q_losses;
    const B = A + sigma*F*(alpha*Acp + Acp_shld*alpha_shld)*Tw()**4 + 
        h_conv*At*Tw() + m_flue*Cp_flue(t_stack)*t_amb;
    const C = sigma*F*(alpha*Acp + Acp_shld*alpha_shld);
    const D = h_conv*At + m_flue*Cp_flue(t_stack);

    // Equation of effective temperature.
    const y = (Tg) => C*(Tg**4) + D*Tg - B
    // const y1 = (Tg) => 3.6299e-4*(Tg**3) + 7.9153e4
    
    //log("info",`Equation for effective gas temperature: ${y.toString()} 
    //${C.toExponential(4)}*Tg**4 + ${D.toExponential(4)}*Tg - ${B.toExponential(4)}`)
    flame = newtonRaphson(y, 1270, options)
    log(`Effective gas temperature: ${flame}`)
 */