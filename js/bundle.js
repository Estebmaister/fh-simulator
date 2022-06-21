(
    () => {
      var e =
              {
                620 : (e, t, n) => {
                  const {optionsModifier : o} = n(691),
                                           {graphicData : a} = n(624),
                                           {logger : r} = n(170), {
                                             stringRadResult : s,
                                             stringShldResult : u,
                                             stringConvResult : l,
                                             stringCombResult : i
                                           } = n(30);
                  e.exports = {
                    browserProcess : (e, t, n, _) => {
                      let c = "en";
                      const d = window.location.pathname.split("/");
                      d.length > 0 &&
                          d.forEach((e => {"es" != e && "es_graph" != e ||
                                           (c = "es")})),
                          n.lang = c;
                      const f = (e => {
                        if ("" == e)
                          return {};
                        let t = {};
                        for (const n of e) {
                          const e = n.split("=", 2);
                          1 == e.length
                              ? t[e[0]] = ""
                              : t[e[0]] =
                                    decodeURIComponent(e[1].replace(/\+/g, " "))
                        }
                        return t
                      })(window.location.search.substring(1).split("&"));
                      f !== {} &&
                          (e = ((e, t, n, a) => {
                             const s = {}, u = n.filter((t => t.Formula in e));
                             for (const t in e)
                               if (1 ===
                                       u.filter((e => e.Formula == t)).length &&
                                   "" !== e[t]) {
                                 const n = parseFloat(e[t]);
                                 n > 0 && n <= 100
                                     ? s[t] = n / 100
                                     : r.error(`fuel fraction invalid (${
                                           n}) for ${t}`)
                               } else
                                 "" !== e[t] && void 0 !== e[t] && o(t, e, a);
                             return 0 !== Object.keys(s).length && (t = s), t
                           })(f, e, t, n)),
                          d[1].includes("_graph") || d[2].includes("_graph")
                              ? a(_, e, n)
                              : ((e, t, n, o) => {
                                  r.debug(JSON.stringify(t, null, 2));
                                  const a =
                                      document.getElementById("loader-wrapper");
                                  a && a.remove();
                                  const _ = document.getElementById(
                                      "output-combustion");
                                  _ && (_.textContent = i(n, e, o));
                                  const c =
                                      document.getElementById("output-radiant");
                                  c && (c.textContent = s(n, e.rad_result, o));
                                  const d =
                                      document.getElementById("output-shield");
                                  d && (d.textContent = u(n, e.shld_result, o));
                                  const f = document.getElementById(
                                      "output-convective");
                                  f && (f.textContent = l(n, e.conv_result, o))
                                })(_(e, n), f, c, n.unitSystem)
                    }
                  }
                },
                624 : (e, t, n) => {
                  const {logger : o, unitConv : a} = n(170);
                  e.exports = {
                    graphicData : (e, t, n) => {
                      const r = {...o};
                      o.error = () => 0, o.default = () => 0, o.info = () => 0,
                      o.debug = () => 0, n.unitSystem = "english";
                      const s = [];
                      let u, l,
                          i = JSON.parse(localStorage.getItem(`${n.title}`));
                      if (i && (u = i[`${window.location.search}`],
                                Object.keys(i).length > 5 &&
                                    localStorage.clear()),
                          u)
                        return void draw(u, n);
                      switch (n.graphVar) {
                      case "humidity":
                        l = "humidity";
                        break;
                      case "air_excess":
                        l = "airExcess", n.graphRange = .01 * n.graphRange;
                        break;
                      case "o2_excess":
                        l = "o2Excess", n.graphRange = .01 * n.graphRange;
                        break;
                      case "m_fluid":
                        l = "mFluid",
                        n.graphRange = a.BPDtolb_h(1e3 * n.graphRange);
                        break;
                      default:
                        l = "tOut"
                      }
                      const _ = n.graphPoints, c = n.graphRange;
                      let d = n[l] - c / 2;
                      d < 0 && (d = 0), r.info(`Var: ${l}, centerValue: ${
                                            n[l]}, range: ${c}, points: ${_}`);
                      for (let o = 0; o < _; o++) {
                        n[l] = d + o * c / _;
                        const r = e(t, n);
                        s[o] = {
                          m_fluid : .001 * a.lb_htoBPD(
                                               a.kgtolb(r.rad_result.m_fluid)),
                          duty_total : r.rad_result.duty_total,
                          t_out : a.KtoF(r.rad_result.t_out),
                          o2_excess : r.flows["O2_%"],
                          air_excess : r.flows["air_excess_%"] > 0
                                           ? r.flows["air_excess_%"]
                                           : 0,
                          humidity : r.debug_data["humidity_%"],
                          cnv_tg_out : a.KtoF(r.conv_result.tg_out),
                          m_fuel : r.rad_result.m_fuel
                                       ? a.kgtolb(r.rad_result.m_fuel)
                                       : 0,
                          efficiency : r.rad_result.eff_total
                                           ? r.rad_result.eff_total
                                           : 0,
                          rad_dist :
                              r.rad_result["%"] < 1
                                  ? Math.round(1e6 * r.rad_result["%"]) / 1e4
                                  : 0
                        }
                      }
                      i || (i = {}),
                          i[`${window.location.search}`] = s,
                          localStorage.setItem(`${n.title}`, JSON.stringify(i)),
                          console.log(s), draw(s, n)
                    }
                  }
                },
                911 : (e, t, n) => {
                  const {
                    newtonRaphson : o,
                    options : a,
                    logger : r,
                    round : s,
                    roundDict : u,
                    initSystem : l,
                    normalize : i,
                    flueViscosity : _,
                    flueThermalCond : c
                  } = n(170),
                 d = n(684), f = {O2 : .2095, N2 : .7905, H2O : 0},
                 m =
                      (e, t = {}) => {
                        const n = Object.values(e).reduce(((e, t) => e + t)),
                              o = Math.abs(1 - n) <= 3e-12;
                        return o || (t.err +=
                                     `[fuel fraction not equal to 1, total: ${
                                         n}. fuels: ${Object.keys(e)}],`),
                               o
                      },
                 h = ({c0 : e, c1 : t, c2 : n, c3 : o, MW : a, Substance : u},
                      l, i) => _ =>
                      (_ < 250 && !i &&
                           r.debug(`"Cp0", "temp": ${s(_)},"Msg": "${
                               u} bellow range for Cp0 formula"`),
                       _ > 1200 && !i &&
                           r.debug(`"Cp0", "temp": ${s(_)},"Msg": "${
                               u} above range for Cp0 formula"`),
                       "-" === e
                           ? (r.debug(
                                  `"Cp0", "Msg": "Wrong use, called for compound ${
                                      u}, no data found"`),
                              0)
                       : l ? a * (e + t * (.001 * _) + n * (.001 * _) ** 2 +
                                  o * (.001 * _) ** 3)
                           : e + t * (.001 * _) + n * (.001 * _) ** 2 +
                                 o * (.001 * _) ** 3),
                 p =
                      (e, t, n) => {
                        if (0 === e.length)
                          return e => 0;
                        let o = JSON.parse(JSON.stringify(e));
                        m(e) || (o = i(o, "Cp_multicomp", n));
                        const a = d.filter((e => e.Formula in o)), r = [];
                        let s = 0;
                        for (const e in o)
                          r[s] = n =>
                              o[e] *
                              h(a.filter((t => t.Formula == e))[0], t)(n),
                          s++;
                        return r.reduce(((e, t) => n => e(n) + t(n)), (e => 0))
                      },
                 O =
                      (e, t) => {
                        if (0 === e.length)
                          return e => 0;
                        let n = JSON.parse(JSON.stringify(e));
                        m(e) || (n = i(n, "MW_multicomp", t));
                        const o = d.filter((e => e.Formula in n));
                        let a = 0;
                        for (const e in n)
                          a += o.filter((t => t.Formula == e))[0].MW * n[e];
                        return a
                      },
                 $ =
                      (e, t) => {
                        const n = e - a.tempToK;
                        return 610.78 * Math.exp(n / (n + 238.3) * 17.2694) *
                               t * .01
                      },
                 g =
                      (e, t) => {
                        const n = $(e, t);
                        return d[31].MW * n / (O(f) * (a.pAtm - n))
                      },
                 C = (e, t) =>
                      "-" === e.Cp0
                          ? "-" === e.h0
                                ? (r.warn(
                                       `wrong use of deltaH func, called for compound ${
                                           e.Substance} without data`),
                                   void 0 === t ? () => 0 : 0)
                            : void 0 === t ? () => e.h0
                                           : e.h0
                      : void 0 === t
                          ? t => e.h0 + (t - a.tempAmbRef) *
                                            h(e, !0, !0)((a.tempAmbRef + t) / 2)
                          : e.h0 + (t - a.tempAmbRef) *
                                       h(e, !0, !0)((a.tempAmbRef + t) / 2),
                 b = (e, t, n, o) => {
                   const r = C(d[6]), s = C(d[34]), u = C(d[2]);
                   let l = C(d[31]);
                   return !0 === o && (l = C(d[32])),
                          void 0 === n && (n = a.tAmb),
                          void 0 === t
                              ? t => e.CO2 * r(t) + e.SO2 * s(t) +
                                     e.H2O * l(t) - C(e)(n) - e.O2 * u(n)
                              : e.CO2 * r(t) + e.SO2 * s(t) + e.H2O * l(t) -
                                    C(e)(n) - e.O2 * u(n)
                 };
                  e.exports = {
                    combSection : (e, t, n, h) => {
                      h || r.debug(`"airExcess", "value": ${e}`);
                      const k = l(n.unitSystem), w = {
                        err : "",
                        atmPressure : k.pressure(n.p_atm),
                        fuelTemperature : k.tempC(n.t_fuel),
                        ambTemperature : k.tempC(n.t_amb),
                        airTemperature : k.tempC(n.t_air),
                        "humidity_%" : n.humidity,
                        "dryAirN2_%" : s(79.05),
                        "dryAirO2_%" : s(20.95),
                        moisture : k.moist(g(n.t_air, n.humidity)),
                        spGrav : n.sp_grav,
                        cpFluidTb :
                            k.cp(n.Cp_fluid((n.t_in_conv + n.t_out) / 2)),
                        unitSystem : k.system[n.lang]
                      },
                            N = d.filter(((e, n, o) => e.Formula in t));
                      let v = {...t};
                      m(t, w) || (v = i(t, "combSection")), ((e, t, n = {}) => {
                        const o = Math.abs(t.length - Object.keys(e).length);
                        0 === o ||
                            (r.error(
                                 `[some fuels aren't in the database, #badFuels: ${
                                     o}],`),
                             n.err +=
                             `[some fuels aren't in the database, #badFuels: ${
                                 o}],`)
                      })(v, N, w);
                      const y = {O2 : 0, N2 : 0, H2O : 0, CO2 : 0, SO2 : 0},
                            S = {...f};
                      ((e, t, n) => {
                        for (const o of e)
                          for (const e in t)
                            if ("N2" != e)
                              t[e] += o[e] * n[o.Formula];
                            else {
                              if ("N2" == o.Formula || '"N2a' == o.Formula) {
                                t[e] += n[o.Formula];
                                continue
                              }
                              t[e] += o.O2 * n[o.Formula] * 3.7732696897374702
                            }
                      })(N, y, v),
                          e - 1e-6 < 0 && (e = 0),
                          n.humidity - 1e-6 < 0 && (n.humidity = 0);
                      let F = y.O2, A = F * (1 + e);
                      if (y.O2 <= 0 || y.N2 < 0)
                        r.error(
                            `airExcess set to 0, O2 in fuel >= O2 needed. Products: {O2:${
                                y.O2}, N2:${y.N2}}`),
                            A = 0, F = 0, y.N2 = v.N2, y.O2 = -y.O2;
                      else {
                        const e = $(n.t_air, n.humidity), t = n.p_atm - e;
                        S.N2 = .7905 * t / n.p_atm, S.O2 = .2095 * t / n.p_atm,
                        S.H2O = e / n.p_atm, w.dryAirPressure = k.pressure(t),
                        w.waterPressure = k.pressure(e),
                        w["H2OPressure_%"] = s(100 * S.H2O),
                        w["N2Pressure_%"] = s(100 * S.N2),
                        w["O2Pressure_%"] = s(100 * S.O2), y.O2 = A - y.O2,
                        y.N2 += y.O2 * (S.N2 / S.O2),
                        y.H2O += y.N2 * (e / (S.N2 * n.p_atm))
                      }
                      let M = 0, T = 0;
                      for (const e in y)
                        M += y[e], "H2O" !== e && (T += y[e]);
                      const I = {
                        total_flow : M,
                        dry_total_flow : T,
                        "N2_%" : 100 * y.N2 / M,
                        "H2O_%" : 100 * y.H2O / M,
                        "CO2_%" : 100 * y.CO2 / M,
                        "O2_%" : 100 * y.O2 / M,
                        O2_mol_req_theor : F,
                        O2_mass_req_theor : k.mass(F * d[2].MW),
                        "air_excess_%" : 100 * n.airExcess,
                        AC : A / S.O2,
                        AC_theor_dryAir : F / .2095,
                        AC_mass : A / S.O2 * O(S) / O(v),
                        AC_mass_theor_moistAir : F / S.O2 * O(S) / O(v),
                        fuel_MW : k["mass/mol"](O(v)),
                        Cp_fuel : k.cp(p(v)(n.t_fuel)),
                        flue_MW : O(y, h),
                        Cp_flue : p(y, !1, h)
                      };
                      return h ||
                                 (n.m_flue_ratio = M * I.flue_MW / O(v),
                                  n.m_air_ratio = A / S.O2 * O(S) / O(v),
                                  n.Pco2 = y.CO2 / M, n.Ph2o = y.H2O / M,
                                  n.Cp_air = p(S), n.Cp_fuel = p(v),
                                  n.Cp_flue = I.Cp_flue, n.miu_flue = _(d, y),
                                  n.kw_flue = c(d, y),
                                  I.Cp_flue = k.cp(I.Cp_flue(n.t_air)),
                                  I.flue_MW = k["mass/mol"](I.flue_MW),
                                  n.NCV = -((e, t, n, o) => {
                                    let a = 0;
                                    for (const r in e) {
                                      if (r in t)
                                        continue;
                                      const s =
                                          n.filter((e => e.Formula == r))[0];
                                      a += e[r] * b(s)(o)
                                    }
                                    return a
                                  })(v, y, N, n.t_amb) /
                                          O(v),
                                  I.NCV = k["energy/mass"](n.NCV),
                                  n.adFlame = o(
                                      ((e, t, n, o) => {
                                        void 0 === n && (n = a.tAmb),
                                            void 0 === o && (o = 0);
                                        const r =
                                            d.filter((t => t.Formula in e)),
                                              s = C(d.filter(
                                                  (e => "O2" == e.Formula))[0]),
                                              u = C(d.filter(
                                                  (e => "N2" == e.Formula))[0]),
                                              l = C(d.filter((
                                                  e => "CO2" == e.Formula))[0]),
                                              i = C(d.filter((
                                                  e => "H2O" == e.Formula))[0]),
                                              _ = C(d.filter((
                                                  e => "SO2" == e.Formula))[0]),
                                              c = [];
                                        let f = 0;
                                        for (const t in e)
                                          c[f] = e[t] *
                                                 C(r.filter((e => e.Formula ==
                                                                  t))[0])(n),
                                          f++;
                                        return e => (e => t.O2 * s(e) +
                                                          t.SO2 * _(e) +
                                                          t.H2O * i(e) +
                                                          t.CO2 * l(e) +
                                                          t.N2 * u(e) -
                                                          t.N2 * u(n) -
                                                          o * s(n))(e) -
                                                    c.reduce(((e, t) => e + t))
                                      })(v, y, n.t_amb, A),
                                      2e3, n.NROptions, "fuel_adFlame"),
                                  r.info(`Adiabatic flame temp: [${
                                      s(n.adFlame)} K] ${k.tempC(n.adFlame)}`),
                                  u(y), "" == w.err && delete w.err),
                      {
                        flows: I, products: y, debug_data: w
                      }
                    }
                  }
                },
                399 : (e, t, n) => {
                  const {
                    newtonRaphson : o,
                    logger : a,
                    LMTD : r,
                    round : s,
                    unitConv : u
                  } = n(170);
                  e.exports = {
                    convSection : (e, t) => {
                      let n = e.tg_sh, o = 0, a = e.t_in_sh, u = e.t_in_conv;
                      const l = (e, t = a) => .5 * (e + t), i = e.m_fluid,
                            _ = e.m_flue, c = (t, n = t) => e.Cp_fluid(l(t, n)),
                            d = (t, n = t) => e.Cp_flue(l(t, n)),
                            f = t => e.kw_fluid(t), m = t => e.kw_tube(t),
                            h = t => e.kw_flue(t), p = t => e.miu_fluid(t),
                            O = t => e.miu_flue(t), $ = e.Rfo, g = e.Rfi_conv,
                            C = e.L_conv, b = e.Do_conv,
                            k = e.Do_conv - 2 * e.Sch_sh_cnv,
                            w = e.Pitch_sh_cnv, N = e.N_conv, v = e.Tpr_sh_cnv,
                            y = e.Nf, S = e.Lf, F = e.Tf,
                            A = v * w * C - (b + 2 * S * F * y) * C * v,
                            M = Math.PI * b * (1 - y * F),
                            T = Math.PI * b * (1 - y * F) +
                                Math.PI * y *
                                    (2 * S * (b + S) + F * (b + 2 * S)),
                            I = T - M, R = N * T * C, D = Math.PI * k ** 2 / 2,
                            H = 2 / 3 *
                                (e.Width_rad * e.Length_rad * e.Height_rad) **
                                (1 / 3),
                            P = (e.Ph2o + e.Pco2) * H, x = 3.6,
                            B = e => p(e) * x * c(e) / f(e),
                            Q = e => O(e) * x * d(e) / h(e), W = i / x / D,
                            E = e => W * k / p(e), G = _ / A,
                            L = e => G / x * b / O(e),
                            U = (e, t = e) => f(e) / k * .023 * E(e) ** .8 *
                                              B(e) ** (1 / 3) * (p(e) / p(t)) **
                                              .14,
                            J = (e, t = a) => i * c(e, t) * (t - e),
                            K = (e = l(a, u), t = e, n = u) =>
                                (e => J(e))(n) / R * (b / k) *
                                    (g + 1 / U(e, t) +
                                     k * Math.log(b / k) / (2 * m(t))) +
                                e,
                            V = (e, t) =>
                                2.2 * 2.7431452152 * P ** .5 * (M / T) ** .75;
                      let j = (e, t) =>
                          h(e) / b * .33 * Q(e) ** (1 / 3) * L(e) ** .6;
                      const q = (e, t) => 1 / (1 / (j(e, t) + V()) + $),
                            z = 1.36 * m(K(l(u, a), K(l(u, a)))), X = S + F / 2,
                            Y = (q(l(n, o), K(l(u, a), K(l(u, a)))) /
                                 (6 * z * F)) **
                                .5,
                            Z = Math.tanh(Y * X) / (Y * X),
                            ee = Z * (.7 + .3 * Z), te = b + 2 * S,
                            ne = ee * (.45 * Math.log(te / b) * (ee - 1) + 1),
                            oe = (e, t) => q(e, t) * (ne * I + M) / T,
                            ae = (t, n) => ((e, t, n, o) => {
                              const a = t.Lf, r = 1 / t.Nf - t.Tf,
                                    s = .35 + .65 * Math.exp(-.25 * a / r),
                                    u = t.Pitch_sh_cnv, l = t.Pitch_sh_cnv,
                                    i = t.N_conv / t.Tpr_sh_cnv,
                                    _ = .7 +
                                        (.7 - .8 * Math.exp(-.15 * i ** 2)) *
                                            Math.exp(-u / l),
                                    c = (2 * t.Lf + t.Do_conv) / t.Do_conv,
                                    d = (e, t) =>
                                        e +
                                        (t - e) / ((Math.exp(1.4142 * n * o) +
                                                    Math.exp(-1.4142 * n * o)) /
                                                   2);
                              return t.Ts = d,
                                     (t, n) => (t => .25 * e(t) ** -.35)(t) *
                                               s * _ * c ** .5 *
                                               (t / d(t, n)) ** .25
                            })(L, e, Y, X)(t, n);
                      j = (e, t) => ae(e, t) * G * d(e) * Q(e) ** -.67;
                      const re = e => r(e, a, n, o),
                            se = (e, t) => b / k * (1 / U(e, t) + g),
                            ue = e => b * Math.log(b / k) / (2 * m(e)),
                            le = (e, t) => 1 / oe(e, t),
                            ie = (e, t, n) =>
                                1 / ((e, t, n) =>
                                         le(e, n) + ue(n) + se(t, n))(e, t, n),
                            _e = (e, t) => _ * d(e, t) * (e - t),
                            ce = (e, t, n) =>
                                ie(l(n, t), l(e), K(l(e), K(l(e)))) * R * re(e),
                            de = e => Math.abs(n - J(e) / (_ * d(n)));
                      var fe;
                      return o = de(u), fe = o,
                             u = Math.abs(a - ce(u, n, fe) / (i * c(u, a))),
                             o = de(u), e.t_in_conv_calc = u, e.tg_conv = o, {
                        t_fin: e.Ts(l(u), K(l(u), K(l(u)))),
                            t_in_given: e.t_in_conv, t_in: u, t_out: a,
                            Tb: l(u), Tw: K(l(u), K(l(u))), tg_out: o, tg_in: n,
                            Tb_g: l(n, o), LMTD: re(u), DeltaA: n - a,
                            DeltaB: o - u, Q_flue: _e(n, o), Q_fluid: J(u),
                            Q_conv: ce(u, n, o), Q_stack: _e(o, e.t_air),
                            duty: J(u), "%": J(u) / e.duty, duty_flux: J(u) / R,
                            Cp_fluid: c(u, a), Cp_flue: d(n, o),
                            miu_fluid: p(K(l(u))), miu_flue: O(o),
                            kw_fluid: f(l(u)), kw_tube: m(K(l(u))), kw_fin: z,
                            kw_flue: h(l(n, o)), Prandtl: s(B(l(a))),
                            Reynolds: s(E(l(a))), PrandtlFlue: s(Q(l(a))),
                            ReynoldsFlue: s(L(l(a))), At: R, Ai: D, An: A,
                            Ao: T, Apo: M, Afo: I, Ef: ne, Gn: G / x,
                            hi: U(l(u), K(l(u), K(l(u)))),
                            hr: V(l(n, o), K(l(u), K(l(u)))),
                            ho: q(l(n, o), K(l(u), K(l(u)))),
                            hc: j(l(n, o), K(l(u), K(l(u)))),
                            he: oe(l(n, o), K(l(u), K(l(u)))),
                            j: ae(l(n, o), K(l(u), K(l(u)))),
                            gr: (l(n, o), K(l(u), K(l(u))), 2.7431452152),
                            Uo: ie(l(n, o), l(u), K(l(u))),
                            R_int: se(l(u), K(l(u))), R_tube: ue(K(l(u))),
                            R_ext: le(l(n, o), K(l(u))), TUBING: {
                              Material: e.Material,
                              Nt: v,
                              N,
                              Sch: e.Sch_sh_cnv,
                              Do: b,
                              L: C,
                              S_tube: w
                            },
                            FINING: {
                              Material: e.FinMaterial,
                              Type: e.FinType,
                              Height: e.Lf,
                              Thickness: e.Tf,
                              Dens: e.Nf,
                              Arrange: e.FinArrange
                            }
                      }
                    }
                  }
                },
                623 : (e, t, n) => {
                  const {
                    newtonRaphson : o,
                    logger : a,
                    round : r,
                    unitConv : s
                  } = n(170),
                 u = e => {
                   const t = {
                     a : {A : 2.58e-8, B : -39e-9, C : 6.8e-9, D : -2.2e-10},
                     b : {A : -119e-6, B : 56e-6, C : -41e-7, D : -72e-8},
                     c : {A : .21258, B : .2258, C : -.047351, D : .004165}
                   },
                         n = (e, n = t) => t =>
                             n.a[e] * t ** 2 + n.b[e] * t + n.c[e],
                         o = n("A"), a = n("B"), r = n("C"), s = n("D");
                   return t => o(t) + a(t) * e + r(t) * e ** 2 + s(t) * e ** 3
                 }, l = (e, t, n, o, a) => {
                   const r = n * o + e * t, s = a - r;
                   return { Aw: s, Aw_aAcp: s / r }
                 };
                  e.exports = {
                    radSection : (e, t) => {
                      let n = 0, i = 0, _ = e.t_out, c = e.m_fuel, d = 0, f = 0;
                      const m = e.t_air, h = e.t_fuel, p = e.t_amb,
                            O = e.t_in_conv, $ = (e, t = i) => .5 * (t + e),
                            g = e.Rfi, C = e.N_rad, b = e.N_shld, k = e.L_rad,
                            w = e.L_shld, N = e.Do_rad,
                            v = e.Do_rad - e.Sch_rad, y = e.Pitch_rad || .394,
                            S = e.Pitch_sh_cnv, F = e.h_conv || 30.66,
                            A = 2 / 3 *
                                (e.Width_rad * e.Length_rad * e.Height_rad) **
                                (1 / 3),
                            M = (e.Ph2o + e.Pco2) * A,
                            T = 1 + y / N * .49 / 6 - .09275 * (y / N) ** 2 +
                                .065 * (y / N) ** 3 / 6 + 25e-5 * (y / N) ** 4,
                            I = C * Math.PI * N * k, R = C * y * k,
                            D = b / 2 * S * w,
                            H = (e => {
                              const t = s.m2toft2(e.Pitch_sh_cnv *
                                                  e.Tpr_sh_cnv * e.L_shld),
                                    n = e.Length_rad * e.Width_rad,
                                    o = e.Height_rad * e.Width_rad,
                                    a = e.Height_rad * e.Length_rad,
                                    r = s.mtoft(e.Pitch_sh_cnv * e.Tpr_sh_cnv),
                                    u = (e.Width_rad - r) / 2,
                                    l = s.mtoft(4 * e.Pitch_rad),
                                    i = Math.sin(Math.acos(u / l)) * l,
                                    _ = 2 * o + 2 * a + 2 * n - t -
                                        (2 * u * i + 2 * r * i) -
                                        Math.PI / 4 * 13 * 2.24 ** 2;
                              return s.ft2tom2(_)
                            })(e),
                            {Aw : P, Aw_aAcp : x} = l(T, R, 1, D, H),
                            B = Math.PI * v ** 2 / 2, Q = 2.04133464e-7,
                            W = e => ((e, t, n, o, a, r) => {
                              const {
                                Aw_aAcp : s
                              } = l(t, n, o, a, r),
                             i = u(e), _ = {
                               a : {A : -5e-4, B : .0072, C : -.0062},
                               b : {A : .0022, B : -.1195, C : .1168},
                               c : {A : .0713, B : .5333, C : -.6473},
                               d : {A : -.0152, B : 1.0577, C : -.154}
                             },
                             c = (e, t = _) => n => t.a[e] * n ** 3 +
                                                    t.b[e] * n ** 2 +
                                                    t.c[e] * n + t.d[e],
                             d = c("A"), f = c("B"), m = c("C");
                              return e => d(s) + f(s) * i(e) + m(s) * i(e) ** 2
                            })(M, T, R, 1, D, H)(s.KtoF(e)),
                            E = e.duty_rad_dist || .7, G = e.efficiency || .8,
                            L = e.heat_loss_percent || .015, U = e.NCV,
                            J = e.m_fluid, K = (t = c) => e.m_flue_ratio * t,
                            V = e.Cp_fuel($(h, p)), j = e.Cp_air($(m, p)),
                            q = (t, n = t) => e.Cp_fluid($(t, n)),
                            z = (t, n = t) => e.Cp_flue($(t, n)),
                            X = t => e.kw_fluid(t), Y = t => e.kw_tube(t),
                            Z = t => e.miu_fluid(t), ee = J / 3.6 / B,
                            te = e => Z(e) * q(e) * 3.6 / X(e),
                            ne = e => ee * v / Z(e),
                            oe = (e, t = e) => X(e) / v * .023 * ne(e) ** .8 *
                                               te(e) ** (1 / 3) *
                                               (Z(e) / Z(t)) ** .14,
                            ae = (e, t = e, n = f) =>
                                n / I * (N / v) *
                                    (g + 1 / oe(e, t) +
                                     v * Math.log(N / v) / (2 * Y(t))) +
                                e,
                            re = t =>
                                ((t = c) => e.m_air_ratio * t)(t) * j * (m - p),
                            se = e => e * V * (h - p), ue = e => e * U,
                            le = e => ue(e) + re(e) + se(e),
                            ie = (e, t) => K(t) * z(e, p) * (e - p),
                            _e = e => ue(e) * L, ce = (e, t) => F * I * (e - t),
                            de = (e, t) => W(e) * Q * T * R * (e ** 4 - t ** 4),
                            fe = (e, t) => W(e) * Q * 1 * D * (e ** 4 - t ** 4),
                            me = (e, t) => de(e, t) + ce(e, t),
                            he = (e, t = c, n = ae($(_), ae($(_)))) =>
                                me(e, n) + fe(e, n) + _e(t) + ie(e, t),
                            pe = (e, t) => J * q(t, e) * (e - t);
                      if (0 !== _) {
                        d = pe(_, O), f = d * E,
                        i = O + d * (1 - E) / (J * q(O, _));
                        const r =
                            o((e => pe(_, i) - me(e, ae($(_), ae($(_))))), 1e3,
                              e.NROptions, "Tg_Tout-seed_radiant", t);
                        r && (n = r);
                        const s = e => le(e) - he(n, e, ae($(_), ae($(_))));
                        let u = pe(_, O) / (U * G);
                        t || a.debug(`"mass_fuel_seed", "value": "${u}"`),
                            u = o(s, u, e.NROptions, "M-fuel_T-seed_radiant",
                                  t),
                            u && (c = u), f = me(n, ae($(_), ae($(_))))
                      } else {
                        d = ue(c) * G, f = d * E,
                        i = O + d * (1 - E) / (J * q(O));
                        let r = O + d / (J * q(i));
                        const s =
                            o((e => le(c) - he(e, c, ae($(r), ae($(r))))), 1e3,
                              e.NROptions, "Tg_mFuel-seed_radiant", t);
                        s && (n = s),
                            r = o((e => pe(e, i) - me(n, ae($(e), ae($(e))))),
                                  r, e.NROptions, "Tout_mFuel-seed_radiant", t),
                            r && (_ = r);
                        const u = J * q(i, _) * (_ - O),
                              l = e.t_in_conv + u * (1 - E) / (J * q(i, _));
                        t || a.info(`t_out, seed: ${r} vs calc: ${_}`),
                            t || a.info(`t_in_rad, seed: ${i} vs calc: ${l}`)
                      }
                      t || a.default(
                               `RADI, T_in_calc: ${e.units.tempC(i)}, M_fuel: ${
                                   e.units.mass_flow(
                                       c)}, Tg_out: ${e.units.tempC(n)}`),
                          e.t_in_rad = i, e.t_out = _, e.tg_rad = n, e.duty = d,
                          e.m_flue = K(c), e.t_w_rad = ae($(_), ae($(_))),
                          e.q_rad_sh = fe(n, e.t_w_rad);
                      const Oe = {
                        m_fuel : c,
                        m_fluid : J,
                        t_in : i,
                        t_out : _,
                        Tw : e.t_w_rad,
                        tg_out : n,
                        Q_in : le(c),
                        Q_rls : ue(c),
                        Q_air : re(c),
                        Q_fuel : se(c),
                        Q_out : he(n, c),
                        Q_flue : ie(n, c),
                        Q_losses : _e(c),
                        Q_shld : fe(n, e.t_w_rad),
                        Q_conv : ce(n, e.t_w_rad),
                        Q_rad : de(n, e.t_w_rad),
                        Q_R : me(n, e.t_w_rad),
                        Q_fluid : pe(_, i),
                        At : I,
                        Ar : H,
                        Ai : B,
                        Aw : P,
                        Aw_aAcp : x,
                        Acp : R,
                        aAcp : T * R,
                        Acp_sh : D,
                        hi : oe($(_), e.t_w_rad),
                        h_conv : F,
                        duty_total : d,
                        duty : f,
                        "%" : f / d,
                        eff_total : d / ue(c) > 1 ? 100 : 100 * d / ue(c),
                        duty_flux : f / I,
                        Alpha : T,
                        MBL : r(A),
                        Pco2 : r(e.Pco2),
                        Ph2o : r(e.Ph2o),
                        PL : r(M),
                        F : r(W(n)),
                        emiss : r(u(M)(n)),
                        kw_tube : Y(ae($(i))),
                        kw_fluid : X($(i)),
                        kw_flue : e.kw_flue(n),
                        Cp_fluid : q(i, _),
                        Cp_flue : z(n, p),
                        Cp_fuel : V,
                        Cp_air : j,
                        Prandtl : r(te($(_))),
                        Reynolds : r(ne($(_))),
                        TUBING : {
                          Material : e.Material,
                          Nt : 2,
                          N : C,
                          Sch : e.Sch_rad,
                          Do : N,
                          L : k,
                          S_tube : y
                        },
                        FINING : "None"
                      };
                      return Oe.miu_flue = e.miu_flue(n),
                             Oe.miu_fluid = Z($(_)), Oe
                    }
                  }
                },
                16 : (e, t, n) => {
                  const {
                    newtonRaphson : o,
                    logger : a,
                    LMTD : r,
                    round : s,
                    unitConv : u
                  } = n(170);
                  e.exports = {
                    shieldSection : (e, t) => {
                      let n = e.tg_rad, u = 0, l = e.t_in_rad,
                          i = .5 * (e.t_in_rad + e.t_in_conv), _ = 0;
                      const c = (e, t = l) => .5 * (e + t), d = e.m_fluid,
                            f = e.m_flue, m = (t, n = t) => e.Cp_fluid(c(t, n)),
                            h = (t, n = t) => e.Cp_flue(c(t, n)),
                            p = t => e.kw_fluid(t), O = t => e.kw_tube(t),
                            $ = t => e.kw_flue(t), g = t => e.miu_fluid(t),
                            C = t => e.miu_flue(t), b = e.Rfo_shld,
                            k = e.Rfi_shld, w = e.N_shld, N = e.L_shld,
                            v = e.Do_shld, y = e.Do_shld - 2 * e.Sch_sh_cnv,
                            S = e.Pitch_sh_cnv, F = w * Math.PI * v * N,
                            A = Math.PI * y ** 2 / 2, M = w / 2 * (S - v) * N,
                            T = 3.6, I = e => g(e) * T * m(e) / p(e),
                            R = e => C(e) * T * h(e) / $(e), D = d / T / A,
                            H = e => D * y / g(e), P = f / T / M,
                            x = e => P * v / C(e),
                            B = (e, t = e) => p(e) / y * .023 * H(e) ** .8 *
                                              I(e) ** (1 / 3) * (g(e) / g(t)) **
                                              .14,
                            Q = e => .092 * e - 34,
                            W = e =>
                                $(e) / v * .33 * R(e) ** (1 / 3) * x(e) ** .6,
                            E = (e, t = n) =>
                                1 / (1 / (W(c(e, t)) + Q(c(e, t))) + b),
                            G = e => d * m(e) * (l - e),
                            L = (e, t = e, n = i) =>
                                G(n) / F * (v / y) *
                                    (k + 1 / B(e, t) +
                                     y * Math.log(v / y) / (2 * O(t))) +
                                e,
                            U = (e, t) => v / (y * B(e, t)) + v / y * k,
                            J = e => v * Math.log(v / y) / (2 * O(e)),
                            K = (e, t = n) => 1 / E(e, t),
                            V = (e, t, n, o) =>
                                1 / ((e, t, n, o) =>
                                         K(e, t) + J(o) + U(n, o))(e, t, n, o),
                            j = e.q_rad_sh,
                            q = (e, t, n, o, a) =>
                                V(n, t, o, a) * F * r(e, l, t, n),
                            z = (e, t, n, o, a) => j + q(e, t, n, o, a),
                            X = (e, t = l) => d * m(e, t) * (t - e),
                            Y = (e, t = u) => f * h(e, t) * (e - t),
                            Z = e => Y(n, e) + j - X(i, l),
                            ee = e => X(e) - z(e, n, u, c(e), L(c(e), L(c(e))));
                      u = o(Z, n - 200, e.NROptions, "Tg_out_shield-1", t),
                      _ = o(ee, i, e.NROptions, "T_in_shield-1", t);
                      let te = 1;
                      const ne = e => Math.abs(
                          (Y(n, e) - q(i, n, e, c(i), L(c(i), L(c(i))))) /
                          Y(n, u));
                      for (; ne(u) - .001 > 0;) {
                        if (!_) {
                          a.error("Invalid t_in_calc at shield sect");
                          break
                        }
                        if (i = _,
                            _ = o(ee, i, e.NROptions, "T_in_shield-2", !0),
                            u = o(Z, n - 58, e.NROptions, "Tg_out_shield-2",
                                  !0),
                            te++, te > 35) {
                          a.debug(`"Tin_shield",  "t_in_sh_calc": ${
                              s(_)}, "t_in_sh_sup": ${s(i)}`),
                              t || a.info(`diff vs error: ${ne(u)}-0.001`),
                              a.error(
                                  "Max iterations reached for inlet temp calc at shield sect");
                          break
                        }
                      }
                      return t || a.default(`SHLD, cycles: ${te}, T_in_calc: ${
                                      e.units.tempC(
                                          i)}, Tg_out: ${e.units.tempC(u)}`),
                             e.t_in_sh = i, e.tg_sh = u, {
                        m_flue: f, t_in_sup: .5 * (e.t_in_rad + e.t_in_conv),
                            t_in: i, t_out: l, Tb: c(i), Tw: L(c(i), L(c(i))),
                            tg_out: u, tg_in: n, Tb_g: c(n, u),
                            LMTD: r(i, l, n, u), DeltaA: n - l, DeltaB: u - i,
                            Q_flue: Y(n, u), Q_fluid: X(i),
                            Q_R: z(i, n, u, c(i), L(c(i))), Q_rad: j,
                            Q_conv: q(i, n, u, c(i), L(c(i))),
                            Cp_fluid: m(i, l), Cp_flue: h(n, u),
                            miu_fluid: g(L(c(i))), miu_flue: C(u), duty: G(i),
                            "%": G(i) / e.duty, duty_flux: G(i) / F,
                            kw_fluid: p(c(i)), kw_tube: O(L(c(i))),
                            kw_flue: $(c(n, u)), Prandtl: s(I(c(l))),
                            Reynolds: s(H(c(l))), PrandtlFlue: s(R(c(l))),
                            ReynoldsFlue: s(x(c(l))), At: F, Ai: A, An: M,
                            Gn: P, hi: B(c(i)), hi_tw: B(c(i), L(c(i))),
                            hr: Q(n), ho: E(u), hc: W(c(n, u)),
                            Uo: V(u, n, c(i), L(c(i), L(c(i)))),
                            R_int: U(c(i), L(c(i), L(c(i)))),
                            R_tube: J(L(c(i), L(c(i)))), R_ext: K(u, n),
                            TUBING: {
                              Material: e.Material,
                              Nt: e.Tpr_sh_cnv,
                              N: w,
                              Sch: e.Sch_sh_cnv,
                              Do: v,
                              L: N,
                              S_tube: S
                            },
                            FINING: "None"
                      }
                    }
                  }
                },
                691 : (e, t, n) => {
                  const {logger : o, unitConv : a} = n(170);
                  e.exports = {
                    optionsModifier : (e, t, n) => {
                      let r;
                      switch (e) {
                      case "project_title":
                        "" != t[e] && (n.title = t[e]);
                        break;
                      case "project_n":
                        "" != t[e] && (n.case = t[e]);
                        break;
                      case "revision_n":
                      case "fuel_percent":
                        break;
                      case "date":
                        "" != t[e] && (n.date = t[e]);
                        break;
                      case "heat_loss":
                        r = parseFloat(t[e]), r <= 15 && (n.hLoss = .01 * r);
                        break;
                      case "efficiency":
                        r = parseFloat(t[e]), r >= 50 && (n.effcy = .01 * r);
                        break;
                      case "rad_dist":
                        r = parseFloat(t[e]),
                        r >= 40 && (n.radDist = .01 * r, n.runDistCycle = !1);
                        break;
                      case "rfi":
                        r = parseFloat(t[e]), r >= 0 && (n.rfi = r);
                        break;
                      case "rfo":
                        r = parseFloat(t[e]), r >= 0 && (n.rfo = r);
                        break;
                      case "t_fuel":
                        r = parseFloat(t[e]),
                        r >= 0 && r && (n.tFuel = a.FtoK(r));
                        break;
                      case "unit_system":
                        o.debug(`"${e}", "value":"${t[e]}"`),
                            n.unitSystem = t[e];
                        break;
                      default:
                        ((e, t, n) => {
                          let o;
                          switch (e) {
                          case "graph_var":
                            switch (t[e]) {
                            case "humidity":
                              n.graphVar = "humidity";
                              break;
                            case "air_excess":
                              n.graphVar = "air_excess";
                              break;
                            case "m_fluid":
                              n.graphVar = "m_fluid"
                            }
                            break;
                          case "graph_range":
                            o = parseFloat(t[e]), o > 0 && (n.graphRange = o);
                            break;
                          case "graph_points":
                            o = parseFloat(t[e]),
                            o > 0 && o <= 200 && (n.graphPoints = o)
                          }
                        })(e, t, n),
                            ((e, t, n) => {
                              let o;
                              switch (e) {
                              case "m_fluid":
                                o = parseFloat(t[e]),
                                o > 0 && o < 175 &&
                                    (n.mFluid = a.BPDtolb_h(1e3 * o));
                                break;
                              case "t_in":
                                o = parseFloat(t[e]), o > 0 && (n.tIn = o);
                                break;
                              case "t_out":
                                o = parseFloat(t[e]), o > 0 && (n.tOut = o)
                              }
                            })(e, t, n),
                            ((e, t, n) => {
                              let o;
                              switch (e) {
                              case "t_amb":
                                o = parseFloat(t[e]),
                                o < 100 && (n.tAir = a.FtoK(o));
                                break;
                              case "humidity":
                                o = parseFloat(t[e]),
                                o >= 0 && o <= 100 && (n.humidity = o);
                                break;
                              case "p_atm":
                                o = parseFloat(t[e]),
                                o > .001 && o < 2 && (n.pAtm = o * n.pAtmRef);
                                break;
                              case "air_excess":
                                o = parseFloat(t[e]),
                                o >= 0 && o <= 300 && (n.airExcess = .01 * o);
                                break;
                              case "o2_excess":
                                o = parseFloat(t[e]),
                                o >= 0 && o <= 30 && (n.o2Excess = .01 * o)
                              }
                            })(e, t, n)
                      }
                    }
                  }
                },
                30 : (e, t, n) => {
                  const {round : o, initSystem : a} = n(170);
                  e.exports = {
                    stringRadResult : (e, t, n) => {
                      const r = a(n);
                      let s;
                      return s = "es" == e ? "Resultados sección radiante:"
                                           : "Radiant section results:",
                             s += `\n\n  t_in:     ${
                                 r.tempC(t.t_in)}      \n  t_out:    ${
                                 r.tempC(t.t_out)}      \n  Tw:       ${
                                 r.tempC(t.Tw)}      \n\n  tg_out:   ${
                                 r.tempC(t.tg_out)}     \n\n  Q_in:     ${
                                 r.heat_flow(t.Q_in)} \n    Q_rls:    ${
                                 r.heat_flow(t.Q_rls)} \n    Q_air:    ${
                                 r.heat_flow(t.Q_air)}  \n    Q_fuel:   ${
                                 r.heat_flow(t.Q_fuel)}  \n\n  Q_out:    ${
                                 r.heat_flow(t.Q_out)} \n    Q_flue:   ${
                                 r.heat_flow(t.Q_flue)} \n    Q_losses: ${
                                 r.heat_flow(t.Q_losses)}  \n    Q_shld:   ${
                                 r.heat_flow(t.Q_shld)}  \n    Q_R:      ${
                                 r.heat_flow(t.Q_R)} \n      Q_conv: ${
                                 r.heat_flow(t.Q_conv)}  \n      Q_rad:  ${
                                 r.heat_flow(t.Q_rad)} \n    Q_fluid:  ${
                                 r.heat_flow(t.Q_fluid)} \n\n  duty_rad:   ${
                                 o(100 * t["%"], 2)}%  \n\n  At:       ${
                                 r.area(t.At)}    \n  Ar:       ${
                                 r.area(t.Ar)}    \n  Acp:      ${
                                 r.area(t.Acp)}    \n  αAcp:     ${
                                 r.area(t.aAcp)}    \n  Aw:       ${
                                 r.area(t.Aw)}    \n  Aw/αAcp:  ${
                                 o(t.Aw_aAcp)}           \n  Alpha:    ${
                                 o(t.Alpha)}           \n  Acp_sh:   ${
                                 r.area(t.Acp_sh)}     \n  Ai:        ${
                                 r.area(t.Ai)}      \n\n  hi:     ${
                                 r.convect(t.hi)} \n  h_conv:   ${
                                 r.convect(t.h_conv)} \n\n  MBL:      ${
                                 t.MBL} ft \n  GPpres:   ${
                                 o(1 * t.Pco2 +
                                   1 * t.Ph2o)} atm \n  PL:       ${
                                 t.PL} atm-ft \n  GEmiss:   ${
                                 t.emiss} \n  F:        ${
                                 t.F} \n\n  kw_tube:  ${
                                 r.thermal(t.kw_tube)}\n  kw_fluid: ${
                                 r.thermal(t.kw_fluid)}\n  kw_flue:  ${
                                 r.thermal(t.kw_flue)}\n  \n  miu_fluid:${
                                 r.viscosity(t.miu_fluid)}\n  miu_flue: ${
                                 r.viscosity(t.miu_flue)}\n\n  Cp_fluid: ${
                                 r.cp(t.Cp_fluid)}\n  Cp_flue:  ${
                                 r.cp(t.Cp_flue)}\n  \n  Cp_fuel:  ${
                                 r.cp(t.Cp_fuel)}\n  Cp_air:   ${
                                 r.cp(t.Cp_air)}\n  Pr_fluid: ${
                                 t.Prandtl}\n  Re_fluid: ${
                                 t.Reynolds}\n\n  TUBING:\n    Material:       ${
                                 t.TUBING.Material}\n    No Tubes Wide:  ${
                                 t.TUBING.Nt}\n    No Tubes:       ${
                                 t.TUBING.N}\n    Wall Thickness: ${
                                 r.lengthC(
                                     t.TUBING.Sch)}\n    Outside Di:     ${
                                 r.lengthC(t.TUBING.Do)}\n    Pitch:          ${
                                 r.lengthC(
                                     t.TUBING.S_tube)}\n    Ef. Length:     ${
                                 r.length(t.TUBING.L)}\n    \n  `,
                             "\n" + s
                    },
                    stringShldResult : (e, t, n) => {
                      const r = a(n);
                      let s;
                      return s = "es" == e ? "Resultados sección de escudo:"
                                           : "Shield section results:",
                             s += `\n\n  t_in:     ${
                                 r.tempC(t.t_in)} \n  t_out:    ${
                                 r.tempC(t.t_out)} \n  Tw:       ${
                                 r.tempC(t.Tw)} \n  \n  tg_in:      ${
                                 r.tempC(t.tg_in)} \n  tg_out:     ${
                                 r.tempC(t.tg_out)} \n\n  LMTD:     ${
                                 r.temp(t.LMTD)}    \n  DeltaA:     ${
                                 r.temp(t.DeltaA)}\n  DeltaB:     ${
                                 r.temp(t.DeltaB)}\n  DeltaA-B:   ${
                                 r.temp(t.DeltaA - t.DeltaB)}\n  Log(A/B):   ${
                                 o(Math.log(t.DeltaA /
                                            t.DeltaB))}\n\n  Q_flue:   ${
                                 r.heat_flow(
                                     t.Q_flue)} \n    M_fuel xCp x(Tg_in-Tg_out)\n  Q_Shield: ${
                                 r.heat_flow(t.Q_R)} \n    Q_rad:   ${
                                 r.heat_flow(t.Q_rad)} \n    Q_conv:  ${
                                 r.heat_flow(t.Q_conv)} \n  Q_fluid:  ${
                                 r.heat_flow(t.Q_fluid)} \n\n  duty_shld: ${
                                 o(100 * t["%"], 2)}% \n\n  At:    ${
                                 r.area(t.At)}     \n  An:     ${
                                 r.area(t.An)}     \n  Ai:      ${
                                 r.area(t.Ai)}\n  Gn:    ${
                                 o(t.Gn / 3600)} lb/sec-ft² \n\n  Uo:    ${
                                 r.convect(t.Uo)} \n  R_int: ${
                                 o(t.R_int,
                                   6)}\n  R_tub: ${o(t.R_tube, 6)}\n  R_ext: ${
                                 o(t.R_ext,
                                   6)}\n\n  hi: ${r.convect(t.hi)} \n  hr:   ${
                                 r.convect(t.hr)}\n  ho:   ${
                                 r.convect(t.ho)}\n  hc:   ${
                                 r.convect(t.hc)}\n\n  kw_tube:  ${
                                 r.thermal(t.kw_tube)}\n  kw_fluid: ${
                                 r.thermal(t.kw_fluid)}\n  kw_flue:  ${
                                 r.thermal(t.kw_flue)}\n  \n  miu_fluid:${
                                 r.viscosity(t.miu_fluid)}\n  miu_flue: ${
                                 r.viscosity(t.miu_flue)}\n\n  Cp_fluid: ${
                                 r.cp(t.Cp_fluid)}\n  Cp_flue:  ${
                                 r.cp(t.Cp_flue)}\n\n  Pr_flue:  ${
                                 t.PrandtlFlue}\n  Re_flue:  ${
                                 t.ReynoldsFlue}\n  Pr_fluid: ${
                                 t.Prandtl}\n  Re_fluid: ${
                                 t.Reynolds}\n\n  TUBING:\n    Material:       ${
                                 t.TUBING.Material}\n    No Tubes Wide:  ${
                                 t.TUBING.Nt}\n    No Tubes:       ${
                                 t.TUBING.N}\n    Wall Thickness: ${
                                 r.lengthC(
                                     t.TUBING.Sch)}\n    Outside Di:     ${
                                 r.lengthC(t.TUBING.Do)}\n    Tran Pitch:     ${
                                 r.lengthC(
                                     t.TUBING.S_tube)}\n    Long Pitch:     ${
                                 r.lengthC(
                                     t.TUBING.S_tube)}\n    Ef. Length:     ${
                                 r.length(t.TUBING.L)}\n\n  `,
                             "\n" + s
                    },
                    stringConvResult : (e, t, n) => {
                      const r = a(n);
                      let s;
                      return s = "es" == e ? "Resultados sección convectiva:"
                                           : "Convective section results:",
                             s +=
                             `\n\n  t_in:     ${r.tempC(t.t_in)}\n  t_out:    ${
                                 r.tempC(t.t_out)}      \n  Tw:       ${
                                 r.tempC(t.Tw)}      \n  \n  tg_in:      ${
                                 r.tempC(t.tg_in)}   \n  tg_stack:   ${
                                 r.tempC(t.tg_out)}    \n\n  LMTD:     ${
                                 r.temp(t.LMTD)}      \n  DeltaA:     ${
                                 r.temp(t.DeltaA)}\n  DeltaB:     ${
                                 r.temp(t.DeltaB)}\n  DeltaA-B:     ${
                                 r.temp(t.DeltaA -
                                        t.DeltaB)}\n  Log(|A/B|):   ${
                                 o(Math.log(Math.abs(
                                     t.DeltaA / t.DeltaB)))}\n\n  Q_flue:   ${
                                 r.heat_flow(t.Q_flue)}\n  Q_conv:   ${
                                 r.heat_flow(t.Q_conv)}   \n  Q_fluid:  ${
                                 r.heat_flow(t.Q_fluid)}   \n\n  Q_stack:  ${
                                 r.heat_flow(t.Q_stack)}\n\n  duty_conv: ${
                                 o(100 * t["%"], 2)}% \n\n  At:   ${
                                 r.area(t.At)}        \n  An:    ${
                                 r.area(t.An)}         \n  Ao:     ${
                                 r.area(t.Ao)}         \n  Afo:    ${
                                 r.area(t.Afo)}         \n  Apo:    ${
                                 r.area(t.Apo)}          \n  Ai:     ${
                                 r.area(t.Ai)}          \n  F_eff:  ${
                                 o(t.Ef, 6)}           \n  Gn:    ${
                                 o(t.Gn / 3600)} lb/sec-ft²    \n\n  Uo:    ${
                                 r.convect(t.Uo)}  \n  R_int: ${
                                 o(t.R_int,
                                   6)}\n  R_tub: ${o(t.R_tube, 6)}\n  R_ext: ${
                                 o(t.R_ext, 6)}\n\n  hi:   ${
                                 r.convect(t.hi)} \n  hr:   ${
                                 r.convect(t.hr)}\n  ho:   ${
                                 r.convect(t.ho)}   \n  hc:   ${
                                 r.convect(t.hc)}\n  he:   ${
                                 r.convect(t.he)}      \n\n  kw_fin:   ${
                                 r.thermal(t.kw_fin)} \n  kw_tube:  ${
                                 r.thermal(t.kw_tube)}\n  kw_fluid: ${
                                 r.thermal(t.kw_fluid)}\n  kw_flue:  ${
                                 r.thermal(t.kw_flue)}\n  \n  miu_fluid:${
                                 r.viscosity(t.miu_fluid)}\n  miu_flue: ${
                                 r.viscosity(t.miu_flue)}\n\n  Cp_fluid: ${
                                 r.cp(t.Cp_fluid)}\n  Cp_flue:  ${
                                 r.cp(t.Cp_flue)}\n\n  Pr_flue:  ${
                                 t.PrandtlFlue}\n  Re_flue:  ${
                                 t.ReynoldsFlue}\n  Pr_fluid: ${
                                 t.Prandtl}\n  Re_fluid: ${
                                 t.Reynolds}\n\n  TUBING:\n    No Tubes:    ${
                                 t.TUBING
                                     .N}\n    Other props: Same as shield\n\n  FINNING: \n    Material:   ${
                                 t.FINING.Material}\n    Type:       ${
                                 t.FINING.Type}\n    Height:     ${
                                 r.lengthC(t.FINING.Height)}\n    Thickness:  ${
                                 r.lengthC(
                                     t.FINING.Thickness)}\n    Dens:       ${
                                 r.lengthInv(
                                     t.FINING.Dens)},\n    Arrange:    ${
                                 t.FINING.Arrange}\n  `,
                             "\n" + s
                    },
                    stringCombResult : (e, t, n) => {
                      const r = a(n);
                      let s;
                      return s = "es" == e
                                     ? `\nDatos de entrada\n  (en caso de no haber sido introducidos, el \n    simulador tomará los valores predeterminado)\n\n  Sistema de unidades:      ${
                                           t.debug_data
                                               .unitSystem}\n  Presión atmosférica:      ${
                                           t.debug_data
                                               .atmPressure}\n  Temperatura ref:          ${
                                           t.debug_data
                                               .ambTemperature}\n  Temperatura aire:         ${
                                           t.debug_data
                                               .airTemperature}\n  Temperatura comb:         ${
                                           t.debug_data
                                               .fuelTemperature}\n\n  Humedad:                  ${
                                           o(t.debug_data["humidity_%"],
                                             3)} %\n  N2 en aire seco:          ${
                                           t.debug_data["dryAirN2_%"]} %\n  O2 en aire seco:          ${
                                           t.debug_data["dryAirO2_%"]} %\n\n  Presión de aire seco:     ${
                                           t.debug_data
                                               .dryAirPressure}\n  Presión de vapor de agua:  ${
                                           t.debug_data
                                               .waterPressure}\n\n  Fracción parcial de H2O: ${
                                           t.debug_data["H2OPressure_%"]} ÷10²\n  Fracción parcial de N2: ${
                                           t.debug_data["N2Pressure_%"]} ÷10²\n  Fracción parcial de O2: ${
                                           t.debug_data["O2Pressure_%"]} ÷10²\n  Cont. húmedo (w):   ${
                                           t.debug_data
                                               .moisture}-AireSeco\n\n\n  Temp. entrada residuo: ${
                                           r.tempC(
                                               t.conv_result
                                                   .t_in_given)}\n  Temp. salida residuo:  ${
                                           r.tempC(
                                               t.rad_result
                                                   .t_out)}\n\n  Cp(Tb) residuo: ${
                                           t.debug_data
                                               .cpFluidTb}\n\n  Gravedad esp, residuo: ${
                                           t.debug_data
                                               .spGrav}\n  Flujo másico, residuo: ${
                                           r.mass_flow(
                                               t.rad_result
                                                   .m_fluid)}\n\n  Flujo másico, comb.:   ${
                                           r.mass_flow(
                                               t.rad_result
                                                   .m_fuel)}   \n  Flujo másico, gases:   ${
                                           r.mass_flow(
                                               t.shld_result
                                                   .m_flue)} \n\n  Calor requerido: ${
                                           r.heat_flow(
                                               t.rad_result
                                                   .duty_total)}\n  Calor calculado: ${
                                           r.heat_flow(
                                               t.rad_result.duty +
                                               t.shld_result.duty +
                                               t.conv_result
                                                   .duty)}\n\n  Eficiencia del horno: ${
                                           o(t.rad_result.eff_total,
                                             2)}% [Q_rls/Q_fluid]\n\n\nMoles de gases de combustión total y porcentajes\npor cada mol de combustible\n\n  Flujo total: ${
                                           o(t.flows.total_flow,
                                             3)}\n  Flujo seco:  ${
                                           o(t.flows.dry_total_flow,
                                             3)}\n                      Porcentajes en base húmeda\n  N2:  ${
                                           t.products.N2}             N2:  ${
                                           o(t.flows["N2_%"], 3)} %\n  O2:   ${
                                           t.products.O2}             O2:  ${
                                           o(t.flows["O2_%"], 3)} %\n  H2O:  ${
                                           t.products.H2O}             H2O: ${
                                           o(t.flows["H2O_%"], 3)} %\n  CO2:  ${
                                           t.products.CO2}             CO2: ${
                                           o(t.flows["CO2_%"], 3)} %\n  SO2:  ${
                                           t.products.SO2}             SO2: ${
                                           t.flows["SO2_%"] ||
                                           "0.000"} %\n\n  Exceso de aire usado: ${
                                           o(t.flows["air_excess_%"],
                                             3)} %\n  Moles O2 req./mol de comb. (teórico): ${
                                           o(t.flows.O2_mol_req_theor,
                                             3)}\n\n  Rel. A/C molar húmeda:  ${
                                           o(t.flows.AC,
                                             3)}\n  Rel. A/C másica húmeda: ${
                                           o(t.flows.AC_mass,
                                             3)}\n  Rel. A/C molar (aire seco, teórica):    ${
                                           o(t.flows.AC_theor_dryAir,
                                             3)}\n  Rel. A/C másica (aire húmedo, teórica): ${
                                           o(t.flows.AC_mass_theor_moistAir,
                                             3)}\n\n  Peso molecular del comb. ${
                                           t.flows
                                               .fuel_MW}\n  Cp(t_comb) del comb.  ${
                                           t.flows.Cp_fuel}\n  NCV: ${
                                           t.flows
                                               .NCV}\n\n  Peso mol. de los gases de comb. ${
                                           t.flows
                                               .flue_MW}\n  Cp(t_amb) de los gases de comb. ${
                                           t.flows.Cp_flue}\n`
                                     : `\nInput Data \n  (in case of no input, \n  default values will be taken)\n\n  Unit System:          ${
                                           t.debug_data
                                               .unitSystem}\n  Atmospheric Pressure: ${
                                           t.debug_data
                                               .atmPressure}\n  Ref Temperature:      ${
                                           t.debug_data
                                               .ambTemperature}\n  Air Temperature:      ${
                                           t.debug_data
                                               .airTemperature}\n  Fuel Temperature:     ${
                                           t.debug_data
                                               .fuelTemperature}\n\n  Humidity:             ${
                                           o(t.debug_data["humidity_%"],
                                             3)} %\n  N2 en aire seco:      ${
                                           t.debug_data["dryAirN2_%"]} %\n  O2 en aire seco:      ${
                                           t.debug_data["dryAirO2_%"]} %\n\n  Dry Air Pressure:     ${
                                           t.debug_data
                                               .dryAirPressure}\n  Water Vapor Pressure:  ${
                                           t.debug_data
                                               .waterPressure}\n\n  Partial Fraction H2O: ${
                                           t.debug_data["H2OPressure_%"]} ÷10²\n  Partial Fraction N2: ${
                                           t.debug_data["N2Pressure_%"]} ÷10²\n  Partial Fraction O2: ${
                                           t.debug_data["O2Pressure_%"]} ÷10²\n  Moisture content (w): ${
                                           t.debug_data
                                               .moisture}-dryAir\n\n\n  Fluid's Inlet Temp.:  ${
                                           r.tempC(
                                               t.conv_result
                                                   .t_in_given)}\n  Fluid's outlet Temp.: ${
                                           r.tempC(
                                               t.rad_result
                                                   .t_out)}\n\n  Fluid's Cp(Tb):    ${
                                           t.debug_data
                                               .cpFluidTb}\n\n  Fluid's Sp Grav:   ${
                                           t.debug_data
                                               .spGrav}\n  Fluid's Mass Flow: ${
                                           r.mass_flow(
                                               t.rad_result
                                                   .m_fluid)}\n\n  Comb's  Mass Flow: ${
                                           r.mass_flow(
                                               t.rad_result
                                                   .m_fuel)}   \n  Gases's Mass Flow: ${
                                           r.mass_flow(
                                               t.shld_result
                                                   .m_flue)} \n\n  Fluid heat required: ${
                                           r.heat_flow(
                                               t.rad_result
                                                   .duty_total)}\n  Heat calculated:     ${
                                           r.heat_flow(
                                               t.rad_result.duty +
                                               t.shld_result.duty +
                                               t.conv_result
                                                   .duty)}\n  \n  Heater Efficiency: ${
                                           o(t.rad_result.eff_total,
                                             2)}% [Q_rls/Q_fluid]\n\n\nTotal flue gas moles and percentage (per fuel mol)\n\n  Flow total: ${
                                           o(t.flows.total_flow,
                                             3)}\n  Dry total:  ${
                                           o(t.flows.dry_total_flow,
                                             3)}\n                        Moist basis percentage\n  N2:  ${
                                           t.products.N2}             N2:  ${
                                           o(t.flows["N2_%"], 3)} %\n  O2:  ${
                                           t.products.O2}              O2:  ${
                                           o(t.flows["O2_%"], 3)} %\n  H2O: ${
                                           t.products.H2O}              H2O: ${
                                           o(t.flows["H2O_%"], 3)} %\n  CO2: ${
                                           t.products.CO2}              CO2: ${
                                           o(t.flows["CO2_%"], 3)} %\n  SO2: ${
                                           t.products.SO2}              SO2: ${
                                           t.flows["SO2_%"] ||
                                           "0.000"} %\n\n  Air excess used : ${
                                           o(t.flows["air_excess_%"],
                                             3)} %\n  Moles O2 required/fuel-mol (theor): ${
                                           o(t.flows.O2_mol_req_theor,
                                             3)}\n\n  A/C molar moist relation:   ${
                                           o(t.flows.AC,
                                             3)}\n  A/C mass moist relation:    ${
                                           o(t.flows.AC_mass,
                                             3)}\n  A/C molar relation (dry air, theor):   ${
                                           o(t.flows.AC_theor_dryAir,
                                             3)}\n  A/C mass relation (moist air, theor):  ${
                                           o(t.flows.AC_mass_theor_moistAir,
                                             3)}\n\n  Fuel mol weight: ${
                                           t.flows
                                               .fuel_MW}\n  Fuel Cp(t_fuel): ${
                                           t.flows
                                               .Cp_fuel}\n  NCV:             ${
                                           t.flows
                                               .NCV} \n\n  Flue gas mol weight: ${
                                           t.flows
                                               .flue_MW}\n  Flue gas Cp(t_amb):  ${
                                           t.flows.Cp_flue}\n`,
                             s
                    }
                  }
                },
                170 : e => {
                  const t =
                      (...e) => {
                        let t = "" + e[1][0];
                        for (var n = 1; n < e[1].length; n++)
                          t += " " + e[1][n];
                        switch (e[0]) {
                        case "DEBUG":
                          _.verbose &&
                              console.debug(JSON.parse(`{"${e[0]}": ${t}}`));
                          break;
                        case "INFO":
                          console.info(`{ [32;1m${e[0]}[0m: "${t}"}`);
                          break;
                        case "ERROR":
                          console.error(`{ [31;1m${e[0]}[0m: '${t}'}`);
                          break;
                        case "WARN":
                          console.warn(`{ [35;1m${e[0]}[0m: '${t}'}`);
                          break;
                        default:
                          console.log(`{ [34;1m${e[0]}[0m: '${t}'}`)
                        }
                      },
                        n = {
                          info : (...e) => t("INFO", e),
                          warn : (...e) => t("WARN", e),
                          error : (...e) => t("ERROR", e),
                          debug : (...e) => t("DEBUG", e),
                          default : (...e) => t("DEFAULT", e)
                        },
                        o = 273.15, a = 101325, r = 5.6145833333, s = 62.371,
                        u = .84, l = 288.70556, i = {
                          RtoK : e => e * (5 / 9),
                          KtoR : e => 1.8 * e,
                          KtoF : e => 1.8 * e - 459.67,
                          CtoK : e => e + o,
                          CtoF : e => 1.8 * e + 32,
                          FtoC : e => 5 / 9 * (e - 32),
                          FtoK : e => 5 / 9 * (e - 32) + o,
                          kgtolb : e => 2.20462 * e,
                          lbtokg : e => e / 2.20462,
                          BPDtolb_h : e => e * r * s / 24 * u,
                          lb_htoBPD : e => e / r / s * 24 / u,
                          kJtoBTU : e => e / 1.05506,
                          BTUtokJ : e => 1.05506 * e,
                          fttom : e => e / 3.28084,
                          ft2tom2 : e => e / 3.28084 ** 2,
                          mtoft : e => 3.28084 * e,
                          m2toft2 : e => e * 3.28084 ** 2,
                          intom : e => e / 39.3701,
                          mtoin : e => 39.3701 * e,
                          CpENtoCpSI : e => 1.05506 * e / (5 / 9) * 2.20462,
                          kwENtokwSI : e => 1.05506 * e / (5 / 9) * 3.28084,
                          RfENtoRfSI : e => e / 20.441829691933805,
                          hcENtohcSI : e =>
                              1.05506 * e / (5 / 9) * 3.28084 ** 2,
                          BtuHtoW : e => e / 3.4121416331
                        },
                        _ = (() => {
                          const e = {
                            tempToK : o,
                            tempAmbRef : l,
                            pAtmRef : a,
                            spGrav : u,
                            runDistCycle : !0,
                            verbose : !0,
                            tAmb : l,
                            tAir : l,
                            tFuel : l,
                            humidity : 0,
                            o2Excess : 0,
                            airExcess : 0,
                            radDist : .64,
                            hLoss : .015,
                            effcy : .8,
                            rfi : 0,
                            rfo : 0,
                            tIn : 678,
                            tOut : 772,
                            mFluid : i.BPDtolb_h(9e4),
                            pAtm : a,
                            unitSystem : "SI",
                            lang : "en",
                            title : "heater_sim",
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
                                     (e.verbose = "true" == process.argv[2],
                                      e.unitSystem = process.argv[3],
                                      e.tAmb =
                                          o + parseFloat(process.argv[4]) || l,
                                      e.humidity =
                                          parseFloat(process.argv[5]) || 0,
                                      e.o2Excess =
                                          .01 * parseFloat(process.argv[6]) ||
                                          0,
                                      e.airExcess =
                                          .01 * parseFloat(process.argv[7]) ||
                                          0,
                                      e.pAtm =
                                          parseFloat(process.argv[8]) || 101325,
                                      e.NROptions.verbose =
                                          "true" == process.argv[2]),
                                 e
                        })();
                  _.verbose &&
                      n.debug(`"options","args":${JSON.stringify(_, null, 2)}`);
                  const c = (e, t = 3) =>
                      (Math.round(e * 10 ** t) / 10 ** t).toFixed(t),
                        d =
                            (e, t, o) => {
                              const a = {...e}, r = Object.values(a).reduce(
                                                    ((e, t) => e + t));
                              for (const e in a)
                                a[e] = a[e] / r;
                              return o || n.debug(`"normalize", "name": "${
                                              t}", "total": ${r}`),
                                     a
                            },
                        f = ({k0 : e, k1 : t, k2 : o, Substance : a}) =>
                            0 == e || "-" == e
                                ? (n.debug(`"Thermal Cond func called for '${
                                       a}' without coffs"`),
                                   () => 0)
                                : n => 3.6 * (e + t * n + o * n ** 2),
                        m = ({u0 : e, u1 : t, u2 : o, Substance : a}) =>
                            0 == e || "-" == e
                                ? (n.debug(`"Viscosity func called for '${
                                       a}' without coffs"`),
                                   () => 0)
                                : n => e + t * n + o * n ** 2,
                        h = {
                          "energy/mol" : e => c(i.kJtoBTU(e)) + " Btu/mol",
                          "mass/mol" : e => c(e) + " lb/lb-mol",
                          heat_flow : e => c(1e-6 * i.kJtoBTU(e)) + " MBtu/h",
                          heat_flux : e =>
                              c(i.kJtoBTU(e) / i.mtoft(1) ** 2) + " Btu/h-ft²",
                          fouling_factor : e =>
                              c(10.763910417 * e * 1.8 / .94781712) +
                              " h-ft²-°F/Btu",
                          "energy/mass" : e =>
                              c(i.kJtoBTU(e) / i.kgtolb(1)) + " Btu/lb",
                          "energy/vol" : e =>
                              c(i.kJtoBTU(e) / i.mtoft(1) ** 3) + " Btu/ft³",
                          area : e => c(10.763910417 * e) + " ft²",
                          length : e => c(i.mtoft(e)) + " ft",
                          lengthC : e => c(i.mtoin(e)) + " in",
                          lengthInv : e => c(e / i.mtoft(1)) + " 1/ft",
                          temp : e => c(i.KtoR(e)) + " °R",
                          tempC : e => c(i.CtoF(e - o)) + " °F",
                          pressure : e => c(.0001450377 * e) + " psi",
                          mass : e => c(.0022046244202 * e) + " lb",
                          mass_flow : e => c(i.kgtolb(e)) + " lb/h",
                          barrel_flow : e =>
                              c(i.kgtolb(e) / i.BPDtolb_h(1) / 1e3) +
                              " x10³ BPD",
                          vol_flow : e => c(e * i.mtoft(1) ** 3) + " ft³/h",
                          cp : e => c(.238845896627 * e) + " Btu/lb-°F",
                          cp_mol : e => c(.238845896627 * e) + " Btu/lb-mol-°F",
                          power : e => c(3.4121416331 * e) + " Btu/h",
                          moist : e => c(1e3 * e) + " ÷10³ lb-H2O/lb",
                          thermal : e =>
                              c(e * i.kJtoBTU(1) / i.KtoR(1) / i.mtoft(1)) +
                              " BTU/h-ft-°F",
                          convect : e => c(e * i.kJtoBTU(1) / i.KtoR(1) /
                                           i.mtoft(1) ** 2) +
                                         " BTU/h-ft²-°F",
                          viscosity : e => c(1 * e) + " cP",
                          system : {en : "English", es : "Inglés"}
                        },
                        p = {
                          "energy/mol" : e => c(1 * e) + " kJ/mol",
                          "mass/mol" : e => c(1 * e) + " kg/kmol",
                          heat_flow : e => c(1e-6 * e) + " MJ/h",
                          heat_flux : e => c(1 * e) + " W/m²",
                          fouling_factor : e => c(1 * e) + " m²-K/W",
                          "energy/mass" : e => c(1 * e) + " kJ/kg",
                          "energy/vol" : e => c(1 * e) + " kJ/m³",
                          area : e => c(1 * e) + " m²",
                          length : e => c(1 * e) + " m",
                          lengthC : e => c(100 * e) + " cm",
                          lengthInv : e => c(1 * e) + " 1/m",
                          tempC : e => c(1 * e - o) + " °C",
                          temp : e => c(1 * e) + " K",
                          pressure : e => c(.001 * e) + " kPa",
                          mass : e => c(.001 * e) + " kg",
                          mass_flow : e => c(1 * e) + " kg/h",
                          barrel_flow : e =>
                              c(i.kgtolb(e) / i.BPDtolb_h(1) / 1e3) +
                              " x10³ BPD",
                          vol_flow : e => c(1 * e) + " m³/h",
                          cp : e => c(1 * e) + " kJ/kg-K",
                          cp_mol : e => c(1 * e) + " kJ/kmol-K",
                          power : e => c(1 * e) + " W",
                          moist : e => c(1e3 * e) + " g-H2O/kg",
                          thermal : e => c(1 * e) + " kJ/h-m-C",
                          convect : e => c(1 * e) + " kJ/h-m²-C",
                          viscosity : e => c(1 * e) + " cP",
                          system : {en : "SI", es : "SI"}
                        };
                  e.exports = {
                    options : _,
                    unitConv : i,
                    newtonRaphson : (e, t, o, a, r, s) => {
                      let u, l, i, _, c, d, f, m;
                      "function" != typeof t &&
                          (s = r, r = a, a = o, o = t, t = null);
                      const h = a || {},
                            p = void 0 === h.tolerance ? 1e-7 : h.tolerance,
                            O = void 0 === h.epsilon ? 222e-17 : h.epsilon,
                            $ = void 0 === h.h ? 1e-4 : h.h, g = 1 / $,
                            C = void 0 === h.maxIterations ? 20
                                                           : h.maxIterations;
                      for (_ = 0; _++ < C;) {
                        if (l = e(o),
                            t ? i = t(o)
                              : (c = e(o + $), d = e(o - $), f = e(o + 2 * $),
                                 m = e(o - 2 * $),
                                 i = (m - f + 8 * (c - d)) * g / 12),
                            Math.abs(i) <= O * Math.abs(l))
                          return n.error(`Newton-Raphson (${
                                     r}): failed to converged due to nearly zero first derivative`),
                                 !1;
                        if (u = o - l / i, Math.abs(u - o) <= p * Math.abs(u))
                          return s || n.debug(`"Newton-Raphson", "func":"${
                                          r}", "var converged to":${
                                          u}, "iterations":${_}`),
                                 u;
                        o = u
                      }
                      return n.error(`Newton-Raphson (${
                                 r}): Maximum iterations reached (${C})`),
                             !1
                    },
                    logger : n,
                    round : c,
                    roundDict : (e = {}) => {
                      for (const [t, n] of Object.entries(e))
                        isNaN(n) || "" === n || (e[t] = c(n))
                    },
                    linearApprox : ({x1 : e, x2 : t, y1 : o, y2 : a}) => {
                      if ("number" != typeof o)
                        return n.error(
                                   `call for linearApprox with incorrect value type for y1: ${
                                       o}`),
                               () => 0;
                      if (e == t || null == t || null == a)
                        return () => o;
                      const r = (a - o) / (t - e);
                      return t => r * (t - e) + o
                    },
                    viscosityApprox : ({t1 : e, t2 : t, v1 : o, v2 : a}) => {
                      if ("number" != typeof o)
                        return n.error(
                                   `call for viscosityApprox with incorrect value type for v1: ${
                                       o}`),
                               () => 0;
                      if (e == t || null == t || null == a)
                        return () => o;
                      const r = Math.log(o / a) / (1 / e - 1 / t),
                            s = o * Math.exp(-r / e);
                      return e => s * Math.exp(r / e)
                    },
                    initSystem : e => {
                      if ("string" != typeof e)
                        return _.verbose &&
                                   n.warn(`invalid type (${
                                       e}) for unit system, using default SI`),
                               p;
                      switch (e.toLowerCase()) {
                      case "si":
                        return p;
                      case "english":
                      case "en":
                        return h;
                      default:
                        return n.warn(
                                   e.toLowerCase() +
                                   " - invalid unit system, using default SI"),
                               p
                      }
                    },
                    normalize : d,
                    flueViscosity : (e, t) => {
                      const n = d(t, "flueViscosity"), o = m(e[34]),
                            a = m(e[31]), r = m(e[6]), s = m(e[3]), u = m(e[2]);
                      return e => n.CO2 * r(e) + n.SO2 * o(e) + n.H2O * a(e) +
                                  n.O2 * u(e) + n.N2 * s(e)
                    },
                    flueThermalCond : (e, t) => {
                      const n = d(t, "flueThermalCond"), o = f(e[34]),
                            a = f(e[31]), r = f(e[6]), s = f(e[3]), u = f(e[2]);
                      return e => n.CO2 * r(e) + n.SO2 * o(e) + n.H2O * a(e) +
                                  n.O2 * u(e) + n.N2 * s(e)
                    },
                    kw_tubes_A312_TP321 : e => {
                      const t = e - o;
                      return 3.6 * (14.643 + .0164 * t + -2e-6 * t ** 2)
                    },
                    LMTD : (e, t, n, o, a) => {
                      let r = n - t, s = o - e;
                      return a && (r = o - e, s = n - t),
                             Math.abs((r - s) / Math.log(Math.abs(r / s)))
                    }
                  }
                },
                684 : e => {
                  "use strict";
                  e.exports = JSON.parse(
                      '[{"ID":0,"Substance":"Carbon","Formula":"C","MW":12.011,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1,"SO2":0,"CO2":1,"H2O":0,"N2":3.773269},{"ID":1,"Substance":"Hydrogen","Formula":"H2","MW":2.0159,"h0":0,"Cp0":14.209,"c0":13.46,"c1":4.6,"c2":-6.85,"c3":3.79,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.5,"SO2":0,"CO2":0,"H2O":1,"N2":1.886634},{"ID":2,"Substance":"Oxygen","Formula":"O2","MW":31.9988,"h0":0,"Cp0":0.922,"c0":0.88,"c1":-0.0001,"c2":0.54,"c3":-0.33,"u0":0.00845,"u1":0.0000472,"u2":-6.56e-9,"k0":0.00733,"k1":0.0000708,"k2":-6.61e-9,"O2":-1,"SO2":0,"CO2":0,"H2O":0,"N2":0},{"ID":3,"Substance":"Nitrogen","Formula":"N2","MW":28.0134,"h0":0,"Cp0":1.042,"c0":1.11,"c1":-0.48,"c2":0.96,"c3":-0.42,"u0":0.00784,"u1":0.0000387,"u2":-5.11e-9,"k0":0.00952,"k1":0.000062,"k2":-6.22e-9,"O2":0,"SO2":0,"CO2":0,"H2O":0,"N2":1},{"ID":4,"Substance":"Nitrogen (atm)","Formula":"N2a","MW":28.158,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0,"SO2":0,"CO2":0,"H2O":0,"N2":1},{"ID":5,"Substance":"Carbon Monoxide","Formula":"CO","MW":28.0104,"h0":-110527,"Cp0":1.041,"c0":1.1,"c1":-0.46,"c2":1,"c3":-0.454,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.5,"SO2":0,"CO2":1,"H2O":0,"N2":1.886634},{"ID":6,"Substance":"Carbon Dioxide","Formula":"CO2","MW":44.0098,"h0":-393522,"Cp0":0.842,"c0":0.45,"c1":1.67,"c2":-1.27,"c3":0.39,"u0":0.00331,"u1":0.0000445,"u2":-6.69e-9,"k0":-0.00958,"k1":0.0000918,"k2":-1.14e-8,"O2":0,"SO2":0,"CO2":1,"H2O":0,"N2":0},{"ID":7,"Substance":"Methane","Formula":"CH4","MW":16.0428,"h0":-74873,"Cp0":2.254,"c0":1.2,"c1":3.25,"c2":0.75,"c3":-0.71,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":2,"SO2":0,"CO2":1,"H2O":2,"N2":7.546539},{"ID":8,"Substance":"Ethane","Formula":"C2H6","MW":30.0697,"h0":-84740,"Cp0":1.766,"c0":0.18,"c1":5.92,"c2":-2.31,"c3":0.29,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3.5,"SO2":0,"CO2":2,"H2O":3,"N2":13.20644},{"ID":9,"Substance":"Propane","Formula":"C3H8","MW":44.0966,"h0":-103900,"Cp0":1.679,"c0":-0.096,"c1":6.95,"c2":-3.6,"c3":0.73,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":5,"SO2":0,"CO2":3,"H2O":4,"N2":18.86634},{"ID":10,"Substance":"n-Butane","Formula":"C4H10","MW":58.1235,"h0":-126200,"Cp0":1.716,"c0":0.163,"c1":5.7,"c2":-1.906,"c3":-0.049,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6.5,"SO2":0,"CO2":4,"H2O":5,"N2":24.52625},{"ID":11,"Substance":"Isobutane","Formula":"iC4H10","MW":58.1235,"h0":-135000,"Cp0":1.547,"c0":0.206,"c1":5.67,"c2":-2.12,"c3":0.183,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6.5,"SO2":0,"CO2":4,"H2O":5,"N2":24.52625},{"ID":12,"Substance":"n-Pentane","Formula":"C5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":13,"Substance":"Isopentane","Formula":"iC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":14,"Substance":"Neopentane","Formula":"nC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":8,"SO2":0,"CO2":5,"H2O":6,"N2":30.18615},{"ID":15,"Substance":"n-Hexane","Formula":"C6H14","MW":86.1773,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":9.5,"SO2":0,"CO2":6,"H2O":7,"N2":35.84606},{"ID":16,"Substance":"Ethylene","Formula":"C2H4","MW":28.0538,"h0":52467,"Cp0":1.548,"c0":0.136,"c1":5.58,"c2":-3,"c3":0.63,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3,"SO2":0,"CO2":2,"H2O":2,"N2":11.3198},{"ID":17,"Substance":"Propylene","Formula":"C3H6","MW":42.0807,"h0":20410,"Cp0":1.437,"c0":0.454,"c1":4.06,"c2":-0.934,"c3":-0.133,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":4.5,"SO2":0,"CO2":3,"H2O":3,"N2":16.97971},{"ID":18,"Substance":"n-Butene (Butylene)","Formula":"C4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6,"SO2":0,"CO2":4,"H2O":4,"N2":22.63961},{"ID":19,"Substance":"Isobutene","Formula":"iC4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":6,"SO2":0,"CO2":4,"H2O":4,"N2":22.63961},{"ID":20,"Substance":"n-Pentene","Formula":"C5H10","MW":70.1345,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":7.5,"SO2":0,"CO2":5,"H2O":5,"N2":28.29952},{"ID":21,"Substance":"Benzene","Formula":"C6H6","MW":78.1137,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":7.5,"SO2":0,"CO2":6,"H2O":3,"N2":28.29952},{"ID":22,"Substance":"Toluene","Formula":"C7H8","MW":92.1406,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":9,"SO2":0,"CO2":7,"H2O":4,"N2":33.95942},{"ID":23,"Substance":"Xylene","Formula":"C8H10","MW":106.1675,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":10.5,"SO2":0,"CO2":8,"H2O":5,"N2":39.6193},{"ID":24,"Substance":"Acetylene","Formula":"C2H2","MW":26.0379,"h0":226731,"Cp0":1.699,"c0":1.03,"c1":2.91,"c2":-1.92,"c3":0.54,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":2.5,"SO2":0,"CO2":2,"H2O":1,"N2":9.433174},{"ID":25,"Substance":"Naphthalene","Formula":"C10H8","MW":128.1736,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":12,"SO2":0,"CO2":10,"H2O":4,"N2":45.27923},{"ID":26,"Substance":"Methyl alcohol-Methanol","Formula":"CH3OH","MW":32.0422,"h0":-201300,"Cp0":1.405,"c0":0.66,"c1":2.21,"c2":0.81,"c3":-0.89,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1.5,"SO2":0,"CO2":1,"H2O":2,"N2":5.659904},{"ID":27,"Substance":"Ethyl alcohol-Ethanol","Formula":"C2H5OH","MW":46.0691,"h0":-235000,"Cp0":1.427,"c0":0.2,"c1":-4.65,"c2":-1.82,"c3":0.03,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":3,"SO2":0,"CO2":2,"H2O":3,"N2":11.3198},{"ID":28,"Substance":"Ammonia","Formula":"NH3","MW":17.0306,"h0":-45720,"Cp0":2.13,"c0":1.6,"c1":1.4,"c2":1,"c3":-0.7,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.75,"SO2":0,"CO2":0,"H2O":1.5,"N2":2.82995},{"ID":29,"Substance":"Sulfur","Formula":"S","MW":32.066,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":1,"SO2":1,"CO2":0,"H2O":0,"N2":3.773269},{"ID":30,"Substance":"Hydrogen sulfide","Formula":"H2S","MW":34.0819,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":-0.000545,"u1":0.0000502,"u2":-1.3e-8,"k0":"-","k1":"-","k2":"-","O2":1.5,"SO2":1,"CO2":0,"H2O":1,"N2":5.659904},{"ID":31,"Substance":"Steam (Water vapor)","Formula":"H2O","MW":18.0153,"h0":-241826,"Cp0":1.872,"c0":1.79,"c1":0.107,"c2":0.586,"c3":-0.2,"u0":-0.00596,"u1":0.0000484,"u2":-4.76e-9,"k0":-0.00592,"k1":0.0000718,"k2":-3.03e-8,"O2":0,"SO2":0,"CO2":0,"H2O":1,"N2":0},{"ID":32,"Substance":"Water (liquid)","Formula":"H2Ol","MW":18.0153,"h0":-285830,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0,"SO2":0,"CO2":0,"H2O":1,"N2":0},{"ID":33,"Substance":"Dry Air","Formula":"N2+O2","MW":28.8483,"h0":0,"Cp0":1.004,"c0":1.05,"c1":-0.365,"c2":0.85,"c3":-0.39,"u0":"-","u1":"-","u2":"-","k0":"-","k1":"-","k2":"-","O2":0.2095,"SO2":0,"CO2":0,"H2O":0,"N2":0.7905},{"ID":34,"Substance":"Sulfur dioxide","Formula":"SO2","MW":62.059,"h0":-296842,"Cp0":0.624,"c0":0.37,"c1":1.05,"c2":-0.77,"c3":0.21,"u0":-0.00301,"u1":0.0000578,"u2":-1.66e-8,"k0":-0.00188,"k1":0.0000314,"k2":2.7e-8,"O2":0,"SO2":1,"CO2":0,"H2O":0,"N2":0}]')
                }
              },
          t = {};
      function n(o) {
        var a = t[o];
        if (void 0 !== a)
          return a.exports;
        var r = t[o] = {exports : {}};
        return e[o](r, r.exports, n), r.exports
      }
      (() => {
        const {
          round : e,
          logger : t,
          options : o,
          unitConv : a,
          initSystem : r,
          linearApprox : s,
          newtonRaphson : u,
          viscosityApprox : l,
          kw_tubes_A312_TP321 : i
        } = n(170),
       _ = n(684), {radSection : c} = n(623), {convSection : d} = n(399),
       {shieldSection : f} = n(16), {combSection : m} = n(911),
       {browserProcess : h} = n(620), p = (e, t) => {
         const n = (e => {
           const t = a.lbtokg(e.mFluid), n = a.FtoK(e.tIn), o = a.FtoK(e.tOut),
                 u = a.CpENtoCpSI(.676), _ = a.CpENtoCpSI(.702),
                 c = a.kwENtokwSI(.038), d = a.kwENtokwSI(.035);
           return {
             runDistCycle: e.runDistCycle, p_atm: e.pAtm, t_fuel: e.tFuel,
                 t_air: e.tAir, t_amb: e.tAmb, humidity: e.humidity,
                 airExcess: e.airExcess, o2Excess: e.o2Excess,
                 sp_grav: e.spGrav, t_in_conv: n, t_out: o, m_fluid: t,
                 Rfi: a.RfENtoRfSI(e.rfi), Rfo: a.RfENtoRfSI(e.rfo),
                 Rfi_conv: 0, Rfi_shld: 0, Rfo_shld: 0, efficiency: e.effcy,
                 duty_rad_dist: e.radDist, heat_loss_percent: e.hLoss,
                 max_duty: a.BTUtokJ(71527.6),
                 miu_fluid: l(
                     {t1 : a.FtoK(678), v1 : 1.45, t2 : a.FtoK(772), v2 : .96}),
                 Cp_fluid:
                     s({x1 : a.FtoK(678), y1 : u, x2 : a.FtoK(772), y2 : _}),
                 kw_fluid:
                     s({x1 : a.FtoK(678), y1 : c, x2 : a.FtoK(772), y2 : d}),
                 Material: "A-312 TP321", h_conv: a.hcENtohcSI(1.5), kw_tube: i,
                 Pass_number: 2, Pitch_rad: a.intom(16), N_rad: 42,
                 L_rad: a.fttom(62.094), Do_rad: a.intom(8.625),
                 Sch_rad: a.intom(.322), Burner_number: 13, Do_Burner: 2.24,
                 Width_rad: 17.5, Length_rad: 64.55, Height_rad: 27, N_shld: 16,
                 L_shld: a.fttom(60), Do_shld: a.intom(6.625),
                 Pitch_sh_cnv: a.intom(12), Sch_sh_cnv: a.intom(.28),
                 Tpr_sh_cnv: 8, N_conv: 40, L_conv: a.fttom(60),
                 Do_conv: a.intom(6.625), Nf: a.mtoft(60), Tf: a.fttom(.005),
                 Lf: a.fttom(.08), FinType: "Solid", FinMaterial: "11.5-13.5Cr",
                 FinArrange: "Staggered Pitch", verbose: e.verbose,
                 unitSystem: e.unitSystem, lang: e.lang, NROptions: e.NROptions,
                 units: r(e.unitSystem)
           }
         })(t);
         0 != n.o2Excess && $(n, e);
         const o = m(n.airExcess, e, n);
         return n.runDistCycle && O(n),
                o.rad_result = c(n), o.shld_result = f(n), o.conv_result = d(n),
                o
       }, O = n => {
         let o = 0, a = !0;
         const r = {...n.NROptions};
         r.maxIterations *= 5, r.tolerance *= .1, r.epsilon *= .1, r.h *= .1;
         const s =
             u((e => {
                 o++, e > .3 && e < 1 && (n.duty_rad_dist = e);
                 const t = {rad : c(n, a), shld : f(n, a), conv : d(n, a)};
                 t.conv.tg_out <= t.conv.t_in && (t.conv.Q_fluid *= 2);
                 const r = Math.abs(t.rad.Q_fluid) + Math.abs(t.shld.Q_fluid) +
                           Math.abs(t.conv.Q_fluid);
                 return (n.duty - r) / r
               }),
               n.duty_rad_dist, r, "rad_dist_final");
         s > .1 &&s < 1
             ? n.duty_rad_dist = s
             : t.error(
                   "external cycle broken, error in rad_dist estimation, using: " +
                   n.duty_rad_dist),
               t.info(`duty_rad_dist: ${e(100 * s, 2)}, ext_cycle_reps: ${o}`)
       }, $ = (n, o) => {
         let a = 0;
         const r =
             u((e => {
                 a++;
                 const t = m(e, o, n, !0);
                 return Math.round(1e5 * t.flows["O2_%"] - 1e7 * n.o2Excess)
               }),
               .5, n.NROptions, "o2_excess_to_air");
         r && (n.airExcess = r),
             t.info(`'air_excess': ${e(100 * r, 2)}, 'comb_cycle_reps': ${a}`)
       };
        let g = {
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
        };
        "undefined" != typeof window ? h(g, _, o, p)
                                     : t.info(JSON.stringify(p(g, o), null, 2))
      })()
    })();