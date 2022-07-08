(() => {
  var t = {
      620: (t, e, s) => {
        const { compactResult: n } = s(851),
          { outputFullData: l } = s(669),
          { graphicData: a } = s(566),
          { optionsModifier: r } = s(691),
          { logger: o } = s(170);
        t.exports = {
          browserProcess: (t, e, s, u) => {
            const i = { ...s };
            let c = "en";
            const d = window.location.pathname.split("/");
            d.length > 0 &&
              d.forEach((t) => {
                ("es" != t && "es_graph" != t) || (c = "es");
              }),
              (s.lang = c);
            const _ = ((t) => {
              if ("" == t) return {};
              let e = {};
              for (const s of t) {
                const t = s.split("=", 2);
                1 == t.length
                  ? (e[t[0]] = "")
                  : (e[t[0]] = decodeURIComponent(t[1].replace(/\+/g, " ")));
              }
              return e;
            })(window.location.search.substring(1).split("&"));
            if (
              (_ !== {} &&
                (t = ((t, e, s, n) => {
                  const l = {},
                    a = s.filter((e) => e.Formula in t);
                  for (const e in t)
                    if (
                      1 === a.filter((t) => t.Formula == e).length &&
                      "" !== t[e]
                    ) {
                      const s = parseFloat(t[e]);
                      s > 0 && s <= 100
                        ? (l[e] = s / 100)
                        : o.error(`fuel fraction invalid (${s}) for ${e}`);
                    } else "" !== t[e] && void 0 !== t[e] && r(e, t, n);
                  return 0 !== Object.keys(l).length && (e = l), e;
                })(_, t, e, s)),
              d[1].includes("_graph") || d[2].includes("_graph"))
            )
              a(u, t, s);
            else if (
              d.includes("fullResult") ||
              d.includes("fullResult.html")
            ) {
              const e = u(t, s);
              l(e, _, c, s.unitSystem);
            } else n(u, t, s, i);
          },
        };
      },
      851: (t, e, s) => {
        const { stringCompactResult: n } = s(144),
          { logger: l } = s(170);
        t.exports = {
          compactResult: (t, e, s, l) => {
            const a = t(e, s);
            let r, o, u, i, c;
            localStorage.setItem(
              `${s.title}`,
              JSON.stringify({ result: a, opt: s })
            ),
              "base" === s.title
                ? ((u = s),
                  (r = a),
                  (c = JSON.parse(localStorage.getItem("modified"))),
                  (i = c ? c.opt : {}),
                  (o = c ? c.result : {}))
                : ((i = s),
                  (o = a),
                  (c = JSON.parse(localStorage.getItem("base"))),
                  c || (c = { result: t(e, l), opt: l }),
                  (u = c ? c.opt : {}),
                  (r = c ? c.result : {}));
            const d = document.getElementById("loader-wrapper");
            d && d.remove();
            const _ = document.getElementById("output-com");
            _ && (_.innerHTML = n(s.unitSystem, r, u, o, i));
          },
        };
      },
      669: (t, e, s) => {
        const {
            stringRadResult: n,
            stringShldResult: l,
            stringConvResult: a,
            stringCombResult: r,
          } = s(144),
          { logger: o } = s(170);
        t.exports = {
          outputFullData: (t, e, s, u) => {
            o.debug(JSON.stringify(e, null, 2));
            const i = document.getElementById("loader-wrapper");
            i && i.remove();
            const c = document.getElementById("output-com");
            c && (c.textContent = r(s, t, u));
            const d = document.getElementById("output-radiant");
            d && (d.textContent = n(s, t.rad_result, u));
            const _ = document.getElementById("output-shield");
            _ && (_.textContent = l(s, t.shld_result, u));
            const m = document.getElementById("output-convective");
            m && (m.textContent = a(s, t.conv_result, u));
          },
        };
      },
      566: (t, e, s) => {
        const { logger: n, unitConv: l } = s(170);
        t.exports = {
          graphicData: (t, e, s) => {
            const a = { ...n };
            (n.error = () => 0),
              (n.default = () => 0),
              (n.info = () => 0),
              (n.debug = () => 0),
              (s.unitSystem = "english");
            const r = [];
            let o,
              u,
              i = JSON.parse(localStorage.getItem(`${s.title}`));
            if (
              (i &&
                ((o = i[`${window.location.search}`]),
                Object.keys(i).length > 5 && localStorage.clear()),
              o)
            )
              return void draw(o, s);
            switch (s.graphVar) {
              case "humidity":
                u = "humidity";
                break;
              case "air_excess":
                (u = "airExcess"), (s.graphRange = 0.01 * s.graphRange);
                break;
              case "o2_excess":
                (u = "o2Excess"), (s.graphRange = 0.01 * s.graphRange);
                break;
              case "m_fluid":
                (u = "mFluid"), (s.graphRange = 1e3 * s.graphRange);
                break;
              default:
                u = "tOut";
            }
            const c = s.graphPoints,
              d = s.graphRange;
            let _ = s[u] - d / 2;
            _ < 0 && (_ = 0),
              a.info(
                `Var: ${u}, centerValue: ${s[u]}, range: ${d}, points: ${c}`
              );
            for (let n = 0; n < c; n++) {
              s[u] = _ + (n * d) / c;
              const a = t(e, s);
              r[n] = {
                m_fluid: 0.001 * l.lb_htoBPD(l.kgtolb(a.rad_result.m_fluid)),
                duty_total: a.rad_result.duty_total,
                t_out: l.KtoF(a.rad_result.t_out),
                o2_excess: a.flows["O2_%"],
                air_excess:
                  a.flows["air_excess_%"] > 0 ? a.flows["air_excess_%"] : 0,
                humidity: a.debug_data["humidity_%"],
                cnv_tg_out: l.KtoF(a.conv_result.tg_out),
                m_fuel: a.rad_result.m_fuel ? l.kgtolb(a.rad_result.m_fuel) : 0,
                efficiency: a.rad_result.eff_total ? a.rad_result.eff_total : 0,
                rad_dist:
                  a.rad_result["%"] < 1
                    ? Math.round(1e5 * a.rad_result["%"]) / 1e3
                    : 0,
              };
            }
            i || (i = {}),
              (i[`${window.location.search}`] = r),
              localStorage.setItem(`${s.title}`, JSON.stringify(i)),
              console.log(r),
              draw(r, s);
          },
        };
      },
      144: (t, e, s) => {
        const { round: n, initSystem: l } = s(170);
        t.exports = {
          stringRadResult: (t, e, s) => {
            const a = l(s);
            let r;
            return (
              (r =
                "es" == t
                  ? "Resultados sección radiante:"
                  : "Radiant section results:"),
              (r += `\n\n  t_in:     ${a.tempC(
                e.t_in
              )}      \n  t_out:    ${a.tempC(
                e.t_out
              )}      \n  Tw:       ${a.tempC(
                e.Tw
              )}      \n\n  tg_out:   ${a.tempC(
                e.tg_out
              )}     \n\n  rfi:      ${a.fouling_factor(
                e.rfi
              )}\n\n  Q_in:     ${a.heat_flow(
                e.Q_in
              )} \n    Q_rls:    ${a.heat_flow(
                e.Q_rls
              )} \n    Q_air:    ${a.heat_flow(
                e.Q_air
              )}  \n    Q_fuel:   ${a.heat_flow(
                e.Q_fuel
              )}  \n\n  Q_out:    ${a.heat_flow(
                e.Q_out
              )} \n    Q_flue:   ${a.heat_flow(
                e.Q_flue
              )} \n    Q_losses: ${a.heat_flow(
                e.Q_losses
              )}  \n    Q_shld:   ${a.heat_flow(
                e.Q_shld
              )}  \n    Q_R:      ${a.heat_flow(
                e.Q_R
              )} \n      Q_conv: ${a.heat_flow(
                e.Q_conv
              )}  \n      Q_rad:  ${a.heat_flow(
                e.Q_rad
              )} \n    Q_fluid:  ${a.heat_flow(
                e.Q_fluid
              )} \n\n  duty_rad:   ${n(
                100 * e["%"],
                2
              )}%  \n\n  At:       ${a.area(e.At)}    \n  Ar:       ${a.area(
                e.Ar
              )}    \n  Acp:      ${a.area(e.Acp)}    \n  αAcp:     ${a.area(
                e.aAcp
              )}    \n  Aw:       ${a.area(e.Aw)}    \n  Aw/αAcp:  ${n(
                e.Aw_aAcp
              )}           \n  Alpha:    ${n(
                e.Alpha
              )}           \n  Acp_sh:   ${a.area(
                e.Acp_sh
              )}     \n  Ai:        ${a.area(
                e.Ai
              )}      \n\n  hi:     ${a.convect(
                e.hi
              )} \n  h_conv:   ${a.convect(e.h_conv)} \n\n  MBL:      ${
                e.MBL
              } ft \n  GPpres:   ${n(
                1 * e.Pco2 + 1 * e.Ph2o
              )} atm \n  PL:       ${e.PL} atm-ft \n  GEmiss:   ${
                e.emiss
              } \n  F:        ${e.F} \n\n  kw_tube:  ${a.thermal(
                e.kw_tube
              )}\n  kw_fluid: ${a.thermal(e.kw_fluid)}\n  kw_flue:  ${a.thermal(
                e.kw_flue
              )}\n  \n  miu_fluid:${a.viscosity(
                e.miu_fluid
              )}\n  miu_flue: ${a.viscosity(e.miu_flue)}\n\n  Cp_fluid: ${a.cp(
                e.Cp_fluid
              )}\n  Cp_flue:  ${a.cp(e.Cp_flue)}\n  \n  Cp_fuel:  ${a.cp(
                e.Cp_fuel
              )}\n  Cp_air:   ${a.cp(e.Cp_air)}\n  Pr_fluid: ${
                e.Prandtl
              }\n  Re_fluid: ${e.Reynolds}\n\n  TUBING:\n    Material:       ${
                e.TUBING.Material
              }\n    No Tubes Wide:  ${e.TUBING.Nt}\n    No Tubes:       ${
                e.TUBING.N
              }\n    Wall Thickness: ${a.lengthC(
                e.TUBING.Sch
              )}\n    Outside Di:     ${a.lengthC(
                e.TUBING.Do
              )}\n    Pitch:          ${a.lengthC(
                e.TUBING.S_tube
              )}\n    Ef. Length:     ${a.length(e.TUBING.L)}\n    \n  `),
              "\n" + r
            );
          },
          stringShldResult: (t, e, s) => {
            const a = l(s);
            let r;
            return (
              (r =
                "es" == t
                  ? "Resultados sección de escudo:"
                  : "Shield section results:"),
              (r += `\n\n  t_in:     ${a.tempC(e.t_in)} \n  t_out:    ${a.tempC(
                e.t_out
              )} \n  Tw:       ${a.tempC(e.Tw)} \n  \n  tg_in:      ${a.tempC(
                e.tg_in
              )} \n  tg_out:     ${a.tempC(
                e.tg_out
              )} \n\n  rfi:      ${a.fouling_factor(
                e.rfi
              )}\n  rfo:      ${a.fouling_factor(
                e.rfo
              )}\n\n  LMTD:     ${a.temp(e.LMTD)}    \n  DeltaA:     ${a.temp(
                e.DeltaA
              )}\n  DeltaB:     ${a.temp(e.DeltaB)}\n  DeltaA-B:   ${a.temp(
                e.DeltaA - e.DeltaB
              )}\n  Log(A/B):   ${n(
                Math.log(e.DeltaA / e.DeltaB)
              )}\n\n  Q_flue:   ${a.heat_flow(
                e.Q_flue
              )} \n    M_fuel xCp x(Tg_in-Tg_out)\n  Q_Shield: ${a.heat_flow(
                e.Q_R
              )} \n    Q_rad:   ${a.heat_flow(
                e.Q_rad
              )} \n    Q_conv:  ${a.heat_flow(
                e.Q_conv
              )} \n  Q_fluid:  ${a.heat_flow(e.Q_fluid)} \n\n  duty_shld: ${n(
                100 * e["%"],
                2
              )}% \n\n  At:    ${a.area(e.At)}     \n  An:     ${a.area(
                e.An
              )}     \n  Ai:      ${a.area(e.Ai)}\n  Gn:    ${n(
                e.Gn / 3600
              )} lb/sec-ft² \n\n  Uo:    ${a.convect(e.Uo)} \n  R_int: ${n(
                e.R_int,
                6
              )}\n  R_tub: ${n(e.R_tube, 6)}\n  R_ext: ${n(
                e.R_ext,
                6
              )}\n\n  hi: ${a.convect(e.hi)} \n  hr:   ${a.convect(
                e.hr
              )}\n  ho:   ${a.convect(e.ho)}\n  hc:   ${a.convect(
                e.hc
              )}\n\n  kw_tube:  ${a.thermal(
                e.kw_tube
              )}\n  kw_fluid: ${a.thermal(e.kw_fluid)}\n  kw_flue:  ${a.thermal(
                e.kw_flue
              )}\n  \n  miu_fluid:${a.viscosity(
                e.miu_fluid
              )}\n  miu_flue: ${a.viscosity(e.miu_flue)}\n\n  Cp_fluid: ${a.cp(
                e.Cp_fluid
              )}\n  Cp_flue:  ${a.cp(e.Cp_flue)}\n\n  Pr_flue:  ${
                e.PrandtlFlue
              }\n  Re_flue:  ${e.ReynoldsFlue}\n  Pr_fluid: ${
                e.Prandtl
              }\n  Re_fluid: ${e.Reynolds}\n\n  TUBING:\n    Material:       ${
                e.TUBING.Material
              }\n    No Tubes Wide:  ${e.TUBING.Nt}\n    No Tubes:       ${
                e.TUBING.N
              }\n    Wall Thickness: ${a.lengthC(
                e.TUBING.Sch
              )}\n    Outside Di:     ${a.lengthC(
                e.TUBING.Do
              )}\n    Tran Pitch:     ${a.lengthC(
                e.TUBING.S_tube
              )}\n    Long Pitch:     ${a.lengthC(
                e.TUBING.S_tube
              )}\n    Ef. Length:     ${a.length(e.TUBING.L)}\n\n  `),
              "\n" + r
            );
          },
          stringConvResult: (t, e, s) => {
            const a = l(s);
            let r;
            return (
              (r =
                "es" == t
                  ? "Resultados sección convectiva:"
                  : "Convective section results:"),
              (r += `\n\n  t_in:     ${a.tempC(e.t_in)}\n  t_out:    ${a.tempC(
                e.t_out
              )}      \n  Tw:       ${a.tempC(
                e.Tw
              )}      \n  t_fin:    ${a.tempC(
                e.t_fin
              )}  \n  \n  tg_in:      ${a.tempC(
                e.tg_in
              )}   \n  tg_stack:   ${a.tempC(
                e.tg_out
              )}    \n\n  rfi:      ${a.fouling_factor(
                e.rfi
              )}\n  rfo:      ${a.fouling_factor(
                e.rfo
              )}\n\n  LMTD:     ${a.temp(e.LMTD)}      \n  DeltaA:     ${a.temp(
                e.DeltaA
              )}\n  DeltaB:     ${a.temp(e.DeltaB)}\n  DeltaA-B:     ${a.temp(
                e.DeltaA - e.DeltaB
              )}\n  Log(|A/B|):   ${n(
                Math.log(Math.abs(e.DeltaA / e.DeltaB))
              )}\n\n  Q_flue:   ${a.heat_flow(
                e.Q_flue
              )}\n  Q_conv:   ${a.heat_flow(
                e.Q_conv
              )}   \n  Q_fluid:  ${a.heat_flow(
                e.Q_fluid
              )}   \n\n  Q_stack:  ${a.heat_flow(
                e.Q_stack
              )}\n\n  duty_conv: ${n(100 * e["%"], 2)}% \n\n  At:   ${a.area(
                e.At
              )}        \n  An:    ${a.area(e.An)}         \n  Ao:     ${a.area(
                e.Ao
              )}         \n  Afo:    ${a.area(
                e.Afo
              )}         \n  Apo:    ${a.area(
                e.Apo
              )}          \n  Ai:     ${a.area(
                e.Ai
              )}          \n  Fin_eff:  ${n(
                100 * e.Ef,
                2
              )}%           \n  Gn:    ${n(
                e.Gn / 3600
              )} lb/sec-ft²    \n\n  Uo:    ${a.convect(e.Uo)}  \n  R_int: ${n(
                e.R_int,
                6
              )}\n  R_tub: ${n(e.R_tube, 6)}\n  R_ext: ${n(
                e.R_ext,
                6
              )}\n\n  hi:   ${a.convect(e.hi)} \n  hr:   ${a.convect(
                e.hr
              )}\n  ho:   ${a.convect(e.ho)}   \n  hc:   ${a.convect(
                e.hc
              )}\n  he:   ${a.convect(e.he)}      \n\n  kw_fin:   ${a.thermal(
                e.kw_fin
              )} \n  kw_tube:  ${a.thermal(e.kw_tube)}\n  kw_fluid: ${a.thermal(
                e.kw_fluid
              )}\n  kw_flue:  ${a.thermal(
                e.kw_flue
              )}\n  \n  miu_fluid:${a.viscosity(
                e.miu_fluid
              )}\n  miu_flue: ${a.viscosity(e.miu_flue)}\n\n  Cp_fluid: ${a.cp(
                e.Cp_fluid
              )}\n  Cp_flue:  ${a.cp(e.Cp_flue)}\n\n  Pr_flue:  ${
                e.PrandtlFlue
              }\n  Re_flue:  ${e.ReynoldsFlue}\n  Pr_fluid: ${
                e.Prandtl
              }\n  Re_fluid: ${e.Reynolds}\n\n  TUBING:\n    No Tubes:    ${
                e.TUBING.N
              }\n    Other props: Same as shield\n\n  FINNING: \n    Material:   ${
                e.FINING.Material
              }\n    Type:       ${e.FINING.Type}\n    Height:     ${a.lengthC(
                e.FINING.Height
              )}\n    Thickness:  ${a.lengthC(
                e.FINING.Thickness
              )}\n    Dens:       ${a.lengthInv(
                e.FINING.Dens
              )},\n    Arrange:    ${e.FINING.Arrange}\n  `),
              "\n" + r
            );
          },
          stringCombResult: (t, e, s) => {
            const a = l(s);
            let r;
            return (
              (r =
                "es" == t
                  ? `\nDatos de entrada\n  (en caso de no haber sido introducidos, el \n  simulador selecciona los valores predeterminados)\n\n  Sistema de unidades:         ${
                      e.debug_data.unitSystem
                    }\n  Presión atmosférica:         ${
                      e.debug_data.atmPressure
                    }\n  Temperatura de referencia:   ${
                      e.debug_data.ambTemperature
                    }\n  Temperatura del combustible: ${
                      e.debug_data.fuelTemperature
                    }\n  Temperatura del aire:        ${
                      e.debug_data.airTemperature
                    }\n\n  Humedad Relativa:            ${n(
                      e.debug_data["humidity_%"],
                      0
                    )} %\n  Volumen de N2 en aire seco:  ${
                      e.debug_data["dryAirN2_%"]
                    } %\n  Volumen de O2 en aire seco:  ${
                      e.debug_data["dryAirO2_%"]
                    } %\n\n  Presión del aire seco:       ${
                      e.debug_data.dryAirPressure
                    }\n  Presión de vapor de agua:    ${
                      e.debug_data.waterPressure
                    }\n\n  Fracción molar de H2O: ${
                      e.debug_data["H2OPressure_%"]
                    } ÷10²\n  Fracción molar de N2: ${
                      e.debug_data["N2Pressure_%"]
                    } ÷10²\n  Fracción molar de O2: ${
                      e.debug_data["O2Pressure_%"]
                    } ÷10²\n  Humedad del aire: ${
                      e.debug_data.moisture
                    } aire seco\n\n\n  Temperatura de entrada (residuo): ${a.tempC(
                      e.conv_result.t_in_given,
                      0
                    )}\n  Temperatura de salida (residuo):  ${a.tempC(
                      e.rad_result.t_out,
                      0
                    )}\n\n  Calor específico (Cp) residuo: ${
                      e.debug_data.cpFluidTb
                    }\n\n  Gravedad específica (residuo): ${
                      e.debug_data.spGrav
                    }\n  Flujo másico (residuo):     ${a.mass_flow(
                      e.rad_result.m_fluid,
                      1
                    )}\n\n  Calor absorbido ("duty") requerido: ${a.heat_flow(
                      e.rad_result.duty_total
                    )}\n  Calor absorbido ("duty") calculado: ${a.heat_flow(
                      e.rad_result.duty +
                        e.shld_result.duty +
                        e.conv_result.duty
                    )}\n\n  Eficiencia térmica del horno:   ${n(
                      e.rad_result.eff_thermal(e.conv_result.Q_stack),
                      2
                    )}%\n\n\nMoles de gases de combustión por mol de combustible\n\n  Moles totales:               ${n(
                      e.flows.total_flow,
                      3
                    )}\n  Moles totales (a base seca): ${n(
                      e.flows.dry_total_flow,
                      3
                    )}\n\n  Componentes \n    N2:   ${
                      e.products.N2
                    } \n    O2:   ${e.products.O2}\n    H2O:  ${
                      e.products.H2O
                    }\n    CO2:  ${e.products.CO2}\n    SO2:  ${
                      e.products.SO2
                    }\n\n  Porcentajes molares en base húmeda\n    N2:  ${n(
                      e.flows["N2_%"]
                    )} %\n    O2:  ${n(e.flows["O2_%"])} %\n    H2O: ${n(
                      e.flows["H2O_%"]
                    )} %\n    CO2: ${n(e.flows["CO2_%"])} %\n    SO2: ${
                      e.flows["SO2_%"] || "0.000"
                    } %\n\n  Exceso de aire: ${n(
                      e.flows["air_excess_%"],
                      2
                    )} %\n  Moles O2 estequiométrico/mol combustible: ${n(
                      e.flows.O2_mol_req_theor,
                      3
                    )}\n\n  Relaciones Aire/Combustible (A/C):\n\n  A/C molar húmeda:  ${n(
                      e.flows.AC,
                      3
                    )}\n  A/C másica húmeda: ${n(
                      e.flows.AC_mass,
                      3
                    )}\n  A/C molar estequiométrica (aire seco):    ${n(
                      e.flows.AC_theor_dryAir,
                      3
                    )}\n  A/C másica estequiométrica (aire húmedo): ${n(
                      e.flows.AC_mass_theor_moistAir,
                      3
                    )}\n\n  Poder Calorífico Neto (NCV): ${
                      e.flows.NCV
                    }\n  \n  Flujo másico (combustible): ${a.mass_flow(
                      e.rad_result.m_fuel,
                      1
                    )}   \n  Flujo másico (gases):       ${a.mass_flow(
                      e.rad_result.m_flue,
                      1
                    )} \n  Flujo másico (aire):        ${a.mass_flow(
                      e.rad_result.m_air,
                      1
                    )} \n\n  Peso molecular (combustible): ${a["mass/mol"](
                      e.flows.fuel_MW
                    )}\n  Peso molecular (gases):       ${
                      e.flows.flue_MW
                    }\n  \n  Calor específico (Cp) combustible: ${
                      e.flows.Cp_fuel
                    }\n  Calor específico (Cp) gases:       ${
                      e.flows.Cp_flue
                    }\n\n  Emisiones de CO2 (t/año): ${n(
                      ((44.01 * e.products.CO2) / e.flows.fuel_MW) *
                        e.rad_result.m_fuel *
                        8.76,
                      2
                    )}\n`
                  : `\nInput Data \n  (Default values will be taken in case \n    of no entries)\n\n  Unit System:           ${
                      e.debug_data.unitSystem
                    }\n  Atmospheric Pressure:  ${
                      e.debug_data.atmPressure
                    }\n  Reference Temperature: ${
                      e.debug_data.ambTemperature
                    }\n  Air Temperature:       ${
                      e.debug_data.airTemperature
                    }\n  Fuel Temperature:      ${
                      e.debug_data.fuelTemperature
                    }\n\n  Relative Humidity:     ${n(
                      e.debug_data["humidity_%"],
                      0
                    )} %\n  N2 volume in dry air:  ${
                      e.debug_data["dryAirN2_%"]
                    } %\n  O2 volume in dry air:  ${
                      e.debug_data["dryAirO2_%"]
                    } %\n\n  Dry Air Pressure:     ${
                      e.debug_data.dryAirPressure
                    }\n  Water Vapor Pressure:  ${
                      e.debug_data.waterPressure
                    }\n\n  Molar Fraction H2O:  ${
                      e.debug_data["H2OPressure_%"]
                    } ÷10²\n  Molar Fraction N2:  ${
                      e.debug_data["N2Pressure_%"]
                    } ÷10²\n  Molar Fraction O2:  ${
                      e.debug_data["O2Pressure_%"]
                    } ÷10²\n  Air Moisture: ${
                      e.debug_data.moisture
                    } dry Air\n\n\n  Process fluid Inlet Temperature:  ${a.tempC(
                      e.conv_result.t_in_given,
                      0
                    )}\n  Process fluid Outlet Temperature: ${a.tempC(
                      e.rad_result.t_out,
                      0
                    )}\n\n  Process fluid Sp. Heat, Cp: ${
                      e.debug_data.cpFluidTb
                    }\n\n  Process fluid Sp Grav:   ${
                      e.debug_data.spGrav
                    }\n  Process fluid Mass Flow: ${a.mass_flow(
                      e.rad_result.m_fluid,
                      1
                    )}\n\n  Required Duty:   ${a.heat_flow(
                      e.rad_result.duty_total
                    )}\n  Calculated Duty: ${a.heat_flow(
                      e.rad_result.duty +
                        e.shld_result.duty +
                        e.conv_result.duty
                    )}\n\n  Heater Thermal Efficiency: ${n(
                      e.rad_result.eff_thermal(e.conv_result.Q_stack),
                      2
                    )}%\n\n\nFlue gas moles and components (per mol of fuel)\n\n  Total moles:     ${n(
                      e.flows.total_flow,
                      3
                    )}\n  Total moles dry: ${n(
                      e.flows.dry_total_flow,
                      3
                    )}\n\n  Components                      \n    N2:  ${
                      e.products.N2
                    }\n    O2:  ${e.products.O2} \n    H2O: ${
                      e.products.H2O
                    } \n    CO2: ${e.products.CO2} \n    SO2: ${
                      e.products.SO2
                    } \n\n  Components (Wet basis)\n    N2:  ${n(
                      e.flows["N2_%"],
                      3
                    )} %\n    O2:  ${n(e.flows["O2_%"], 3)} %\n    H2O: ${n(
                      e.flows["H2O_%"],
                      3
                    )} %\n    CO2: ${n(e.flows["CO2_%"], 3)} %\n    SO2: ${
                      e.flows["SO2_%"] || "0.000"
                    } %\n\n  Air excess: ${n(
                      e.flows["air_excess_%"],
                      3
                    )} %\n  Moles O2 stoichiometric/mol of fuel: ${n(
                      e.flows.O2_mol_req_theor,
                      3
                    )}\n\n  A/F Ratios\n  A/C molar (wet basis):   ${n(
                      e.flows.AC,
                      3
                    )}\n  A/C mass (wet basis):    ${n(
                      e.flows.AC_mass,
                      3
                    )}\n  A/C molar stoichiometric (dry basis): ${n(
                      e.flows.AC_theor_dryAir,
                      3
                    )}\n  A/C mass stoichiometric (dry basis):  ${n(
                      e.flows.AC_mass_theor_moistAir,
                      3
                    )}\n\n  Fuel Mass Flow:           ${a.mass_flow(
                      e.rad_result.m_fuel,
                      1
                    )}   \n  Flue Gas Mass Flow:       ${a.mass_flow(
                      e.shld_result.m_flue,
                      1
                    )}\n  Combustion Air Mass Flow: ${a.mass_flow(
                      e.rad_result.m_air,
                      1
                    )} \n\n  Fuel MW:             ${a["mass/mol"](
                      e.flows.fuel_MW
                    )}\n  Fuel Sp. Heat, Cp:   ${
                      e.flows.Cp_fuel
                    }\n  Fuel Net Calorific Value, NCV: ${
                      e.flows.NCV
                    } \n\n  Flue MW:             ${
                      e.flows.flue_MW
                    }\n  Flue Sp. Heat, Cp:   ${
                      e.flows.Cp_flue
                    }\n\n  CO2 Emissions (t/year): ${n(
                      ((44.01 * e.products.CO2) / e.flows.fuel_MW) *
                        e.rad_result.m_fuel *
                        8.76,
                      2
                    )}\n`),
              r
            );
          },
          stringCompactResult: (t, e, s, a = {}, r = {}) => {
            const o = null != r.title,
              u = l(t);
            return `<table class="tg">\n<thead>\n  <tr>\n    <th>(${
              e.debug_data.unitSystem
            }) <b>Caso</b></th>\n    <th>${s.title.toUpperCase()}</th>\n    <th>${
              o ? "MODIFICADO" : ""
            }</th>\n  </tr>\n</thead>\n<tbody>\n  <tr>\n    <td class="tg-mqa1" colspan="3">Condiciones de Diseno</td>\n  </tr>\n  <tr>\n    <td class="tg-simple" colspan="3">Residuo atmosférico</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Flujo volumétrico</td>\n    <td class="tg-simple">${s.mFluid.toLocaleString()} BPD</td>\n    <td class="tg-simple">${
              o ? r.mFluid.toLocaleString() + " BPD" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de entrada</td>\n    <td class="tg-simple">${u.tempC(
              e.conv_result.t_in_given,
              0
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(a.conv_result.t_in_given, 0) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de salida</td>\n    <td class="tg-simple">${u.tempC(
              e.rad_result.t_out,
              0
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(a.rad_result.t_out, 0) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Gravedad específica</td>\n    <td class="tg-simple">${
              e.debug_data.spGrav
            }</td>\n    <td class="tg-simple">${
              o ? a.debug_data.spGrav : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Rfi (interno) radiante</td>\n    <td class="tg-simple">${u.fouling_factor(
              e.rad_result.rfi
            )}</td>\n    <td class="tg-simple">${
              o ? u.fouling_factor(a.rad_result.rfi) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Rfo externo escudo/convectivo</td>\n    <td class="tg-simple">${u.fouling_factor(
              e.conv_result.rfo
            )}</td>\n    <td class="tg-simple">${
              o ? u.fouling_factor(a.conv_result.rfo) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-mqa1" colspan="3">Condiciones de Combustión</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Exceso de Oxígeno</td>\n    <td class="tg-simple">${n(
              e.flows["O2_%"],
              2
            )} % (BH)</td>\n    <td class="tg-simple">${
              o ? n(a.flows["O2_%"], 2) + " % (BH)" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Exceso de aire</td>\n    <td class="tg-simple">${n(
              e.flows["air_excess_%"],
              2
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.flows["air_excess_%"], 2) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Temperatura del aire de combustión</td>\n    <td class="tg-simple">${u.tempC(
              s.tAir
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(r.tAir) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Humedad relativa</td>\n    <td class="tg-simple">${n(
              e.debug_data["humidity_%"],
              0
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.debug_data["humidity_%"], 0) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Pérdidas por radiación al ambiente</td>\n    <td class="tg-simple">${n(
              100 * s.hLoss,
              1
            )} %</td>\n    <td class="tg-simple">${
              o ? n(100 * r.hLoss, 1) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-mqa1" colspan="3">Características del Combustible</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Peso molecular</td>\n    <td class="tg-simple">${u[
              "mass/mol"
            ](e.flows.fuel_MW)}</td>\n    <td class="tg-simple">${
              o ? u["mass/mol"](a.flows.fuel_MW) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Calor específico (Cp)</td>\n    <td class="tg-simple">${u.cp(
              e.flows.Cp_fuel_val
            )}</td>\n    <td class="tg-simple">${
              o ? u.cp(a.flows.Cp_fuel_val) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Poder Calorífico Neto (NCV)</td>\n    <td class="tg-simple">${u[
              "energy/mass"
            ](e.flows.NCV_val)}</td>\n    <td class="tg-simple">${
              o ? u["energy/mass"](a.flows.NCV_val) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Emisión de CO2 (t/año)</td>\n    <td class="tg-simple">${n(
              ((44.01 * e.products.CO2) / e.flows.fuel_MW) *
                e.rad_result.m_fuel *
                8.76,
              2
            )}</td>\n    <td class="tg-simple">${
              o
                ? n(
                    ((44.01 * a.products.CO2) / a.flows.fuel_MW) *
                      a.rad_result.m_fuel *
                      8.76,
                    2
                  )
                : ""
            }</td>\n  </tr>\n  <tr><td colspan="3"></td></tr> \n  <tr>\n    <td colspan="3">▪ Flujos másicos</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Residuo atmosférico</td>\n    <td class="tg-simple">${u.mass_flow(
              e.rad_result.m_fluid,
              1
            )}</td>\n    <td class="tg-simple">${
              o ? u.mass_flow(a.rad_result.m_fluid, 1) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Combustible</td>\n    <td class="tg-simple">${u.mass_flow(
              e.rad_result.m_fuel,
              1
            )}</td>\n    <td class="tg-simple">${
              o ? u.mass_flow(a.rad_result.m_fuel, 1) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Gases de combustión</td>\n    <td class="tg-simple">${u.mass_flow(
              e.rad_result.m_flue,
              1
            )}</td>\n    <td class="tg-simple">${
              o ? u.mass_flow(a.rad_result.m_flue, 1) : ""
            }</td>\n  </tr>\n  <tr><td colspan="3"></td></tr>\n  <tr>\n    <td class="tg-simple">▪ Humedad del aire</td>\n    <td class="tg-simple">${
              e.debug_data.moisture
            } aire seco</td>\n    <td class="tg-simple">${
              o ? a.debug_data.moisture + " aire seco" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ (A/C) Masa BH</td>\n    <td class="tg-simple">${n(
              e.flows.AC_mass,
              3
            )}</td>\n    <td class="tg-simple">${
              o ? n(a.flows.AC_mass, 3) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ (A/C) Volumen BH</td>\n    <td class="tg-simple">${n(
              e.flows.AC,
              3
            )}</td>\n    <td class="tg-simple">${
              o ? n(a.flows.AC, 3) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ (A/C) Masa estequiométrica BH</td>\n    <td class="tg-simple">${n(
              e.flows.AC_mass_theor_moistAir,
              3
            )}</td>\n    <td class="tg-simple">${
              o ? n(a.flows.AC_mass_theor_moistAir, 3) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ (A/C) Volumen estequiométrica BS</td>\n    <td class="tg-simple">${n(
              e.flows.AC_theor_dryAir,
              3
            )}</td>\n    <td class="tg-simple">${
              o ? n(a.flows.AC_theor_dryAir, 3) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Suministro Térmico Combustible</td>\n    <td class="tg-simple">${u.heat_flow(
              e.rad_result.Q_rls
            )}</td>\n    <td class="tg-simple">${
              o ? u.heat_flow(a.rad_result.Q_rls) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Suministro Térmico Total</td>\n    <td class="tg-simple">${u.heat_flow(
              e.rad_result.Q_in
            )}</td>\n    <td class="tg-simple">${
              o ? u.heat_flow(a.rad_result.Q_in) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Absorción total de calor</td>\n    <td class="tg-simple">${u.heat_flow(
              e.rad_result.duty_total
            )}</td>\n    <td class="tg-simple">${
              o ? u.heat_flow(a.rad_result.duty_total) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Absorción Sección Radiante</td>\n    <td class="tg-simple">${u.heat_flow(
              e.rad_result.duty
            )} - ${n(
              100 * e.rad_result["%"],
              2
            )}%</td>\n    <td class="tg-simple">${
              o
                ? u.heat_flow(a.rad_result.duty) +
                  " - " +
                  n(100 * a.rad_result["%"], 2) +
                  "%"
                : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Absorción Sección Escudo</td>\n    <td class="tg-simple">${u.heat_flow(
              e.shld_result.duty
            )} - ${n(
              100 * e.shld_result["%"],
              2
            )}%</td>\n    <td class="tg-simple">${
              o
                ? u.heat_flow(a.shld_result.duty) +
                  " - " +
                  n(100 * a.shld_result["%"], 2) +
                  "%"
                : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Absorción Sección Convectiva</td>\n    <td class="tg-simple">${u.heat_flow(
              e.conv_result.duty
            )} - ${n(
              100 * e.conv_result["%"],
              2
            )}%</td>\n    <td class="tg-simple">${
              o
                ? u.heat_flow(a.conv_result.duty) +
                  " - " +
                  n(100 * a.conv_result["%"], 2) +
                  "%"
                : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de pared de tubos radiantes</td>\n    <td class="tg-simple">${u.tempC(
              e.rad_result.Tw
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(a.rad_result.Tw) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura arco radiante</td>\n    <td class="tg-simple">${u.tempC(
              e.rad_result.tg_out
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(a.rad_result.tg_out) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de Chimenea</td>\n    <td class="tg-simple">${u.tempC(
              e.conv_result.tg_out
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(a.conv_result.tg_out) : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de las aletas</td>\n    <td class="tg-simple">${u.tempC(
              e.conv_result.t_fin
            )}</td>\n    <td class="tg-simple">${
              o ? u.tempC(a.conv_result.t_fin) : ""
            }</td>\n  </tr>\n  <tr><td colspan="3"></td></tr>\n  <tr>\n    <td class="tg-simple">▪ Análisis de gases de combustión (BH)</td>\n    <td class="tg-simple"></td>\n    <td class="tg-simple"></td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· CO2</td>\n    <td class="tg-simple">${n(
              e.flows["CO2_%"]
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.flows["CO2_%"]) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· N2</td>\n    <td class="tg-simple">${n(
              e.flows["N2_%"]
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.flows["N2_%"]) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· O2</td>\n    <td class="tg-simple">${n(
              e.flows["O2_%"],
              2
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.flows["O2_%"], 2) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· H2O</td>\n    <td class="tg-simple">${n(
              e.flows["H2O_%"]
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.flows["H2O_%"]) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td colspan="3"></td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Pérdidas de calor por chimenea</td>\n    <td class="tg-simple">${u.heat_flow(
              e.conv_result.Q_stack
            )} - ${n(
              (100 * e.conv_result.Q_stack) / e.rad_result.Q_in,
              2
            )}% del total</td>\n    <td class="tg-simple">${
              o
                ? u.heat_flow(a.conv_result.Q_stack) +
                  " - " +
                  n((100 * a.conv_result.Q_stack) / a.rad_result.Q_in, 2) +
                  "% del total"
                : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Pérdidas de calor al ambiente</td>\n    <td class="tg-simple">${u.heat_flow(
              e.rad_result.Q_losses
            )} - ${n(
              (100 * e.rad_result.Q_losses) / e.rad_result.Q_in,
              2
            )}% del total</td>\n    <td class="tg-simple">${
              o
                ? u.heat_flow(a.rad_result.Q_losses) +
                  " - " +
                  n((100 * a.rad_result.Q_losses) / a.rad_result.Q_in, 2) +
                  "% del total"
                : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Eficiencia Térmica NHV (API-560)</td>\n    <td class="tg-simple">${n(
              e.rad_result.eff_total,
              2
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.rad_result.eff_total, 2) + " %" : ""
            }</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Eficiencia Térmica GHV (API-560)</td>\n    <td class="tg-simple">${n(
              e.rad_result.eff_thermal_val,
              2
            )} %</td>\n    <td class="tg-simple">${
              o ? n(a.rad_result.eff_thermal_val, 2) + " %" : ""
            }</td>\n  </tr>\n</tbody>\n</table>`;
          },
        };
      },
      911: (t, e, s) => {
        const {
            newtonRaphson: n,
            options: l,
            logger: a,
            round: r,
            roundDict: o,
            initSystem: u,
            normalize: i,
            flueViscosity: c,
            flueThermalCond: d,
          } = s(170),
          _ = s(684),
          m = { O2: 0.2095, N2: 0.7905, H2O: 0 },
          f = (t, e = {}) => {
            const s = Object.values(t).reduce((t, e) => t + e),
              n = Math.abs(1 - s) <= 3e-12;
            return (
              n ||
                (e.err += `[fuel fraction not equal to 1, total: ${s}. fuels: ${Object.keys(
                  t
                )}],`),
              n
            );
          },
          p =
            ({ c0: t, c1: e, c2: s, c3: n, MW: l, Substance: o }, u, i) =>
            (c) => (
              c < 250 &&
                !i &&
                a.debug(
                  `"Cp0", "temp": ${r(
                    c
                  )},"Msg": "${o} bellow range for Cp0 formula"`
                ),
              c > 1200 &&
                !i &&
                a.debug(
                  `"Cp0", "temp": ${r(
                    c
                  )},"Msg": "${o} above range for Cp0 formula"`
                ),
              "-" === t
                ? (a.debug(
                    `"Cp0", "Msg": "Wrong use, called for compound ${o}, no data found"`
                  ),
                  0)
                : u
                ? l *
                  (t +
                    e * (0.001 * c) +
                    s * (0.001 * c) ** 2 +
                    n * (0.001 * c) ** 3)
                : t +
                  e * (0.001 * c) +
                  s * (0.001 * c) ** 2 +
                  n * (0.001 * c) ** 3
            ),
          h = (t, e, s) => {
            if (0 === t.length) return (t) => 0;
            let n = JSON.parse(JSON.stringify(t));
            f(t) || (n = i(n, "Cp_multicomp", s));
            const l = _.filter((t) => t.Formula in n),
              a = [];
            let r = 0;
            for (const t in n)
              (a[r] = (s) =>
                n[t] * p(l.filter((e) => e.Formula == t)[0], e)(s)),
                r++;
            return a.reduce(
              (t, e) => (s) => t(s) + e(s),
              (t) => 0
            );
          },
          g = (t, e) => {
            if (0 === t.length) return (t) => 0;
            let s = JSON.parse(JSON.stringify(t));
            f(t) || (s = i(s, "MW_multicomp", e));
            const n = _.filter((t) => t.Formula in s);
            let l = 0;
            for (const t in s)
              l += n.filter((e) => e.Formula == t)[0].MW * s[t];
            return l;
          },
          $ = (t, e) => {
            const s = t - l.tempToK;
            return 610.78 * Math.exp((s / (s + 238.3)) * 17.2694) * e * 0.01;
          },
          C = (t, e) => {
            const s = $(t, e);
            return (_[31].MW * s) / (g(m) * (l.pAtm - s));
          },
          O = (t, e) =>
            "-" === t.Cp0
              ? "-" === t.h0
                ? (a.warn(
                    `wrong use of deltaH func, called for compound ${t.Substance} without data`
                  ),
                  void 0 === e ? () => 0 : 0)
                : void 0 === e
                ? () => t.h0
                : t.h0
              : void 0 === e
              ? (e) =>
                  t.h0 +
                  (e - l.tempAmbRef) * p(t, !0, !0)((l.tempAmbRef + e) / 2)
              : t.h0 +
                (e - l.tempAmbRef) * p(t, !0, !0)((l.tempAmbRef + e) / 2),
          b = (t, e, s, n) => {
            const a = O(_[6]),
              r = O(_[34]),
              o = O(_[2]);
            let u = O(_[31]);
            return (
              !0 === n && (u = O(_[32])),
              void 0 === s && (s = l.tAmb),
              void 0 === e
                ? (e) =>
                    t.CO2 * a(e) +
                    t.SO2 * r(e) +
                    t.H2O * u(e) -
                    O(t)(s) -
                    t.O2 * o(s)
                : t.CO2 * a(e) +
                  t.SO2 * r(e) +
                  t.H2O * u(e) -
                  O(t)(s) -
                  t.O2 * o(s)
            );
          };
        t.exports = {
          combSection: (t, e, s, p) => {
            p || a.debug(`"airExcess", "value": ${t}`);
            const w = u(s.unitSystem),
              k = {
                err: "",
                atmPressure: w.pressure(s.p_atm),
                fuelTemperature: w.tempC(s.t_fuel, 0),
                ambTemperature: w.tempC(s.t_amb, 0),
                airTemperature: w.tempC(s.t_air, 0),
                "humidity_%": s.humidity,
                "dryAirN2_%": r(79.05, 2),
                "dryAirO2_%": r(20.95, 2),
                moisture: w.moist(C(s.t_air, s.humidity)),
                spGrav: s.sp_grav,
                cpFluidTb: w.cp(s.Cp_fluid((s.t_in_conv + s.t_out) / 2)),
                unitSystem: w.system[s.lang],
              },
              v = _.filter((t, s, n) => t.Formula in e);
            let N = { ...e };
            f(e, k) || (N = i(e, "combSection")),
              ((t, e, s = {}) => {
                const n = Math.abs(e.length - Object.keys(t).length);
                0 === n ||
                  (a.error(
                    `[some fuels aren't in the database, #badFuels: ${n}],`
                  ),
                  (s.err += `[some fuels aren't in the database, #badFuels: ${n}],`));
              })(N, v, k);
            const y = { O2: 0, N2: 0, H2O: 0, CO2: 0, SO2: 0 },
              S = { ...m };
            ((t, e, s) => {
              for (const n of t)
                for (const t in e)
                  if ("N2" != t) e[t] += n[t] * s[n.Formula];
                  else {
                    if ("N2" == n.Formula || '"N2a' == n.Formula) {
                      e[t] += s[n.Formula];
                      continue;
                    }
                    e[t] += n.O2 * s[n.Formula] * 3.7732696897374702;
                  }
            })(v, y, N),
              t - 1e-6 < 0 && (t = 0),
              s.humidity - 1e-6 < 0 && (s.humidity = 0);
            let A = y.O2,
              F = A * (1 + t);
            if (y.O2 <= 0 || y.N2 < 0)
              a.error(
                `airExcess set to 0, O2 in fuel >= O2 needed. Products: {O2:${y.O2}, N2:${y.N2}}`
              ),
                (F = 0),
                (A = 0),
                (y.N2 = N.N2),
                (y.O2 = -y.O2);
            else {
              const t = $(s.t_air, s.humidity),
                e = s.p_atm - t;
              (S.N2 = (0.7905 * e) / s.p_atm),
                (S.O2 = (0.2095 * e) / s.p_atm),
                (S.H2O = t / s.p_atm),
                (k.dryAirPressure = w.pressure(e)),
                (k.waterPressure = w.pressure(t)),
                (k["H2OPressure_%"] = r(100 * S.H2O)),
                (k["N2Pressure_%"] = r(100 * S.N2)),
                (k["O2Pressure_%"] = r(100 * S.O2)),
                (y.O2 = F - y.O2),
                (y.N2 += y.O2 * (S.N2 / S.O2)),
                (y.H2O += y.N2 * (t / (S.N2 * s.p_atm)));
            }
            let M = 0,
              T = 0;
            for (const t in y) (M += y[t]), "H2O" !== t && (T += y[t]);
            const I = {
              total_flow: M,
              dry_total_flow: T,
              "N2_%": (100 * y.N2) / M,
              "H2O_%": (100 * y.H2O) / M,
              "CO2_%": (100 * y.CO2) / M,
              "O2_%": (100 * y.O2) / M,
              O2_mol_req_theor: A,
              O2_mass_req_theor: w.mass(A * _[2].MW),
              "air_excess_%": 100 * s.airExcess,
              AC: F / S.O2,
              AC_theor_dryAir: A / 0.2095,
              AC_mass: ((F / S.O2) * g(S)) / g(N),
              AC_mass_theor_moistAir: ((A / S.O2) * g(S)) / g(N),
              fuel_MW: g(N),
              Cp_fuel: h(N),
              flue_MW: g(y, p),
              Cp_flue: h(y, !1, p),
            };
            return (
              p ||
                ((s.m_flue_ratio = (M * I.flue_MW) / g(N)),
                (s.m_air_ratio = ((F / S.O2) * g(S)) / g(N)),
                (s.Pco2 = y.CO2 / M),
                (s.Ph2o = y.H2O / M),
                (s.Cp_air = h(S)),
                (s.Cp_fuel = h(N)),
                (s.Cp_flue = I.Cp_flue),
                (s.miu_flue = c(_, y)),
                (s.kw_flue = d(_, y)),
                (I.Cp_fuel_val = I.Cp_fuel(s.t_fuel)),
                (I.Cp_fuel = w.cp(I.Cp_fuel_val)),
                (I.Cp_flue = w.cp(I.Cp_flue(s.t_air))),
                (I.flue_MW = w["mass/mol"](I.flue_MW)),
                (s.NCV =
                  -((t, e, s, n) => {
                    let l = 0;
                    for (const a in t) {
                      if (a in e) continue;
                      const r = s.filter((t) => t.Formula == a)[0];
                      l += t[a] * b(r)(n);
                    }
                    return l;
                  })(N, y, v, s.t_amb) / g(N)),
                (I.NCV = w["energy/mass"](s.NCV, 0)),
                (I.NCV_val = s.NCV),
                (s.adFlame = n(
                  ((t, e, s, n) => {
                    void 0 === s && (s = l.tAmb), void 0 === n && (n = 0);
                    const a = _.filter((e) => e.Formula in t),
                      r = O(_.filter((t) => "O2" == t.Formula)[0]),
                      o = O(_.filter((t) => "N2" == t.Formula)[0]),
                      u = O(_.filter((t) => "CO2" == t.Formula)[0]),
                      i = O(_.filter((t) => "H2O" == t.Formula)[0]),
                      c = O(_.filter((t) => "SO2" == t.Formula)[0]),
                      d = [];
                    let m = 0;
                    for (const e in t)
                      (d[m] = t[e] * O(a.filter((t) => t.Formula == e)[0])(s)),
                        m++;
                    return (t) =>
                      ((t) =>
                        e.O2 * r(t) +
                        e.SO2 * c(t) +
                        e.H2O * i(t) +
                        e.CO2 * u(t) +
                        e.N2 * o(t) -
                        e.N2 * o(s) -
                        n * r(s))(t) - d.reduce((t, e) => t + e);
                  })(N, y, s.t_amb, F),
                  2e3,
                  s.NROptions,
                  "fuel_adFlame"
                )),
                a.info(
                  `Adiabatic flame temp: [${r(s.adFlame)} K] ${w.tempC(
                    s.adFlame
                  )}`
                ),
                o(y),
                "" == k.err && delete k.err),
              {
                flows: I,
                products: y,
                debug_data: k,
              }
            );
          },
        };
      },
      399: (t, e, s) => {
        const {
          newtonRaphson: n,
          logger: l,
          LMTD: a,
          round: r,
          unitConv: o,
        } = s(170);
        t.exports = {
          convSection: (t, e) => {
            let s = t.tg_sh,
              n = 0,
              o = t.t_in_sh,
              u = t.t_in_conv,
              i = 0;
            const c = (t, e = o) => 0.5 * (t + e),
              d = t.m_fluid,
              _ = t.m_flue,
              m = (e, s = e) => t.Cp_fluid(c(e, s)),
              f = (e, s = e) => t.Cp_flue(c(e, s)),
              p = (e) => t.kw_fluid(e),
              h = (e) => t.kw_tube(e),
              g = (e) => t.kw_flue(e),
              $ = (e) => t.miu_fluid(e),
              C = (e) => t.miu_flue(e),
              O = t.Rfo,
              b = t.Rfi_conv,
              w = t.L_conv,
              k = t.Do_conv,
              v = t.Do_conv - 2 * t.Sch_sh_cnv,
              N = t.Pitch_sh_cnv,
              y = t.N_conv,
              S = t.Tpr_sh_cnv,
              A = t.Nf,
              F = t.Lf,
              M = t.Tf,
              T = S * N * w - (k + 2 * F * M * A) * w * S,
              I = Math.PI * k * (1 - A * M),
              R =
                Math.PI * k * (1 - A * M) +
                Math.PI * A * (2 * F * (k + F) + M * (k + 2 * F)),
              H = R - I,
              D = y * R * w,
              P = (Math.PI * v ** 2) / 2,
              x =
                (2 / 3) *
                (t.Width_rad * t.Length_rad * t.Height_rad) ** (1 / 3),
              B = (t.Ph2o + t.Pco2) * x,
              Q = 3.6,
              W = (t) => ($(t) * Q * m(t)) / p(t),
              E = (t) => (C(t) * Q * f(t)) / g(t),
              G = d / Q / P,
              L = (t) => (G * v) / $(t),
              U = _ / T,
              J = (t) => ((U / Q) * k) / C(t),
              V = (t, e = t) =>
                (p(t) / v) *
                0.023 *
                L(t) ** 0.8 *
                W(t) ** (1 / 3) *
                ($(t) / $(e)) ** 0.14,
              K = (t, e = o) => d * m(t, e) * (e - t),
              q = (t = c(o, u), e = t, s = u) =>
                (((t) => K(t))(s) / D) *
                  (k / v) *
                  (b + 1 / V(t, e) + (v * Math.log(k / v)) / (2 * h(e))) +
                t,
              j = (t, e) => 2.2 * 2.7431452152 * B ** 0.5 * (I / R) ** 0.75;
            let z = (t, e) => (g(t) / k) * 0.33 * E(t) ** (1 / 3) * J(t) ** 0.6;
            const X = (t, e) => 1 / (1 / (z(t, e) + j()) + O),
              Y = 1.36 * h(q(c(u, o), q(c(u, o)))),
              Z = F + M / 2,
              tt = (X(c(s, n), q(c(u, o), q(c(u, o)))) / (6 * Y * M)) ** 0.5,
              et = Math.tanh(tt * Z) / (tt * Z),
              st = et * (0.7 + 0.3 * et),
              nt = k + 2 * F,
              lt = st * (0.45 * Math.log(nt / k) * (st - 1) + 1),
              at = (t, e) => (X(t, e) * (lt * H + I)) / R,
              rt = (e, s) =>
                ((t, e, s, n) => {
                  const l = e.Lf,
                    a = 1 / e.Nf - e.Tf,
                    r = 0.35 + 0.65 * Math.exp((-0.25 * l) / a),
                    o = e.Pitch_sh_cnv,
                    u = e.Pitch_sh_cnv,
                    i = e.N_conv / e.Tpr_sh_cnv,
                    c =
                      0.7 +
                      (0.7 - 0.8 * Math.exp(-0.15 * i ** 2)) * Math.exp(-o / u),
                    d = (2 * e.Lf + e.Do_conv) / e.Do_conv,
                    _ = (t, e) =>
                      t +
                      (e - t) /
                        ((Math.exp(1.4142 * s * n) +
                          Math.exp(-1.4142 * s * n)) /
                          2);
                  return (
                    (e.Ts = _),
                    (e, s) =>
                      ((e) => 0.25 * t(e) ** -0.35)(e) *
                      r *
                      c *
                      d ** 0.5 *
                      (e / _(e, s)) ** 0.25
                  );
                })(
                  J,
                  t,
                  tt,
                  Z
                )(e, s);
            z = (t, e) => rt(t, e) * U * f(t) * E(t) ** -0.67;
            const ot = (t) => a(t, o, s, n),
              ut = (t, e) => (k / v) * (1 / V(t, e) + b),
              it = (t) => (k * Math.log(k / v)) / (2 * h(t)),
              ct = (t, e) => 1 / at(t, e),
              dt = (t, e, s) =>
                1 / ((t, e, s) => ct(t, s) + it(s) + ut(e, s))(t, e, s),
              _t = (t, e) => _ * f(t, e) * (t - e),
              mt = (t, e, s) => dt(c(s, e), c(t), q(c(t), q(c(t)))) * D * ot(t),
              ft = (t, e = 0.7 * s) => s - K(t) / (_ * f(c(s, e))),
              pt = () => (100 * (mt(i, s, n) - K(i))) / K(i);
            for (n = ft(u), i = u; n - i < 0; ) (i *= 1.002), (n = ft(i));
            let ht, gt;
            for (let t = 0; t < 100 && !(Math.abs(pt()) < 0.001); t++)
              n - i < 0 || pt() <= 0
                ? ((ht = i), ht && gt ? (i = (ht + gt) / 2) : (i *= 1.001))
                : ((gt = i), ht && gt ? (i = (ht + gt) / 2) : (i *= 0.999)),
                (n = ft(i));
            return (
              (u = i),
              e ||
                l.default(
                  `CONV, T_in_calc: ${t.units.tempC(
                    i
                  )}, T_in_given: ${t.units.tempC(
                    t.t_in_conv
                  )}, Tg_stack: ${t.units.tempC(n)}`
                ),
              (t.t_in_conv_calc = u),
              (t.tg_conv = n),
              {
                t_fin: t.Ts(c(u), q(c(u), q(c(u)))),
                t_in_given: t.t_in_conv,
                t_in: u,
                t_out: o,
                Tb: c(u),
                Tw: q(c(u), q(c(u))),
                tg_out: n,
                tg_in: s,
                Tb_g: c(s, n),
                rfi: b,
                rfo: O,
                LMTD: ot(u),
                DeltaA: s - o,
                DeltaB: n - u,
                Q_flue: _t(s, n),
                Q_fluid: K(u),
                Q_conv: mt(u, s, n),
                Q_stack: _t(n, t.t_air),
                duty: K(u),
                "%": K(u) / t.duty,
                duty_flux: K(u) / D,
                Cp_fluid: m(u, o),
                Cp_flue: f(s, n),
                miu_fluid: $(q(c(u))),
                miu_flue: C(n),
                kw_fluid: p(c(u)),
                kw_tube: h(q(c(u))),
                kw_fin: Y,
                kw_flue: g(c(s, n)),
                Prandtl: r(W(c(o))),
                Reynolds: r(L(c(o))),
                PrandtlFlue: r(E(c(o))),
                ReynoldsFlue: r(J(c(o))),
                At: D,
                Ai: P,
                An: T,
                Ao: R,
                Apo: I,
                Afo: H,
                Ef: lt,
                Gn: U / Q,
                hi: V(c(u), q(c(u), q(c(u)))),
                hr: j(c(s, n), q(c(u), q(c(u)))),
                ho: X(c(s, n), q(c(u), q(c(u)))),
                hc: z(c(s, n), q(c(u), q(c(u)))),
                he: at(c(s, n), q(c(u), q(c(u)))),
                j: rt(c(s, n), q(c(u), q(c(u)))),
                gr: (c(s, n), q(c(u), q(c(u))), 2.7431452152),
                Uo: dt(c(s, n), c(u), q(c(u))),
                R_int: ut(c(u), q(c(u))),
                R_tube: it(q(c(u))),
                R_ext: ct(c(s, n), q(c(u))),
                TUBING: {
                  Material: t.Material,
                  Nt: S,
                  N: y,
                  Sch: t.Sch_sh_cnv,
                  Do: k,
                  L: w,
                  S_tube: N,
                },
                FINING: {
                  Material: t.FinMaterial,
                  Type: t.FinType,
                  Height: t.Lf,
                  Thickness: t.Tf,
                  Dens: t.Nf,
                  Arrange: t.FinArrange,
                },
              }
            );
          },
        };
      },
      623: (t, e, s) => {
        const { newtonRaphson: n, logger: l, round: a, unitConv: r } = s(170),
          o = (t) => {
            const e = {
                a: { A: 2.58e-8, B: -39e-9, C: 6.8e-9, D: -2.2e-10 },
                b: { A: -119e-6, B: 56e-6, C: -41e-7, D: -72e-8 },
                c: { A: 0.21258, B: 0.2258, C: -0.047351, D: 0.004165 },
              },
              s =
                (t, s = e) =>
                (e) =>
                  s.a[t] * e ** 2 + s.b[t] * e + s.c[t],
              n = s("A"),
              l = s("B"),
              a = s("C"),
              r = s("D");
            return (e) => n(e) + l(e) * t + a(e) * t ** 2 + r(e) * t ** 3;
          },
          u = (t, e, s, n, l) => {
            const a = s * n + t * e,
              r = l - a;
            return { Aw: r, Aw_aAcp: r / a };
          };
        t.exports = {
          radSection: (t, e) => {
            let s = 0,
              i = 0,
              c = t.t_out,
              d = t.m_fuel,
              _ = 0,
              m = 0;
            const f = t.t_air,
              p = t.t_fuel,
              h = t.t_amb,
              g = t.t_in_conv,
              $ = (t, e = i) => 0.5 * (e + t),
              C = t.Rfi,
              O = t.N_rad,
              b = t.N_shld,
              w = t.L_rad,
              k = t.L_shld,
              v = t.Do_rad,
              N = t.Do_rad - t.Sch_rad,
              y = t.Pitch_rad || 0.394,
              S = t.Pitch_sh_cnv,
              A = t.h_conv || 30.66,
              F =
                (2 / 3) *
                (t.Width_rad * t.Length_rad * t.Height_rad) ** (1 / 3),
              M = (t.Ph2o + t.Pco2) * F,
              T =
                1 +
                ((y / v) * 0.49) / 6 -
                0.09275 * (y / v) ** 2 +
                (0.065 * (y / v) ** 3) / 6 +
                25e-5 * (y / v) ** 4,
              I = O * Math.PI * v * w,
              R = O * y * w,
              H = (b / 2) * S * k,
              D = ((t) => {
                const e = r.m2toft2(t.Pitch_sh_cnv * t.Tpr_sh_cnv * t.L_shld),
                  s = t.Length_rad * t.Width_rad,
                  n = t.Height_rad * t.Width_rad,
                  l = t.Height_rad * t.Length_rad,
                  a = r.mtoft(t.Pitch_sh_cnv * t.Tpr_sh_cnv),
                  o = (t.Width_rad - a) / 2,
                  u = r.mtoft(4 * t.Pitch_rad),
                  i = Math.sin(Math.acos(o / u)) * u,
                  c =
                    2 * n +
                    2 * l +
                    2 * s -
                    e -
                    (2 * o * i + 2 * a * i) -
                    (Math.PI / 4) * 13 * 2.24 ** 2;
                return r.ft2tom2(c);
              })(t),
              { Aw: P, Aw_aAcp: x } = u(T, R, 1, H, D),
              B = (Math.PI * N ** 2) / 2,
              Q = 2.04133464e-7,
              W = (t) =>
                ((t, e, s, n, l, a) => {
                  const { Aw_aAcp: r } = u(e, s, n, l, a),
                    i = o(t),
                    c = {
                      a: { A: -5e-4, B: 0.0072, C: -0.0062 },
                      b: { A: 0.0022, B: -0.1195, C: 0.1168 },
                      c: { A: 0.0713, B: 0.5333, C: -0.6473 },
                      d: { A: -0.0152, B: 1.0577, C: -0.154 },
                    },
                    d =
                      (t, e = c) =>
                      (s) =>
                        e.a[t] * s ** 3 + e.b[t] * s ** 2 + e.c[t] * s + e.d[t],
                    _ = d("A"),
                    m = d("B"),
                    f = d("C");
                  return (t) => _(r) + m(r) * i(t) + f(r) * i(t) ** 2;
                })(
                  M,
                  T,
                  R,
                  1,
                  H,
                  D
                )(r.KtoF(t)),
              E = t.duty_rad_dist || 0.7,
              G = t.efficiency || 0.8,
              L = t.heat_loss_percent || 0.015,
              U = t.NCV,
              J = t.m_fluid,
              V = (e = d) => t.m_air_ratio * e,
              K = (e = d) => t.m_flue_ratio * e,
              q = t.Cp_fuel($(p, h)),
              j = t.Cp_air($(f, h)),
              z = (e, s = e) => t.Cp_fluid($(e, s)),
              X = (e, s = e) => t.Cp_flue($(e, s)),
              Y = (e) => t.kw_fluid(e),
              Z = (e) => t.kw_tube(e),
              tt = (e) => t.miu_fluid(e),
              et = J / 3.6 / B,
              st = (t) => (tt(t) * z(t) * 3.6) / Y(t),
              nt = (t) => (et * N) / tt(t),
              lt = (t, e = t) =>
                (Y(t) / N) *
                0.023 *
                nt(t) ** 0.8 *
                st(t) ** (1 / 3) *
                (tt(t) / tt(e)) ** 0.14,
              at = (t, e = t, s = m) =>
                (s / I) *
                  (v / N) *
                  (C + 1 / lt(t, e) + (N * Math.log(v / N)) / (2 * Z(e))) +
                t,
              rt = (t) => V(t) * j * (f - h),
              ot = (t) => t * q * (p - h),
              ut = (t) => t * U,
              it = (t) => ut(t) + rt(t) + ot(t),
              ct = (t, e) => K(e) * X(t, h) * (t - h),
              dt = (t) => ut(t) * L,
              _t = (t, e) => A * I * (t - e),
              mt = (t, e) => W(t) * Q * T * R * (t ** 4 - e ** 4),
              ft = (t, e) => W(t) * Q * 1 * H * (t ** 4 - e ** 4),
              pt = (t, e) => mt(t, e) + _t(t, e),
              ht = (t, e = d, s = at($(c), at($(c)))) =>
                pt(t, s) + ft(t, s) + dt(e) + ct(t, e),
              gt = (t, e) => J * z(e, t) * (t - e);
            if (0 !== c) {
              (_ = gt(c, g)),
                (m = _ * E),
                (i = g + (_ * (1 - E)) / (J * z(g, c)));
              const a = n(
                (t) => gt(c, i) - pt(t, at($(c), at($(c)))),
                1e3,
                t.NROptions,
                "Tg_Tout-seed_radiant",
                e
              );
              a && (s = a);
              const r = (t) => it(t) - ht(s, t, at($(c), at($(c))));
              let o = gt(c, g) / (U * G);
              e || l.debug(`"mass_fuel_seed", "value": "${o}"`),
                (o = n(r, o, t.NROptions, "M-fuel_T-seed_radiant", e)),
                o && (d = o),
                (m = pt(s, at($(c), at($(c)))));
            } else {
              (_ = ut(d) * G),
                (m = _ * E),
                (i = g + (_ * (1 - E)) / (J * z(g)));
              let a = g + _ / (J * z(i));
              const r = n(
                (t) => it(d) - ht(t, d, at($(a), at($(a)))),
                1e3,
                t.NROptions,
                "Tg_mFuel-seed_radiant",
                e
              );
              r && (s = r),
                (a = n(
                  (t) => gt(t, i) - pt(s, at($(t), at($(t)))),
                  a,
                  t.NROptions,
                  "Tout_mFuel-seed_radiant",
                  e
                )),
                a && (c = a);
              const o = J * z(i, c) * (c - g),
                u = t.t_in_conv + (o * (1 - E)) / (J * z(i, c));
              e || l.info(`t_out, seed: ${a} vs calc: ${c}`),
                e || l.info(`t_in_rad, seed: ${i} vs calc: ${u}`);
            }
            e ||
              l.default(
                `RADI, T_in_calc: ${t.units.tempC(
                  i
                )}, M_fuel: ${t.units.mass_flow(d)}, Tg_out: ${t.units.tempC(
                  s
                )}`
              ),
              (t.t_in_rad = i),
              (t.t_out = c),
              (t.tg_rad = s),
              (t.duty = _),
              (t.m_flue = K(d)),
              (t.m_air = V(d)),
              (t.t_w_rad = at($(c), at($(c)))),
              (t.q_rad_sh = ft(s, t.t_w_rad));
            const $t = {
              m_air: V(),
              m_flue: K(),
              m_fuel: d,
              m_fluid: J,
              t_in: i,
              t_out: c,
              Tw: t.t_w_rad,
              tg_out: s,
              rfi: C,
              Q_in: it(d),
              Q_rls: ut(d),
              Q_air: rt(d),
              Q_fuel: ot(d),
              Q_out: ht(s, d),
              Q_flue: ct(s, d),
              Q_losses: dt(d),
              Q_shld: ft(s, t.t_w_rad),
              Q_conv: _t(s, t.t_w_rad),
              Q_rad: mt(s, t.t_w_rad),
              Q_R: pt(s, t.t_w_rad),
              Q_fluid: gt(c, i),
              At: I,
              Ar: D,
              Ai: B,
              Aw: P,
              Aw_aAcp: x,
              Acp: R,
              aAcp: T * R,
              Acp_sh: H,
              hi: lt($(c), t.t_w_rad),
              h_conv: A,
              duty_total: _,
              duty: m,
              "%": m / _,
              eff_total: _ / ut(d) > 1 ? 100 : (100 * _) / ut(d),
              eff_thermal: (t) => (100 * (it(d) - dt(d) - t)) / it(d),
              duty_flux: m / I,
              Alpha: T,
              MBL: a(F),
              Pco2: a(t.Pco2),
              Ph2o: a(t.Ph2o),
              PL: a(M),
              F: a(W(s)),
              emiss: a(o(M)(s)),
              kw_tube: Z(at($(i))),
              kw_fluid: Y($(i)),
              kw_flue: t.kw_flue(s),
              Cp_fluid: z(i, c),
              Cp_flue: X(s, h),
              Cp_fuel: q,
              Cp_air: j,
              Prandtl: a(st($(c))),
              Reynolds: a(nt($(c))),
              TUBING: {
                Material: t.Material,
                Nt: 2,
                N: O,
                Sch: t.Sch_rad,
                Do: v,
                L: w,
                S_tube: y,
              },
              FINING: "None",
            };
            return ($t.miu_flue = t.miu_flue(s)), ($t.miu_fluid = tt($(c))), $t;
          },
        };
      },
      16: (t, e, s) => {
        const {
          newtonRaphson: n,
          logger: l,
          LMTD: a,
          round: r,
          unitConv: o,
        } = s(170);
        t.exports = {
          shieldSection: (t, e) => {
            let s = t.tg_rad,
              o = 0,
              u = t.t_in_rad,
              i = 0.5 * (t.t_in_rad + t.t_in_conv),
              c = 0;
            const d = (t, e = u) => 0.5 * (t + e),
              _ = t.m_fluid,
              m = t.m_flue,
              f = (e, s = e) => t.Cp_fluid(d(e, s)),
              p = (e, s = e) => t.Cp_flue(d(e, s)),
              h = (e) => t.kw_fluid(e),
              g = (e) => t.kw_tube(e),
              $ = (e) => t.kw_flue(e),
              C = (e) => t.miu_fluid(e),
              O = (e) => t.miu_flue(e),
              b = t.Rfo_shld,
              w = t.Rfi_shld,
              k = t.N_shld,
              v = t.L_shld,
              N = t.Do_shld,
              y = t.Do_shld - 2 * t.Sch_sh_cnv,
              S = t.Pitch_sh_cnv,
              A = k * Math.PI * N * v,
              F = (Math.PI * y ** 2) / 2,
              M = (k / 2) * (S - N) * v,
              T = 3.6,
              I = (t) => (C(t) * T * f(t)) / h(t),
              R = (t) => (O(t) * T * p(t)) / $(t),
              H = _ / T / F,
              D = (t) => (H * y) / C(t),
              P = m / T / M,
              x = (t) => (P * N) / O(t),
              B = (t, e = t) =>
                (h(t) / y) *
                0.023 *
                D(t) ** 0.8 *
                I(t) ** (1 / 3) *
                (C(t) / C(e)) ** 0.14,
              Q = (t) => 0.092 * t - 34,
              W = (t) => ($(t) / N) * 0.33 * R(t) ** (1 / 3) * x(t) ** 0.6,
              E = (t, e = s) => 1 / (1 / (W(d(t, e)) + Q(d(t, e))) + b),
              G = (t) => _ * f(t) * (u - t),
              L = (t, e = t, s = i) =>
                (G(s) / A) *
                  (N / y) *
                  (w + 1 / B(t, e) + (y * Math.log(N / y)) / (2 * g(e))) +
                t,
              U = (t, e) => N / (y * B(t, e)) + (N / y) * w,
              J = (t) => (N * Math.log(N / y)) / (2 * g(t)),
              V = (t, e = s) => 1 / E(t, e),
              K = (t, e, s, n) =>
                1 / ((t, e, s, n) => V(t, e) + J(n) + U(s, n))(t, e, s, n),
              q = t.q_rad_sh,
              j = (t, e, s, n, l) => K(s, e, n, l) * A * a(t, u, e, s),
              z = (t, e, s, n, l) => q + j(t, e, s, n, l),
              X = (t, e = u) => _ * f(t, e) * (e - t),
              Y = (t, e = o) => m * p(t, e) * (t - e),
              Z = (t) => Y(s, t) + q - X(i, u),
              tt = (t) => X(t) - z(t, s, o, d(t), L(d(t), L(d(t))));
            (o = n(Z, s - 100, t.NROptions, "Tg_out_shield-1", e)),
              (c = n(tt, i, t.NROptions, "T_in_shield-1", e));
            let et = 1;
            const st = (t) =>
              Math.abs(
                (Y(s, t) - j(i, s, t, d(i), L(d(i), L(d(i))))) / Y(s, o)
              );
            for (; st(o) - 0.001 > 0; ) {
              if (!c) {
                l.error("Invalid t_in_calc at shield sect");
                break;
              }
              if (
                ((i = c),
                (c = n(tt, i, t.NROptions, "T_in_shield-2", !0)),
                (o = n(Z, s - 58, t.NROptions, "Tg_out_shield-2", !0)),
                et++,
                et > 35)
              ) {
                l.debug(
                  `"Tin_shield",  "t_in_sh_calc": ${r(c)}, "t_in_sh_sup": ${r(
                    i
                  )}`
                ),
                  e || l.info(`diff vs error: ${st(o)}-0.001`),
                  l.error(
                    "Max iterations reached for inlet temp calc at shield sect"
                  );
                break;
              }
            }
            return (
              e ||
                l.default(
                  `SHLD, cycles: ${et}, T_in_calc: ${t.units.tempC(
                    i
                  )}, Tg_out: ${t.units.tempC(o)}`
                ),
              (t.t_in_sh = i),
              (t.tg_sh = o),
              {
                m_flue: m,
                t_in_sup: 0.5 * (t.t_in_rad + t.t_in_conv),
                t_in: i,
                t_out: u,
                Tb: d(i),
                Tw: L(d(i), L(d(i))),
                tg_out: o,
                tg_in: s,
                Tb_g: d(s, o),
                LMTD: a(i, u, s, o),
                DeltaA: s - u,
                DeltaB: o - i,
                rfi: w,
                rfo: b,
                Q_flue: Y(s, o),
                Q_fluid: X(i),
                Q_R: z(i, s, o, d(i), L(d(i))),
                Q_rad: q,
                Q_conv: j(i, s, o, d(i), L(d(i))),
                Cp_fluid: f(i, u),
                Cp_flue: p(s, o),
                miu_fluid: C(L(d(i))),
                miu_flue: O(o),
                duty: G(i),
                "%": G(i) / t.duty,
                duty_flux: G(i) / A,
                kw_fluid: h(d(i)),
                kw_tube: g(L(d(i))),
                kw_flue: $(d(s, o)),
                Prandtl: r(I(d(u))),
                Reynolds: r(D(d(u))),
                PrandtlFlue: r(R(d(u))),
                ReynoldsFlue: r(x(d(u))),
                At: A,
                Ai: F,
                An: M,
                Gn: P,
                hi: B(d(i)),
                hi_tw: B(d(i), L(d(i))),
                hr: Q(s),
                ho: E(o),
                hc: W(d(s, o)),
                Uo: K(o, s, d(i), L(d(i), L(d(i)))),
                R_int: U(d(i), L(d(i), L(d(i)))),
                R_tube: J(L(d(i), L(d(i)))),
                R_ext: V(o, s),
                TUBING: {
                  Material: t.Material,
                  Nt: t.Tpr_sh_cnv,
                  N: k,
                  Sch: t.Sch_sh_cnv,
                  Do: N,
                  L: v,
                  S_tube: S,
                },
                FINING: "None",
              }
            );
          },
        };
      },
      691: (t, e, s) => {
        const { logger: n, unitConv: l } = s(170);
        t.exports = {
          optionsModifier: (t, e, s) => {
            let a;
            switch (t) {
              case "project_title":
                e[t] && (s.title = e[t]);
                break;
              case "fuel_percent":
                break;
              case "heat_loss":
                (a = parseFloat(e[t])), a <= 5 && (s.hLoss = 0.01 * a);
                break;
              case "rad_dist":
                (a = parseFloat(e[t])),
                  a >= 40 &&
                    a <= 100 &&
                    ((s.radDist = 0.01 * a), (s.runDistCycle = !1));
                break;
              case "rfi":
                (a = parseFloat(e[t])), a >= 0 && (s.rfi = a);
                break;
              case "rfo":
                (a = parseFloat(e[t])),
                  a >= 0 && ((s.rfoConv = a), (s.rfoShld = a));
                break;
              case "rfi_conv":
                (a = parseFloat(e[t])), a >= 0 && (s.rfiConv = a);
                break;
              case "rfo_conv":
                (a = parseFloat(e[t])), a >= 0 && (s.rfoConv = a);
                break;
              case "rfi_shld":
                (a = parseFloat(e[t])), a >= 0 && (s.rfiShld = a);
                break;
              case "rfo_shld":
                (a = parseFloat(e[t])), a >= 0 && (s.rfoShld = a);
                break;
              case "t_fuel":
                (a = parseFloat(e[t])), a >= 0 && (s.tFuel = l.FtoK(a));
                break;
              case "unit_system":
                n.debug(`"${t}", "value":"${e[t]}"`), (s.unitSystem = e[t]);
                break;
              default:
                ((t, e, s) => {
                  let n;
                  switch (t) {
                    case "graph_var":
                      s.graphVar = e[t];
                      break;
                    case "graph_range":
                      (n = parseFloat(e[t])), n > 0 && (s.graphRange = n);
                      break;
                    case "graph_points":
                      (n = parseFloat(e[t])),
                        n > 0 && n <= 200 && (s.graphPoints = n);
                  }
                })(t, e, s),
                  ((t, e, s) => {
                    let n = parseFloat(e[t]);
                    if (!(n <= 0))
                      switch (t) {
                        case "m_fluid":
                          s.mFluid = n;
                          break;
                        case "t_in":
                          s.tIn = n;
                          break;
                        case "t_out":
                          s.tOut = n;
                          break;
                        case "sp_grav":
                          s.spGrav = n;
                          break;
                        case "miu_in":
                          s.miuFluidIn = n;
                          break;
                        case "miu_out":
                          s.miuFluidOut = n;
                          break;
                        case "kw_in":
                          s.kwFluidIn = n;
                          break;
                        case "kw_out":
                          s.kwFluidOut = n;
                          break;
                        case "cp_in":
                          s.cpFluidIn = n;
                          break;
                        case "cp_out":
                          s.cpFluidOut = n;
                      }
                  })(t, e, s),
                  ((t, e, s) => {
                    let n;
                    switch (t) {
                      case "t_amb":
                        (n = parseFloat(e[t])), n < 100 && (s.tAir = l.FtoK(n));
                        break;
                      case "humidity":
                        (n = parseFloat(e[t])),
                          n >= 0 && n <= 100 && (s.humidity = n);
                        break;
                      case "p_atm":
                        (n = parseFloat(e[t])),
                          n >= 0.01 && n < 2 && (s.pAtm = n * s.pAtmRef);
                        break;
                      case "air_excess":
                        (n = parseFloat(e[t])),
                          n >= 0 && n <= 300 && (s.airExcess = 0.01 * n);
                        break;
                      case "o2_excess":
                        (n = parseFloat(e[t])),
                          n >= 0 && n <= 30 && (s.o2Excess = 0.01 * n);
                    }
                  })(t, e, s);
            }
          },
        };
      },
      170: (t) => {
        const e = (...t) => {
            let e = "" + t[1][0];
            for (var s = 1; s < t[1].length; s++) e += " " + t[1][s];
            switch (t[0]) {
              case "DEBUG":
                i.verbose && console.debug(JSON.parse(`{"${t[0]}": ${e}}`));
                break;
              case "INFO":
                console.info(`{ [32;1m${t[0]}[0m: "${e}"}`);
                break;
              case "ERROR":
                console.error(`{ [31;1m${t[0]}[0m: '${e}'}`);
                break;
              case "WARN":
                console.warn(`{ [35;1m${t[0]}[0m: '${e}'}`);
                break;
              default:
                console.log(`{ [34;1m${t[0]}[0m: '${e}'}`);
            }
          },
          s = {
            info: (...t) => e("INFO", t),
            warn: (...t) => e("WARN", t),
            error: (...t) => e("ERROR", t),
            debug: (...t) => e("DEBUG", t),
            default: (...t) => e("DEFAULT", t),
          },
          n = 273.15,
          l = 101325,
          a = 5.6145833333,
          r = 62.371,
          o = 288.70556,
          u = {
            RtoK: (t = 1) => t * (5 / 9),
            KtoR: (t = 1) => 1.8 * t,
            KtoF: (t = 1) => 1.8 * t - 459.67,
            CtoK: (t = 1) => t + n,
            CtoF: (t = 1) => 1.8 * t + 32,
            FtoC: (t = 1) => (5 / 9) * (t - 32),
            FtoK: (t = 1) => (5 / 9) * (t - 32) + n,
            kgtolb: (t = 1) => 2.20462 * t,
            lbtokg: (t = 1) => t / 2.20462,
            BPDtolb_h: (t = 1, e = 0.84) => ((t * a * r) / 24) * e,
            lb_htoBPD: (t = 1, e = 0.84) => ((t / a / r) * 24) / e,
            kJtoBTU: (t = 1) => t / 1.05506,
            BTUtokJ: (t = 1) => 1.05506 * t,
            fttom: (t = 1) => t / 3.28084,
            ft2tom2: (t = 1) => t / 3.28084 ** 2,
            mtoft: (t = 1) => 3.28084 * t,
            m2toft2: (t = 1) => t * 3.28084 ** 2,
            intom: (t = 1) => t / 39.3701,
            mtoin: (t = 1) => 39.3701 * t,
            CpENtoCpSI: (t = 1) => ((1.05506 * t) / (5 / 9)) * 2.20462,
            kwENtokwSI: (t = 1) => ((1.05506 * t) / (5 / 9)) * 3.28084,
            RfENtoRfSI: (t = 1) => t / 20.441829691933805,
            hcENtohcSI: (t = 1) => ((1.05506 * t) / (5 / 9)) * 3.28084 ** 2,
            BtuHtoW: (t = 1) => t / 3.4121416331,
          },
          i = (() => {
            const t = {
              tempToK: n,
              tempAmbRef: o,
              pAtmRef: l,
              spGrav: 0.84,
              runDistCycle: !0,
              verbose: !0,
              tAmb: o,
              tAir: o,
              tFuel: o,
              humidity: 50,
              o2Excess: 0,
              airExcess: 0.2,
              radDist: 0.64,
              hLoss: 0.015,
              effcy: 0.8,
              rfi: 0,
              rfiConv: 0,
              rfoConv: 0,
              rfiShld: 0,
              rfoShld: 0,
              tIn: 678,
              tOut: 772,
              mFluid: 9e4,
              miuFluidIn: 1.45,
              miuFluidOut: 0.96,
              cpFluidIn: 0.676,
              cpFluidOut: 0.702,
              kwFluidIn: 0.038,
              kwFluidOut: 0.035,
              pAtm: l,
              unitSystem: "SI",
              lang: "en",
              title: "base",
              graphVar: "t_out",
              graphRange: 50,
              graphPoints: 100,
              NROptions: {
                tolerance: 1e-4,
                epsilon: 3e-8,
                maxIterations: 20,
                h: 1e-4,
                verbose: !0,
              },
            };
            return (
              "undefined" == typeof process ||
                ((t.verbose = "true" == process.argv[2]),
                (t.unitSystem = process.argv[3]),
                (t.tAmb = n + parseFloat(process.argv[4]) || o),
                (t.humidity = parseFloat(process.argv[5]) || 0),
                (t.o2Excess = 0.01 * parseFloat(process.argv[6]) || 0),
                (t.airExcess = 0.01 * parseFloat(process.argv[7]) || 0),
                (t.pAtm = parseFloat(process.argv[8]) || 101325),
                (t.NROptions.verbose = "true" == process.argv[2])),
              t
            );
          })();
        i.verbose && s.debug(`"options","args":${JSON.stringify(i, null, 2)}`);
        const c = (t, e = 3) =>
            void 0 !== t
              ? t.toLocaleString(void 0, {
                  minimumFractionDigits: e,
                  maximumFractionDigits: e,
                })
              : NaN,
          d = (t, e, n) => {
            const l = { ...t },
              a = Object.values(l).reduce((t, e) => t + e);
            for (const t in l) l[t] = l[t] / a;
            return (
              n || s.debug(`"normalize", "name": "${e}", "total": ${a}`), l
            );
          },
          _ = ({ k0: t, k1: e, k2: n, Substance: l }) =>
            0 == t || "-" == t
              ? (s.debug(`"Thermal Cond func called for '${l}' without coffs"`),
                () => 0)
              : (s) => 3.6 * (t + e * s + n * s ** 2),
          m = ({ u0: t, u1: e, u2: n, Substance: l }) =>
            0 == t || "-" == t
              ? (s.debug(`"Viscosity func called for '${l}' without coffs"`),
                () => 0)
              : (s) => t + e * s + n * s ** 2,
          f = {
            "energy/mol": (t) => c(t * u.kJtoBTU()) + " Btu/mol",
            "mass/mol": (t) => c(t) + " lb/lbmol",
            heat_flow: (t) => c(t * u.kJtoBTU() * 1e-6) + " MMBtu/h",
            heat_flux: (t) => c((t * u.kJtoBTU()) / u.m2toft2()) + " Btu/h-ft²",
            fouling_factor: (t) =>
              c((t * u.m2toft2() * u.KtoR()) / u.kJtoBTU()) + " h-ft²-°F/Btu",
            "energy/mass": (t, e) =>
              c((t * u.kJtoBTU()) / u.kgtolb(), e) + " Btu/lb",
            "energy/vol": (t) =>
              c((t * u.kJtoBTU()) / u.mtoft() ** 3) + " Btu/ft³",
            area: (t) => c(10.763910417 * t) + " ft²",
            length: (t) => c(u.mtoft(t)) + " ft",
            lengthC: (t) => c(u.mtoin(t)) + " in",
            lengthInv: (t) => c(t / u.mtoft()) + " 1/ft",
            temp: (t) => c(u.KtoR(t)) + " °R",
            tempC: (t, e) => c(u.CtoF(t - n), e) + " °F",
            pressure: (t) => c(0.0001450377 * t) + " psi",
            mass: (t) => c(0.0022046244202 * t) + " lb",
            mass_flow: (t, e) => c(u.kgtolb(t), e) + " lb/h",
            barrel_flow: (t, e = 0.84) =>
              c(u.kgtolb(t) / u.BPDtolb_h(1, e) / 1e3) + " x10³ BPD",
            vol_flow: (t) => c(t * u.mtoft() ** 3) + " ft³/h",
            cp: (t) => c(0.238845896627 * t) + " Btu/lb-°F",
            cp_mol: (t) => c(0.238845896627 * t) + " Btu/lb-mol-°F",
            power: (t) => c(3.4121416331 * t) + " Btu/h",
            moist: (t) => c(1e3 * t) + " ÷10³ lb H2O/lb",
            thermal: (t) =>
              c((t * u.kJtoBTU()) / u.KtoR() / u.mtoft()) + " BTU/h-ft-°F",
            convect: (t) =>
              c((t * u.kJtoBTU()) / u.KtoR() / u.mtoft() ** 2) +
              " BTU/h-ft²-°F",
            viscosity: (t) => c(1 * t) + " cP",
            system: { en: "English", es: "Inglés" },
          },
          p = {
            "energy/mol": (t) => c(1 * t) + " kJ/mol",
            "mass/mol": (t) => c(1 * t) + " kg/kmol",
            heat_flow: (t) => c(1e-6 * t) + " MJ/h",
            heat_flux: (t) => c(1 * t) + " W/m²",
            fouling_factor: (t, e) => c(3600 * t, e) + " ÷10³ m²-K/W",
            "energy/mass": (t, e) => c(t, e) + " kJ/kg",
            "energy/vol": (t) => c(1 * t) + " kJ/m³",
            area: (t) => c(1 * t) + " m²",
            length: (t) => c(1 * t) + " m",
            lengthC: (t) => c(100 * t) + " cm",
            lengthInv: (t) => c(1 * t) + " 1/m",
            tempC: (t, e) => c(1 * t - n, 1) + " °C",
            temp: (t) => c(1 * t) + " K",
            pressure: (t) => c(0.001 * t) + " kPa",
            mass: (t) => c(0.001 * t) + " kg",
            mass_flow: (t, e) => c(t, e) + " kg/h",
            barrel_flow: (t, e = 0.84) =>
              c(u.kgtolb(t) / u.BPDtolb_h(1, e) / 1e3) + " x10³ BPD",
            vol_flow: (t) => c(1 * t) + " m³/h",
            cp: (t) => c(1 * t) + " kJ/kg-K",
            cp_mol: (t) => c(1 * t) + " kJ/kmol-K",
            power: (t) => c(1 * t) + " W",
            moist: (t) => c(1e3 * t) + " g H2O/kg",
            thermal: (t) => c(1 * t) + " kJ/h-m-C",
            convect: (t) => c(1 * t) + " kJ/h-m²-C",
            viscosity: (t) => c(1 * t) + " cP",
            system: { en: "SI", es: "SI" },
          };
        t.exports = {
          options: i,
          unitConv: u,
          newtonRaphson: (t, e, n, l, a, r) => {
            let o, u, i, c, d, _, m, f;
            "function" != typeof e &&
              ((r = a), (a = l), (l = n), (n = e), (e = null));
            const p = l || {},
              h = void 0 === p.tolerance ? 1e-7 : p.tolerance,
              g = void 0 === p.epsilon ? 222e-17 : p.epsilon,
              $ = void 0 === p.h ? 1e-4 : p.h,
              C = 1 / $,
              O = void 0 === p.maxIterations ? 20 : p.maxIterations;
            for (c = 0; c++ < O; ) {
              if (
                ((u = t(n)),
                e
                  ? (i = e(n))
                  : ((d = t(n + $)),
                    (_ = t(n - $)),
                    (m = t(n + 2 * $)),
                    (f = t(n - 2 * $)),
                    (i = ((f - m + 8 * (d - _)) * C) / 12)),
                Math.abs(i) <= g * Math.abs(u))
              )
                return (
                  s.error(
                    `Newton-Raphson (${a}): failed to converged due to nearly zero first derivative`
                  ),
                  !1
                );
              if (((o = n - u / i), Math.abs(o - n) <= h * Math.abs(o)))
                return (
                  r ||
                    s.debug(
                      `"Newton-Raphson", "func":"${a}", "var converged to":${o}, "iterations":${c}`
                    ),
                  o
                );
              n = o;
            }
            return (
              s.error(
                `Newton-Raphson (${a}): Maximum iterations reached (${O})`
              ),
              !1
            );
          },
          logger: s,
          round: c,
          roundDict: (t = {}) => {
            for (const [e, s] of Object.entries(t))
              isNaN(s) || "" === s || (t[e] = c(s));
          },
          linearApprox: ({ x1: t, x2: e, y1: n, y2: l }) => {
            if ("number" != typeof n)
              return (
                s.error(
                  `call for linearApprox with incorrect value type for y1: ${n}`
                ),
                () => 0
              );
            if (t == e || null == e || null == l) return () => n;
            const a = (l - n) / (e - t);
            return (e) => a * (e - t) + n;
          },
          viscosityApprox: ({ t1: t, t2: e, v1: n, v2: l }) => {
            if ("number" != typeof n)
              return (
                s.error(
                  `call for viscosityApprox with incorrect value type for v1: ${n}`
                ),
                () => 0
              );
            if (t == e || null == e || null == l) return () => n;
            const a = Math.log(n / l) / (1 / t - 1 / e),
              r = n * Math.exp(-a / t);
            return (t) => r * Math.exp(a / t);
          },
          initSystem: (t) => {
            if ("string" != typeof t)
              return (
                i.verbose &&
                  s.warn(
                    `invalid type (${t}) for unit system, using default SI`
                  ),
                p
              );
            switch (t.toLowerCase()) {
              case "si":
                return p;
              case "english":
              case "en":
                return f;
              default:
                return (
                  s.warn(
                    t.toLowerCase() + " - invalid unit system, using default SI"
                  ),
                  p
                );
            }
          },
          normalize: d,
          flueViscosity: (t, e) => {
            const s = d(e, "flueViscosity"),
              n = m(t[34]),
              l = m(t[31]),
              a = m(t[6]),
              r = m(t[3]),
              o = m(t[2]);
            return (t) =>
              s.CO2 * a(t) +
              s.SO2 * n(t) +
              s.H2O * l(t) +
              s.O2 * o(t) +
              s.N2 * r(t);
          },
          flueThermalCond: (t, e) => {
            const s = d(e, "flueThermalCond"),
              n = _(t[34]),
              l = _(t[31]),
              a = _(t[6]),
              r = _(t[3]),
              o = _(t[2]);
            return (t) =>
              s.CO2 * a(t) +
              s.SO2 * n(t) +
              s.H2O * l(t) +
              s.O2 * o(t) +
              s.N2 * r(t);
          },
          kw_tubes_A312_TP321: (t) => {
            const e = t - n;
            return 3.6 * (14.643 + 0.0164 * e + -2e-6 * e ** 2);
          },
          LMTD: (t, e, s, n, l) => {
            let a = s - e,
              r = n - t;
            return (
              l && ((a = n - t), (r = s - e)),
              Math.abs((a - r) / Math.log(Math.abs(a / r)))
            );
          },
        };
      },
      684: (t) => {
        "use strict";
        t.exports = JSON.parse(
          '[{"ID":0,"Substance":"Carbon","Formula":"C","MW":12.011,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1,"SO2":0,"CO2":1,"H2O":0,"N2":3.773269},{"ID":1,"Substance":"Hydrogen","Formula":"H2","MW":2.0159,"h0":0,"Cp0":14.209,"c0":13.46,"c1":4.6,"c2":-6.85,"c3":3.79,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.5,"SO2":0,"CO2":0,"H2O":1,"N2":1.886634},{"ID":2,"Substance":"Oxygen","Formula":"O2","MW":31.9988,"h0":0,"Cp0":0.922,"c0":0.88,"c1":-0.0001,"c2":0.54,"c3":-0.33,"u0":0.00845,"u1":0.0000472,"u2":-6.56e-9,"k0":0.00733,"k1":0.0000708,"k2":-6.61e-9,"O2":-1,"SO2":0,"CO2":0,"H2O":0,"N2":0},{"ID":3,"Substance":"Nitrogen","Formula":"N2","MW":28.0134,"h0":0,"Cp0":1.042,"c0":1.11,"c1":-0.48,"c2":0.96,"c3":-0.42,"u0":0.00784,"u1":0.0000387,"u2":-5.11e-9,"k0":0.00952,"k1":0.000062,"k2":-6.22e-9,"O2":0,"SO2":0,"CO2":0,"H2O":0,"N2":1},{"ID":4,"Substance":"Nitrogen (atm)","Formula":"N2a","MW":28.158,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0,"SO2":0,"CO2":0,"H2O":0,"N2":1},{"ID":5,"Substance":"Carbon Monoxide","Formula":"CO","MW":28.0104,"h0":-110527,"Cp0":1.041,"c0":1.1,"c1":-0.46,"c2":1,"c3":-0.454,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.5,"SO2":0,"CO2":1,"H2O":0,"N2":1.886634},{"ID":6,"Substance":"Carbon Dioxide","Formula":"CO2","MW":44.0098,"h0":-393522,"Cp0":0.842,"c0":0.45,"c1":1.67,"c2":-1.27,"c3":0.39,"u0":0.00331,"u1":0.0000445,"u2":-6.69e-9,"k0":-0.00958,"k1":0.0000918,"k2":-1.14e-8,"O2":0,"SO2":0,"CO2":1,"H2O":0,"N2":0},{"ID":7,"Substance":"Methane","Formula":"CH4","MW":16.0428,"h0":-74873,"Cp0":2.254,"c0":1.2,"c1":3.25,"c2":0.75,"c3":-0.71,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":2,"SO2":0,"CO2":1,"H2O":2,"N2":7.546539},{"ID":8,"Substance":"Ethane","Formula":"C2H6","MW":30.0697,"h0":-84740,"Cp0":1.766,"c0":0.18,"c1":5.92,"c2":-2.31,"c3":0.29,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3.5,"SO2":0,"CO2":2,"H2O":3,"N2":13.20644},{"ID":9,"Substance":"Propane","Formula":"C3H8","MW":44.0966,"h0":-103900,"Cp0":1.679,"c0":-0.096,"c1":6.95,"c2":-3.6,"c3":0.73,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":5,"SO2":0,"CO2":3,"H2O":4,"N2":18.86634},{"ID":10,"Substance":"n-Butane","Formula":"C4H10","MW":58.1235,"h0":-126200,"Cp0":1.716,"c0":0.163,"c1":5.7,"c2":-1.906,"c3":-0.049,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6.5,"SO2":0,"CO2":4,"H2O":5,"N2":24.52625},{"ID":11,"Substance":"Isobutane","Formula":"iC4H10","MW":58.1235,"h0":-135000,"Cp0":1.547,"c0":0.206,"c1":5.67,"c2":-2.12,"c3":0.183,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6.5,"SO2":0,"CO2":4,"H2O":5,"N2":24.52625},{"ID":12,"Substance":"n-Pentane","Formula":"C5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":13,"Substance":"Isopentane","Formula":"iC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":14,"Substance":"Neopentane","Formula":"nC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":15,"Substance":"n-Hexane","Formula":"C6H14","MW":86.1773,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":9.5,"SO2":0,"CO2":6,"H2O":7,"N2":35.84606},{"ID":16,"Substance":"Ethylene","Formula":"C2H4","MW":28.0538,"h0":52467,"Cp0":1.548,"c0":0.136,"c1":5.58,"c2":-3,"c3":0.63,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3,"SO2":0,"CO2":2,"H2O":2,"N2":11.3198},{"ID":17,"Substance":"Propylene","Formula":"C3H6","MW":42.0807,"h0":20410,"Cp0":1.437,"c0":0.454,"c1":4.06,"c2":-0.934,"c3":-0.133,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":4.5,"SO2":0,"CO2":3,"H2O":3,"N2":16.97971},{"ID":18,"Substance":"n-Butene (Butylene)","Formula":"C4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6,"SO2":0,"CO2":4,"H2O":4,"N2":22.63961},{"ID":19,"Substance":"Isobutene","Formula":"iC4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6,"SO2":0,"CO2":4,"H2O":4,"N2":22.63961},{"ID":20,"Substance":"n-Pentene","Formula":"C5H10","MW":70.1345,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":7.5,"SO2":0,"CO2":5,"H2O":5,"N2":28.29952},{"ID":21,"Substance":"Benzene","Formula":"C6H6","MW":78.1137,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":7.5,"SO2":0,"CO2":6,"H2O":3,"N2":28.29952},{"ID":22,"Substance":"Toluene","Formula":"C7H8","MW":92.1406,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":9,"SO2":0,"CO2":7,"H2O":4,"N2":33.95942},{"ID":23,"Substance":"Xylene","Formula":"C8H10","MW":106.1675,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":10.5,"SO2":0,"CO2":8,"H2O":5,"N2":39.6193},{"ID":24,"Substance":"Acetylene","Formula":"C2H2","MW":26.0379,"h0":226731,"Cp0":1.699,"c0":1.03,"c1":2.91,"c2":-1.92,"c3":0.54,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":2.5,"SO2":0,"CO2":2,"H2O":1,"N2":9.433174},{"ID":25,"Substance":"Naphthalene","Formula":"C10H8","MW":128.1736,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":12,"SO2":0,"CO2":10,"H2O":4,"N2":45.27923},{"ID":26,"Substance":"Methyl alcohol-Methanol","Formula":"CH3OH","MW":32.0422,"h0":-201300,"Cp0":1.405,"c0":0.66,"c1":2.21,"c2":0.81,"c3":-0.89,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1.5,"SO2":0,"CO2":1,"H2O":2,"N2":5.659904},{"ID":27,"Substance":"Ethyl alcohol-Ethanol","Formula":"C2H5OH","MW":46.0691,"h0":-235000,"Cp0":1.427,"c0":0.2,"c1":-4.65,"c2":-1.82,"c3":0.03,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3,"SO2":0,"CO2":2,"H2O":3,"N2":11.3198},{"ID":28,"Substance":"Ammonia","Formula":"NH3","MW":17.0306,"h0":-45720,"Cp0":2.13,"c0":1.6,"c1":1.4,"c2":1,"c3":-0.7,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.75,"SO2":0,"CO2":0,"H2O":1.5,"N2":2.82995},{"ID":29,"Substance":"Sulfur","Formula":"S","MW":32.066,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1,"SO2":1,"CO2":0,"H2O":0,"N2":3.773269},{"ID":30,"Substance":"Hydrogen sulfide","Formula":"H2S","MW":34.0819,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":-0.000545,"u1":0.0000502,"u2":-1.3e-8,"k0":"-","k1":"-","k2":"-","O2":1.5,"SO2":1,"CO2":0,"H2O":1,"N2":5.659904},{"ID":31,"Substance":"Steam (Water vapor)","Formula":"H2O","MW":18.0153,"h0":-241826,"Cp0":1.872,"c0":1.79,"c1":0.107,"c2":0.586,"c3":-0.2,"u0":-0.00596,"u1":0.0000484,"u2":-4.76e-9,"k0":-0.00592,"k1":0.0000718,"k2":-3.03e-8,"O2":0,"SO2":0,"CO2":0,"H2O":1,"N2":0},{"ID":32,"Substance":"Water (liquid)","Formula":"H2Ol","MW":18.0153,"h0":-285830,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0,"SO2":0,"CO2":0,"H2O":1,"N2":0},{"ID":33,"Substance":"Dry Air","Formula":"N2+O2","MW":28.8483,"h0":0,"Cp0":1.004,"c0":1.05,"c1":-0.365,"c2":0.85,"c3":-0.39,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.2095,"SO2":0,"CO2":0,"H2O":0,"N2":0.7905},{"ID":34,"Substance":"Sulfur dioxide","Formula":"SO2","MW":62.059,"h0":-296842,"Cp0":0.624,"c0":0.37,"c1":1.05,"c2":-0.77,"c3":0.21,"u0":-0.00301,"u1":0.0000578,"u2":-1.66e-8,"k0":-0.00188,"k1":0.0000314,"k2":2.7e-8,"O2":0,"SO2":1,"CO2":0,"H2O":0,"N2":0}]'
        );
      },
    },
    e = {};
  function s(n) {
    var l = e[n];
    if (void 0 !== l) return l.exports;
    var a = (e[n] = { exports: {} });
    return t[n](a, a.exports, s), a.exports;
  }
  (() => {
    const {
        round: t,
        logger: e,
        options: n,
        unitConv: l,
        initSystem: a,
        linearApprox: r,
        newtonRaphson: o,
        viscosityApprox: u,
        kw_tubes_A312_TP321: i,
      } = s(170),
      c = s(684),
      { radSection: d } = s(623),
      { convSection: _ } = s(399),
      { shieldSection: m } = s(16),
      { combSection: f } = s(911),
      { browserProcess: p } = s(620),
      h = (t, e) => {
        const s = ((t) => {
          const e = l.BPDtolb_h(l.lbtokg(t.mFluid), t.spGrav),
            s = l.FtoK(t.tIn),
            n = l.FtoK(t.tOut),
            o = t.miuFluidIn,
            c = t.miuFluidOut,
            d = l.CpENtoCpSI(t.cpFluidIn),
            _ = l.CpENtoCpSI(t.cpFluidOut),
            m = l.kwENtokwSI(t.kwFluidIn),
            f = l.kwENtokwSI(t.kwFluidOut);
          return {
            runDistCycle: t.runDistCycle,
            p_atm: t.pAtm,
            t_fuel: t.tFuel,
            t_air: t.tAir,
            t_amb: t.tAmb,
            humidity: t.humidity,
            airExcess: t.airExcess,
            o2Excess: t.o2Excess,
            sp_grav: t.spGrav,
            t_in_conv: s,
            t_out: n,
            m_fluid: e,
            Rfi: l.RfENtoRfSI(t.rfi),
            Rfo: l.RfENtoRfSI(t.rfoConv),
            Rfi_conv: l.RfENtoRfSI(t.rfiConv),
            Rfi_shld: l.RfENtoRfSI(t.rfiShld),
            Rfo_shld: l.RfENtoRfSI(t.rfoShld),
            efficiency: t.effcy,
            duty_rad_dist: t.radDist,
            heat_loss_percent: t.hLoss,
            max_duty: l.BTUtokJ(71527.6),
            miu_fluid: u({ t1: s, v1: o, t2: n, v2: c }),
            Cp_fluid: r({ x1: s, y1: d, x2: n, y2: _ }),
            kw_fluid: r({ x1: s, y1: m, x2: n, y2: f }),
            Material: "A-312 TP321",
            h_conv: l.hcENtohcSI(1.5),
            kw_tube: i,
            Pass_number: 2,
            Pitch_rad: l.intom(16),
            N_rad: 42,
            L_rad: l.fttom(62.094),
            Do_rad: l.intom(8.625),
            Sch_rad: l.intom(0.322),
            Burner_number: 13,
            Do_Burner: 2.24,
            Width_rad: 17.5,
            Length_rad: 64.55,
            Height_rad: 27,
            N_shld: 16,
            L_shld: l.fttom(60),
            Do_shld: l.intom(6.625),
            Pitch_sh_cnv: l.intom(12),
            Sch_sh_cnv: l.intom(0.28),
            Tpr_sh_cnv: 8,
            N_conv: 40,
            L_conv: l.fttom(60),
            Do_conv: l.intom(6.625),
            Nf: l.mtoft(60),
            Tf: l.fttom(0.005),
            Lf: l.fttom(0.08),
            FinType: "Solid",
            FinMaterial: "11.5-13.5Cr",
            FinArrange: "Staggered Pitch",
            verbose: t.verbose,
            unitSystem: t.unitSystem,
            lang: t.lang,
            NROptions: t.NROptions,
            units: a(t.unitSystem),
          };
        })(e);
        0 != s.o2Excess && $(s, t);
        const n = f(s.airExcess, t, s);
        return (
          s.runDistCycle && g(s),
          (n.rad_result = d(s)),
          (n.shld_result = m(s)),
          (n.conv_result = _(s)),
          (n.rad_result.eff_thermal_val = n.rad_result.eff_thermal(
            n.conv_result.Q_stack
          )),
          n
        );
      },
      g = (s) => {
        let n = 0,
          l = !0;
        const a = { ...s.NROptions };
        (a.maxIterations *= 5),
          (a.tolerance *= 0.1),
          (a.epsilon *= 0.1),
          (a.h *= 0.1);
        const r = o(
          (t) => {
            n++, t > 0.3 && t < 1 && (s.duty_rad_dist = t);
            const e = { rad: d(s, l), shld: m(s, l), conv: _(s, l) },
              a =
                Math.abs(e.rad.Q_fluid) +
                Math.abs(e.shld.Q_fluid) +
                Math.abs(e.conv.Q_fluid);
            return (s.duty - a) / a;
          },
          s.duty_rad_dist,
          a,
          "rad_dist_final"
        );
        r > 0.1 && r < 1
          ? (s.duty_rad_dist = r)
          : e.error(
              "external cycle broken, error in rad_dist estimation, using: " +
                s.duty_rad_dist
            ),
          e.info(`duty_rad_dist: ${t(100 * r, 2)}, ext_cycle_reps: ${n}`);
      },
      $ = (s, n) => {
        let l = 0;
        const a = { ...s.NROptions };
        (a.maxIterations *= 5),
          (a.tolerance *= 0.1),
          (a.epsilon *= 0.1),
          (a.h *= 0.1);
        const r = o(
          (t) => {
            l++;
            const e = f(t, n, s, !0);
            return Math.round(1e5 * e.flows["O2_%"] - 1e7 * s.o2Excess);
          },
          0.05,
          a,
          "o2_excess_to_air"
        );
        r && (s.airExcess = r),
          e.info(`'air_excess': ${t(100 * r, 2)}, 'comb_cycle_reps': ${l}`);
      };
    let C = {
      H2: 0.1142,
      N2: 0.0068,
      CO: 0.0066,
      CO2: 0.0254,
      CH4: 0.5647,
      C2H6: 0.1515,
      C3H8: 0.0622,
      C4H10: 0.0176,
      iC4H10: 0.0075,
      C2H4: 0.0158,
      C3H6: 0.0277,
    };
    "undefined" != typeof window
      ? p(C, c, n, h)
      : e.info(JSON.stringify(h(C, n), null, 2));
  })();
})();
