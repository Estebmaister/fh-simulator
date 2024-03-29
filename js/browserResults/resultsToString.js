const { round, initSystem } = require("./../utils");

const stringRadResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string;
  if (lang == "es") {
    string = `Resultados sección radiante:`;
  } else {
    string = `Radiant section results:`;
  }

  string += `\n
  t_in:     ${unit.tempC(result_obj.t_in)}
  t_out:    ${unit.tempC(result_obj.t_out)}
  Tw:       ${unit.tempC(result_obj.Tw)}

  tg_out:   ${unit.tempC(result_obj.tg_out)}

  rfi:      ${unit.fouling_factor(result_obj.rfi)}

  Q_in:     ${unit.heat_flow(result_obj.Q_in)}
    Q_rls:    ${unit.heat_flow(result_obj.Q_rls)}
    Q_air:    ${unit.heat_flow(result_obj.Q_air)}
    Q_fuel:   ${unit.heat_flow(result_obj.Q_fuel)}

  Q_out:    ${unit.heat_flow(result_obj.Q_out)}
    Q_flue:   ${unit.heat_flow(result_obj.Q_flue)}
    Q_losses: ${unit.heat_flow(result_obj.Q_losses)}
    Q_shld:   ${unit.heat_flow(result_obj.Q_shld)}
    Q_R:      ${unit.heat_flow(result_obj.Q_R)}
      Q_conv: ${unit.heat_flow(result_obj.Q_conv)}
      Q_rad:  ${unit.heat_flow(result_obj.Q_rad)}
    Q_fluid:  ${unit.heat_flow(result_obj.Q_fluid)}

  duty_rad:   ${round(100 * result_obj["%"], 2)}%

  At:       ${unit.area(result_obj.At)}
  Ar:       ${unit.area(result_obj.Ar)}
  Acp:      ${unit.area(result_obj.Acp)}
  αAcp:     ${unit.area(result_obj.aAcp)}
  Aw:       ${unit.area(result_obj.Aw)}
  Aw/αAcp:  ${round(result_obj.Aw_aAcp)}
  Alpha:    ${round(result_obj.Alpha)}
  Acp_sh:   ${unit.area(result_obj.Acp_sh)}
  Ai:        ${unit.area(result_obj.Ai)}

  hi:     ${unit.convect(result_obj.hi)}
  h_conv:   ${unit.convect(result_obj.h_conv)}

  MBL:       ${result_obj.MBL} ft
  P co₂+h₂o: ${round(+result_obj.Pco2 * 1 + result_obj.Ph2o * 1)} atm
  PL:        ${result_obj.PL} atm-ft
  GEmiss:    ${result_obj.emiss}
  F:         ${result_obj.F}

  kw_tube:  ${unit.thermal(result_obj.kw_tube)}
  kw_fluid: ${unit.thermal(result_obj.kw_fluid)}
  kw_flue:  ${unit.thermal(result_obj.kw_flue)}

  miu_fluid:${unit.viscosity(result_obj.miu_fluid)}
  miu_flue: ${unit.viscosity(result_obj.miu_flue)}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp(result_obj.Cp_flue)}

  Cp_fuel:  ${unit.cp(result_obj.Cp_fuel)}
  Cp_air:   ${unit.cp(result_obj.Cp_air)}
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

  `;
  return `\n` + string;
};

const stringShldResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string;
  if (lang == "es") {
    string = `Resultados sección de escudo:`;
  } else {
    string = `Shield section results:`;
  }

  string += `\n
  t_in:     ${unit.tempC(result_obj.t_in)}
  t_out:    ${unit.tempC(result_obj.t_out)}
  Tw:       ${unit.tempC(result_obj.Tw)}

  tg_in:      ${unit.tempC(result_obj.tg_in)}
  tg_out:     ${unit.tempC(result_obj.tg_out)}

  rfi:      ${unit.fouling_factor(result_obj.rfi)}
  rfo:      ${unit.fouling_factor(result_obj.rfo)}

  LMTD:     ${unit.temp(result_obj.LMTD)}
  DeltaA:     ${unit.temp(result_obj.DeltaA)}
  DeltaB:     ${unit.temp(result_obj.DeltaB)}
  DeltaA-B:   ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(A/B):   ${round(Math.log(result_obj.DeltaA / result_obj.DeltaB),1,true)}

  Q_flue:   ${unit.heat_flow(result_obj.Q_flue)}
    M_fuel xCp x(Tg_in-Tg_out)
  Q_Shield: ${unit.heat_flow(result_obj.Q_R)}
    Q_rad:   ${unit.heat_flow(result_obj.Q_rad)}
    Q_conv:  ${unit.heat_flow(result_obj.Q_conv)}
  Q_fluid:  ${unit.heat_flow(result_obj.Q_fluid)}

  duty_shld: ${round(100 * result_obj["%"], 2)}%

  At:    ${unit.area(result_obj.At)}
  An:     ${unit.area(result_obj.An)}
  Ai:      ${unit.area(result_obj.Ai)}
  Gn:    ${round(result_obj.Gn / 3600)} lb/sec-ft²

  Uo:    ${unit.convect(result_obj.Uo)}
  R_int: ${round(result_obj.R_int, 6)}
  R_tub: ${round(result_obj.R_tube, 6)}
  R_ext: ${round(result_obj.R_ext, 6)}

  hi: ${unit.convect(result_obj.hi)}
  hr:   ${unit.convect(result_obj.hr)}
  ho:   ${unit.convect(result_obj.ho)}
  hc:   ${unit.convect(result_obj.hc)}

  kw_tube:  ${unit.thermal(result_obj.kw_tube)}
  kw_fluid: ${unit.thermal(result_obj.kw_fluid)}
  kw_flue:  ${unit.thermal(result_obj.kw_flue)}

  miu_fluid:${unit.viscosity(result_obj.miu_fluid)}
  miu_flue: ${unit.viscosity(result_obj.miu_flue)}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp(result_obj.Cp_flue)}

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

  `;
  return `\n` + string;
};

const stringConvResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string;
  if (lang == "es") {
    string = `Resultados sección convectiva:`;
  } else {
    string = `Convective section results:`;
  }

  string += `\n
  t_in:      ${unit.tempC(result_obj.t_in)}
  t_out:     ${unit.tempC(result_obj.t_out)}
  Tw:        ${unit.tempC(result_obj.Tw)}
  t_fin_avg: ${unit.tempC(result_obj.t_fin)}
  t_fin_max: ${unit.tempC(result_obj.t_fin_max)}

  tg_in:      ${unit.tempC(result_obj.tg_in)}
  tg_stack:   ${unit.tempC(result_obj.tg_out)}

  rfi:      ${unit.fouling_factor(result_obj.rfi)}
  rfo:      ${unit.fouling_factor(result_obj.rfo)}

  LMTD:     ${unit.temp(result_obj.LMTD)}
  DeltaA:     ${unit.temp(result_obj.DeltaA)}
  DeltaB:     ${unit.temp(result_obj.DeltaB)}
  DeltaA-B:     ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(|A/B|):   ${round(
    Math.log(Math.abs(result_obj.DeltaA / result_obj.DeltaB))
  )}

  Q_flue:   ${unit.heat_flow(result_obj.Q_flue)}
  Q_conv:   ${unit.heat_flow(result_obj.Q_conv)}
  Q_fluid:  ${unit.heat_flow(result_obj.Q_fluid)}

  Q_stack:  ${unit.heat_flow(result_obj.Q_stack)}

  duty_conv: ${round(100 * result_obj["%"], 2)}%

  At:   ${unit.area(result_obj.At)}
  An:    ${unit.area(result_obj.An)}
  Ao:     ${unit.area(result_obj.Ao)}
  Afo:    ${unit.area(result_obj.Afo)}
  Apo:    ${unit.area(result_obj.Apo)}
  Ai:     ${unit.area(result_obj.Ai)}
  Fin_eff:  ${round(result_obj.Ef * 100, 2)}%
  Gn:    ${round(result_obj.Gn / 3600)} lb/sec-ft²

  Uo:    ${unit.convect(result_obj.Uo)}
  R_int: ${round(result_obj.R_int, 6)}
  R_tub: ${round(result_obj.R_tube, 6)}
  R_ext: ${round(result_obj.R_ext, 6)}

  hi:   ${unit.convect(result_obj.hi)}
  hr:   ${unit.convect(result_obj.hr)}
  ho:   ${unit.convect(result_obj.ho)}
  hc:   ${unit.convect(result_obj.hc)}
  he:   ${unit.convect(result_obj.he)}

  kw_fin:   ${unit.thermal(result_obj.kw_fin)}
  kw_tube:  ${unit.thermal(result_obj.kw_tube)}
  kw_fluid: ${unit.thermal(result_obj.kw_fluid)}
  kw_flue:  ${unit.thermal(result_obj.kw_flue)}

  miu_fluid:${unit.viscosity(result_obj.miu_fluid)}
  miu_flue: ${unit.viscosity(result_obj.miu_flue)}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp(result_obj.Cp_flue)}

  Pr_flue:  ${result_obj.PrandtlFlue}
  Re_flue:  ${result_obj.ReynoldsFlue}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    No Tubes:    ${result_obj.TUBING.N}
    Other props: Same as shield

  FINNING:
    Material:   ${result_obj.FINING.Material}
    Type:       ${result_obj.FINING.Type}
    Height:     ${unit.lengthC(result_obj.FINING.Height)}
    Thickness:  ${unit.lengthC(result_obj.FINING.Thickness)}
    Dens:       ${unit.lengthInv(result_obj.FINING.Dens)},
    Arrange:    ${result_obj.FINING.Arrange}
  `;
  return `\n` + string;
};

const stringCombResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let outputString;
  if (lang == "es") {
    outputString = `
Datos de entrada
  (en caso de no haber sido introducidos, el
  simulador selecciona los valores predeterminados)

  Sistema de unidades:         ${result_obj.debug_data["unitSystem"]}
  Presión atmosférica:         ${result_obj.debug_data["atmPressure"]}
  Temperatura de referencia:   ${result_obj.debug_data["ambTemperature"]}
  Temperatura del combustible: ${result_obj.debug_data["fuelTemperature"]}
  Temperatura del aire:        ${result_obj.debug_data["airTemperature"]}

  Humedad Relativa:            ${round(
    result_obj.debug_data["humidity_%"],0)} %
  Volumen de N2 en aire seco:  ${result_obj.debug_data["dryAirN2_%"]} %
  Volumen de O2 en aire seco:  ${result_obj.debug_data["dryAirO2_%"]} %

  Presión del aire seco:       ${result_obj.debug_data["dryAirPressure"]}
  Presión de vapor de agua:    ${result_obj.debug_data["waterPressure"]}

  Fracción molar de H2O: ${result_obj.debug_data["H2OPressure_%"]} ÷10²
  Fracción molar de N2: ${result_obj.debug_data["N2Pressure_%"]} ÷10²
  Fracción molar de O2: ${result_obj.debug_data["O2Pressure_%"]} ÷10²
  Humedad del aire: ${result_obj.debug_data["moisture"]} aire seco


  Temperatura de entrada (residuo): ${unit.tempC(
    result_obj.conv_result.t_in_given,0)}
  Temperatura de salida (residuo):  ${unit.tempC(
    result_obj.rad_result.t_out,0)}

  Cp (Tb) promedio (residuo): ${result_obj.debug_data.cpFluidTb}

  Gravedad específica (residuo): ${round(result_obj.debug_data.spGrav,2)}
  Flujo másico (residuo):        ${unit.mass_flow(
    result_obj.rad_result.m_fluid,1)}

  Calor absorbido ("duty") requerido: ${unit.heat_flow(
    result_obj.rad_result.duty_total)}
  Calor absorbido ("duty") calculado: ${
    unit.heat_flow( result_obj.rad_result.duty +
      result_obj.shld_result.duty + result_obj.conv_result.duty)}

  Eficiencia térmica (NHV): ${round(result_obj.rad_result.eff_thermal_val, 2)}%
  Eficiencia térmica (GHV): ${round(result_obj.rad_result.eff_gcv_val, 2)}%

  Emisiones de CO2: ${round(result_obj.rad_result.co2_emiss, 0)} toneladas/año

  Moles de gases de combustión por mol de combustible
    Moles totales:               ${round(result_obj.flows["total_flow"], 3)}
    Moles totales (a base seca): ${round(result_obj.flows["dry_total_flow"], 3)}

    Componentes
      N2:   ${result_obj.products["N2"]}
      O2:   ${result_obj.products["O2"]}
      H2O:  ${result_obj.products["H2O"]}
      CO2:  ${result_obj.products["CO2"]}
      SO2:  ${result_obj.products["SO2"]}

    Porcentajes molares en base húmeda
      N2:  ${round(result_obj.flows["N2_%"])} %
      O2:  ${round(result_obj.flows["O2_%"])} %
      H2O: ${round(result_obj.flows["H2O_%"])} %
      CO2: ${round(result_obj.flows["CO2_%"])} %
      SO2: ${result_obj.flows["SO2_%"] || "0.000"} %

  Exceso de aire en combustión: ${round(result_obj.flows["air_excess_%"], 2)} %
  Moles O2 estequiométrico/mol combustible: ${round(
    result_obj.flows["O2_mol_req_theor"], 3 )}

  Relaciones Aire/Combustible (A/C)
    A/C molar húmeda:  ${round(result_obj.flows["AC"], 3)}
    A/C másica húmeda: ${round(result_obj.flows["AC_mass"], 3)}
    A/C molar estequiométrica (aire seco):    ${round(
      result_obj.flows["AC_theor_dryAir"], 3 )}
    A/C másica estequiométrica (aire húmedo): ${round(
      result_obj.flows["AC_mass_theor_moistAir"], 3 )}

  Temperatura de llama adiabática: ${unit.temp(result_obj.flows.adFlame)}

  Poder Calorífico Neto  (NCV): ${result_obj.flows["NCV"]}
  Poder Calorífico Bruto (GCV): ${result_obj.flows["GCV"]}

  Flujo másico (combustible): ${unit.mass_flow(result_obj.rad_result.m_fuel, 1)}
  Flujo másico (gases):       ${unit.mass_flow(result_obj.rad_result.m_flue, 1)}
  Flujo másico (aire):        ${unit.mass_flow(result_obj.rad_result.m_air, 1)}

  Peso molecular (combustible): ${unit["mass/mol"](result_obj.flows["fuel_MW"])}
  Peso molecular (gases):       ${result_obj.flows["flue_MW"]}

  Calor específico, Cp(Tcomb) comb.: ${result_obj.flows["Cp_fuel"]}
  Calor específico, Cp(Tcomb) gases: ${result_obj.flows["Cp_flue"]}
`;
  } else {
    outputString = `
Input Data
  (Default values will be taken in case
    of no entries)

  Unit System:           ${result_obj.debug_data["unitSystem"]}
  Atmospheric Pressure:  ${result_obj.debug_data["atmPressure"]}
  Reference Temperature: ${result_obj.debug_data["ambTemperature"]}
  Air Temperature:       ${result_obj.debug_data["airTemperature"]}
  Fuel Temperature:      ${result_obj.debug_data["fuelTemperature"]}

  Relative Humidity:     ${round(result_obj.debug_data["humidity_%"], 0)} %
  N2 volume in dry air:  ${result_obj.debug_data["dryAirN2_%"]} %
  O2 volume in dry air:  ${result_obj.debug_data["dryAirO2_%"]} %

  Dry Air Pressure:     ${result_obj.debug_data["dryAirPressure"]}
  Water Vapor Pressure:  ${result_obj.debug_data["waterPressure"]}

  Molar Fraction H2O:  ${result_obj.debug_data["H2OPressure_%"]} ÷10²
  Molar Fraction N2:  ${result_obj.debug_data["N2Pressure_%"]} ÷10²
  Molar Fraction O2:  ${result_obj.debug_data["O2Pressure_%"]} ÷10²
  Air Moisture: ${result_obj.debug_data["moisture"]} dry Air


  Process fluid Inlet Temperature:  ${unit.tempC(
    result_obj.conv_result.t_in_given, 0 )}
  Process fluid Outlet Temperature: ${unit.tempC(
    result_obj.rad_result.t_out, 0 )}

  Process fluid Sp. Heat, Cp(Tb): ${result_obj.debug_data.cpFluidTb}

  Process fluid Sp Grav:   ${round(result_obj.debug_data.spGrav,2)}
  Process fluid Mass Flow: ${unit.mass_flow(result_obj.rad_result.m_fluid, 1)}

  Required Duty:   ${unit.heat_flow(result_obj.rad_result.duty_total)}
  Calculated Duty: ${unit.heat_flow( result_obj.rad_result.duty +
    result_obj.shld_result.duty + result_obj.conv_result.duty )}

  Heater Thermal Efficiency (NHV): ${round(
    result_obj.rad_result.eff_thermal_val, 2 )}%
  Heater Thermal Efficiency (GHV): ${round(
    result_obj.rad_result.eff_gcv_val, 2 )}%

  CO2 Emissions: ${round(result_obj.rad_result.co2_emiss, 0 )} metric-ton/year

  Flue gas moles and components (per mol of fuel)
    Total moles:     ${round(result_obj.flows["total_flow"], 3)}
    Total moles dry: ${round(result_obj.flows["dry_total_flow"], 3)}

    Components
      N2:  ${result_obj.products["N2"]}
      O2:  ${result_obj.products["O2"]}
      H2O: ${result_obj.products["H2O"]}
      CO2: ${result_obj.products["CO2"]}
      SO2: ${result_obj.products["SO2"]}

    Components (Wet basis)
      N2:  ${round(result_obj.flows["N2_%"], 3)} %
      O2:  ${round(result_obj.flows["O2_%"], 3)} %
      H2O: ${round(result_obj.flows["H2O_%"], 3)} %
      CO2: ${round(result_obj.flows["CO2_%"], 3)} %
      SO2: ${result_obj.flows["SO2_%"] || "0.000"} %

  Air excess in combustion: ${round(result_obj.flows["air_excess_%"], 3)} %
  Moles O2 stoichiometric/mol of fuel: ${round(
    result_obj.flows["O2_mol_req_theor"], 3 )}

  Air/Fuel Ratios (A/F)
    A/F molar (wet basis):   ${round(result_obj.flows["AC"], 3)}
    A/F mass (wet basis):    ${round(result_obj.flows["AC_mass"], 3)}
    A/F molar stoichiometric (dry basis): ${round(
      result_obj.flows["AC_theor_dryAir"], 3 )}
    A/F mass stoichiometric (dry basis):  ${round(
      result_obj.flows["AC_mass_theor_moistAir"], 3 )}

  Adiabatic Flame Temperature: ${unit.temp(result_obj.flows.adFlame)}

  Fuel Mass Flow:           ${unit.mass_flow(result_obj.rad_result.m_fuel, 1)}
  Flue Gas Mass Flow:       ${unit.mass_flow(result_obj.shld_result.m_flue, 1)}
  Combustion Air Mass Flow: ${unit.mass_flow(result_obj.rad_result.m_air, 1)}

  Fuel MW:             ${unit["mass/mol"](result_obj.flows["fuel_MW"])}
  Fuel Sp. Heat, Cp(Tf):   ${result_obj.flows["Cp_fuel"]}
  Fuel Net Calorific Value, NCV:   ${result_obj.flows["NCV"]}
  Fuel Gross Calorific Value, GCV: ${result_obj.flows["GCV"]}

  Flue MW:             ${result_obj.flows["flue_MW"]}
  Flue Sp. Heat, Cp(Tf):   ${result_obj.flows["Cp_flue"]}
`;
  }
  return outputString;
};

