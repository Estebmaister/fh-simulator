const {round, initSystem} = require('./utils');

const stringRadResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados para sección radiante:`
  } else {
    string = `Radiant section results:`
  }
  
  string += `\n
  m_fuel:   ${unit.mass_flow( result_obj.m_fuel )}
  m_fluid:  ${unit.mass_flow( result_obj.m_fluid )}
  t_in:     ${unit.tempC( result_obj.t_in )}
  t_out:    ${unit.tempC( result_obj.t_out )}
  Tw:       ${unit.tempC( result_obj.Tw )}
  tg_out:   ${unit.tempC( result_obj.tg_out )}

  Q_in:     ${unit.heat_flow( result_obj.Q_in )}
    Q_rls:    ${unit.heat_flow( result_obj.Q_rls )}
    Q_air:    ${unit.heat_flow( result_obj.Q_air )}
    Q_fuel:   ${unit.heat_flow( result_obj.Q_fuel )}

  Q_out:    ${unit.heat_flow( result_obj.Q_out )}
    Q_flue:   ${unit.heat_flow( result_obj.Q_flue )}
    Q_losses: ${unit.heat_flow( result_obj.Q_losses )}
    Q_shld:   ${unit.heat_flow( result_obj.Q_shld )}
    Q_R:      ${unit.heat_flow( result_obj.Q_R )}
      Q_conv: ${unit.heat_flow( result_obj.Q_conv )}
      Q_rad:  ${unit.heat_flow( result_obj.Q_rad )}
    Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid )}

  At:       ${unit.area(result_obj.At)}
  Ar:       ${unit.area(result_obj.Ar)}
  Ai:          ${unit.area(result_obj.Ai)}
  Acp:      ${unit.area(result_obj.Acp)}
  Acp_sh:    ${unit.area(result_obj.Acp_sh)}

  hi:       ${unit.convect(result_obj.hi)}
  h_conv:   ${unit.convect(result_obj.h_conv)}
  duty:      ${unit.heat_flow(result_obj.duty)}
  duty_flux: ${unit.heat_flux(result_obj.duty_flux)}
  duty_rad:  ${unit.heat_flow(result_obj.duty_rad)}

  Alpha:    ${result_obj.Alpha}
  MBL:      ${result_obj.MBL} ft
  Pco2:     ${result_obj.Pco2}
  Ph2o:     ${result_obj.Ph2o}
  PL:       ${result_obj.PL}
  F:        ${result_obj.F} vs .635

  kw_tube:  ${unit.thermal( result_obj.kw_tube )}
  kw_fluid: ${unit.thermal( result_obj.kw_fluid )}
  
  miu_fluid:${unit.viscosity( result_obj.miu_fluid )}
  miu_flue: ${unit.viscosity( result_obj.miu_flue )}
  kw_flue:  ${unit.thermal( result_obj.kw_flue )}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp( result_obj.Cp_flue )}
  
  Cp_fuel:  ${unit.cp( result_obj.Cp_fuel )}
  Cp_air:   ${unit.cp( result_obj.Cp_air )}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    Material:       ${result_obj.TUBING.Material}
    No Tubes Wide:  ${result_obj.TUBING.Nt}
    No Tubes:       ${result_obj.TUBING.N}
    Wall Thickness: ${unit.lengthC(result_obj.TUBING.Sch)}
    Outside Di:     ${unit.lengthC(result_obj.TUBING.Do)}
    Pitch:          ${unit.lengthC(result_obj.TUBING.S_tube)}
    Ef. Length:     ${unit.length(result_obj.TUBING.L)}
    
  FINING: No
  `;
  return `\n` + string;
}

const stringShldResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados para sección de escudo:`
  } else {
    string = `Shield section results:`
  }
  
  string += `\n
  m_flue:   ${unit.mass_flow( result_obj.m_flue )}
  t_in_sup: ${unit.tempC( result_obj.t_in_sup )}
  t_in:     ${unit.tempC( result_obj.t_in )}
  t_out:    ${unit.tempC( result_obj.t_out )}
  Tw:       ${unit.tempC( result_obj.Tw )}
  Tb_g:     ${unit.tempC( result_obj.Tb_g )}
  tg_in:      ${unit.tempC( result_obj.tg_in )}
  tg_out:     ${unit.tempC( result_obj.tg_out )}

  LMTD:     ${unit.temp(result_obj.LMTD)}
  DeltaA:     ${unit.temp(result_obj.DeltaA)}
  DeltaB:     ${unit.temp(result_obj.DeltaB)}
  DeltaA-B:   ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(A/B):   ${round(Math.log(result_obj.DeltaA/result_obj.DeltaB))}

  Q_flue:   ${unit.heat_flow( result_obj.Q_flue )}
  Q_R:      ${unit.heat_flow( result_obj.Q_R )}
    Q_rad:  ${unit.heat_flow( result_obj.Q_rad )}
    Q_conv: ${unit.heat_flow( result_obj.Q_conv )}
  Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid )}

  At:       ${unit.area(result_obj.At)}
  Ai:         ${unit.area(result_obj.Ai)}
  An:       ${unit.area(result_obj.An)}
  Acp:      ${unit.area(result_obj.Acp)}

  hi:       ${unit.convect(result_obj.hi)}
  hr:       ${unit.convect(result_obj.hr)}
  ho:       ${unit.convect(result_obj.ho)}
  hc:       ${unit.convect(result_obj.hc)}

  Uo:       ${unit.convect(result_obj.Uo)}
  R_int:    ${round(result_obj.R_int, 6)}
  R_tube:   ${round(result_obj.R_tube, 6)}
  R_ext:    ${round(result_obj.R_ext, 6)}





  kw_tube:  ${unit.thermal( result_obj.kw_tube )}
  kw_fluid: ${unit.thermal( result_obj.kw_fluid )}
  
  miu_fluid:${unit.viscosity( result_obj.miu_fluid )}
  miu_flue: ${unit.viscosity( result_obj.miu_flue )}
  kw_flue:  ${unit.thermal( result_obj.kw_flue )}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp( result_obj.Cp_flue )}

  Pr_flue:  ${result_obj.PrandtlFlue}
  Re_flue:  ${result_obj.ReynoldsFlue}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    Material:       ${result_obj.TUBING.Material}
    No Tubes Wide:  ${result_obj.TUBING.Nt}
    No Tubes:       ${result_obj.TUBING.N}
    Wall Thickness: ${unit.lengthC(result_obj.TUBING.Sch)}
    Outside Di:     ${unit.lengthC(result_obj.TUBING.Do)}
    Tran Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Long Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Ef. Length:     ${unit.length(result_obj.TUBING.L)}

  FINING: No
  `;
  return `\n` + string;
}

const stringConvResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados para sección convectiva:`
  } else {
    string = `Convective section results:`
  }

  string += `\n
  t_fin:    ${unit.tempC( result_obj.t_fin )}
  t_in_data:${unit.tempC( result_obj.t_in_given )}
  t_in:     ${unit.tempC( result_obj.t_in )}
  t_out:    ${unit.tempC( result_obj.t_out )}
  Tw:       ${unit.tempC( result_obj.Tw )}
  Tb_g:     ${unit.tempC( result_obj.Tb_g )}
  tg_in:      ${unit.tempC( result_obj.tg_in )}
  tg_out:     ${unit.tempC( result_obj.tg_out )}

  LMTD:     ${unit.temp(result_obj.LMTD)}
  DeltaA:     ${unit.temp(result_obj.DeltaA)}
  DeltaB:     ${unit.temp(result_obj.DeltaB)}
  DeltaA-B:   ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(A/B):   ${round(Math.log(result_obj.DeltaA/result_obj.DeltaB))}

  Q_flue:   ${unit.heat_flow( result_obj.Q_flue )}
  Q_conv:   ${unit.heat_flow( result_obj.Q_conv )}
  Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid )}

  At:       ${unit.area(result_obj.At)}
  Ai:         ${unit.area(result_obj.Ai)}
  An:       ${unit.area(result_obj.An)}
  Ao:        ${unit.area(result_obj.Ao)}
  Apo:        ${unit.area(result_obj.Apo)}
  Afo:       ${unit.area(result_obj.Afo)}
  Ef:       ${round(result_obj.Ef, 6)}

  hi:       ${unit.convect(result_obj.hi)}
  hr:       ${unit.convect(result_obj.hr)}
  ho:       ${unit.convect(result_obj.ho)}
  hc:       ${unit.convect(result_obj.hc)}
  he:       ${unit.convect(result_obj.he)}
  
  Uo:       ${unit.convect(result_obj.Uo)}
  R_int:    ${round(result_obj.R_int, 6)}
  R_tube:   ${round(result_obj.R_tube, 6)}
  R_ext:    ${round(result_obj.R_ext, 6)}

  j:        ${round(result_obj.j, 6)} vs .0055

  kw_tube:  ${unit.thermal( result_obj.kw_tube )}
  kw_fluid: ${unit.thermal( result_obj.kw_fluid )}
  kw_flue:  ${unit.thermal( result_obj.kw_flue )}
  
  miu_fluid:${unit.viscosity( result_obj.miu_fluid )}
  miu_flue: ${unit.viscosity( result_obj.miu_flue )}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp( result_obj.Cp_flue )}

  Pr_flue:  ${result_obj.PrandtlFlue}
  Re_flue:  ${result_obj.ReynoldsFlue}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    Material:       ${result_obj.TUBING.Material}
    No Tubes Wide:  ${result_obj.TUBING.Nt}
    No Tubes:       ${result_obj.TUBING.N}
    Wall Thickness: ${unit.lengthC(result_obj.TUBING.Sch)}
    Outside Di:     ${unit.lengthC(result_obj.TUBING.Do)}
    Tran Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Long Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Ef. Length:     ${unit.length(result_obj.TUBING.L)}

  FINING: 
    Material:       ${result_obj.FINING.Material}
    Type:           ${result_obj.FINING.Type}
    Height:         ${unit.lengthC(result_obj.FINING.Height)}
    Thickness:      ${unit.lengthC(result_obj.FINING.Thickness)}
    Dens:           ${unit.lengthInv(result_obj.FINING.Dens)},
    Arrange:        ${result_obj.FINING.Arrange}
  `;
  return `\n` + string;
}

module.exports = {
	stringRadResult,
  stringShldResult,
  stringConvResult
};