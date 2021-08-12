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
 * Q_R = Q_rad + Q_conv = Q_fluid(out-in) = m_fluid*Cp_fluid(T_out - T_in)
 *****************************************************************/
const {newtonRaphson, options, log} = require('./utils');

/** Calculates the required temperature of the rad section
 * Q_in = Q_rls + Q_air + Q_fuel
 * Q_out = Q_R + Q_shield + Q_losses + Q_flue
 * Q_in(Tg) - Q_out(Tg) ~= 0
*/
const radSection = (params) => {
    if (params === null || params === undefined) params = {}

    const
        // Temperatures
        T_in = params.t_in_rad , // K
        T_out = params.t_out, // K
        T_stack = params.t_stack, // K
        T_air = params.t_air, // K
        T_fuel = params.t_fuel, // K
        T_datum = params.t_amb // K

        /** (kmol/h) */
        m_fuel = params.m_fuel || 120,
        /** (kmol/h) */
        m_fluid = params.m_fluid || 225_700,
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

        // calculated params
        /** (kmol/h) */
        m_air = params.m_air || 1_589.014,
        /** (kmol/h) */
        m_flue = params.m_flue || 1_720.9,
        /** (kJ/kmol) net calorific value */
        NCV = params.ncv || 927_844.41,
        /** (kJ/kmol-K) */
        Cp_fuel = params.Cp_fuel((T_fuel + T_datum)*0.5) || 39.26,
        /** (kJ/kmol-K) */
        Cp_air = params.Cp_air((T_air + T_datum)*0.5) || 29.142,
        //sigma = 5.67e-11, // (W.m-2.K-4)
        /** (kJ/h.m2.K4) */
        sigma = 2.041e-7,
        pi = 3.14159;

    // ******* Heat input to the radiant section ********

    /** (kJ/kg.K) */
    const Cp_fluid = 2.5744
    /** Q_fluid = m_fluid * Cp_fluid(T_fluid_avg) * DeltaT */
    const Q_fluid = (tIn = T_in, tOut = T_out) =>
        m_fluid * Cp_fluid * ((tOut - tIn))
        
    // Sensible heat of air
    const Q_air = (tAir = T_air, tAmb = T_datum) => 
        m_air*Cp_air*(tAir - tAmb);

    // Combustion heat of fuel
    const Q_rls = m_fuel*NCV;

    // Sensible heat of fuel
    const Q_fuel = (tFuel = T_fuel, tAmb = T_datum) => 
        m_fuel*Cp_fuel*(tFuel - tAmb);

    const Q_in = (tAir = T_air, tFuel = T_fuel, tAmb = T_datum,  tIn = T_in) => 
        Q_rls + Q_air(tAir, tAmb) + Q_fuel(tFuel, tAmb)

    // **************************************************

    // ******* Heat taken out of radiant section ********

    // Tg = Effective gas temperature in degrees Kelvin
    // Tw = Average tube wall temperature in degrees Kelvin
    const Tw = (tIn = T_in, tOut = T_out) => 100 + 0.5*(tIn + tOut);
    const Acp = N*CtoC*L; // Cold plane area of tube bank
    const Acp_shld = N_shld*CtoC*L; // m2
    const At = N*pi*Do*L; // Area of tubes in bank
    const h_conv = 30.66; // Film convective heat transfer coefficient (kJ/h.m2.c)
    // Molar heat of flue gases
    const Cp_flue = (tG, tAmb = T_datum) => 
        29.98 + 3.1157e-3*(tG + tAmb)/2;

    // Heat losses through setting
    const Q_losses = 0.05*Q_rls;
    // Radiant heat transfer
    const Q_rad = (tG, tIn = T_in, tOut = T_out) => 
        sigma*(alpha*Acp)*F*(tG**4 - Tw(tIn,tOut)**4)
    // Convective heat transfer
    const Q_conv = (tG, tIn = T_in, tOut = T_out) => 
        h_conv*At*(tG - Tw(tIn,tOut))
    // Heat absorbed by radiant tubes
    const Q_R = (tG, tIn = T_in, tOut = T_out) => 
        Q_rad(tG,tIn,tOut) + Q_conv(tG,tIn,tOut)
    // Shield radiant heat transfer
    const Q_shld = (tG, tIn = T_in, tOut = T_out) => 
        sigma*(alpha_shld*Acp_shld)*F*(tG**4 - Tw(tIn,tOut)**4)
    // Sensible heat of flue gases
    const Q_flue = (tG, tAmb = T_datum) => 
        m_flue*Cp_flue(tG,tAmb)*(tG - tAmb)
    // Q_out = Q_R + Q_shld + Q_losses + Q_flue
    const Q_out = (tG, tAmb = T_datum, tIn = T_in, tOut = T_out) => 
        Q_R(tG, tIn, tOut) + Q_shld(tG, tIn, tOut) + Q_losses + Q_flue(tG, tAmb)

    // **************************************************

    // Output:
    const A = Q_in() - Q_losses;
    const B = A + sigma*F*(alpha*Acp + Acp_shld*alpha_shld)*Tw()**4 + h_conv*At*Tw() + m_flue*Cp_flue(T_stack)*T_datum;
    const C = sigma*F*(alpha*Acp + Acp_shld*alpha_shld);
    const D = h_conv*At + m_flue*Cp_flue(T_stack);

    // Equation of effective temperature.
    const y = (Tg) => C*(Tg**4) + D*Tg - B
    // const y1 = (Tg) => 3.6299e-4*(Tg**3) + 7.9153e4
    
    //log("info",`Equation for effective gas temperature: ${y.toString()} 
    //${C.toExponential(4)}*Tg**4 + ${D.toExponential(4)}*Tg - ${B.toExponential(4)}`)
    flame = newtonRaphson(y, 1270, options)
    log(`Effective gas temperature: ${flame}`)
    
    const y2 = (Tg) => Q_out(Tg) - Q_in()
    flame2 = newtonRaphson(y2, 1270, options)
    //log(`Second: ${flame2.toExponential(2)}`)
    log("debug", `{"Effective Gas temperature": ${flame2}, "Tw": ${Tw(T_in,T_out)}` 
    + `, "Q_in": ${Q_in()}`
    + `, "Q_rls": ${Q_rls}`
    + `, "Q_air": ${Q_air()}`
    + `, "Cp_air": ${Cp_air}`
    + `, "Q_fuel": ${Q_fuel()}`
    + `, "Cp_fuel": ${Cp_fuel}`
    + `, "Q_fluid": ${Q_fluid()}`

    + `, "Q_out": ${Q_out(flame2)}`
    + `, "Q_losses": ${Q_losses}`
    + `, "Q_rad": ${Q_rad(flame2)}`
    + `, "Q_conv": ${Q_conv(flame2)}`
    + `, "Q_shld": ${Q_shld(flame2)}`
    + `, "Q_flue": ${Q_flue(flame2)}`
    +`}`)

    return flame2
}

module.exports = {
    radSection
  };