const tableStr = {
  row3: (title, base, mod, arg, validMod, mult = 1, rn = 2) => {
    let basi = isNaN(base[arg]) ? base[arg] : round(base[arg]*mult,rn);
    if (basi === undefined) basi = 0;
    let modi = "";
    if (validMod) modi = isNaN(mod[arg]) ? mod[arg] : round(mod[arg]*mult,rn);
    if (modi === undefined) modi = 0;
    return `<tr>
    <td class="tg-simple">${title}</td>
    <td class="tg-simple">${basi}</td>
    <td class="tg-simple">${modi}</td>
  </tr>`},
  row3val: (title, baseVal, modVal, validMod) => {
    let modi = "";
    if (validMod) modi = modVal;
    return `<tr>
    <td class="tg-simple">${title}</td>
    <td class="tg-simple">${baseVal}</td>
    <td class="tg-simple">${modi}</td>
  </tr>`},
  emptyRow3: `<tr><td colspan="3"></td></tr>`,
  titleRow3: (title) =>
    `<tr><td class="tg-mqa1" colspan="3">${title}</td></tr>`,
  fullRow3: (title) =>
    `<tr><td colspan="3">${title}</td></tr>`,
  fullStrongRow3: (title) =>
    `<tr><td colspan="3"><b>${title}</b></td></tr>`
}

