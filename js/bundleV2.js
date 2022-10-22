(() => {
  var t = {
    620 : (t, e, s) => {
      const {compactResult : a} = s(851), {outputFullData : n} = s(669),
                             {graphicData : r} = s(566),
                             {optionsModifier : l} = s(691),
                             {logger : o} = s(170);
      t.exports = {
        browserProcess : (t, e, s, i) => {
          const u = {...s};
          let c = "en";
          const _ = window.location.pathname.split("/");
          _.length > 0 &&
              _.forEach((t => {"es" != t && "es_graph" != t || (c = "es")})),
              s.lang = c;
          const d = (t => {
            if ("" == t)
              return {};
            let e = {};
            for (const s of t) {
              const t = s.split("=", 2);
              1 == t.length
                  ? e[t[0]] = ""
                  : e[t[0]] = decodeURIComponent(t[1].replace(/\+/g, " "))
            }
            return e
          })(window.location.search.substring(1).split("&"));
          if (d !== {} &&
                  (t = ((t, e, s, a) => {
                     const n = {}, r = s.filter((e => e.Formula in t));
                     for (const e in t)
                       if (1 === r.filter((t => t.Formula == e)).length &&
                           "" !== t[e]) {
                         const s = parseFloat(t[e]);
                         s > 0 && s <= 100
                             ? n[e] = s / 100
                             : o.error(`fuel fraction invalid (${s}) for ${e}`)
                       } else
                         "" !== t[e] && void 0 !== t[e] && l(e, t, a);
                     return 0 !== Object.keys(n).length && (e = n), e
                   })(d, t, e, s)),
              _[1].includes("_graph") || _[2].includes("_graph"))
            r(i, t, s);
          else if (_.includes("fullResult") || _.includes("fullResult.html")) {
            const e = i(t, s);
            n(e, d, c, s.unitSystem)
          } else
            a(i, t, s, u)
        }
      }
    },
    851 : (t, e, s) => {
      const {
        stringCompactResult : a
      } = s(144),
     {logger : n, defaultFuel : r} = s(170), l = "base", o = "modified",
     i = (t = {}, e = "") => !(
         t && t.time && t.time.date && !(Date.now() - t.time.date > 2592e5) ||
         (n.info(`Deleting ${e} old result`), localStorage.removeItem(e), 0));
      t.exports = {
        compactResult : (t, e, s, n) => {
          const u = t(e, s), c = {date : Date.now()};
          let _, d, m, f, p;
          localStorage.setItem(`${s.title}`,
                               JSON.stringify({result : u, opt : s, time : c})),
              s.title === l
                  ? (m = s, _ = u, p = JSON.parse(localStorage.getItem(o)),
                     i(p, o) && (p = !1), f = p ? p.opt : {},
                     d = p ? p.result : {})
                  : (f = s, d = u, p = JSON.parse(localStorage.getItem(l)),
                     i(p, l) && (p = !1),
                     p || (p = {result : t(r, n), opt : n}), m = p ? p.opt : {},
                     _ = p ? p.result : {});
          const h = document.getElementById("loader-wrapper");
          h && h.remove();
          const g = document.getElementById("output-com");
          g && (g.innerHTML = a(s.unitSystem, _, m, d, f))
        }
      }
    },
    669 : (t, e, s) => {
      const {
        stringRadResult : a,
        stringShldResult : n,
        stringConvResult : r,
        stringCombResult : l
      } = s(144),
     {logger : o} = s(170);
      t.exports = {
        outputFullData : (t, e, s, i) => {
          o.debug(JSON.stringify(e, null, 2));
          const u = document.getElementById("loader-wrapper");
          u && u.remove();
          const c = document.getElementById("output-com");
          c && (c.textContent = l(s, t, i));
          const _ = document.getElementById("output-radiant");
          _ && (_.textContent = a(s, t.rad_result, i));
          const d = document.getElementById("output-shield");
          d && (d.textContent = n(s, t.shld_result, i));
          const m = document.getElementById("output-convective");
          m && (m.textContent = r(s, t.conv_result, i))
        }
      }
    },
    566 : (t, e, s) => {
      const {logger : a, unitConv : n} = s(170), {draw : r} = s(597),
                                    l = document.getElementById("output-sect");
      t.exports = {
        graphicData : (t, e, s) => {
          const o = {...a};
          a.error = () => 0, a.default = () => 0, a.info = () => 0,
          a.debug = () => 0;
          const i = [], u = `${s.title}_graph`;
          let c, _, d = JSON.parse(localStorage.getItem(u));
          if (d && (Object.keys(d).length > 5 || !d.time ||
                            Date.now() - d.time.date > 2592e5
                        ? (localStorage.removeItem(u), d = {})
                        : c = d[`${window.location.search}`]),
              c)
            return r(c, s), o.debug(`"Drawing stored case: ${u}"`),
                   void (l && l.remove());
          switch (s.graphRange *= .01, s.graphVar) {
          case "humidity":
            _ = "humidity", s.graphRange *= 100;
            break;
          case "air_excess":
            _ = "airExcess";
            break;
          case "o2_excess":
            _ = "o2Excess";
            break;
          case "m_fluid":
            _ = "mFluid", s.graphRange *= 1e5;
            break;
          default:
            _ = "tOut", s.graphRange *= 100
          }
          const m = s.graphPoints, f = s.graphRange;
          let p = s[_] - f / 2;
          p < 0 && (p = 0),
              o.info(
                  `Var: ${_}, centerValue: ${s[_]}, range: ${f}, points: ${m}`);
          for (let a = 0; a < m; a++) {
            s[_] = p + a * f / m;
            const r = t(e, s);
            i[a] = {
              m_fluid : .001 * n.lb_htoBPD(n.kgtolb(r.rad_result.m_fluid)),
              m_fluid_si : n.BarrelsTom3(
                  .001 * n.lb_htoBPD(n.kgtolb(r.rad_result.m_fluid))),
              t_out : n.KtoF(r.rad_result.t_out),
              t_out_si : n.KtoC(r.rad_result.t_out),
              o2_excess : r.flows["O2_%"] < 11 ? r.flows["O2_%"] : 11,
              air_excess : r.flows["air_excess_%"] > 0 ? r.flows["air_excess_%"]
                                                       : 0,
              humidity : r.debug_data["humidity_%"],
              rad_tg_out : n.KtoF(r.rad_result.tg_out),
              rad_tg_out_si : n.KtoC(r.rad_result.tg_out),
              cnv_tg_out : n.KtoF(r.conv_result.tg_out),
              cnv_tg_out_si : n.KtoC(r.conv_result.tg_out),
              m_fuel : r.rad_result.m_fuel ? n.kgtolb(r.rad_result.m_fuel) : 0,
              m_fuel_si : r.rad_result.m_fuel ? r.rad_result.m_fuel : 0,
              efficiency : r.rad_result.eff_thermal_val
                               ? r.rad_result.eff_thermal_val
                               : 0,
              rad_dist : r.rad_result["%"] < 1
                             ? Math.round(1e5 * r.rad_result["%"]) / 1e3
                             : 0,
              cnv_dist : r.conv_result["%"] < 1
                             ? Math.round(1e5 * r.conv_result["%"]) / 1e3
                             : 0,
              rad_cnv_dist : 0 != r.conv_result["%"]
                                 ? r.rad_result["%"] / r.conv_result["%"]
                                 : 0,
              co2_emiss : Math.round(100 * r.rad_result.co2_emiss) / 100
            }
          }
          d || (d = {}),
              d[`${window.location.search}`] = i, d.time = {date : Date.now()},
              localStorage.setItem(u, JSON.stringify(d)), console.log(i),
              r(i, s), l && l.remove()
        }
      }
    },
    597 : (t, e, s) => {
      const {initSystem : a} = s(170),
                          n = (a("en"), document.getElementById("graph-title"));
      function r(
          t, e, s, r,
          {svg : l, data : o, margin : i, innerHeight : u, innerWidth : c}) {
        const _ = (c -= i.left) < 900 ? "1.15em" : "1.5em",
              d = c < 900 ? .08 * u : .1 * u, m = d, f = _,
              p = c < 1300 ? "2em" : .03 * c;
        let h, g = e => e[t.graphVar], $ = "";
        switch (t.graphVar) {
        case "humidity":
          h = "es" == t.lang ? "Humedad Relativa" : "Humidity", $ = "[%]",
          h += ` @ ${a(t.unitSystem).tempC(t.tAir, 0)} (Temp. Amb.)`;
          break;
        case "air_excess":
          h = "es" == t.lang ? "Exceso de Aire" : "Air Excess", $ = "[%]";
          break;
        case "m_fluid":
          h = "es" == t.lang ? "Flujo de Residuo" : "Residue Flow",
          "si" == t.unitSystem.toLowerCase()
              ? (g = e => e[t.graphVar + "_si"], $ = "[10³-m3/d]")
              : $ = "[10³-BPD]";
          break;
        default:
          h = "es" == t.lang ? "Temperatura de Salida de Residuo"
                             : "Residue Outlet Temperature",
          "si" == t.unitSystem.toLowerCase()
              ? (g = e => e[t.graphVar + "_si"], $ = "[C]")
              : $ = "[F]"
        }
        n.innerHTML = h;
        const C = t => t[e];
        let b, O = "";
        switch (e) {
        case "co2_emiss":
          b = "es" == t.lang ? "Emisiones de CO₂" : "CO₂ Emissions",
          O = "es" == t.lang ? "[t/año]" : "[t/year]";
          break;
        case "m_fuel":
          b = "es" == t.lang ? "Flujo de Combustible" : "Fuel Mass Flow",
          "si" == t.unitSystem.toLowerCase() ? (e += "_si", O = "[kg/h]")
                                             : O = "[lb/h]";
          break;
        case "efficiency":
          b = "es" == t.lang ? "Eficiencia Térmica" : "Thermal Efficiency",
          O = "[%]", b += " (@ NHV)";
          break;
        case "cnv_tg_out":
          b = "es" == t.lang ? "Temperatura de Chimenea" : "Stack Temperature",
          "si" == t.unitSystem.toLowerCase() ? (e += "_si", O = "[C]")
                                             : O = "[F]";
          break;
        case "rad_tg_out":
          b = "es" == t.lang ? "Temperatura de Arco Radiante"
                             : "Radiant Flue Temperature",
          "si" == t.unitSystem.toLowerCase() ? (e += "_si", O = "[C]")
                                             : O = "[F]";
          break;
        case "rad_cnv_dist":
          b = "es" == t.lang ? "Absorción de Calor (Rad/Conv)"
                             : "Heat Absorption (Rad/Conv)",
          O = "[Adim]";
          break;
        case "rad_dist":
          b = "es" == t.lang ? "Distribución Radiante" : "Radiant Distribution",
          O = `${b} [%]`;
          break;
        case "cnv_dist":
          b = "es" == t.lang ? "Distribución Convectiva"
                             : "Convective Distribution",
          O = `${b} [%]`
        }
        const w = `${b}`, v = d3.extent(o, g),
              k = d3.scaleLinear().range([ 0, c ]).domain(v).nice(),
              N = d3.scaleLinear()
                      .range([ u, 0 ])
                      .domain([
                        d3.min(o, (t => .997 * t[e])),
                        d3.max(o, (t => 1.003 * t[e]))
                      ])
                      .nice(),
              y = d3.axisBottom(k).tickSize(-u).tickPadding(15),
              S = d3.axisLeft(N).ticks(8).tickSize(-c).tickPadding(10),
              F = l.append("g").attr(
                  "transform",
                  `translate(${s + 1.25 * i.left},${r + i.top / 2})`),
              A = F.append("g").call(y).attr("transform", `translate(0,${u})`);
        A.select(".domain").remove(),
            A.selectAll(".tick")
                .selectAll("line")
                .attr("stroke-dasharray", 3)
                .attr("stroke-width", .1),
            A.selectAll(".tick")
                .selectAll("text")
                .attr("fill", "#646a6c")
                .attr("font-size", _),
            A.append("text")
                .attr("class", "axis-label")
                .attr("y", -10)
                .attr("x", .5 * c)
                .attr("fill", "#8E8883")
                .attr("font-size", m)
                .text($);
        const T = F.append("g").call(S).attr("fill", "#FEF8F3");
        T.selectAll(".domain").remove(),
            T.selectAll(".tick")
                .selectAll("line")
                .attr("stroke-dasharray", 3)
                .attr("stroke-width", .1),
            T.selectAll(".tick")
                .selectAll("text")
                .attr("fill", "#646a6c")
                .attr("font-size", f),
            T.append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", 30)
                .attr("x", .5 * -u)
                .attr("fill", "#8E8883")
                .attr("font-size", d)
                .attr("text-anchor", "middle")
                .text(O),
            F.selectAll("circle")
                .data(o)
                .enter()
                .append("circle")
                .attr("fill", "red")
                .attr("opacity", "0.3")
                .attr("cy", (t => N(C(t))))
                .attr("y", (t => C(t)))
                .attr("x", (t => g(t)))
                .transition()
                .duration(500)
                .delay(((t, e) => 10 * e))
                .attr("cx", (t => k(g(t))))
                .attr("r", 3);
        const M =
            d3.line().x((t => k(g(t)))).y((t => N(C(t)))).curve(d3.curveBasis),
              R = F.append("path")
                      .attr("d", M(o))
                      .attr("fill", "none")
                      .attr("stroke", "steelblue")
                      .attr("stroke-linejoin", "round")
                      .attr("stroke-linecap", "round"),
              H = R.node().getTotalLength();
        R.attr("stroke-dashoffset", H)
            .attr("stroke-dasharray", H)
            .transition()
            .duration(1e3)
            .ease(d3.easeSin)
            .attr("stroke-width", 2)
            .attr("stroke-dashoffset", 0),
            F.append("text")
                .attr("class", "title")
                .attr("fill", "#635F5D")
                .attr("y", -10)
                .attr("x", .5 * c)
                .attr("font-size", p)
                .attr("text-anchor", "middle")
                .text(w)
      }
      t.exports = {
        draw : function(t = [], e = {}) {
          const s = .85 * window.innerHeight, a = .975 * window.innerWidth;
          let n = a > 1300 ? 2 : 1;
          const l = {top : 150, right : 0, bottom : 100, left : 50},
                o = (s - l.top - l.bottom) / (1 == n ? 2 : 3),
                i = (a - 1.5 * l.left - l.right) / n, u = {
                  svg : d3.select("svg")
                            .attr("width", a)
                            .attr("height", 6 * s / (2 * n))
                            .attr("class", "line-chart")
                            .style("border", "1px solid lightgray"),
                  data : t,
                  margin : l,
                  innerHeight : o,
                  innerWidth : i
                };
          r(e, "m_fuel", 0, 0 * s, u),
              r(e, "rad_tg_out", 1 == n ? 0 : a / 2, 1 == n ? .5 * s : 0, u),
              r(e, "cnv_tg_out", 0, 1 == n ? 1 * s : s / 2, u),
              r(e, "rad_cnv_dist", 1 == n ? 0 : a / 2, 1 == n ? 1.5 * s : s / 2,
                u),
              r(e, "efficiency", 0, 1 == n ? 2 * s : s, u),
              r(e, "co2_emiss", 1 == n ? 0 : a / 2, 1 == n ? 2.5 * s : s, u)
        }
      }
    },
    144 : (t, e, s) => {
      const {
        round : a,
        initSystem : n
      } = s(170),
     r =
          (t, e, s, n, r, l = 1, o = 2) => {
            let i = isNaN(e[n]) ? e[n] : a(e[n] * l, o);
            void 0 === i && (i = 0);
            let u = "";
            return r && (u = isNaN(s[n]) ? s[n] : a(s[n] * l, o)),
                   void 0 === u && (u = 0),
                   `<tr>\n    <td class="tg-simple">${
                       t}</td>\n    <td class="tg-simple">${
                       i}</td>\n    <td class="tg-simple">${u}</td>\n  </tr>`
          },
     l =
          (t, e, s, a) => {
            let n = "";
            return a && (n = s),
                   `<tr>\n    <td class="tg-simple">${
                       t}</td>\n    <td class="tg-simple">${
                       e}</td>\n    <td class="tg-simple">${n}</td>\n  </tr>`
          },
     o = '<tr><td colspan="3"></td></tr>',
     i = t => `<tr><td class="tg-mqa1" colspan="3">${t}</td></tr>`,
     u = t => `<tr><td colspan="3">${t}</td></tr>`;
      t.exports = {
        stringRadResult : (t, e, s) => {
          const r = n(s);
          let l;
          return l = "es" == t ? "Resultados sección radiante:"
                               : "Radiant section results:",
                 l += `\n\n  t_in:     ${r.tempC(e.t_in)}\n  t_out:    ${
                     r.tempC(e.t_out)}\n  Tw:       ${
                     r.tempC(e.Tw)}\n\n  tg_out:   ${
                     r.tempC(e.tg_out)}\n\n  rfi:      ${
                     r.fouling_factor(e.rfi)}\n\n  Q_in:     ${
                     r.heat_flow(e.Q_in)}\n    Q_rls:    ${
                     r.heat_flow(e.Q_rls)}\n    Q_air:    ${
                     r.heat_flow(e.Q_air)}\n    Q_fuel:   ${
                     r.heat_flow(e.Q_fuel)}\n\n  Q_out:    ${
                     r.heat_flow(e.Q_out)}\n    Q_flue:   ${
                     r.heat_flow(e.Q_flue)}\n    Q_losses: ${
                     r.heat_flow(e.Q_losses)}\n    Q_shld:   ${
                     r.heat_flow(e.Q_shld)}\n    Q_R:      ${
                     r.heat_flow(e.Q_R)}\n      Q_conv: ${
                     r.heat_flow(e.Q_conv)}\n      Q_rad:  ${
                     r.heat_flow(e.Q_rad)}\n    Q_fluid:  ${
                     r.heat_flow(e.Q_fluid)}\n\n  duty_rad:   ${
                     a(100 * e["%"],
                       2)}%\n\n  At:       ${r.area(e.At)}\n  Ar:       ${
                     r.area(e.Ar)}\n  Acp:      ${r.area(e.Acp)}\n  αAcp:     ${
                     r.area(
                         e.aAcp)}\n  Aw:       ${r.area(e.Aw)}\n  Aw/αAcp:  ${
                     a(e.Aw_aAcp)}\n  Alpha:    ${a(e.Alpha)}\n  Acp_sh:   ${
                     r.area(e.Acp_sh)}\n  Ai:        ${
                     r.area(
                         e.Ai)}\n\n  hi:     ${r.convect(e.hi)}\n  h_conv:   ${
                     r.convect(
                         e.h_conv)}\n\n  MBL:      ${e.MBL} ft\n  GPpres:   ${
                     a(1 * e.Pco2 + 1 * e.Ph2o)} atm\n  PL:       ${
                     e.PL} atm-ft\n  GEmiss:   ${e.emiss}\n  F:        ${
                     e.F}\n\n  kw_tube:  ${r.thermal(e.kw_tube)}\n  kw_fluid: ${
                     r.thermal(e.kw_fluid)}\n  kw_flue:  ${
                     r.thermal(e.kw_flue)}\n\n  miu_fluid:${
                     r.viscosity(e.miu_fluid)}\n  miu_flue: ${
                     r.viscosity(e.miu_flue)}\n\n  Cp_fluid: ${
                     r.cp(e.Cp_fluid)}\n  Cp_flue:  ${
                     r.cp(e.Cp_flue)}\n\n  Cp_fuel:  ${
                     r.cp(e.Cp_fuel)}\n  Cp_air:   ${
                     r.cp(e.Cp_air)}\n  Pr_fluid: ${e.Prandtl}\n  Re_fluid: ${
                     e.Reynolds}\n\n  TUBING:\n    Material:       ${
                     e.TUBING.Material}\n    No Tubes Wide:  ${
                     e.TUBING.Nt}\n    No Tubes:       ${
                     e.TUBING.N}\n    Wall Thickness: ${
                     r.lengthC(e.TUBING.Sch)}\n    Outside Di:     ${
                     r.lengthC(e.TUBING.Do)}\n    Pitch:          ${
                     r.lengthC(e.TUBING.S_tube)}\n    Ef. Length:     ${
                     r.length(e.TUBING.L)}\n\n  `,
                 "\n" + l
        },
        stringShldResult : (t, e, s) => {
          const r = n(s);
          let l;
          return l = "es" == t ? "Resultados sección de escudo:"
                               : "Shield section results:",
                 l += `\n\n  t_in:     ${r.tempC(e.t_in)}\n  t_out:    ${
                     r.tempC(e.t_out)}\n  Tw:       ${
                     r.tempC(e.Tw)}\n\n  tg_in:      ${
                     r.tempC(e.tg_in)}\n  tg_out:     ${
                     r.tempC(e.tg_out)}\n\n  rfi:      ${
                     r.fouling_factor(e.rfi)}\n  rfo:      ${
                     r.fouling_factor(e.rfo)}\n\n  LMTD:     ${
                     r.temp(e.LMTD)}\n  DeltaA:     ${
                     r.temp(e.DeltaA)}\n  DeltaB:     ${
                     r.temp(e.DeltaB)}\n  DeltaA-B:   ${
                     r.temp(e.DeltaA - e.DeltaB)}\n  Log(A/B):   ${
                     a(Math.log(e.DeltaA / e.DeltaB))}\n\n  Q_flue:   ${
                     r.heat_flow(
                         e.Q_flue)}\n    M_fuel xCp x(Tg_in-Tg_out)\n  Q_Shield: ${
                     r.heat_flow(e.Q_R)}\n    Q_rad:   ${
                     r.heat_flow(e.Q_rad)}\n    Q_conv:  ${
                     r.heat_flow(e.Q_conv)}\n  Q_fluid:  ${
                     r.heat_flow(e.Q_fluid)}\n\n  duty_shld: ${
                     a(100 * e["%"],
                       2)}%\n\n  At:    ${r.area(e.At)}\n  An:     ${
                     r.area(e.An)}\n  Ai:      ${r.area(e.Ai)}\n  Gn:    ${
                     a(e.Gn / 3600)} lb/sec-ft²\n\n  Uo:    ${
                     r.convect(e.Uo)}\n  R_int: ${a(e.R_int, 6)}\n  R_tub: ${
                     a(e.R_tube, 6)}\n  R_ext: ${a(e.R_ext, 6)}\n\n  hi: ${
                     r.convect(e.hi)}\n  hr:   ${r.convect(e.hr)}\n  ho:   ${
                     r.convect(
                         e.ho)}\n  hc:   ${r.convect(e.hc)}\n\n  kw_tube:  ${
                     r.thermal(e.kw_tube)}\n  kw_fluid: ${
                     r.thermal(e.kw_fluid)}\n  kw_flue:  ${
                     r.thermal(e.kw_flue)}\n\n  miu_fluid:${
                     r.viscosity(e.miu_fluid)}\n  miu_flue: ${
                     r.viscosity(e.miu_flue)}\n\n  Cp_fluid: ${
                     r.cp(e.Cp_fluid)}\n  Cp_flue:  ${
                     r.cp(e.Cp_flue)}\n\n  Pr_flue:  ${
                     e.PrandtlFlue}\n  Re_flue:  ${
                     e.ReynoldsFlue}\n  Pr_fluid: ${e.Prandtl}\n  Re_fluid: ${
                     e.Reynolds}\n\n  TUBING:\n    Material:       ${
                     e.TUBING.Material}\n    No Tubes Wide:  ${
                     e.TUBING.Nt}\n    No Tubes:       ${
                     e.TUBING.N}\n    Wall Thickness: ${
                     r.lengthC(e.TUBING.Sch)}\n    Outside Di:     ${
                     r.lengthC(e.TUBING.Do)}\n    Tran Pitch:     ${
                     r.lengthC(e.TUBING.S_tube)}\n    Long Pitch:     ${
                     r.lengthC(e.TUBING.S_tube)}\n    Ef. Length:     ${
                     r.length(e.TUBING.L)}\n\n  `,
                 "\n" + l
        },
        stringConvResult : (t, e, s) => {
          const r = n(s);
          let l;
          return l = "es" == t ? "Resultados sección convectiva:"
                               : "Convective section results:",
                 l += `\n\n  t_in:      ${r.tempC(e.t_in)}\n  t_out:     ${
                     r.tempC(e.t_out)}\n  Tw:        ${
                     r.tempC(e.Tw)}\n  t_fin_avg: ${
                     r.tempC(e.t_fin)}\n  t_fin_max: ${
                     r.tempC(e.t_fin_max)}\n\n  tg_in:      ${
                     r.tempC(e.tg_in)}\n  tg_stack:   ${
                     r.tempC(e.tg_out)}\n\n  rfi:      ${
                     r.fouling_factor(e.rfi)}\n  rfo:      ${
                     r.fouling_factor(e.rfo)}\n\n  LMTD:     ${
                     r.temp(e.LMTD)}\n  DeltaA:     ${
                     r.temp(e.DeltaA)}\n  DeltaB:     ${
                     r.temp(e.DeltaB)}\n  DeltaA-B:     ${
                     r.temp(e.DeltaA - e.DeltaB)}\n  Log(|A/B|):   ${
                     a(Math.log(
                         Math.abs(e.DeltaA / e.DeltaB)))}\n\n  Q_flue:   ${
                     r.heat_flow(e.Q_flue)}\n  Q_conv:   ${
                     r.heat_flow(e.Q_conv)}\n  Q_fluid:  ${
                     r.heat_flow(e.Q_fluid)}\n\n  Q_stack:  ${
                     r.heat_flow(e.Q_stack)}\n\n  duty_conv: ${
                     a(100 * e["%"],
                       2)}%\n\n  At:   ${r.area(e.At)}\n  An:    ${
                     r.area(e.An)}\n  Ao:     ${r.area(e.Ao)}\n  Afo:    ${
                     r.area(e.Afo)}\n  Apo:    ${r.area(e.Apo)}\n  Ai:     ${
                     r.area(
                         e.Ai)}\n  Fin_eff:  ${a(100 * e.Ef, 2)}%\n  Gn:    ${
                     a(e.Gn / 3600)} lb/sec-ft²\n\n  Uo:    ${
                     r.convect(e.Uo)}\n  R_int: ${a(e.R_int, 6)}\n  R_tub: ${
                     a(e.R_tube, 6)}\n  R_ext: ${a(e.R_ext, 6)}\n\n  hi:   ${
                     r.convect(e.hi)}\n  hr:   ${r.convect(e.hr)}\n  ho:   ${
                     r.convect(e.ho)}\n  hc:   ${r.convect(e.hc)}\n  he:   ${
                     r.convect(e.he)}\n\n  kw_fin:   ${
                     r.thermal(e.kw_fin)}\n  kw_tube:  ${
                     r.thermal(e.kw_tube)}\n  kw_fluid: ${
                     r.thermal(e.kw_fluid)}\n  kw_flue:  ${
                     r.thermal(e.kw_flue)}\n\n  miu_fluid:${
                     r.viscosity(e.miu_fluid)}\n  miu_flue: ${
                     r.viscosity(e.miu_flue)}\n\n  Cp_fluid: ${
                     r.cp(e.Cp_fluid)}\n  Cp_flue:  ${
                     r.cp(e.Cp_flue)}\n\n  Pr_flue:  ${
                     e.PrandtlFlue}\n  Re_flue:  ${
                     e.ReynoldsFlue}\n  Pr_fluid: ${e.Prandtl}\n  Re_fluid: ${
                     e.Reynolds}\n\n  TUBING:\n    No Tubes:    ${
                     e.TUBING
                         .N}\n    Other props: Same as shield\n\n  FINNING:\n    Material:   ${
                     e.FINING.Material}\n    Type:       ${
                     e.FINING.Type}\n    Height:     ${
                     r.lengthC(e.FINING.Height)}\n    Thickness:  ${
                     r.lengthC(e.FINING.Thickness)}\n    Dens:       ${
                     r.lengthInv(e.FINING.Dens)},\n    Arrange:    ${
                     e.FINING.Arrange}\n  `,
                 "\n" + l
        },
        stringCombResult : (t, e, s) => {
          const r = n(s);
          let l;
          return l = "es" == t
                         ? `\nDatos de entrada\n  (en caso de no haber sido introducidos, el\n  simulador selecciona los valores predeterminados)\n\n  Sistema de unidades:         ${
                               e.debug_data
                                   .unitSystem}\n  Presión atmosférica:         ${
                               e.debug_data
                                   .atmPressure}\n  Temperatura de referencia:   ${
                               e.debug_data
                                   .ambTemperature}\n  Temperatura del combustible: ${
                               e.debug_data
                                   .fuelTemperature}\n  Temperatura del aire:        ${
                               e.debug_data
                                   .airTemperature}\n\n  Humedad Relativa:            ${
                               a(e.debug_data["humidity_%"],
                                 0)} %\n  Volumen de N2 en aire seco:  ${
                               e.debug_data["dryAirN2_%"]} %\n  Volumen de O2 en aire seco:  ${
                               e.debug_data["dryAirO2_%"]} %\n\n  Presión del aire seco:       ${
                               e.debug_data
                                   .dryAirPressure}\n  Presión de vapor de agua:    ${
                               e.debug_data
                                   .waterPressure}\n\n  Fracción molar de H2O: ${
                               e.debug_data["H2OPressure_%"]} ÷10²\n  Fracción molar de N2: ${
                               e.debug_data["N2Pressure_%"]} ÷10²\n  Fracción molar de O2: ${
                               e.debug_data["O2Pressure_%"]} ÷10²\n  Humedad del aire: ${
                               e.debug_data
                                   .moisture} aire seco\n\n\n  Temperatura de entrada (residuo): ${
                               r.tempC(
                                   e.conv_result.t_in_given,
                                   0)}\n  Temperatura de salida (residuo):  ${
                               r.tempC(e.rad_result.t_out,
                                       0)}\n\n  Cp (Tb) promedio (residuo): ${
                               e.debug_data
                                   .cpFluidTb}\n\n  Gravedad específica (residuo): ${
                               a(e.debug_data.spGrav,
                                 2)}\n  Flujo másico (residuo):        ${
                               r.mass_flow(
                                   e.rad_result.m_fluid,
                                   1)}\n\n  Calor absorbido ("duty") requerido: ${
                               r.heat_flow(
                                   e.rad_result
                                       .duty_total)}\n  Calor absorbido ("duty") calculado: ${
                               r.heat_flow(
                                   e.rad_result.duty + e.shld_result.duty +
                                   e.conv_result
                                       .duty)}\n\n  Eficiencia térmica (NHV): ${
                               a(e.rad_result.eff_thermal_val,
                                 2)}%\n  Eficiencia térmica (GHV): ${
                               a(e.rad_result.eff_gcv_val,
                                 2)}%\n\n  Emisiones de CO2: ${
                               a(e.rad_result.co2_emiss,
                                 0)} ton/año\n\nMoles de gases de combustión por mol de combustible\n\n  Moles totales:               ${
                               a(e.flows.total_flow,
                                 3)}\n  Moles totales (a base seca): ${
                               a(e.flows.dry_total_flow,
                                 3)}\n\n  Componentes\n    N2:   ${
                               e.products.N2}\n    O2:   ${
                               e.products.O2}\n    H2O:  ${
                               e.products.H2O}\n    CO2:  ${
                               e.products.CO2}\n    SO2:  ${
                               e.products
                                   .SO2}\n\n  Porcentajes molares en base húmeda\n    N2:  ${
                               a(e.flows["N2_%"])} %\n    O2:  ${
                               a(e.flows["O2_%"])} %\n    H2O: ${
                               a(e.flows["H2O_%"])} %\n    CO2: ${
                               a(e.flows["CO2_%"])} %\n    SO2: ${
                               e.flows["SO2_%"] ||
                               "0.000"} %\n\n  Exceso de aire: ${
                               a(e.flows["air_excess_%"],
                                 2)} %\n  Moles O2 estequiométrico/mol combustible: ${
                               a(e.flows.O2_mol_req_theor,
                                 3)}\n\n  Relaciones Aire/Combustible (A/C):\n\n  A/C molar húmeda:  ${
                               a(e.flows.AC, 3)}\n  A/C másica húmeda: ${
                               a(e.flows.AC_mass,
                                 3)}\n  A/C molar estequiométrica (aire seco):    ${
                               a(e.flows.AC_theor_dryAir,
                                 3)}\n  A/C másica estequiométrica (aire húmedo): ${
                               a(e.flows.AC_mass_theor_moistAir,
                                 3)}\n\n  Poder Calorífico Neto  (NCV): ${
                               e.flows.NCV}\n  Poder Calorífico Bruto (GCV): ${
                               e.flows.GCV}\n\n  Flujo másico (combustible): ${
                               r.mass_flow(e.rad_result.m_fuel,
                                           1)}\n  Flujo másico (gases):       ${
                               r.mass_flow(e.rad_result.m_flue,
                                           1)}\n  Flujo másico (aire):        ${
                               r.mass_flow(
                                   e.rad_result.m_air,
                                   1)}\n\n  Peso molecular (combustible): ${
                               r["mass/mol"](
                                   e.flows
                                       .fuel_MW)}\n  Peso molecular (gases):       ${
                               e.flows
                                   .flue_MW}\n\n  Calor específico, Cp(T_comb) combustible: ${
                               e.flows
                                   .Cp_fuel}\n  Calor específico, Cp(T_comb) gases:       ${
                               e.flows.Cp_flue}\n`
                         : `\nInput Data\n  (Default values will be taken in case\n    of no entries)\n\n  Unit System:           ${
                               e.debug_data
                                   .unitSystem}\n  Atmospheric Pressure:  ${
                               e.debug_data
                                   .atmPressure}\n  Reference Temperature: ${
                               e.debug_data
                                   .ambTemperature}\n  Air Temperature:       ${
                               e.debug_data
                                   .airTemperature}\n  Fuel Temperature:      ${
                               e.debug_data
                                   .fuelTemperature}\n\n  Relative Humidity:     ${
                               a(e.debug_data["humidity_%"],
                                 0)} %\n  N2 volume in dry air:  ${
                               e.debug_data["dryAirN2_%"]} %\n  O2 volume in dry air:  ${
                               e.debug_data["dryAirO2_%"]} %\n\n  Dry Air Pressure:     ${
                               e.debug_data
                                   .dryAirPressure}\n  Water Vapor Pressure:  ${
                               e.debug_data
                                   .waterPressure}\n\n  Molar Fraction H2O:  ${
                               e.debug_data["H2OPressure_%"]} ÷10²\n  Molar Fraction N2:  ${
                               e.debug_data["N2Pressure_%"]} ÷10²\n  Molar Fraction O2:  ${
                               e.debug_data["O2Pressure_%"]} ÷10²\n  Air Moisture: ${
                               e.debug_data
                                   .moisture} dry Air\n\n\n  Process fluid Inlet Temperature:  ${
                               r.tempC(
                                   e.conv_result.t_in_given,
                                   0)}\n  Process fluid Outlet Temperature: ${
                               r.tempC(
                                   e.rad_result.t_out,
                                   0)}\n\n  Process fluid Sp. Heat, Cp(Tb): ${
                               e.debug_data
                                   .cpFluidTb}\n\n  Process fluid Sp Grav:   ${
                               a(e.debug_data.spGrav,
                                 2)}\n  Process fluid Mass Flow: ${
                               r.mass_flow(e.rad_result.m_fluid,
                                           1)}\n\n  Required Duty:   ${
                               r.heat_flow(
                                   e.rad_result
                                       .duty_total)}\n  Calculated Duty: ${
                               r.heat_flow(
                                   e.rad_result.duty + e.shld_result.duty +
                                   e.conv_result
                                       .duty)}\n\n  Heater Thermal Efficiency (NHV): ${
                               a(e.rad_result.eff_thermal_val,
                                 2)}%\n  Heater Thermal Efficiency (GHV): ${
                               a(e.rad_result.eff_gcv_val,
                                 2)}%\n\n  CO2 Emissions: ${
                               a(e.rad_result.co2_emiss,
                                 0)} ton/year\n\nFlue gas moles and components (per mol of fuel)\n\n  Total moles:     ${
                               a(e.flows.total_flow, 3)}\n  Total moles dry: ${
                               a(e.flows.dry_total_flow,
                                 3)}\n\n  Components\n    N2:  ${
                               e.products.N2}\n    O2:  ${
                               e.products.O2}\n    H2O: ${
                               e.products.H2O}\n    CO2: ${
                               e.products.CO2}\n    SO2: ${
                               e.products
                                   .SO2}\n\n  Components (Wet basis)\n    N2:  ${
                               a(e.flows["N2_%"], 3)} %\n    O2:  ${
                               a(e.flows["O2_%"], 3)} %\n    H2O: ${
                               a(e.flows["H2O_%"], 3)} %\n    CO2: ${
                               a(e.flows["CO2_%"], 3)} %\n    SO2: ${
                               e.flows["SO2_%"] ||
                               "0.000"} %\n\n  Air excess: ${
                               a(e.flows["air_excess_%"],
                                 3)} %\n  Moles O2 stoichiometric/mol of fuel: ${
                               a(e.flows.O2_mol_req_theor,
                                 3)}\n\n  A/F Ratios\n  A/C molar (wet basis):   ${
                               a(e.flows.AC, 3)}\n  A/C mass (wet basis):    ${
                               a(e.flows.AC_mass,
                                 3)}\n  A/C molar stoichiometric (dry basis): ${
                               a(e.flows.AC_theor_dryAir,
                                 3)}\n  A/C mass stoichiometric (dry basis):  ${
                               a(e.flows.AC_mass_theor_moistAir,
                                 3)}\n\n  Fuel Mass Flow:           ${
                               r.mass_flow(e.rad_result.m_fuel,
                                           1)}\n  Flue Gas Mass Flow:       ${
                               r.mass_flow(e.shld_result.m_flue,
                                           1)}\n  Combustion Air Mass Flow: ${
                               r.mass_flow(e.rad_result.m_air,
                                           1)}\n\n  Fuel MW:             ${
                               r["mass/mol"](
                                   e.flows
                                       .fuel_MW)}\n  Fuel Sp. Heat, Cp(Tf):   ${
                               e.flows
                                   .Cp_fuel}\n  Fuel Net Calorific Value, NCV:   ${
                               e.flows
                                   .NCV}\n  Fuel Gross Calorific Value, GCV: ${
                               e.flows.GCV}\n\n  Flue MW:             ${
                               e.flows.flue_MW}\n  Flue Sp. Heat, Cp(Tf):   ${
                               e.flows.Cp_flue}\n`,
                 l
        },
        stringCompactResult : (t, e, s, c = {}, _ = {}) => {
          const d = null != _.title, m = n(t);
          return `<table class="tg">\n<thead>\n  <tr>\n    <th>(${
              e.debug_data.unitSystem}) <b>Caso</b></th>\n    <th>${
              s.title.toUpperCase()}</th>\n    <th>${
              d ? "MODIFICADO" : ""}</th>\n  </tr>\n</thead>\n<tbody>\n  ${
              i("Condiciones de Proceso")}\n  \n  ${
              u("Residuo atmosférico")}\n  <tr>\n    <td class="tg-simple">▪ Flujo volumétrico, ${
              m.barrel_flowC(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.barrel_flowC(s.mFluid, 0,
                             !0)}</td>\n    <td class="tg-simple">${
              d ? m.barrel_flowC(_.mFluid, 0, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de entrada, ${
              m.tempC(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.tempC(e.conv_result.t_in_given, 0,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(c.conv_result.t_in_given, 0, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Temperatura de salida, ${
              m.tempC(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.tempC(e.rad_result.t_out, 0,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(c.rad_result.t_out, 0, !0) : ""}</td>\n  </tr>\n  ${
              l("▪ Gravedad específica", a(e.debug_data.spGrav, 2),
                a(c.debug_data.spGrav, 2),
                d)}\n  <tr>\n    <td class="tg-simple">▪ Calor absorbido total, ${
              m.heat_flow(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.heat_flow(e.rad_result.duty_total, 3,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.rad_result.duty_total, 3, !0)
                : ""}</td>\n  </tr>\n  ${
              u("▪ Factores de ensuciamiento")}\n  <tr>\n    <td class="tg-simple">· Rfi (interno) radiante, ${
              m.fouling_factor(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.fouling_factor(e.rad_result.rfi, 3,
                               !0)}</td>\n    <td class="tg-simple">${
              d ? m.fouling_factor(c.rad_result.rfi, 3, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Rfi interno escudo/convectivo, ${
              m.fouling_factor(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.fouling_factor(e.conv_result.rfi, 3,
                               !0)}</td>\n    <td class="tg-simple">${
              d ? m.fouling_factor(c.conv_result.rfi, 3, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Rfo externo escudo/convectivo, ${
              m.fouling_factor(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.fouling_factor(e.conv_result.rfo, 3,
                               !0)}</td>\n    <td class="tg-simple">${
              d ? m.fouling_factor(c.conv_result.rfo, 3, !0)
                : ""}</td>\n  </tr>\n  \n  ${
              i("Condiciones de Combustión")}\n  <tr>\n    <td class="tg-simple">Exceso de Oxígeno, % (BH)</td>\n    <td class="tg-simple">${
              a(e.flows["O2_%"], 2)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows["O2_%"], 2)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Exceso de aire, %</td>\n    <td class="tg-simple">${
              a(e.flows["air_excess_%"], 0)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows["air_excess_%"], 0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Temperatura del aire de combustión, ${
              m.tempC(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.tempC(s.tAir, 0, !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(_.tAir, 0, !0) : ""}</td>\n  </tr>\n  ${
              r("Humedad relativa, %", e.debug_data, c.debug_data, "humidity_%",
                d, 1, 0)}\n  ${
              r("Pérdidas por radiación al ambiente, %", s, _, "hLoss", d, 100,
                1)}\n  \n  ${i("Características del Combustible")}\n  ${
              f = "Composición (100%)",
      `<tr><td colspan="3"><b>${f}</b></td></tr>`}\n  ${
              r("Metano (CH4)", e.fuel, c.fuel, "CH4", d, 100)}\n  ${
              r("Etano (C2H6)", e.fuel, c.fuel, "C2H6", d, 100)}\n  ${
              r("Propano (C3H8)", e.fuel, c.fuel, "C3H8", d, 100)}\n  ${
              r("n-Butano (C4H10)", e.fuel, c.fuel, "C4H10", d, 100)}\n  ${
              r("i-Butano (C4H10)", e.fuel, c.fuel, "iC4H10", d, 100)}\n  ${
              r("Etileno (C2H4)", e.fuel, c.fuel, "C2H4", d, 100)}\n  ${
              r("Propileno (C3H6)", e.fuel, c.fuel, "C3H6", d, 100)}\n  ${
              r("Monóxido de Carbono (CO)", e.fuel, c.fuel, "CO", d, 100)}\n  ${
              r("Hidrógeno (H2)", e.fuel, c.fuel, "H2", d, 100)}\n  ${
              r("Nitrógeno (N2)", e.fuel, c.fuel, "N2", d, 100)}\n  ${
              r("Dióxido de Carbono (CO2)", e.fuel, c.fuel, "CO2", d,
                100)}\n  ${
              o}\n  <tr>\n    <td class="tg-simple">Peso molecular, ${
              m["mass/mol"](0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m["mass/mol"](e.flows.fuel_MW, 3,
                            !0)}</td>\n    <td class="tg-simple">${
              d ? m["mass/mol"](c.flows.fuel_MW, 3, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Calor específico Cp (T comb), ${
              m.cp(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.cp(e.flows.Cp_fuel_val, 3,
                   !0)}</td>\n    <td class="tg-simple">${
              d ? m.cp(c.flows.Cp_fuel_val, 3, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Poder Calorífico Neto (NCV), ${
              m["energy/mass"](0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m["energy/mass"](e.flows.NCV_val, 0,
                               !0)}</td>\n    <td class="tg-simple">${
              d ? m["energy/mass"](c.flows.NCV_val, 0, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">Poder Calorífico Bruto (GCV), ${
              m["energy/mass"](0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m["energy/mass"](e.flows.GCV_val, 0,
                               !0)}</td>\n    <td class="tg-simple">${
              d ? m["energy/mass"](c.flows.GCV_val, 0, !0)
                : ""}</td>\n  </tr>\n\n  ${i("Resultados")}\n  ${
              u(`▪ Flujos másicos, ${
                  m.mass_flow(
                      0, 0, 0,
                      !0)}`)}\n  <tr>\n    <td class="tg-simple">· Residuo atmosférico</td>\n    <td class="tg-simple">${
              m.mass_flow(e.rad_result.m_fluid, 1,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.mass_flow(c.rad_result.m_fluid, 1, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Combustible</td>\n    <td class="tg-simple">${
              m.mass_flow(e.rad_result.m_fuel, 2,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.mass_flow(c.rad_result.m_fuel, 2, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Aire</td>\n    <td class="tg-simple">${
              m.mass_flow(e.rad_result.m_air, 2,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.mass_flow(c.rad_result.m_air, 2, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Gases de combustión</td>\n    <td class="tg-simple">${
              m.mass_flow(e.rad_result.m_flue, 2,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.mass_flow(c.rad_result.m_flue, 2, !0)
                : ""}</td>\n  </tr>\n  ${
              o}\n  <tr>\n    <td class="tg-simple">▪ Humedad del aire, ${
              m.moist(0, 0, 0, !0)} aire seco</td>\n    <td class="tg-simple">${
              m.moist(e.flows.moisture_val, 3,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.moist(c.flows.moisture_val, 3, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ (A/C) Masa BH</td>\n    <td class="tg-simple">${
              a(e.flows.AC_mass, 3)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows.AC_mass, 3)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ (A/C) Volumen BH</td>\n    <td class="tg-simple">${
              a(e.flows.AC, 3)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows.AC, 3) : ""}</td>\n  </tr>\n  ${
              o}\n  <tr>\n    <td class="tg-simple">▪ Suministro Térmico Combustible, ${
              m.heat_flow(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.heat_flow(e.rad_result.Q_rls, 3,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.rad_result.Q_rls, 3, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Suministro Térmico Total, ${
              m.heat_flow(0, 0, 0, !0)}</td>\n    <td class="tg-simple">${
              m.heat_flow(e.rad_result.Q_in, 3,
                          !0)}</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.rad_result.Q_in, 3, !0)
                : ""}</td>\n  </tr>\n  ${o}\n  ${
              u(`▪ Calor Absorbido, ${
                  m.heat_flow(
                      0, 0, 0,
                      !0)}`)}\n  <tr>\n    <td class="tg-simple">· Sección Radiante - (%)</td>\n    <td class="tg-simple">${
              m.heat_flow(e.rad_result.duty, 3, !0)} - (${
              a(100 * e.rad_result["%"], 2)})</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.rad_result.duty, 3, !0) +
                      ` - (${a(100 * c.rad_result["%"], 2)})`
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Sección Escudo - (%)</td>\n    <td class="tg-simple">${
              m.heat_flow(e.shld_result.duty, 3, !0)} - (${
              a(100 * e.shld_result["%"],
                2)})</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.shld_result.duty, 3, !0) +
                      ` - (${a(100 * c.shld_result["%"], 2)})`
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Sección Convectiva - (%)</td>\n    <td class="tg-simple">${
              m.heat_flow(e.conv_result.duty, 3, !0)} - (${
              a(100 * e.conv_result["%"],
                2)})</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.conv_result.duty, 3, !0) +
                      ` - (${a(100 * c.conv_result["%"], 2)})`
                : ""}</td>\n  </tr>\n  ${o}\n  ${
              u(`▪ Temperaturas, ${
                  m.tempC(
                      0, 0, 0,
                      !0)}`)}\n  <tr>\n    <td class="tg-simple">· Pared (tubos radiantes)</td>\n    <td class="tg-simple">${
              m.tempC(e.rad_result.Tw, 0,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(c.rad_result.Tw, 0, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Arco radiante</td>\n    <td class="tg-simple">${
              m.tempC(e.rad_result.tg_out, 0,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(c.rad_result.tg_out, 0, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Chimenea</td>\n    <td class="tg-simple">${
              m.tempC(e.conv_result.tg_out, 0,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(c.conv_result.tg_out, 0, !0)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Máxima Aletas (perímetro)</td>\n    <td class="tg-simple">${
              m.tempC(e.conv_result.t_fin_max, 0,
                      !0)}</td>\n    <td class="tg-simple">${
              d ? m.tempC(c.conv_result.t_fin_max, 0, !0)
                : ""}</td>\n  </tr>\n  ${o}\n  ${
              u("▪ Análisis de gases de combustión (Base Húmeda)")}\n  <tr>\n    <td class="tg-simple">· CO2, %</td>\n    <td class="tg-simple">${
              a(e.flows["CO2_%"], 2)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows["CO2_%"], 2)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· N2, %</td>\n    <td class="tg-simple">${
              a(e.flows["N2_%"], 2)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows["N2_%"], 2)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· O2, %</td>\n    <td class="tg-simple">${
              a(e.flows["O2_%"], 2)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows["O2_%"], 2)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· H2O, %</td>\n    <td class="tg-simple">${
              a(e.flows["H2O_%"], 2)}</td>\n    <td class="tg-simple">${
              d ? a(c.flows["H2O_%"], 2) : ""}</td>\n  </tr>\n  ${o}\n  ${
              l("▪ Emisiones de CO2, ton/año", a(e.rad_result.co2_emiss, 0),
                a(c.rad_result.co2_emiss, 0), d)}\n  ${o}\n\n  ${
              u(`▪ Pérdidas de calor, ${
                  m.heat_flow(
                      0, 0, 0,
                      !0)}`)}\n  <tr>\n    <td class="tg-simple">· Por chimenea - (% del total)</td>\n    <td class="tg-simple">${
              m.heat_flow(e.conv_result.Q_stack, 3, !0)} - (${
              a(100 * e.conv_result.Q_stack / e.rad_result.Q_in,
                2)})</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.conv_result.Q_stack, 3, !0) +
                      ` - (${
                          a(100 * c.conv_result.Q_stack / c.rad_result.Q_in,
                            2)})`
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">· Al ambiente - (% del total)</td>\n    <td class="tg-simple">${
              m.heat_flow(e.rad_result.Q_losses, 3, !0)} - (${
              a(100 * e.rad_result.Q_losses / e.rad_result.Q_in,
                2)})</td>\n    <td class="tg-simple">${
              d ? m.heat_flow(c.rad_result.Q_losses, 3, !0) +
                      ` - (${
                          a(100 * c.rad_result.Q_losses / c.rad_result.Q_in,
                            2)})`
                : ""}</td>\n  </tr>\n  ${
              o}\n  <tr>\n    <td class="tg-simple">▪ Eficiencia Térmica @ NHV, %</td>\n    <td class="tg-simple">${
              a(e.rad_result.eff_thermal_val,
                2)}</td>\n    <td class="tg-simple">${
              d ? a(c.rad_result.eff_thermal_val, 2)
                : ""}</td>\n  </tr>\n  <tr>\n    <td class="tg-simple">▪ Eficiencia Térmica @ GHV, %</td>\n    <td class="tg-simple">${
              a(e.rad_result.eff_gcv_val, 2)}</td>\n    <td class="tg-simple">${
              d ? a(c.rad_result.eff_gcv_val, 2)
                : ""}</td>\n  </tr>\n</tbody>\n</table>`;
          var f
        }
      }
    },
    911 : (t, e, s) => {
      const {
        newtonRaphson : a,
        options : n,
        logger : r,
        round : l,
        roundDict : o,
        initSystem : i,
        normalize : u,
        flueViscosity : c,
        flueThermalCond : _
      } = s(170),
     d = s(684), m = {O2 : .2095, N2 : .7905, H2O : 0},
     f =
          (t, e = {}) => {
            const s = Object.values(t).reduce(((t, e) => t + e)),
                  a = Math.abs(1 - s) <= 3e-12;
            return a || (e.err += `[fuel fraction not equal to 1, total: ${
                             s}. fuels: ${Object.keys(t)}],`),
                   a
          },
     p = ({c0 : t, c1 : e, c2 : s, c3 : a, MW : n, Substance : o}, i, u) => c =>
          (c < 250 && !u &&
               r.debug(`"Cp0", "temp": "${l(c)}","Msg": "${
                   o} bellow range for Cp0 formula"`),
           c > 1200 && !u &&
               r.debug(`"Cp0", "temp": "${l(c)}","Msg": "${
                   o} above range for Cp0 formula"`),
           "-" === t
               ? (r.debug(`"Cp0", "Msg": "Wrong use, called for compound ${
                      o}, no data found"`),
                  0)
           : i ? n * (t + e * (.001 * c) + s * (.001 * c) ** 2 +
                      a * (.001 * c) ** 3)
               : t + e * (.001 * c) + s * (.001 * c) ** 2 +
                     a * (.001 * c) ** 3),
     h =
          (t, e, s) => {
            if (0 === t.length)
              return t => 0;
            let a = JSON.parse(JSON.stringify(t));
            f(t) || (a = u(a, "Cp_multicomp", s));
            const n = d.filter((t => t.Formula in a)), r = [];
            let l = 0;
            for (const t in a)
              r[l] = s => a[t] * p(n.filter((e => e.Formula == t))[0], e)(s),
              l++;
            return r.reduce(((t, e) => s => t(s) + e(s)), (t => 0))
          },
     g =
          (t, e) => {
            if (0 === t.length)
              return t => 0;
            let s = JSON.parse(JSON.stringify(t));
            f(t) || (s = u(s, "MW_multicomp", e));
            const a = d.filter((t => t.Formula in s));
            let n = 0;
            for (const t in s)
              n += a.filter((e => e.Formula == t))[0].MW * s[t];
            return n
          },
     $ =
          (t, e) => {
            const s = t - n.tempToK;
            return 610.78 * Math.exp(s / (s + 238.3) * 17.2694) * e * .01
          },
     C = (t, e) =>
          "-" === t.Cp0
              ? "-" === t.h0
                    ? (r.warn(`wrong use of deltaH func, called for compound ${
                           t.Substance} without data`),
                       void 0 === e ? () => 0 : 0)
                : void 0 === e ? () => t.h0
                               : t.h0
          : void 0 === e ? e => t.h0 + (e - n.tempAmbRef) *
                                           p(t, !0, !0)((n.tempAmbRef + e) / 2)
                         : t.h0 + (e - n.tempAmbRef) *
                                      p(t, !0, !0)((n.tempAmbRef + e) / 2),
     b = (t, e, s, a = !1) => {
       const r = C(d[6]), l = C(d[34]), o = C(d[2]);
       let i = C(d[31]);
       return !0 === a && (i = C(d[32])), void 0 === s && (s = n.tAmb),
              void 0 === e ? e => t.CO2 * r(e) + t.SO2 * l(e) + t.H2O * i(e) -
                                  C(t)(s) - t.O2 * o(s)
                           : t.CO2 * r(e) + t.SO2 * l(e) + t.H2O * i(e) -
                                 C(t)(s) - t.O2 * o(s)
     }, O = (t, e, s, a, n = !1) => {
       let r = 0;
       for (const l in t) {
         if (l in e)
           continue;
         const o = s.filter((t => t.Formula == l))[0];
         r += t[l] * b(o, void 0, a, n)(a)
       }
       return r
     };
      t.exports = {
        combSection : (t, e, s, p) => {
          p || r.debug(`"airExcess", "value": ${t}`);
          const b = i(s.unitSystem),
                w = ((t, e) => {
                  const s = $(t, e);
                  return d[31].MW * s / (g(m) * (n.pAtm - s))
                })(s.t_air, s.humidity),
                v = {
                  err : "",
                  atmPressure : b.pressure(s.p_atm),
                  fuelTemperature : b.tempC(s.t_fuel, 0),
                  ambTemperature : b.tempC(s.t_amb, 0),
                  airTemperature : b.tempC(s.t_air, 0),
                  "humidity_%" : s.humidity,
                  "dryAirN2_%" : l(79.05, 2),
                  "dryAirO2_%" : l(20.95, 2),
                  moisture : b.moist(w),
                  spGrav : s.sp_grav,
                  cpFluidTb : b.cp(s.Cp_fluid((s.t_in_conv + s.t_out) / 2)),
                  unitSystem : b.system[s.lang]
                },
                k = d.filter(((t, s, a) => t.Formula in e));
          let N = {...e};
          f(e, v) || (N = u(e, "combSection")), ((t, e, s = {}) => {
            const a = Math.abs(e.length - Object.keys(t).length);
            0 === a || (r.error(`fuels not found in the database: ${a}`),
                        s.err +=
                        `[some fuels aren't in the database, #badFuels: ${a}],`)
          })(N, k, v);
          const y = {O2 : 0, N2 : 0, H2O : 0, CO2 : 0, SO2 : 0}, S = {...m};
          ((t, e, s) => {
            for (const a of t)
              for (const t in e)
                if ("N2" != t)
                  e[t] += a[t] * s[a.Formula];
                else {
                  if ("N2" == a.Formula || '"N2a' == a.Formula) {
                    e[t] += s[a.Formula];
                    continue
                  }
                  e[t] += a.O2 * s[a.Formula] * 3.7732696897374702
                }
          })(k, y, N),
              t - 1e-6 < 0 && (t = 0),
              s.humidity - 1e-6 < 0 && (s.humidity = 0);
          let F = y.O2, A = F * (1 + t);
          if (y.O2 <= 0 || y.N2 < 0)
            r.error(
                `airExcess set to 0, O2 in fuel >= O2 needed. Products: {O2:${
                    y.O2}, N2:${y.N2}}`),
                A = 0, F = 0, y.N2 = N.N2, y.O2 = -y.O2;
          else {
            const t = $(s.t_air, s.humidity), e = s.p_atm - t;
            S.N2 = .7905 * e / s.p_atm, S.O2 = .2095 * e / s.p_atm,
            S.H2O = t / s.p_atm, v.dryAirPressure = b.pressure(e),
            v.waterPressure = b.pressure(t),
            v["H2OPressure_%"] = l(100 * S.H2O),
            v["N2Pressure_%"] = l(100 * S.N2),
            v["O2Pressure_%"] = l(100 * S.O2), y.O2 = A - y.O2,
            y.N2 += y.O2 * (S.N2 / S.O2), y.H2O += y.N2 * (t / (S.N2 * s.p_atm))
          }
          let T = 0, M = 0;
          for (const t in y)
            T += y[t], "H2O" !== t && (M += y[t]);
          v.CO2 = y.CO2;
          const R = {
            total_flow : T,
            dry_total_flow : M,
            "N2_%" : 100 * y.N2 / T,
            "H2O_%" : 100 * y.H2O / T,
            "CO2_%" : 100 * y.CO2 / T,
            "O2_%" : 100 * y.O2 / T,
            moisture_val : w,
            O2_mol_req_theor : F,
            O2_mass_req_theor : b.mass(F * d[2].MW),
            "air_excess_%" : 100 * s.airExcess,
            AC : A / S.O2,
            AC_theor_dryAir : F / .2095,
            AC_mass : A / S.O2 * g(S) / g(N),
            AC_mass_theor_moistAir : F / S.O2 * g(S) / g(N),
            fuel_MW : g(N),
            Cp_fuel : h(N),
            flue_MW : g(y, p),
            Cp_flue : h(y, !1, p)
          };
          return p ? {flows : R, products : y, debug_data : v}
                   : (s.m_flue_ratio = T * R.flue_MW / g(N),
                      s.m_air_ratio = A / S.O2 * g(S) / g(N),
                      s.Pco2 = y.CO2 / T, s.Ph2o = y.H2O / T, s.Cp_air = h(S),
                      s.Cp_fuel = h(N), s.Cp_flue = R.Cp_flue,
                      s.miu_flue = c(d, y), s.kw_flue = _(d, y),
                      R.Cp_fuel_val = R.Cp_fuel(s.t_fuel),
                      R.Cp_fuel = b.cp(R.Cp_fuel_val),
                      R.Cp_flue = b.cp(R.Cp_flue(s.t_air)),
                      R.flue_MW = b["mass/mol"](R.flue_MW),
                      s.NCV = -O(N, y, k, s.t_amb) / g(N),
                      s.GCV = -O(N, y, k, s.t_amb, !0) / g(N),
                      R.NCV = b["energy/mass"](s.NCV, 0),
                      R.GCV = b["energy/mass"](s.GCV, 0), R.NCV_val = s.NCV,
                      R.GCV_val = s.GCV,
                      s.adFlame = a(
                          ((t, e, s, a) => {
                            void 0 === s && (s = n.tAmb),
                                void 0 === a && (a = 0);
                            const r = d.filter((e => e.Formula in t)),
                                  l = C(d.filter((t => "O2" == t.Formula))[0]),
                                  o = C(d.filter((t => "N2" == t.Formula))[0]),
                                  i = C(d.filter((t => "CO2" == t.Formula))[0]),
                                  u = C(d.filter((t => "H2O" == t.Formula))[0]),
                                  c = C(d.filter((t => "SO2" == t.Formula))[0]),
                                  _ = [];
                            let m = 0;
                            for (const e in t)
                              _[m] = t[e] *
                                     C(r.filter((t => t.Formula == e))[0])(s),
                              m++;
                            return t => (t => e.O2 * l(t) + e.SO2 * c(t) +
                                              e.H2O * u(t) + e.CO2 * i(t) +
                                              e.N2 * o(t) - e.N2 * o(s) -
                                              a * l(s))(t) -
                                        _.reduce(((t, e) => t + e))
                          })(N, y, s.t_amb, A),
                          2e3, s.NROptions, "fuel_adFlame"),
                      r.info(`Adiabatic flame temp: [${l(s.adFlame)} K] ${
                          b.tempC(s.adFlame)}`),
                      o(y), "" == v.err && delete v.err,
                      {flows : R, products : y, debug_data : v, fuel : N})
        }
      }
    },
    399 : (t, e, s) => {
      const {logger : a, LMTD : n, round : r} = s(170);
      t.exports = {
        convSection : (t, e) => {
          let s = t.tg_sh, l = 0, o = t.t_in_sh, i = t.t_in_conv, u = 0;
          const c = (t, e = o) => .5 * (t + e), _ = t.m_fluid, d = t.m_flue,
                m = (e, s = e) => t.Cp_fluid(c(e, s)),
                f = (e, s = e) => t.Cp_flue(c(e, s)), p = e => t.kw_fluid(e),
                h = e => t.kw_tube(e), g = e => t.kw_flue(e),
                $ = e => t.miu_fluid(e), C = e => t.miu_flue(e), b = t.Rfo,
                O = t.Rfi_conv, w = t.L_conv, v = t.Do_conv,
                k = t.Do_conv - 2 * t.Sch_sh_cnv, N = t.Pitch_sh_cnv,
                y = t.N_conv, S = t.Tpr_sh_cnv, F = t.Nf, A = t.Lf, T = t.Tf,
                M = S * N * w - (v + 2 * A * T * F) * w * S,
                R = Math.PI * v * (1 - F * T),
                H = Math.PI * v * (1 - F * T) +
                    Math.PI * F * (2 * A * (v + A) + T * (v + 2 * A)),
                I = H - R, x = y * H * w, D = Math.PI * k ** 2 / 2,
                P = 2 / 3 * (t.Width_rad * t.Length_rad * t.Height_rad) **
                    (1 / 3),
                B = (t.Ph2o + t.Pco2) * P, E = 3.6,
                Q = t => $(t) * E * m(t) / p(t),
                W = t => C(t) * E * f(t) / g(t), G = _ / E / D,
                L = t => G * k / $(t), V = d / M, U = t => V / E * v / C(t),
                K = (t, e = t) => p(t) / k * .023 * L(t) ** .8 * Q(t) **
                                  (1 / 3) * ($(t) / $(e)) ** .14,
                J = (t, e = o) => _ * m(t, e) * (e - t),
                j = (t = c(o, i), e = t, s = i) =>
                    (t => J(t))(s) / x * (v / k) *
                        (O + 1 / K(t, e) + k * Math.log(v / k) / (2 * h(e))) +
                    t,
                q = (t, e) => 2.2 * 2.7431452152 * B ** .5 * (R / H) ** .75;
          let z = (t, e) => g(t) / v * .33 * W(t) ** (1 / 3) * U(t) ** .6;
          const X = (t, e) => 1 / (1 / (z(t, e) + q()) + b),
                Y = 1.36 * h(j(c(i, o), j(c(i, o)))), Z = A + T / 2,
                tt = (X(c(s, l), j(c(i, o), j(c(i, o)))) / (6 * Y * T)) ** .5,
                et = Math.tanh(tt * Z) / (tt * Z), st = et * (.7 + .3 * et),
                at = v + 2 * A,
                nt = st * (.45 * Math.log(at / v) * (st - 1) + 1),
                rt = (t, e) => X(t, e) * (nt * I + R) / H,
                lt = (e, s) => ((t, e, s, a) => {
                  const n = e.Lf, r = 1 / e.Nf - e.Tf,
                        l = .35 + .65 * Math.exp(-.25 * n / r),
                        o = e.Pitch_sh_cnv, i = e.Pitch_sh_cnv,
                        u = e.N_conv / e.Tpr_sh_cnv,
                        c = .7 + (.7 - .8 * Math.exp(-.15 * u ** 2)) *
                                     Math.exp(-o / i),
                        _ = (2 * e.Lf + e.Do_conv) / e.Do_conv,
                        d = (t, e) =>
                            t + (e - t) / ((Math.exp(1.4142 * s * a) +
                                            Math.exp(-1.4142 * s * a)) /
                                           2);
                  return e.Ts = d, (e, s) => (e => .25 * t(e) ** -.35)(e) * l *
                                             c * _ ** .5 * (e / d(e, s)) ** .25
                })(U, t, tt, Z)(e, s);
          z = (t, e) => lt(t, e) * V * f(t) * W(t) ** -.67;
          const ot = t => n(t, o, s, l),
                it = (t, e) => v / k * (1 / K(t, e) + O),
                ut = t => v * Math.log(v / k) / (2 * h(t)),
                ct = (t, e) => 1 / rt(t, e),
                _t = (t, e, s) =>
                    1 / ((t, e, s) => ct(t, s) + ut(s) + it(e, s))(t, e, s),
                dt = (t, e) => d * f(t, e) * (t - e),
                mt = (t, e, s) =>
                    _t(c(s, e), c(t), j(c(t), j(c(t)))) * x * ot(t),
                ft = (t, e = .7 * s) => s - J(t) / (d * f(c(s, e))),
                pt = () => 100 * (mt(u, s, l) - J(u)) / J(u);
          for (l = ft(i), u = i; l - u < 0;)
            u *= 1.002, l = ft(u);
          let ht, gt;
          for (let t = 0; t < 100 && !(Math.abs(pt()) < .001); t++)
            l - u < 0 || pt() <= 0
                ? (ht = u, ht &&gt ? u = (ht + gt) / 2 : u *= 1.001)
                : (gt = u, ht &&gt ? u = (ht + gt) / 2 : u *= .999),
                l = ft(u);
          return i = u,
                 e ||
                     a.default(
                         `CONV, T_in_calc: ${t.units.tempC(u)}, T_in_given: ${
                             t.units.tempC(
                                 t.t_in_conv)}, Tg_stack: ${t.units.tempC(l)}`),
                 t.t_in_conv_calc = i, t.tg_conv = l, {
            t_fin: t.Ts(c(i), j(c(i), j(c(i)))),
                t_fin_max: o +
                    mt(i, s, l) / (x / (t.N_conv / t.Tpr_sh_cnv)) * (v / k) *
                        (O + 1 / K(c(i), j(c(i), j(c(i)))) +
                         k * Math.log(v / k) / (2 * h(j(c(i), j(c(i)))))),
                t_in_given: t.t_in_conv, t_in: i, t_out: o, Tb: c(i),
                Tw: j(c(i), j(c(i))), tg_out: l, tg_in: s, Tb_g: c(s, l),
                rfi: O, rfo: b, LMTD: ot(i), DeltaA: s - o, DeltaB: l - i,
                Q_flue: dt(s, l), Q_fluid: J(i), Q_conv: mt(i, s, l),
                Q_stack: dt(l, t.t_air), duty: J(i), "%": J(i) / t.duty,
                duty_flux: J(i) / x, Cp_fluid: m(i, o), Cp_flue: f(s, l),
                miu_fluid: $(j(c(i))), miu_flue: C(l), kw_fluid: p(c(i)),
                kw_tube: h(j(c(i))), kw_fin: Y, kw_flue: g(c(s, l)),
                Prandtl: r(Q(c(o))), Reynolds: r(L(c(o))),
                PrandtlFlue: r(W(c(o))), ReynoldsFlue: r(U(c(o))), At: x, Ai: D,
                An: M, Ao: H, Apo: R, Afo: I, Ef: nt, Gn: V / E,
                hi: K(c(i), j(c(i), j(c(i)))), hr: q(c(s, l), j(c(i), j(c(i)))),
                ho: X(c(s, l), j(c(i), j(c(i)))),
                hc: z(c(s, l), j(c(i), j(c(i)))),
                he: rt(c(s, l), j(c(i), j(c(i)))),
                j: lt(c(s, l), j(c(i), j(c(i)))),
                gr: (c(s, l), j(c(i), j(c(i))), 2.7431452152),
                Uo: _t(c(s, l), c(i), j(c(i))), R_int: it(c(i), j(c(i))),
                R_tube: ut(j(c(i))), R_ext: ct(c(s, l), j(c(i))), TUBING: {
                  Material: t.Material,
                  Nt: S,
                  N: y,
                  Sch: t.Sch_sh_cnv,
                  Do: v,
                  L: w,
                  S_tube: N
                },
                FINING: {
                  Material: t.FinMaterial,
                  Type: t.FinType,
                  Height: t.Lf,
                  Thickness: t.Tf,
                  Dens: t.Nf,
                  Arrange: t.FinArrange
                }
          }
        }
      }
    },
    623 : (t, e, s) => {
      const {newtonRaphson : a,
             logger : n,
             round : r,
             unitConv :
                 l} = s(170),
                 o = t => {
                   const e = {
                     a : {A : 2.58e-8, B : -39e-9, C : 6.8e-9, D : -2.2e-10},
                     b : {A : -119e-6, B : 56e-6, C : -41e-7, D : -72e-8},
                     c : {A : .21258, B : .2258, C : -.047351, D : .004165}
                   },
                         s = (t, s = e) => e =>
                             s.a[t] * e ** 2 + s.b[t] * e + s.c[t],
                         a = s("A"), n = s("B"), r = s("C"), l = s("D");
                   return e => a(e) + n(e) * t + r(e) * t ** 2 + l(e) * t ** 3
                 }, i = (t, e, s, a, n) => {
                   const r = s * a + t * e, l = n - r;
                   return { Aw: l, Aw_aAcp: l / r }
                 };
      t.exports = {
        radSection : (t, e) => {
          let s = 0, u = 0, c = t.t_out, _ = t.m_fuel, d = 0, m = 0;
          const f = t.t_air, p = t.t_fuel, h = t.t_amb, g = t.t_in_conv,
                $ = (t, e = u) => .5 * (e + t), C = t.Rfi, b = t.N_rad,
                O = t.N_shld, w = t.L_rad, v = t.L_shld, k = t.Do_rad,
                N = t.Do_rad - t.Sch_rad, y = t.Pitch_rad || .394,
                S = t.Pitch_sh_cnv, F = t.h_conv || 30.66,
                A = 2 / 3 * (t.Width_rad * t.Length_rad * t.Height_rad) **
                    (1 / 3),
                T = (t.Ph2o + t.Pco2) * A,
                M = 1 + y / k * .49 / 6 - .09275 * (y / k) ** 2 +
                    .065 * (y / k) ** 3 / 6 + 25e-5 * (y / k) ** 4,
                R = b * Math.PI * k * w, H = b * y * w, I = O / 2 * S * v,
                x = (t => {
                  const e = l.m2toft2(t.Pitch_sh_cnv * t.Tpr_sh_cnv * t.L_shld),
                        s = t.Length_rad * t.Width_rad,
                        a = t.Height_rad * t.Width_rad,
                        n = t.Height_rad * t.Length_rad,
                        r = l.mtoft(t.Pitch_sh_cnv * t.Tpr_sh_cnv),
                        o = (t.Width_rad - r) / 2, i = l.mtoft(4 * t.Pitch_rad),
                        u = Math.sin(Math.acos(o / i)) * i,
                        c = 2 * a + 2 * n + 2 * s - e -
                            (2 * o * u + 2 * r * u) -
                            Math.PI / 4 * 13 * 2.24 ** 2;
                  return l.ft2tom2(c)
                })(t),
                {Aw : D, Aw_aAcp : P} = i(M, H, 1, I, x),
                B = Math.PI * N ** 2 / 2, E = 2.04133464e-7,
                Q = t => ((t, e, s, a, n, r) => {
                  const {Aw_aAcp : l} = i(e, s, a, n, r), u = o(t), c = {
                    a : {A : -5e-4, B : .0072, C : -.0062},
                    b : {A : .0022, B : -.1195, C : .1168},
                    c : {A : .0713, B : .5333, C : -.6473},
                    d : {A : -.0152, B : 1.0577, C : -.154}
                  },
                                   _ = (t, e = c) => s => e.a[t] * s ** 3 +
                                                          e.b[t] * s ** 2 +
                                                          e.c[t] * s + e.d[t],
                                   d = _("A"), m = _("B"), f = _("C");
                  return t => d(l) + m(l) * u(t) + f(l) * u(t) ** 2
                })(T, M, H, 1, I, x)(l.KtoF(t)),
                W = t.duty_rad_dist || .7, G = t.efficiency || .8,
                L = t.heat_loss_percent || .015, V = t.NCV, U = t.GCV,
                K = t.m_fluid, J = (e = _) => t.m_air_ratio * e,
                j = (e = _) => t.m_flue_ratio * e, q = t.Cp_fuel($(p, h)),
                z = t.Cp_air($(f, h)), X = (e, s = e) => t.Cp_fluid($(e, s)),
                Y = (e, s = e) => t.Cp_flue($(e, s)), Z = e => t.kw_fluid(e),
                tt = e => t.kw_tube(e), et = e => t.miu_fluid(e),
                st = K / 3.6 / B, at = t => et(t) * X(t) * 3.6 / Z(t),
                nt = t => st * N / et(t),
                rt = (t, e = t) => Z(t) / N * .023 * nt(t) ** .8 * at(t) **
                                   (1 / 3) * (et(t) / et(e)) ** .14,
                lt = (t, e = t, s = m) =>
                    s / R * (k / N) *
                        (C + 1 / rt(t, e) + N * Math.log(k / N) / (2 * tt(e))) +
                    t,
                ot = t => J(t) * z * (f - h), it = t => t * q * (p - h),
                ut = t => t * V, ct = t => ut(t) + ot(t) + it(t),
                _t = (t, e) => j(e) * Y(t, h) * (t - h), dt = t => ut(t) * L,
                mt = (t, e) => F * R * (t - e),
                ft = (t, e) => Q(t) * E * M * H * (t ** 4 - e ** 4),
                pt = (t, e) => Q(t) * E * 1 * I * (t ** 4 - e ** 4),
                ht = (t, e) => ft(t, e) + mt(t, e),
                gt = (t, e = _, s = lt($(c), lt($(c)))) =>
                    ht(t, s) + pt(t, s) + dt(e) + _t(t, e),
                $t = (t, e) => K * X(e, t) * (t - e);
          if (0 !== c) {
            d = $t(c, g), m = d * W, u = g + d * (1 - W) / (K * X(g, c));
            const r = a((t => $t(c, u) - ht(t, lt($(c), lt($(c))))), 1e3,
                        t.NROptions, "Tg_Tout-seed_radiant", e);
            r && (s = r);
            const l = t => ct(t) - gt(s, t, lt($(c), lt($(c))));
            let o = $t(c, g) / (V * G);
            e || n.debug(`"mass_fuel_seed", "value": "${o}"`),
                o = a(l, o, t.NROptions, "M-fuel_T-seed_radiant", e),
                o && (_ = o), m = ht(s, lt($(c), lt($(c))))
          } else {
            d = ut(_) * G, m = d * W, u = g + d * (1 - W) / (K * X(g));
            let r = g + d / (K * X(u));
            const l = a((t => ct(_) - gt(t, _, lt($(r), lt($(r))))), 1e3,
                        t.NROptions, "Tg_mFuel-seed_radiant", e);
            l && (s = l),
                r = a((t => $t(t, u) - ht(s, lt($(t), lt($(t))))), r,
                      t.NROptions, "Tout_mFuel-seed_radiant", e),
                r && (c = r);
            const o = K * X(u, c) * (c - g),
                  i = t.t_in_conv + o * (1 - W) / (K * X(u, c));
            e || n.info(`t_out, seed: ${r} vs calc: ${c}`),
                e || n.info(`t_in_rad, seed: ${u} vs calc: ${i}`)
          }
          e || n.default(`RADI, T_in_calc: ${t.units.tempC(u)}, M_fuel: ${
                   t.units.mass_flow(_)}, Tg_out: ${t.units.tempC(s)}`),
              t.t_in_rad = u, t.t_out = c, t.tg_rad = s, t.duty = d,
              t.m_flue = j(_), t.m_air = J(_), t.t_w_rad = lt($(c), lt($(c))),
              t.q_rad_sh = pt(s, t.t_w_rad);
          const Ct = {
            m_air : J(),
            m_flue : j(),
            m_fuel : _,
            m_fluid : K,
            t_in : u,
            t_out : c,
            Tw : t.t_w_rad,
            tg_out : s,
            rfi : C,
            Q_in : ct(_),
            Q_rls : ut(_),
            Q_air : ot(_),
            Q_fuel : it(_),
            Q_out : gt(s, _),
            Q_flue : _t(s, _),
            Q_losses : dt(_),
            Q_shld : pt(s, t.t_w_rad),
            Q_conv : mt(s, t.t_w_rad),
            Q_rad : ft(s, t.t_w_rad),
            Q_R : ht(s, t.t_w_rad),
            Q_fluid : $t(c, u),
            At : R,
            Ar : x,
            Ai : B,
            Aw : D,
            Aw_aAcp : P,
            Acp : H,
            aAcp : M * H,
            Acp_sh : I,
            hi : rt($(c), t.t_w_rad),
            h_conv : F,
            duty_total : d,
            duty : m,
            "%" : m / d,
            eff_total : d / ut(_) > 1 ? 100 : 100 * d / ut(_),
            eff_thermal : t => 100 * (ct(_) - dt(_) - t) / ct(_),
            eff_gcv : t => {
              return 100 * (ct(_) - dt(_) - t) /
                     ((t => t * U)(e = _) + ot(e) + it(e));
              var e
            },
            duty_flux : m / R,
            Alpha : M,
            MBL : r(A),
            Pco2 : t.Pco2,
            Ph2o : t.Ph2o,
            PL : r(T),
            F : r(Q(s)),
            emiss : r(o(T)(s)),
            kw_tube : tt(lt($(u))),
            kw_fluid : Z($(u)),
            kw_flue : t.kw_flue(s),
            Cp_fluid : X(u, c),
            Cp_flue : Y(s, h),
            Cp_fuel : q,
            Cp_air : z,
            Prandtl : r(at($(c))),
            Reynolds : r(nt($(c))),
            TUBING : {
              Material : t.Material,
              Nt : 2,
              N : b,
              Sch : t.Sch_rad,
              Do : k,
              L : w,
              S_tube : y
            },
            FINING : "None"
          };
          return Ct.miu_flue = t.miu_flue(s), Ct.miu_fluid = et($(c)), Ct
        }
      }
    },
    16 : (t, e, s) => {
      const {newtonRaphson : a, logger : n, LMTD : r, round : l} = s(170);
      t.exports = {
        shieldSection : (t, e) => {
          let s = t.tg_rad, o = 0, i = t.t_in_rad,
              u = .5 * (t.t_in_rad + t.t_in_conv), c = 0;
          const _ = (t, e = i) => .5 * (t + e), d = t.m_fluid, m = t.m_flue,
                f = (e, s = e) => t.Cp_fluid(_(e, s)),
                p = (e, s = e) => t.Cp_flue(_(e, s)), h = e => t.kw_fluid(e),
                g = e => t.kw_tube(e), $ = e => t.kw_flue(e),
                C = e => t.miu_fluid(e), b = e => t.miu_flue(e), O = t.Rfo_shld,
                w = t.Rfi_shld, v = t.N_shld, k = t.L_shld, N = t.Do_shld,
                y = t.Do_shld - 2 * t.Sch_sh_cnv, S = t.Pitch_sh_cnv,
                F = v * Math.PI * N * k, A = Math.PI * y ** 2 / 2,
                T = v / 2 * (S - N) * k, M = 3.6,
                R = t => C(t) * M * f(t) / h(t),
                H = t => b(t) * M * p(t) / $(t), I = d / M / A,
                x = t => I * y / C(t), D = m / M / T, P = t => D * N / b(t),
                B = (t, e = t) => h(t) / y * .023 * x(t) ** .8 * R(t) **
                                  (1 / 3) * (C(t) / C(e)) ** .14,
                E = t => .092 * t - 34,
                Q = t => $(t) / N * .33 * H(t) ** (1 / 3) * P(t) ** .6,
                W = (t, e = s) => 1 / (1 / (Q(_(t, e)) + E(_(t, e))) + O),
                G = t => d * f(t) * (i - t),
                L = (t, e = t, s = u) =>
                    G(s) / F * (N / y) *
                        (w + 1 / B(t, e) + y * Math.log(N / y) / (2 * g(e))) +
                    t,
                V = (t, e) => N / (y * B(t, e)) + N / y * w,
                U = t => N * Math.log(N / y) / (2 * g(t)),
                K = (t, e = s) => 1 / W(t, e),
                J = (t, e, s, a) =>
                    1 / ((t, e, s, a) => K(t, e) + U(a) + V(s, a))(t, e, s, a),
                j = t.q_rad_sh,
                q = (t, e, s, a, n) => J(s, e, a, n) * F * r(t, i, e, s),
                z = (t, e, s, a, n) => j + q(t, e, s, a, n),
                X = (t, e = i) => d * f(t, e) * (e - t),
                Y = (t, e = o) => m * p(t, e) * (t - e),
                Z = t => Y(s, t) + j - X(u, i),
                tt = t => X(t) - z(t, s, o, _(t), L(_(t), L(_(t))));
          o = a(Z, s - 100, t.NROptions, "Tg_out_shield-1", e),
          c = a(tt, u, t.NROptions, "T_in_shield-1", e);
          let et = 1;
          const st = t => Math.abs(
              (Y(s, t) - q(u, s, t, _(u), L(_(u), L(_(u))))) / Y(s, o));
          for (; st(o) - .001 > 0;) {
            if (!c) {
              n.error("Invalid t_in_calc at shield sect");
              break
            }
            if (u = c, c = a(tt, u, t.NROptions, "T_in_shield-2", !0),
                o = a(Z, s - 58, t.NROptions, "Tg_out_shield-2", !0), et++,
                et > 35) {
              n.debug(`"Tin_shield",  "t_in_sh_calc": ${l(c)}, "t_in_sh_sup": ${
                  l(u)}`),
                  e || n.info(`diff vs error: ${st(o)}-0.001`),
                  n.error(
                      "Max iterations reached for inlet temp calc at shield sect");
              break
            }
          }
          return e || n.default(`SHLD, cycles: ${et}, T_in_calc: ${
                          t.units.tempC(u)}, Tg_out: ${t.units.tempC(o)}`),
                 t.t_in_sh = u, t.tg_sh = o, {
            m_flue: m, t_in_sup: .5 * (t.t_in_rad + t.t_in_conv), t_in: u,
                t_out: i, Tb: _(u), Tw: L(_(u), L(_(u))), tg_out: o, tg_in: s,
                Tb_g: _(s, o), LMTD: r(u, i, s, o), DeltaA: s - i,
                DeltaB: o - u, rfi: w, rfo: O, Q_flue: Y(s, o), Q_fluid: X(u),
                Q_R: z(u, s, o, _(u), L(_(u))), Q_rad: j,
                Q_conv: q(u, s, o, _(u), L(_(u))), Cp_fluid: f(u, i),
                Cp_flue: p(s, o), miu_fluid: C(L(_(u))), miu_flue: b(o),
                duty: G(u), "%": G(u) / t.duty, duty_flux: G(u) / F,
                kw_fluid: h(_(u)), kw_tube: g(L(_(u))), kw_flue: $(_(s, o)),
                Prandtl: l(R(_(i))), Reynolds: l(x(_(i))),
                PrandtlFlue: l(H(_(i))), ReynoldsFlue: l(P(_(i))), At: F, Ai: A,
                An: T, Gn: D, hi: B(_(u)), hi_tw: B(_(u), L(_(u))), hr: E(s),
                ho: W(o), hc: Q(_(s, o)), Uo: J(o, s, _(u), L(_(u), L(_(u)))),
                R_int: V(_(u), L(_(u), L(_(u)))), R_tube: U(L(_(u), L(_(u)))),
                R_ext: K(o, s), TUBING: {
                  Material: t.Material,
                  Nt: t.Tpr_sh_cnv,
                  N: v,
                  Sch: t.Sch_sh_cnv,
                  Do: N,
                  L: k,
                  S_tube: S
                },
                FINING: "None"
          }
        }
      }
    },
    691 : (t, e, s) => {
      const {logger : a, unitConv : n} = s(170);
      t.exports = {
        optionsModifier : (t, e, s) => {
          let r;
          switch (t) {
          case "project_title":
            e[t] && (s.title = e[t]);
            break;
          case "fuel_percent":
            break;
          case "heat_loss":
            r = parseFloat(e[t]), r <= 5 && (s.hLoss = .01 * r);
            break;
          case "rad_dist":
            r = parseFloat(e[t]),
            r >= 40 && r <= 100 && (s.radDist = .01 * r, s.runDistCycle = !1);
            break;
          case "rfi":
            r = parseFloat(e[t]), r >= 0 && (s.rfi = n.RfENtoRfSI(r));
            break;
          case "si_rfi":
            r = parseFloat(e[t]), r >= 0 && (s.rfi = r / 3600);
            break;
          case "rfo":
            r = parseFloat(e[t]), r >= 0 && (s.rfoConv = n.RfENtoRfSI(r),
                                             s.rfoShld = n.RfENtoRfSI(r));
            break;
          case "si_rfo":
            r = parseFloat(e[t]),
            r >= 0 && (s.rfoConv = r / 3600, s.rfoShld = r / 3600);
            break;
          case "rfi_sc":
            r = parseFloat(e[t]), r >= 0 && (s.rfiConv = n.RfENtoRfSI(r),
                                             s.rfiShld = n.RfENtoRfSI(r));
            break;
          case "si_rfi_sc":
            r = parseFloat(e[t]),
            r >= 0 && (s.rfiConv = r / 3600, s.rfiShld = r / 3600);
            break;
          case "rfi_conv":
            r = parseFloat(e[t]), r >= 0 && (s.rfiConv = n.RfENtoRfSI(r));
            break;
          case "rfo_conv":
            r = parseFloat(e[t]), r >= 0 && (s.rfoConv = n.RfENtoRfSI(r));
            break;
          case "rfi_shld":
            r = parseFloat(e[t]), r >= 0 && (s.rfiShld = n.RfENtoRfSI(r));
            break;
          case "rfo_shld":
            r = parseFloat(e[t]), r >= 0 && (s.rfoShld = n.RfENtoRfSI(r));
            break;
          case "t_fuel":
            r = parseFloat(e[t]), r >= 0 && (s.tFuel = n.FtoK(r));
            break;
          case "si_t_fuel":
            r = parseFloat(e[t]), r >= 0 && (s.tFuel = n.CtoK(r));
            break;
          case "unit_system":
            a.debug(`"${t}", "value":"${e[t]}"`), s.unitSystem = e[t];
            break;
          default:
            ((t, e, s) => {
              let a;
              switch (t) {
              case "graph_var":
                s.graphVar = e[t];
                break;
              case "graph_range":
                a = parseFloat(e[t]), a > 0 && (s.graphRange = a);
                break;
              case "graph_points":
                a = parseFloat(e[t]), a > 0 && a <= 200 && (s.graphPoints = a)
              }
            })(t, e, s),
                ((t, e, s) => {
                  let a = parseFloat(e[t]);
                  if (!(a <= 0))
                    switch (t) {
                    case "m_fluid":
                      s.mFluid = a;
                      break;
                    case "si_m_fluid":
                      s.mFluid = n.m3ToBarrels(a);
                      break;
                    case "t_in":
                      s.tIn = n.FtoK(a);
                      break;
                    case "si_t_in":
                      s.tIn = n.CtoK(a);
                      break;
                    case "t_out":
                      s.tOut = n.FtoK(a);
                      break;
                    case "si_t_out":
                      s.tOut = n.CtoK(a);
                      break;
                    case "sp_grav":
                      s.spGrav = a;
                      break;
                    case "miu_in":
                      s.miuFluidIn = a;
                      break;
                    case "miu_out":
                      s.miuFluidOut = a;
                      break;
                    case "kw_in":
                      s.kwFluidIn = a;
                      break;
                    case "kw_out":
                      s.kwFluidOut = a;
                      break;
                    case "cp_in":
                      s.cpFluidIn = n.CpENtoCpSI(a);
                      break;
                    case "si_cp_in":
                      s.cpFluidIn = a;
                      break;
                    case "cp_out":
                      s.cpFluidOut = n.CpENtoCpSI(a);
                      break;
                    case "si_cp_out":
                      s.cpFluidOut = a
                    }
                })(t, e, s),
                ((t, e, s) => {
                  let a = parseFloat(e[t]);
                  switch (t) {
                  case "t_amb":
                    a <= 120 && (s.tAir = n.FtoK(a));
                    break;
                  case "si_t_amb":
                    a <= 50 && (s.tAir = n.CtoK(a));
                    break;
                  case "humidity":
                    a >= 0 && a <= 100 && (s.humidity = a);
                    break;
                  case "p_atm":
                    a >= .01 && a <= 2 && (s.pAtm = a * s.pAtmRef);
                    break;
                  case "si_p_atm":
                    a >= .01 && a < 200 && (s.pAtm = 1e3 * a);
                    break;
                  case "air_excess":
                    a >= 0 && a <= 300 && (s.airExcess = .01 * a);
                    break;
                  case "o2_excess":
                    a >= 0 && a <= 30 && (s.o2Excess = .01 * a)
                  }
                })(t, e, s)
          }
        }
      }
    },
    170 : t => {
      const e =
          (...t) => {
            let e = "" + t[1][0];
            for (let s = 1; s < t[1].length; s++)
              e += " " + t[1][s];
            switch (t[0]) {
            case "DEBUG":
              u.verbose && console.debug(JSON.parse(`{"${t[0]}": ${e}}`));
              break;
            case "INFO":
              console.info(`%c${t[0]}`, "color: lime;", `'${e}'`);
              break;
            case "ERROR":
              console.error(`%c${t[0]}`, "color: tomato;", `'${e}'`);
              break;
            case "WARN":
              console.warn(`%c${t[0]}`, "color: magenta;", `'${e}'`);
              break;
            default:
              console.log(`%c${t[0]}`, "color: dodgerblue;", `'${e}'`)
            }
          },
            s = {
              info : (...t) => e("INFO", t),
              warn : (...t) => e("WARN", t),
              error : (...t) => e("ERROR", t),
              debug : (...t) => e("DEBUG", t),
              default : (...t) => e("DEFAULT", t)
            },
            a = 273.15, n = 101325, r = 5.6145833333, l = 62.371, o = 288.70556,
            i = {
              RtoK : (t = 1) => t * (5 / 9),
              KtoR : (t = 1) => 1.8 * t,
              KtoF : (t = 1) => 1.8 * t - 459.67,
              KtoC : (t = 1) => t - a,
              CtoK : (t = 1) => t + a,
              CtoF : (t = 1) => 1.8 * t + 32,
              FtoC : (t = 1) => 5 / 9 * (t - 32),
              FtoK : (t = 1) => 5 / 9 * (t - 32) + a,
              kgtolb : (t = 1) => 2.20462 * t,
              lbtokg : (t = 1) => t / 2.20462,
              m3ToBarrels : (t = 1) => t / .158987295,
              BarrelsTom3 : (t = 1) => .158987295 * t,
              BPDtolb_h : (t = 1, e = .84) => t * r * l / 24 * e,
              lb_htoBPD : (t = 1, e = .84) => t / r / l * 24 / e,
              kJtoBTU : (t = 1) => t / 1.05506,
              BTUtokJ : (t = 1) => 1.05506 * t,
              fttom : (t = 1) => t / 3.28084,
              ft2tom2 : (t = 1) => t / 3.28084 ** 2,
              mtoft : (t = 1) => 3.28084 * t,
              m2toft2 : (t = 1) => t * 3.28084 ** 2,
              intom : (t = 1) => t / 39.3701,
              mtoin : (t = 1) => 39.3701 * t,
              CpENtoCpSI : (t = 1) => 1.05506 * t / (5 / 9) * 2.20462,
              kwENtokwSI : (t = 1) => 1.05506 * t / (5 / 9) * 3.28084,
              RfENtoRfSI : (t = 1) => t / 20.441829691933805,
              hcENtohcSI : (t = 1) => 1.05506 * t / (5 / 9) * 3.28084 ** 2,
              BtuHtoW : (t = 1) => t / 3.4121416331
            },
            u = (() => {
              const t = {
                tempToK : a,
                tempAmbRef : o,
                pAtmRef : n,
                spGrav : .84,
                runDistCycle : !0,
                verbose : !0,
                tAmb : o,
                tAir : o,
                tFuel : o,
                humidity : 50,
                o2Excess : 0,
                airExcess : .2,
                radDist : .64,
                hLoss : .015,
                effcy : .8,
                rfi : 0,
                rfiConv : 0,
                rfoConv : 0,
                rfiShld : 0,
                rfoShld : 0,
                tIn : i.FtoK(678),
                tOut : i.FtoK(772),
                mFluid : 9e4,
                miuFluidIn : 1.45,
                miuFluidOut : .96,
                cpFluidIn : i.CpENtoCpSI(.676),
                cpFluidOut : i.CpENtoCpSI(.702),
                kwFluidIn : .038,
                kwFluidOut : .035,
                pAtm : n,
                unitSystem : "SI",
                lang : "en",
                title : "base",
                graphVar : "t_out",
                graphRange : 50,
                graphPoints : 100,
                NROptions : {
                  tolerance : 1e-4,
                  epsilon : 3e-8,
                  maxIterations : 20,
                  h : 1e-4,
                  verbose : !0
                }
              };
              return "undefined" == typeof process ||
                         (t.verbose = "true" == process.argv[2],
                          t.unitSystem = process.argv[3],
                          t.tAmb = a + parseFloat(process.argv[4]) || o,
                          t.humidity = parseFloat(process.argv[5]) || 0,
                          t.o2Excess = .01 * parseFloat(process.argv[6]) || 0,
                          t.airExcess = .01 * parseFloat(process.argv[7]) || 0,
                          t.pAtm = parseFloat(process.argv[8]) || 101325,
                          t.NROptions.verbose = "true" == process.argv[2]),
                     t
            })();
      u.verbose && s.debug(`"options","args":${JSON.stringify(u, null, 2)}`);
      const c = (t, e = 3) =>
          void 0 !== t
              ? t.toLocaleString(
                    void 0,
                    {minimumFractionDigits : e, maximumFractionDigits : e})
              : void 0,
            _ =
                (t, e, a) => {
                  const n = {...t},
                        r = Object.values(n).reduce(((t, e) => t + e));
                  for (const t in n)
                    n[t] = n[t] / r;
                  return a || s.debug(
                                  `"normalize", "name": "${e}", "total": ${r}`),
                         n
                },
            d = ({k0 : t, k1 : e, k2 : a, Substance : n}) =>
                0 == t || "-" == t ? (s.debug(`"Thermal Cond func called for '${
                                          n}' without coffs"`),
                                      () => 0)
                                   : s => 3.6 * (t + e * s + a * s ** 2),
            m = ({u0 : t, u1 : e, u2 : a, Substance : n}) =>
                0 == t || "-" == t
                    ? (s.debug(
                           `"Viscosity func called for '${n}' without coffs"`),
                       () => 0)
                    : s => t + e * s + a * s ** 2,
            f = (t, e, s = 3, a = "", n = 0) =>
                t ? ` ${a}` : c(n, s) + (e ? "" : ` ${a}`),
            p = {
              "energy/mol" : (t, e, s, a) =>
                  f(a, s, e, "Btu/mol", i.kJtoBTU(t)),
              "mass/mol" : (t, e, s, a) => f(a, s, e, "lb/lbmol", t),
              heat_flow : (t, e, s, a) =>
                  f(a, s, e, "MMBtu/h", 1e-6 * i.kJtoBTU(t)),
              heat_flux : (t, e, s, a) =>
                  f(a, s, e, "Btu/h-ft²", i.kJtoBTU(t) / i.m2toft2()),
              fouling_factor : (t, e, s, a) =>
                  f(a, s, e, "h-ft²-°F/Btu",
                    i.m2toft2(t) * i.KtoR() / i.kJtoBTU()),
              "energy/mass" : (t, e, s, a) =>
                  f(a, s, e, "Btu/lb", i.kJtoBTU(t) / i.kgtolb()),
              "energy/vol" : (t, e, s, a) =>
                  f(a, s, e, "Btu/ft³", i.kJtoBTU(t) / i.mtoft() ** 3),
              area : (t, e, s, a) => f(a, s, e, "ft²", i.m2toft2(t)),
              length : (t, e, s, a) => f(a, s, e, "ft", i.mtoft(t)),
              lengthC : (t, e, s, a) => f(a, s, e, "in", i.mtoin(t)),
              lengthInv : (t, e, s, a) => f(a, s, e, "1/ft", t / i.mtoft()),
              temp : (t, e, s, a) => f(a, s, e, "°R", i.KtoR(t)),
              tempC : (t, e, s, n) => f(n, s, e, "°F", i.CtoF(t - a)),
              pressure : (t, e, s, a) => f(a, s, e, "psi", .0001450377 * t),
              mass : (t, e, s, a) => f(a, s, e, "lb", i.kgtolb(t)),
              mass_flow : (t, e, s, a) => f(a, s, 0, "lb/h", i.kgtolb(t)),
              barrel_flow : (t, e, s, a, n = .84) =>
                  f(a, s, e, "x10³ BPD", i.kgtolb(t) / i.BPDtolb_h(1, n) / 1e3),
              barrel_flowC : (t, e, s, a) => f(a, s, e, "BPD", t),
              vol_flow : (t, e, s, a) => f(a, s, e, "ft³/h", i.mtoft(t) ** 3),
              cp : (t, e, s, a) => f(a, s, e, "Btu/lb-°F", .238845896627 * t),
              cp_mol : (t, e, s, a) =>
                  f(a, s, e, "Btu/lb-mol-°F", .238845896627 * t),
              power : (t, e, s, a) => f(a, s, e, "Btu/h", 3.4121416331 * t),
              moist : (t, e, s, a) => f(a, s, e, "÷10³ lb H2O/lb", 1e3 * t),
              thermal : (t, e, s, a) => f(a, s, e, "BTU/h-ft-°F",
                                          i.kJtoBTU(t) / i.KtoR() / i.mtoft()),
              convect : (t, e, s, a) =>
                  f(a, s, e, "BTU/h-ft²-°F",
                    i.kJtoBTU(t) / i.KtoR() / i.m2toft2()),
              viscosity : (t, e, s, a) => f(a, s, e, "cP", t),
              system : {en : "English", es : "Inglés"}
            },
            h = {
              "energy/mol" : (t, e, s, a) => f(a, s, e, "kJ/mol", t),
              "mass/mol" : (t, e, s, a) => f(a, s, e, "kg/kmol", t),
              heat_flow : (t, e, s, a) => f(a, s, e, "MW", 1e-6 * t / 3.6),
              heat_flux : (t, e, s, a) => f(a, s, e, "W/m²", t / 3600),
              fouling_factor : (t, e, s, a) =>
                  f(a, s, e, "m²-K/W ÷10³", 3600 * t),
              "energy/mass" : (t, e, s, a) => f(a, s, e, "kJ/kg", t),
              "energy/vol" : (t, e, s, a) => f(a, s, e, "kJ/m³", t),
              area : (t, e, s, a) => f(a, s, e, "m²", t),
              length : (t, e, s, a) => f(a, s, e, "m", t),
              lengthC : (t, e, s, a) => f(a, s, e, "cm", 100 * t),
              lengthInv : (t, e, s, a) => f(a, s, e, "1/m", t),
              tempC : (t, e, s, n) => f(n, s, 0, "°C", t - a),
              temp : (t, e, s, a) => f(a, s, e, "K", t),
              pressure : (t, e, s, a) => f(a, s, e, "kPa", .001 * t),
              mass : (t, e, s, a) => f(a, s, e, "kg", .001 * t),
              mass_flow : (t, e, s, a) => f(a, s, e, "kg/s", t / 3600),
              barrel_flow : (t, e, s, a, n = .84) =>
                  p.barrel_flow(t, e, s, a, n),
              barrel_flowC : (t, e, s, a) =>
                  f(a, s, e, "m³/d", t / i.m3ToBarrels()),
              vol_flow : (t, e, s, a) => f(a, s, e, "m³/s", t / 3600),
              cp : (t, e, s, a) => f(a, s, e, "kJ/kg-K", t),
              cp_mol : (t, e, s, a) => f(a, s, e, "kJ/kmol-K", t),
              power : (t, e, s, a) => f(a, s, e, "W", t / 3.6),
              moist : (t, e, s, a) => f(a, s, e, "g H2O/kg", 1e3 * t),
              thermal : (t, e, s, a) => f(a, s, e, "kJ/h-m-C", t),
              convect : (t, e, s, a) => f(a, s, e, "kJ/h-m²-C", t),
              viscosity : (t, e, s, a) => f(a, s, e, "cP", t),
              system : {en : "SI", es : "SI"}
            };
      t.exports = {
        logger : s,
        options : u,
        unitConv : i,
        defaultFuel : {
          H2 : .1142,
          N2 : .0068,
          CO : .0066,
          CO2 : .0254,
          CH4 : .5647,
          C2H6 : .1515,
          C3H8 : .0622,
          C4H10 : .0176,
          iC4H10 : .0075,
          C2H4 : .0158,
          C3H6 : .0277
        },
        round : c,
        roundDict : (t = {}) => {
          for (const [e, s] of Object.entries(t))
            isNaN(s) || "" === s || (t[e] = c(s))
        },
        normalize : _,
        initSystem : t => {
          if ("string" != typeof t)
            return u.verbose && s.warn(`invalid type (${
                                    t}) for unit system, using default SI`),
                   h;
          switch (t.toLowerCase()) {
          case "si":
            return h;
          case "english":
          case "en":
            return p;
          default:
            return s.warn(t.toLowerCase() +
                          " - invalid unit system, using default SI"),
                   h
          }
        },
        linearApprox : ({x1 : t, x2 : e, y1 : a, y2 : n}) => {
          if ("number" != typeof a)
            return s.error(
                       `call for linearApprox with incorrect value type for y1: ${
                           a}`),
                   () => 0;
          if (t == e || null == e || null == n)
            return () => a;
          const r = (n - a) / (e - t);
          return e => r * (e - t) + a
        },
        newtonRaphson : (t, e, a, n, r, l) => {
          let o, i, u, c, _, d, m, f;
          "function" != typeof e && (l = r, r = n, n = a, a = e, e = null);
          const p = n || {}, h = void 0 === p.tolerance ? 1e-7 : p.tolerance,
                g = void 0 === p.epsilon ? 222e-17 : p.epsilon,
                $ = void 0 === p.h ? 1e-4 : p.h, C = 1 / $,
                b = void 0 === p.maxIterations ? 20 : p.maxIterations;
          for (c = 0; c++ < b;) {
            if (i = t(a),
                e ? u = e(a)
                  : (_ = t(a + $), d = t(a - $), m = t(a + 2 * $),
                     f = t(a - 2 * $), u = (f - m + 8 * (_ - d)) * C / 12),
                Math.abs(u) <= g * Math.abs(i))
              return s.error(`Newton-Raphson (${
                         r}): failed to converged due to nearly zero first derivative`),
                     !1;
            if (o = a - i / u, Math.abs(o - a) <= h * Math.abs(o))
              return l || s.debug(`"Newton-Raphson", "func":"${
                              r}", "var_converged_to":"${o}", "iterations":"${
                              c}"`),
                     o;
            a = o
          }
          return s.error(`Newton-Raphson (${r}): Maximum iterations reached (${
                     b})`),
                 !1
        },
        flueViscosity : (t, e) => {
          const s = _(e, "flueViscosity"), a = m(t[34]), n = m(t[31]),
                r = m(t[6]), l = m(t[3]), o = m(t[2]);
          return t => s.CO2 * r(t) + s.SO2 * a(t) + s.H2O * n(t) + s.O2 * o(t) +
                      s.N2 * l(t)
        },
        viscosityApprox : ({t1 : t, t2 : e, v1 : a, v2 : n}) => {
          if ("number" != typeof a)
            return s.error(
                       `call for viscosityApprox with incorrect value type for v1: ${
                           a}`),
                   () => 0;
          if (t == e || null == e || null == n)
            return () => a;
          const r = Math.log(a / n) / (1 / t - 1 / e), l = a * Math.exp(-r / t);
          return t => l * Math.exp(r / t)
        },
        flueThermalCond : (t, e) => {
          const s = _(e, "flueThermalCond"), a = d(t[34]), n = d(t[31]),
                r = d(t[6]), l = d(t[3]), o = d(t[2]);
          return t => s.CO2 * r(t) + s.SO2 * a(t) + s.H2O * n(t) + s.O2 * o(t) +
                      s.N2 * l(t)
        },
        kw_tubes_A312_TP321 : t => {
          const e = t - a;
          return 3.6 * (14.643 + .0164 * e + -2e-6 * e ** 2)
        },
        LMTD : (t, e, s, a, n) => {
          let r = s - e, l = a - t;
          return n && (r = a - t, l = s - e),
                 Math.abs((r - l) / Math.log(Math.abs(r / l)))
        }
      }
    },
    684 : t => {
      "use strict";
      t.exports = JSON.parse(
          '[{"ID":0,"Substance":"Carbon","Formula":"C","MW":12.011,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1,"SO2":0,"CO2":1,"H2O":0,"N2":3.773269},{"ID":1,"Substance":"Hydrogen","Formula":"H2","MW":2.0159,"h0":0,"Cp0":14.209,"c0":13.46,"c1":4.6,"c2":-6.85,"c3":3.79,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.5,"SO2":0,"CO2":0,"H2O":1,"N2":1.886634},{"ID":2,"Substance":"Oxygen","Formula":"O2","MW":31.9988,"h0":0,"Cp0":0.922,"c0":0.88,"c1":-0.0001,"c2":0.54,"c3":-0.33,"u0":0.00845,"u1":0.0000472,"u2":-6.56e-9,"k0":0.00733,"k1":0.0000708,"k2":-6.61e-9,"O2":-1,"SO2":0,"CO2":0,"H2O":0,"N2":0},{"ID":3,"Substance":"Nitrogen","Formula":"N2","MW":28.0134,"h0":0,"Cp0":1.042,"c0":1.11,"c1":-0.48,"c2":0.96,"c3":-0.42,"u0":0.00784,"u1":0.0000387,"u2":-5.11e-9,"k0":0.00952,"k1":0.000062,"k2":-6.22e-9,"O2":0,"SO2":0,"CO2":0,"H2O":0,"N2":1},{"ID":4,"Substance":"Nitrogen (atm)","Formula":"N2a","MW":28.158,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0,"SO2":0,"CO2":0,"H2O":0,"N2":1},{"ID":5,"Substance":"Carbon Monoxide","Formula":"CO","MW":28.0104,"h0":-110527,"Cp0":1.041,"c0":1.1,"c1":-0.46,"c2":1,"c3":-0.454,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.5,"SO2":0,"CO2":1,"H2O":0,"N2":1.886634},{"ID":6,"Substance":"Carbon Dioxide","Formula":"CO2","MW":44.0098,"h0":-393522,"Cp0":0.842,"c0":0.45,"c1":1.67,"c2":-1.27,"c3":0.39,"u0":0.00331,"u1":0.0000445,"u2":-6.69e-9,"k0":-0.00958,"k1":0.0000918,"k2":-1.14e-8,"O2":0,"SO2":0,"CO2":1,"H2O":0,"N2":0},{"ID":7,"Substance":"Methane","Formula":"CH4","MW":16.0428,"h0":-74873,"Cp0":2.254,"c0":1.2,"c1":3.25,"c2":0.75,"c3":-0.71,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":2,"SO2":0,"CO2":1,"H2O":2,"N2":7.546539},{"ID":8,"Substance":"Ethane","Formula":"C2H6","MW":30.0697,"h0":-84740,"Cp0":1.766,"c0":0.18,"c1":5.92,"c2":-2.31,"c3":0.29,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3.5,"SO2":0,"CO2":2,"H2O":3,"N2":13.20644},{"ID":9,"Substance":"Propane","Formula":"C3H8","MW":44.0966,"h0":-103900,"Cp0":1.679,"c0":-0.096,"c1":6.95,"c2":-3.6,"c3":0.73,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":5,"SO2":0,"CO2":3,"H2O":4,"N2":18.86634},{"ID":10,"Substance":"n-Butane","Formula":"C4H10","MW":58.1235,"h0":-126200,"Cp0":1.716,"c0":0.163,"c1":5.7,"c2":-1.906,"c3":-0.049,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6.5,"SO2":0,"CO2":4,"H2O":5,"N2":24.52625},{"ID":11,"Substance":"Isobutane","Formula":"iC4H10","MW":58.1235,"h0":-135000,"Cp0":1.547,"c0":0.206,"c1":5.67,"c2":-2.12,"c3":0.183,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6.5,"SO2":0,"CO2":4,"H2O":5,"N2":24.52625},{"ID":12,"Substance":"n-Pentane","Formula":"C5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":13,"Substance":"Isopentane","Formula":"iC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":14,"Substance":"Neopentane","Formula":"nC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":15,"Substance":"n-Hexane","Formula":"C6H14","MW":86.1773,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":9.5,"SO2":0,"CO2":6,"H2O":7,"N2":35.84606},{"ID":16,"Substance":"Ethylene","Formula":"C2H4","MW":28.0538,"h0":52467,"Cp0":1.548,"c0":0.136,"c1":5.58,"c2":-3,"c3":0.63,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3,"SO2":0,"CO2":2,"H2O":2,"N2":11.3198},{"ID":17,"Substance":"Propylene","Formula":"C3H6","MW":42.0807,"h0":20410,"Cp0":1.437,"c0":0.454,"c1":4.06,"c2":-0.934,"c3":-0.133,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":4.5,"SO2":0,"CO2":3,"H2O":3,"N2":16.97971},{"ID":18,"Substance":"n-Butene (Butylene)","Formula":"C4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6,"SO2":0,"CO2":4,"H2O":4,"N2":22.63961},{"ID":19,"Substance":"Isobutene","Formula":"iC4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6,"SO2":0,"CO2":4,"H2O":4,"N2":22.63961},{"ID":20,"Substance":"n-Pentene","Formula":"C5H10","MW":70.1345,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":7.5,"SO2":0,"CO2":5,"H2O":5,"N2":28.29952},{"ID":21,"Substance":"Benzene","Formula":"C6H6","MW":78.1137,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":7.5,"SO2":0,"CO2":6,"H2O":3,"N2":28.29952},{"ID":22,"Substance":"Toluene","Formula":"C7H8","MW":92.1406,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":9,"SO2":0,"CO2":7,"H2O":4,"N2":33.95942},{"ID":23,"Substance":"Xylene","Formula":"C8H10","MW":106.1675,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":10.5,"SO2":0,"CO2":8,"H2O":5,"N2":39.6193},{"ID":24,"Substance":"Acetylene","Formula":"C2H2","MW":26.0379,"h0":226731,"Cp0":1.699,"c0":1.03,"c1":2.91,"c2":-1.92,"c3":0.54,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":2.5,"SO2":0,"CO2":2,"H2O":1,"N2":9.433174},{"ID":25,"Substance":"Naphthalene","Formula":"C10H8","MW":128.1736,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":12,"SO2":0,"CO2":10,"H2O":4,"N2":45.27923},{"ID":26,"Substance":"Methyl alcohol-Methanol","Formula":"CH3OH","MW":32.0422,"h0":-201300,"Cp0":1.405,"c0":0.66,"c1":2.21,"c2":0.81,"c3":-0.89,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1.5,"SO2":0,"CO2":1,"H2O":2,"N2":5.659904},{"ID":27,"Substance":"Ethyl alcohol-Ethanol","Formula":"C2H5OH","MW":46.0691,"h0":-235000,"Cp0":1.427,"c0":0.2,"c1":-4.65,"c2":-1.82,"c3":0.03,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3,"SO2":0,"CO2":2,"H2O":3,"N2":11.3198},{"ID":28,"Substance":"Ammonia","Formula":"NH3","MW":17.0306,"h0":-45720,"Cp0":2.13,"c0":1.6,"c1":1.4,"c2":1,"c3":-0.7,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.75,"SO2":0,"CO2":0,"H2O":1.5,"N2":2.82995},{"ID":29,"Substance":"Sulfur","Formula":"S","MW":32.066,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1,"SO2":1,"CO2":0,"H2O":0,"N2":3.773269},{"ID":30,"Substance":"Hydrogen sulfide","Formula":"H2S","MW":34.0819,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":-0.000545,"u1":0.0000502,"u2":-1.3e-8,"k0":"-","k1":"-","k2":"-","O2":1.5,"SO2":1,"CO2":0,"H2O":1,"N2":5.659904},{"ID":31,"Substance":"Steam (Water vapor)","Formula":"H2O","MW":18.0153,"h0":-241826,"Cp0":1.872,"c0":1.79,"c1":0.107,"c2":0.586,"c3":-0.2,"u0":-0.00596,"u1":0.0000484,"u2":-4.76e-9,"k0":-0.00592,"k1":0.0000718,"k2":-3.03e-8,"O2":0,"SO2":0,"CO2":0,"H2O":1,"N2":0},{"ID":32,"Substance":"Water (liquid)","Formula":"H2Ol","MW":18.0153,"h0":-285830,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0,"SO2":0,"CO2":0,"H2O":1,"N2":0},{"ID":33,"Substance":"Dry Air","Formula":"N2+O2","MW":28.8483,"h0":0,"Cp0":1.004,"c0":1.05,"c1":-0.365,"c2":0.85,"c3":-0.39,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.2095,"SO2":0,"CO2":0,"H2O":0,"N2":0.7905},{"ID":34,"Substance":"Sulfur dioxide","Formula":"SO2","MW":62.059,"h0":-296842,"Cp0":0.624,"c0":0.37,"c1":1.05,"c2":-0.77,"c3":0.21,"u0":-0.00301,"u1":0.0000578,"u2":-1.66e-8,"k0":-0.00188,"k1":0.0000314,"k2":2.7e-8,"O2":0,"SO2":1,"CO2":0,"H2O":0,"N2":0}]')
    }
  },
      e = {};
  function s(a) {
    var n = e[a];
    if (void 0 !== n)
      return n.exports;
    var r = e[a] = {exports : {}};
    return t[a](r, r.exports, s), r.exports
  }
  (() => {
    const {
      round : t,
      defaultFuel : e,
      logger : a,
      options : n,
      unitConv : r,
      initSystem : l,
      linearApprox : o,
      newtonRaphson : i,
      viscosityApprox : u,
      kw_tubes_A312_TP321 : c
    } = s(170),
   _ = s(684), {radSection : d} = s(623), {convSection : m} = s(399),
   {shieldSection : f} = s(16), {combSection : p} = s(911),
   {browserProcess : h} = s(620), g = (t, e) => {
     const s = (t => {
       const e = r.BPDtolb_h(r.lbtokg(t.mFluid), t.spGrav), s = t.tIn,
             a = t.tOut, n = t.miuFluidIn, i = t.miuFluidOut, _ = t.cpFluidIn,
             d = t.cpFluidOut, m = r.kwENtokwSI(t.kwFluidIn),
             f = r.kwENtokwSI(t.kwFluidOut);
       return {
         runDistCycle: t.runDistCycle, p_atm: t.pAtm, t_fuel: t.tFuel,
             t_air: t.tAir, t_amb: t.tAmb, humidity: t.humidity,
             airExcess: t.airExcess, o2Excess: t.o2Excess, sp_grav: t.spGrav,
             t_in_conv: s, t_out: a, m_fluid: e, Rfi: t.rfi, Rfo: t.rfoConv,
             Rfi_conv: t.rfiConv, Rfi_shld: t.rfiShld, Rfo_shld: t.rfoShld,
             efficiency: t.effcy, duty_rad_dist: t.radDist,
             heat_loss_percent: t.hLoss, max_duty: r.BTUtokJ(71527.6),
             miu_fluid: u({t1 : s, v1 : n, t2 : a, v2 : i}),
             Cp_fluid: o({x1 : s, y1 : _, x2 : a, y2 : d}),
             kw_fluid: o({x1 : s, y1 : m, x2 : a, y2 : f}),
             Material: "A-312 TP321", h_conv: r.hcENtohcSI(1.5), kw_tube: c,
             Pass_number: 2, Pitch_rad: r.intom(16), N_rad: 42,
             L_rad: r.fttom(62.094), Do_rad: r.intom(8.625),
             Sch_rad: r.intom(.322), Burner_number: 13, Do_Burner: 2.24,
             Width_rad: 17.5, Length_rad: 64.55, Height_rad: 27, N_shld: 16,
             L_shld: r.fttom(60), Do_shld: r.intom(6.625),
             Pitch_sh_cnv: r.intom(12), Sch_sh_cnv: r.intom(.28), Tpr_sh_cnv: 8,
             N_conv: 40, L_conv: r.fttom(60), Do_conv: r.intom(6.625),
             Nf: r.mtoft(60), Tf: r.fttom(.005), Lf: r.fttom(.08),
             FinType: "Solid", FinMaterial: "11.5-13.5Cr",
             FinArrange: "Staggered Pitch", verbose: t.verbose,
             unitSystem: t.unitSystem, lang: t.lang, NROptions: t.NROptions,
             units: l(t.unitSystem)
       }
     })(e);
     0 != s.o2Excess && C(s, t);
     const a = p(s.airExcess, t, s);
     return s.runDistCycle && $(s),
            a.rad_result = d(s), a.shld_result = f(s), a.conv_result = m(s),
            a.rad_result.eff_thermal_val =
                a.rad_result.eff_thermal(a.conv_result.Q_stack),
            a.rad_result.eff_gcv_val =
                a.rad_result.eff_gcv(a.conv_result.Q_stack),
            a.rad_result.co2_emiss = +a.debug_data.CO2 *
                                     (44.01 / a.flows.fuel_MW) *
                                     a.rad_result.m_fuel * 8.76,
            a
   }, $ = e => {
     let s = 0, n = !0;
     const r = {...e.NROptions};
     r.maxIterations *= 5, r.tolerance *= .1, r.epsilon *= .1, r.h *= .1;
     const l = i((t => {
                   s++, t > .3 && t < 1 && (e.duty_rad_dist = t);
                   const a = {rad : d(e, n), shld : f(e, n), conv : m(e, n)},
                         r = Math.abs(a.rad.Q_fluid) +
                             Math.abs(a.shld.Q_fluid) +
                             Math.abs(a.conv.Q_fluid);
                   return (e.duty - r) / r
                 }),
                 e.duty_rad_dist, r, "rad_dist_final");
     l > .1 &&l < 1
         ? e.duty_rad_dist = l
         : a.error(
               "external cycle broken, error in rad_dist estimation, using: " +
               e.duty_rad_dist),
           a.info(`duty_rad_dist: ${t(100 * l, 2)}, ext_cycle_reps: ${s}`)
   }, C = (e, s) => {
     let n = 0;
     const r = {...e.NROptions};
     r.maxIterations *= 5, r.tolerance *= .1, r.epsilon *= .1, r.h *= .1;
     const l = i((t => {
                   n++;
                   const a = p(t, s, e, !0);
                   return Math.round(1e5 * a.flows["O2_%"] - 1e7 * e.o2Excess)
                 }),
                 .05, r, "o2_excess_to_air");
     l && (e.airExcess = l),
         a.info(`'air_excess': ${t(100 * l, 2)}, 'comb_cycle_reps': ${n}`)
   };
    let b = {...e};
    "undefined" != typeof window ? h(b, _, n, g)
                                 : a.info(JSON.stringify(g(b, n), null, 2))
  })()
})();