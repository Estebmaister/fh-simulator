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
 * @author  Esteban Camargo
 * @date    17 Ago 2021
 * @call    node . true true 25 70 80 1e5
 * @callParams verbose, check for changes in csv, t_amb, humidity, air_excess, p_amb
 * 
 * Q_fluid_shld = m_fluid*Cp_fluid*(Tin_zr - Tin_zs) = Q_rad_shield + Q_conv_shield
 * Qr_shield is already accounted in rad section, so here will be considered
 * only the convection heat in bare tubes
 * Q_fluid_shld = Q_conv_shield
 * 
 * Q_conv_shield = h_conv*At*(tG - Tw(tIn,tOut))
 * Q_conv_shield = m_flue*Cp_flue*(tG - Tg_sh)
 *****************************************************************/
const {newtonRaphson, options, log} = require('./utils');

const shieldSection = (params) => {
  let
    /** (K) of the fluid process */
    t_out = params.t_in_rad,
    /** (K) of the fluid process in rad section */
    t_in = params.t_in_sh,
    /** (K) of the fluid process */
    Tg = params.Tg,
    Tg_sh = 0;

  const
    /** Tw = Average tube wall temperature in Kelvin degrees */
    Tw = (tIn, tOut = t_out) => 100 + 0.5*(tIn + tOut),
    /** (kmol/h) */
    m_fuel = params.m_fuel,
    /** (kmol/h) */
    m_flue = (mFuel = m_fuel) => params.m_flue_ratio*mFuel,
    /** (kmol/h) */
    m_fluid = params.m_fluid,
    /** (kJ/kmol.K) */
    Cp_fluid = params.Cp_fluid,
    /** (kJ/kmol-K) Molar heat of flue gases */
    Cp_flue = (tG_sh, tG = Tg) => params.Cp_flue((tG + tG_sh)*0.5);
  
  const // Fired heater parameters
    /** (kJ/h.m2.c) Film convective heat transfer coff */
    h_conv = params.h_conv_rad || 30.66,
    /** - number of shield tubes */
    N_shld = params.shld_tubes_rad || 8,
    /** (m) effective tube length*/
    L = params.tube_l_rad || 20.024,
    /** (m) external diameter rad section */
    Do = params.do_rad || 0.219,    
    // calculated params
    pi = 3.14159,
    /** (m2) Area of tubes in bank */
    At = N_shld*pi*Do*L;
  
  const Q_conv_sh = (tG_sh, tG = Tg) => 
    h_conv*At*(tG_sh - Tw(tG_sh,tG)); //Tw(tin, tout)

  const Q_flue_sh = (tG_sh, tG = Tg) => 
    m_flue()*Cp_flue(tG_sh, tG)*(tG_sh - tG);

  log("Q_conv_sh: " + Q_conv_sh(500) + ", Q_flue_sh: " + Q_flue_sh(500))
  const Tg_shBalance = (tG_sh, tG = Tg) => 
    Q_flue_sh(tG_sh, tG) - Q_conv_sh(tG_sh, tG); //TODO: q_rad(tG)
  
  flame = newtonRaphson(Tg_shBalance, Tg, options, "shield_Tg")
  if (flame != false) Tg_sh = flame
  params.Tg_sh = Tg_sh

  const Q_fluid_sh =  (tIn, tOut = t_out) => 
    m_fluid*Cp_fluid*(tOut - tIn);

  const T_in_shBalance = (tIn, tG_sh = Tg_sh, tG = Tg) => 
    Q_fluid_sh(tIn) - Q_conv_sh(tG_sh, tG);

  flame_t_in = newtonRaphson(T_in_shBalance, t_out, options, "shield_t_in")
  if (flame_t_in != false) t_in = flame_t_in
  params.t_in_sh = t_in
}

module.exports = {
  shieldSection
};