const stringCompactResult = (
  uSystem,
  baseResult,
  opt,
  modResult = {},
  modOpt = {}
) => {
  const validMod = modOpt.title != undefined;
  const unit = initSystem(uSystem);
  return `<table class="tg">
<thead>
  <tr>
    <th>(${baseResult.debug_data["unitSystem"]}) <b>Caso</b></th>
    <th>${opt.title.toUpperCase()}</th>
    <th>${validMod ? "MODIFICADO" : ""}</th>
  </tr>
</thead>
<tbody>
  ${tableStr.titleRow3("Condiciones de Proceso")}
  
  ${tableStr.fullRow3("Residuo atmosférico")}
  <tr>
    <td class="tg-simple">▪ Flujo volumétrico, ${
      unit.barrel_flowC(0,0,0,true)}</td>
    <td class="tg-simple">${unit.barrel_flowC(opt.mFluid, 0, true)}</td>
    <td class="tg-simple">${validMod ?
      unit.barrel_flowC(modOpt.mFluid, 0,true) :""}</td>
  </tr>
  <tr>
    <td class="tg-simple">▪ Temperatura de entrada, ${
      unit.tempC(0,0,0,true)}</td>
    <td class="tg-simple">${unit.tempC(
      baseResult.conv_result.t_in_given, 0,true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modResult.conv_result.t_in_given, 0,true) :"" }</td>
  </tr>
  <tr>
    <td class="tg-simple">▪ Temperatura de salida, ${
      unit.tempC(0,0,0,true)}</td>
    <td class="tg-simple">${unit.tempC(
      baseResult.rad_result.t_out, 0,true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modResult.rad_result.t_out, 0,true) :""}</td>
  </tr>
  ${tableStr.row3val("▪ Gravedad específica", 
  round(baseResult.debug_data.spGrav,2), 
  validMod ? round(modResult.debug_data.spGrav,2) :"", validMod)}
  <tr>
    <td class="tg-simple">▪ Calor absorbido estimado, ${
      unit.heat_flow(0,0,0,true)}</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.rad_result.duty_total, 3,true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.heat_flow(modResult.rad_result.duty_total, 3,true) :""}</td>
  </tr>
  ${tableStr.fullRow3("▪ Factores de ensuciamiento")}
  <tr>
    <td class="tg-simple">· Rfi (interno) radiante, ${
      unit.fouling_factor(0,0,0,true)}</td>
    <td class="tg-simple">${unit.fouling_factor(
      baseResult.rad_result.rfi, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.fouling_factor(modResult.rad_result.rfi, 3, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Rfi interno escudo/convectivo, ${
      unit.fouling_factor(0,0,0,true)}</td>
    <td class="tg-simple">${unit.fouling_factor(
      baseResult.conv_result.rfi, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.fouling_factor(modResult.conv_result.rfi, 3, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Rfo externo escudo/convectivo, ${
      unit.fouling_factor(0,0,0,true)}</td>
    <td class="tg-simple">${unit.fouling_factor(
      baseResult.conv_result.rfo, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.fouling_factor(modResult.conv_result.rfo, 3, true) : "" }</td>
  </tr>
  
  ${tableStr.titleRow3("Condiciones de Combustión")}
  <tr>
    <td class="tg-simple">Exceso de Oxígeno, % (BH)</td>
    <td class="tg-simple">${round(baseResult.flows["O2_%"], 2)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["O2_%"], 2) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">Exceso de aire, %</td>
    <td class="tg-simple">${round(baseResult.flows["air_excess_%"], 0)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["air_excess_%"], 0) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">Temperatura del aire de combustión, ${
      unit.tempC(0,0,0,true)}</td>
    <td class="tg-simple">${unit.tempC(opt.tAir, 0, true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modOpt.tAir, 0, true) : "" }</td>
  </tr>
  ${tableStr.row3("Humedad relativa, %", baseResult.debug_data,
  validMod ? modResult.debug_data : {}, "humidity_%", validMod, 1, 0)}
  ${tableStr.row3("Pérdidas por radiación al ambiente, %", opt,
    modOpt, "hLoss", validMod, 100, 1)}
  
  ${tableStr.titleRow3("Características del Combustible")}
  ${tableStr.fullStrongRow3("Composición (100%)")}
  ${tableStr.row3("Metano (CH4)", baseResult.fuel,
    modResult.fuel, "CH4", validMod, 100)}
  ${tableStr.row3("Etano (C2H6)", baseResult.fuel,
    modResult.fuel, "C2H6", validMod, 100)}
  ${tableStr.row3("Propano (C3H8)", baseResult.fuel,
    modResult.fuel, "C3H8", validMod, 100)}
  ${tableStr.row3("n-Butano (C4H10)", baseResult.fuel,
    modResult.fuel, "C4H10", validMod, 100)}
  ${tableStr.row3("i-Butano (C4H10)", baseResult.fuel,
    modResult.fuel, "iC4H10", validMod, 100)}
  ${tableStr.row3("Etileno (C2H4)", baseResult.fuel,
    modResult.fuel, "C2H4", validMod, 100)}
  ${tableStr.row3("Propileno (C3H6)", baseResult.fuel,
    modResult.fuel, "C3H6", validMod, 100)}
  ${tableStr.row3("Monóxido de Carbono (CO)", baseResult.fuel,
    modResult.fuel, "CO", validMod, 100)}
  ${tableStr.row3("Hidrógeno (H2)", baseResult.fuel,
    modResult.fuel, "H2", validMod, 100)}
  ${tableStr.row3("Nitrógeno (N2)", baseResult.fuel,
    modResult.fuel, "N2", validMod, 100)}
  ${tableStr.row3("Dióxido de Carbono (CO2)", baseResult.fuel,
    modResult.fuel, "CO2", validMod, 100)}
  ${tableStr.emptyRow3 //tableStr.row3val("Total", 100, 100, validMod)
  }
  <tr>
    <td class="tg-simple">Peso molecular, ${unit["mass/mol"](0,0,0,true)}</td>
    <td class="tg-simple">${unit["mass/mol"](
      baseResult.flows.fuel_MW, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit["mass/mol"](modResult.flows.fuel_MW, 3, true) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">Calor específico Cp (T comb), ${
      unit.cp(0, 0, 0, true)}</td>
    <td class="tg-simple">${unit.cp(baseResult.flows.Cp_fuel_val, 3, true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.cp(modResult.flows.Cp_fuel_val, 3, true) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">Poder Calorífico Neto (NCV), ${
      unit["energy/mass"](0,0,0,true)}</td>
    <td class="tg-simple">${unit["energy/mass"](
      baseResult.flows.NCV_val, 0, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit["energy/mass"](modResult.flows.NCV_val, 0, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">Poder Calorífico Bruto (GCV), ${
      unit["energy/mass"](0,0,0,true)}</td>
    <td class="tg-simple">${unit["energy/mass"](
      baseResult.flows.GCV_val, 0, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit["energy/mass"](modResult.flows.GCV_val, 0, true) : "" }</td>
  </tr>

  ${tableStr.titleRow3("Resultados")}
  ${tableStr.fullRow3(`▪ Flujos másicos, ${unit.mass_flow(0, 0, 0, true)}`)}
  <tr>
    <td class="tg-simple">· Residuo atmosférico</td>
    <td class="tg-simple">${unit.mass_flow(
      baseResult.rad_result.m_fluid, 1, true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.mass_flow(modResult.rad_result.m_fluid, 1, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Combustible</td>
    <td class="tg-simple">${unit.mass_flow(
      baseResult.rad_result.m_fuel, 2, true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.mass_flow(modResult.rad_result.m_fuel, 2, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Aire</td>
    <td class="tg-simple">${unit.mass_flow(
      baseResult.rad_result.m_air,2,true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.mass_flow(modResult.rad_result.m_air, 2, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Gases de combustión</td>
    <td class="tg-simple">${unit.mass_flow(
      baseResult.rad_result.m_flue,2,true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.mass_flow(modResult.rad_result.m_flue, 2, true) : ""
    }</td>
  </tr>
  ${tableStr.emptyRow3}
  <tr>
    <td class="tg-simple">▪ Humedad del aire, ${
      unit.moist(0,0,0,true)} aire seco</td>
    <td class="tg-simple">${unit.moist(
      baseResult.flows.moisture_val, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.moist(modResult.flows.moisture_val, 3, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">▪ (A/C) Masa BH</td>
    <td class="tg-simple">${round(baseResult.flows["AC_mass"], 3)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["AC_mass"], 3) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">▪ (A/C) Volumen BH</td>
    <td class="tg-simple">${round(baseResult.flows["AC"], 3)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["AC"], 3) : "" }</td>
  </tr>
  ${tableStr.emptyRow3}
  <tr>
    <td class="tg-simple">▪ Suministro Térmico Combustible, ${
      unit.heat_flow(0,0,0,true)}</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.rad_result.Q_rls, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.heat_flow(modResult.rad_result.Q_rls, 3, true) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">▪ Suministro Térmico Total, ${
      unit.heat_flow(0,0,0,true)}</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.rad_result.Q_in, 3, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.heat_flow(modResult.rad_result.Q_in, 3, true) : ""
    }</td>
  </tr>
  ${tableStr.emptyRow3}
  ${tableStr.fullRow3(`▪ Distribución del calor absorbido, ${unit.heat_flow(0,0,0,true)}`)}
  <tr>
    <td class="tg-simple">· Sección Radiante - (%)</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.rad_result.duty, 3, true
    )} - (${round(100 * baseResult.rad_result["%"], 2)})</td>
    <td class="tg-simple">${ validMod ? 
      unit.heat_flow(modResult.rad_result.duty, 3, true) +
      ` - (${round(100 * modResult.rad_result["%"], 2)})` : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Sección Escudo - (%)</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.shld_result.duty, 3, true
    )} - (${round(100 * baseResult.shld_result["%"], 2)})</td>
    <td class="tg-simple">${
      validMod ? unit.heat_flow(modResult.shld_result.duty, 3, true) +
      ` - (${round(100 * modResult.shld_result["%"], 2)})` : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Sección Convectiva - (%)</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.conv_result.duty, 3, true
    )} - (${round(100 * baseResult.conv_result["%"], 2)})</td>
    <td class="tg-simple">${
      validMod ? unit.heat_flow(modResult.conv_result.duty, 3, true) +
      ` - (${round(100 * modResult.conv_result["%"], 2)})` : "" }</td>
  </tr>
  ${tableStr.emptyRow3}
  ${tableStr.fullRow3(`▪ Temperaturas, ${unit.tempC(0, 0, 0, true)}`)}
  <tr>
    <td class="tg-simple">· Pared (tubos radiantes)</td>
    <td class="tg-simple">${unit.tempC(baseResult.rad_result.Tw, 0, true)}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modResult.rad_result.Tw, 0, true) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Arco radiante</td>
    <td class="tg-simple">${unit.tempC(
      baseResult.rad_result.tg_out, 0, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modResult.rad_result.tg_out, 0, true) : ""
    }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Chimenea</td>
    <td class="tg-simple">${unit.tempC(
      baseResult.conv_result.tg_out, 0, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modResult.conv_result.tg_out, 0, true) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· Máxima Aletas (perímetro)</td>
    <td class="tg-simple">${unit.tempC(
      baseResult.conv_result.t_fin_max, 0, true )}</td>
    <td class="tg-simple">${validMod ? 
      unit.tempC(modResult.conv_result.t_fin_max, 0, true) : "" }</td>
  </tr>
  ${tableStr.emptyRow3}
  ${tableStr.fullRow3(`▪ Análisis de gases de combustión (Base Húmeda)`)}
  <tr>
    <td class="tg-simple">· CO2, %</td>
    <td class="tg-simple">${round(baseResult.flows["CO2_%"], 2)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["CO2_%"], 2) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· N2, %</td>
    <td class="tg-simple">${round(baseResult.flows["N2_%"], 2)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["N2_%"], 2) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· O2, %</td>
    <td class="tg-simple">${round(baseResult.flows["O2_%"], 2)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["O2_%"], 2) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">· H2O, %</td>
    <td class="tg-simple">${round(baseResult.flows["H2O_%"], 2)}</td>
    <td class="tg-simple">${validMod ? 
      round(modResult.flows["H2O_%"], 2) : "" }</td>
  </tr>
  ${tableStr.emptyRow3}
  ${tableStr.row3val("▪ Emisiones de CO2, toneladas/año", 
  round(baseResult.rad_result.co2_emiss, 0), 
  validMod ? round(modResult.rad_result.co2_emiss, 0) :"", validMod)}
  ${tableStr.emptyRow3}

  ${tableStr.fullRow3(`▪ Pérdidas de calor, ${unit.heat_flow(0,0,0,true)}`)}
  <tr>
    <td class="tg-simple">· Por chimenea - (% del total)</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.conv_result.Q_stack, 3, true
    )} - (${round( (100 * baseResult.conv_result.Q_stack) 
    /baseResult.rad_result.Q_in, 2 )})</td>
    <td class="tg-simple">${validMod ? 
      unit.heat_flow(modResult.conv_result.Q_stack, 3, true) +
      ` - (${round( (100 * modResult.conv_result.Q_stack) 
      /modResult.rad_result.Q_in, 2 )})` : ""}</td>
  </tr>
  <tr>
    <td class="tg-simple">· Al ambiente - (% del total)</td>
    <td class="tg-simple">${unit.heat_flow(
      baseResult.rad_result.Q_losses, 3, true
      )} - (${round( (100 * baseResult.rad_result.Q_losses) 
      /baseResult.rad_result.Q_in,2 ) })</td>
    <td class="tg-simple">${ validMod ? 
      unit.heat_flow(modResult.rad_result.Q_losses, 3, true) +
      ` - (${round( (100 * modResult.rad_result.Q_losses) 
        /modResult.rad_result.Q_in, 2 )})` : "" }</td>
  </tr>
  ${tableStr.emptyRow3}
  <tr>
    <td class="tg-simple">▪ Eficiencia Térmica @ NHV, %</td>
    <td class="tg-simple">${round(
      baseResult.rad_result.eff_thermal_val, 2 )}</td>
    <td class="tg-simple">${ validMod ? 
      round(modResult.rad_result.eff_thermal_val, 2) : "" }</td>
  </tr>
  <tr>
    <td class="tg-simple">▪ Eficiencia Térmica @ GHV, %</td>
    <td class="tg-simple">${round(baseResult.rad_result.eff_gcv_val, 2)}</td>
    <td class="tg-simple">${ validMod ? 
      round(modResult.rad_result.eff_gcv_val, 2) : "" }</td>
  </tr>
</tbody>
</table>`
};

module.exports = {
  stringRadResult,
  stringShldResult,
  stringConvResult,
  stringCombResult,
  stringCompactResult,
};
