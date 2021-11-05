(()=>{var e={620:(e,t,o)=>{const{logger:r}=o(170);e.exports={browserProcess:(e,t,o,s)=>{let a="en";const n=window.location.pathname.split("/");r.debug(n),n.length>0&&n.forEach((e=>{"es"==e&&(a="es")}));const l=(e=>{if(""==e)return{};let t={};for(let o=0;o<e.length;++o){const r=e[o].split("=",2);1==r.length?t[r[0]]="":t[r[0]]=decodeURIComponent(r[1].replace(/\+/g," "))}return t})(window.location.search.substr(1).split("&"));l!=={}&&((e,t,o,s)=>{const a={},n=o.filter((t=>t.Formula in e));for(const t in e)if(1===n.filter((e=>e.Formula==t)).length&&""!==e[t]){const o=parseFloat(e[t]);o>0&&o<=100?a[t]=o/100:r.error(`fuel fraction invalid (${o}) for ${t}`)}else if(""!==e[t]){let o;switch(t){default:break;case"t_amb":o=parseFloat(e[t]),o>-s.tempToK&&o<100&&(s.tAmb=o+s.tempToK);break;case"humidity":o=parseFloat(e[t]),o>=0&&o<=100&&(s.humidity=o);break;case"p_atm":o=parseFloat(e[t]),o>.001&&o<1e3&&(s.pAtm=1e3*o);break;case"air_excess":o=parseFloat(e[t]),o>=0&&o<=300&&(s.airExcess=.01*o);break;case"o2_excess":o=parseFloat(e[t]),o>=0&&o<=30&&(s.o2Excess=.01*o)}}Object.keys(a).length})(l,0,t,o),((e,t,o)=>{r.info(JSON.stringify(e,null,2)),r.debug(JSON.stringify(t,null,2));let s="";s="es"==o?`\nDatos de entrada (en caso de no haber sido introducidos, tomará el predeterminado)\n\n  Sistema de unidades:   ${e.debug_data.unitSystem}\n  Presión atmosférica:   ${e.debug_data.atmPressure}\n  Temperatura ambiente:  ${e.debug_data.ambTemperature}\n  Humedad:               ${e.debug_data["humidity_%"]} %\n  N2 en aire seco:       ${e.debug_data["dryAirN2_%"]} %\n  O2 en aire seco:       ${e.debug_data["dryAirO2_%"]} %\n\n  Presión de aire seco:     ${e.debug_data.dryAirPressure}\n  Presión de vapor de agua: ${e.debug_data.waterPressure}\n  Presión parcial de H2O:   ${e.debug_data["H2OPressure_%"]} %\n  Presión parcial de N2:    ${e.debug_data["N2Pressure_%"]} %\n  Presión parcial de O2:    ${e.debug_data["O2Pressure_%"]} %\n\nMoles de gases de combustión total y porcentajes por cada mol de combustible\n\n  Flujo total: ${e.flows.total_flow}\n  Flujo seco:  ${e.flows.dry_total_flow}\n\n  N2:  ${e.products.N2}\n  O2:  ${e.products.O2}\n  H2O: ${e.products.H2O}\n  CO2: ${e.products.CO2}\n  SO2: ${e.products.SO2}\n\n  Porcentajes en base húmeda\n    N2:  ${e.flows["N2_%"]} %\n    H2O: ${e.flows["H2O_%"]} %\n    CO2: ${e.flows["CO2_%"]} %\n    O2:  ${e.flows["O2_%"]} %\n\n  Exceso de aire usado: ${e.flows["air_excess_%"]} %\n  Moles O2 requeridos/mol de combustible (teórico): ${e.flows.O2_mol_req_theor}\n\n  Relación A/C molar:       ${e.flows.AC}\n  Relación A/C másica:      ${e.flows.AC_mass}\n  Relación A/C molar (aire seco, teórica):    ${e.flows.AC_theor_dryAir}\n  Relación A/C másica (aire húmedo, teórica): ${e.flows.AC_mass_theor_moistAir}\n\n  Peso molecular del combustible: ${e.flows.fuel_MW}\n  Cp(t_entrada) del combustible:  ${e.flows.fuel_Cp}\n  NCV: ${e.flows.NCV}\n\n  Peso molecular de los gases de combustión: ${e.flows.flue_MW}\n  Cp(t_amb) de los gases de combustión: ${e.flows.flue_Cp_Tamb}\n`:`\nInput Data \n  (in case of no input, default values will be taken)\n\n  Unit System:          ${e.debug_data.unitSystem}\n  Atmospheric Pressure: ${e.debug_data.atmPressure}\n  Ambient Temperature:  ${e.debug_data.ambTemperature}\n  Humidity:             ${e.debug_data["humidity_%"]} %\n  N2 en aire seco:      ${e.debug_data["dryAirN2_%"]} %\n  O2 en aire seco:      ${e.debug_data["dryAirO2_%"]} %\n\n  Dry Air Pressure:     ${e.debug_data.dryAirPressure}\n  Water Vapor Pressure: ${e.debug_data.waterPressure}\n  Partial Pressure H2O: ${e.debug_data["H2OPressure_%"]} %\n  Partial Pressure N2 : ${e.debug_data["N2Pressure_%"]} %\n  Partial Pressure O2 : ${e.debug_data["O2Pressure_%"]} %\n\nTotal flue gas moles and percentage (per fuel mol)\n\n  Flow total: ${e.flows.total_flow}\n  Dry total:  ${e.flows.dry_total_flow}\n\n  N2:  ${e.products.N2}\n  O2:  ${e.products.O2}\n  H2O: ${e.products.H2O}\n  CO2: ${e.products.CO2}\n  SO2: ${e.products.SO2}\n\n  Moist basis percentage\n    N2:  ${e.flows["N2_%"]} %\n    H2O: ${e.flows["H2O_%"]} %\n    CO2: ${e.flows["CO2_%"]} %\n    O2:  ${e.flows["O2_%"]} %\n\n  Air excess used : ${e.flows["air_excess_%"]} %\n  Moles O2 required/fuel-mol (theoretical): ${e.flows.O2_mol_req_theor}\n\n  A/C molar relation:         ${e.flows.AC}\n  A/C mass relation:          ${e.flows.AC_mass}\n  A/C molar relation (dry air, theoretical):   ${e.flows.AC_theor_dryAir}\n  A/C mass relation (moist air, theoretical):  ${e.flows.AC_mass_theor_moistAir}\n\n  Fuel mol weight:    ${e.flows.fuel_MW}\n  Fuel Cp(t_fuel_in):\t${e.flows.fuel_Cp}\n  NCV: ${e.flows.NCV}\n\n  Flue gas mol weight: ${e.flows.flue_MW}\n  Flue gas Cp(t_amb):  ${e.flows.flue_Cp_Tamb}\n`,document.getElementById("loader-wrapper").remove(),document.getElementById("output-data").textContent=s})(s(e,o),l,a)}}},392:(e,t,o)=>{const{newtonRaphson:r,options:s,logger:a,round:n,roundDict:l,units:c}=o(170),u=o(684),i=(e,t={})=>{const o=Object.values(e).reduce(((e,t)=>e+t)),r=Math.abs(1-o)<=3e-12;return r||(t.err+=`[fuel fraction not equal to 1, total: ${o}. fuels: ${Object.keys(e)}],`),r},m=(e,t)=>{normalFuel={...e},total=Object.values(normalFuel).reduce(((e,t)=>e+t));for(const e in normalFuel)normalFuel[e]=normalFuel[e]/total;return a.debug(`Normalizing ${t}, total: ${total}`),normalFuel},_=({c0:e,c1:t,c2:o,c3:r,MW:l,Substance:c},u)=>i=>(i<250?s.verbose&&a.warn(`temp [${n(i)}] bellow range for Cp0 formula`):i>1200&&s.verbose&&a.warn(`temp [${n(i)}] above range for Cp0 formula`),"-"===e?(a.warn(`wrong use of Cp0, called for compound ${c}, no data found`),0):u?l*(e+t*(.001*i)+o*(.001*i)**2+r*(.001*i)**3):e+t*(.001*i)+o*(.001*i)**2+r*(.001*i)**3),O=(e,t)=>{if(0===e.length)return e=>0;let o=JSON.parse(JSON.stringify(e));i(e)||(o=m(o,"Cp_multicomp"));const r=u.filter((e=>e.Formula in o));let s=0;const a=[];for(const e in o){const n=r.filter((t=>t.Formula==e))[0];a[s]=r=>o[e]*_(n,t)(r),s++}return a.reduce(((e,t)=>o=>e(o)+t(o)),(e=>0))},d=e=>{if(0===e.length)return e=>0;let t=JSON.parse(JSON.stringify(e));i(e)||(t=m(t,"MW_multicomp"));const o=u.filter((e=>e.Formula in t));let r=0;for(const e in t)r+=o.filter((t=>t.Formula==e))[0].MW*t[e];return r},f=(e,t)=>"-"===e.Cp0?"-"===e.h0?(s.verbose&&a.warn(`wrong use of deltaH func, called for compound ${e.Substance} without data`),void 0===t?()=>0:0):void 0===t?()=>e.h0:e.h0:void 0===t?t=>e.h0+e.MW*_(e)((s.tempAmbRef+t)/2)*(t-s.tempAmbRef):e.h0+e.MW*_(e)((s.tempAmbRef+t)/2)*(t-s.tempAmbRef),p=(e,t,o,r)=>{const a=f(u[6]),n=f(u[34]),l=f(u[2]);let c=f(u[31]);return!0===r&&(c=f(u[32])),void 0===o&&(o=s.tAmb),void 0===t?t=>e.CO2*a(t)+e.SO2*n(t)+e.H2O*c(t)-f(e)(o)-e.O2*l(o):e.CO2*a(t)+e.SO2*n(t)+e.H2O*c(t)-f(e)(o)-e.O2*l(o)};e.exports={combSection:(e,t,o)=>{const _={err:"",atmPressure:c.pressure(o.p_atm),ambTemperature:c.tempC(o.t_amb),"humidity_%":n(o.humidity),"dryAirN2_%":n(79.05),"dryAirO2_%":n(20.95)},C=u.filter(((e,o,r)=>e.Formula in t));let b={...t};if(i(t,_)||(b=m(t,"combSection")),!((e,t,o={})=>{const r=Math.abs(t.length-Object.keys(e).length),s=0===r;return s||(o.err+=`[some fuels aren't in the database, #badFuels: ${r}],`),s})(b,C,_))return _;const h={O2:0,H2O:0,CO2:0,SO2:0,N2:0},g={O2:.2095,N2:.7905,H2O:0};for(const e of C)for(const t in h)h[t]+=e[t]*b[e.Formula];e-1e-6<0&&(e=0),o.humidity-1e-6<0&&(o.humidity=0);let S=h.O2,N=S*(1+e);if(h.O2<=0)a.error("o2 in fuel is greater than needed, airExcess set to 0"),N=0,S=0,h.N2=0,h.O2=-h.O2;else{const e=((e,t)=>{const o=e-s.tempToK;return 610.78*Math.exp(o/(o+238.3)*17.2694)*t*.01})(o.t_amb,o.humidity),t=o.p_atm-e;g.N2=.7905*t/o.p_atm,g.O2=.2095*t/o.p_atm,g.H2O=e/o.p_atm,_.dryAirPressure=c.pressure(t),_.waterPressure=c.pressure(e),_["H2OPressure_%"]=n(100*g.H2O),_["N2Pressure_%"]=n(100*g.N2),_["O2Pressure_%"]=n(100*g.O2),_.unitSystem=c.system,h.O2=N-h.O2,h.N2+=h.O2*(g.N2/g.O2),h.H2O+=h.N2*(e/(g.N2*o.p_atm))}o.NCV=-((e,t,o,r)=>{let s=0;for(const a in e){if(a in t)continue;const n=o.filter((e=>e.Formula==a))[0];s+=e[a]*p(n)(r)}return s})(b,h,C,o.t_amb),o.adFlame=r(((e,t,o,r)=>{const a=u.filter((t=>t.Formula in e)),n=f(u.filter((e=>"O2"==e.Formula))[0]),l=f(u.filter((e=>"N2"==e.Formula))[0]),c=f(u.filter((e=>"CO2"==e.Formula))[0]),i=f(u.filter((e=>"H2O"==e.Formula))[0]),m=f(u.filter((e=>"SO2"==e.Formula))[0]);void 0===o&&(o=s.tAmb),void 0===r&&(r=0);const _=[];let O=0;for(const t in e){const r=a.filter((e=>e.Formula==t))[0];_[O]=e[t]*f(r)(o),O++}return e=>(e=>t.CO2*c(e)+t.SO2*m(e)+t.H2O*i(e)+t.O2*n(e)+t.N2*l(e)-t.N2*l(o)-r*n(o))(e)-_.reduce(((e,t)=>e+t))})(b,h,o.t_amb,N),1400,o.NROptions,"fuel_adFlame");let H=0;totalPerM_Dry=0;for(const e in h)H+=h[e],"H2O"!==e&&(totalPerM_Dry+=h[e]);const $={total_flow:n(H),dry_total_flow:n(totalPerM_Dry),"N2_%":n(100*h.N2/H),"H2O_%":n(100*h.H2O/H),"CO2_%":n(100*h.CO2/H),"O2_%":n(100*h.O2/H),O2_mol_req_theor:n(S),O2_mass_req_theor:c.mass(S*u[2].MW),"air_excess_%":n(100*o.airExcess),AC:n(N/g.O2),AC_theor_dryAir:n(S/.2095),AC_mass:n(N/g.O2*d(g)/d(b)),AC_mass_theor_moistAir:n(S/g.O2*d(g)/d(b)),fuel_MW:c["mass/mol"](d(b)),fuel_Cp:c.cp(O(b,!0)(o.t_fuel)),flue_MW:c["mass/mol"](d(h)),flue_Cp_Tamb:c.cp(O(h,!0)(o.t_amb)),NCV:c["energy/mol"](o.NCV)};return o.m_fuel_seed=120,o.m_flue_ratio=$.total_flow,o.m_air_ratio=$.AC,o.Cp_flue=O(h,!0),o.Cp_air=O(g,!0),o.Cp_fuel=O(b,!0),l(h),l($),l(_),""==_.err&&delete _.err,{flows:$,products:h,debug_data:_}}}},113:(e,t,o)=>{const{newtonRaphson:r,log:s}=o(170),a=(e,t,o)=>{let a=0,n=t||600,l=o.t_in_rad,c=e||o.m_fuel;null==o&&(o={});const u=o.t_air,i=o.t_fuel,m=o.t_amb,_=(e,t=l)=>100+.5*(t+e),O=o.m_fluid||225700,d=o.ncv||927844.41,f=o.Cp_fluid,p=o.Cp_fuel(.5*(i+m))||39.26,C=o.Cp_air(.5*(u+m))||29.142,b=(e,t=m)=>o.Cp_flue(.5*(e+t)),h=o.tubes_rad||60,g=o.shld_tubes_rad||8,S=o.tube_l_rad||20.024,N=o.do_rad||.219,H=o.cToC_rad||.394,$=o.emissive_factor||.97,w=o.alpha_factor||.835,F=o.shld_alpha_factor||1,y=o.h_conv_rad||30.66,v=o.pi||3.14159,M=h*H*S,A=g*H*S,W=2.041e-7,x=h*v*N*S,I=(e,t=u,r=m)=>((e=c)=>o.m_air_ratio*e)(e)*C*(t-r),D=e=>e*d,P=(e,t=i,o=m)=>e*p*(t-o),R=(e,t=u,o=i,r=m)=>D(e)+I(e,t,r)+P(e,o,r),E=(e=c)=>.05*D(e),k=(e,t=n,o=l)=>W*(w*M)*$*(e**4-_(t,o)**4),T=(e,t=n,o=l)=>y*x*(e-_(t,o)),J=(e,t=n,o=l)=>W*(F*A)*$*(e**4-_(t,o)**4),B=(e,t=c,r=m)=>((e=c)=>o.m_flue_ratio*e)(t)*b(e,r)*(e-r),Q=(e,t=n,o=c,r=l,s=m)=>((e,t=n,o=l)=>k(e,t,o)+T(e,t,o))(e,t,r)+J(e,t,r)+E(o)+B(e,o,s);let j=0,K=0;if(void 0!==t){K=O*f*(t-o.t_in_conv),l=o.t_in_conv+.3*K/(O*f),s(`${l} vs ${o.t_in_rad}`),j=r((e=>O*f*(n-l)-(k(e)+T(e))),1e3,o.NROptions,"rad_Tg_Tout"),0!=j&&(a=j);const e=e=>Q(a,n,e)-R(e),u=O*f*(t-o.t_in_conv)/(.75*d);c=r(e,u,o.NROptions,"rad_mFuel"),0!=c&&(o.m_fuel=c)}else void 0!==e?(K=.8*D(e),l=o.t_in_conv+.3*K/(O*f),t=o.t_in_conv+K/(O*f),s(`t_in_rad, seed: ${l} vs problem: ${o.t_in_rad}`),j=r((e=>Q(e,t,c)-R(c)),1e3,o.NROptions,"rad_Tg_mFuel"),0!=j&&(a=j),n=r((e=>O*f*(e-l)-(k(a)+T(a))),t,o.NROptions,"rad_Tout"),0!=n&&(o.t_out=n),s(`t_out, seed: ${t} vs calculated: ${n}`),K=O*f*(n-o.t_in_conv),t_in_2=o.t_in_conv+.3*K/(O*f),s(`t_in_rad, seed: ${l} vs calc: ${t_in_2}`)):o.err+="-wrong call for rad section, no seed for mass fuel or out temp.";return o.t_out=n,o.t_in_rad=l,o.Tg=a,{Tw:_(n),m_fuel:c,t_out:n,Tg:a,Q_in:R(c),Q_rls:D(c),Q_air:I(c),Q_fuel:P(c),Q_out:Q(a,n,c),Q_losses:E(c),Q_rad:k(a,n),Q_conv:T(a),Q_shld:J(a),Q_flue:B(a),Q_fluid:((e=n,t=l)=>O*f*(e-t))(),Cp_fluid:f,Cp_fuel:p,Cp_air:C,Cp_flue:b(a)}};e.exports={radSection:e=>{let t={};return void 0!==e.t_out?t=a(void 0,e.t_out,e):void 0!==e.m_fuel?t=a(e.m_fuel,void 0,e):e.err+="-wrong call for rad section, no seed for mass fuel or out temp.",t}}},361:(e,t,o)=>{const{newtonRaphson:r,options:s,log:a}=o(170);e.exports={shieldSection:e=>{let t=e.t_in_rad,o=e.t_in_sh,n=e.Tg,l=0;const c=e.m_fuel,u=e.m_fluid,i=e.Cp_fluid,m=e.h_conv_rad||30.66,_=e.shld_tubes_rad||8,O=e.tube_l_rad||20.024,d=3.14159*_*(e.do_rad||.219)*O,f=(e,o=n)=>m*d*(e-((e,o=t)=>100+.5*(e+o))(e,o)),p=(t,o=n)=>((t=c)=>e.m_flue_ratio*t)()*((t,o=n)=>e.Cp_flue(.5*(o+t)))(t,o)*(t-o);a("Q_conv_sh: "+f(500)+", Q_flue_sh: "+p(500)),flame=r(((e,t=n)=>p(e,t)-f(e,t)),n,s,"shield_Tg"),0!=flame&&(l=flame),e.Tg_sh=l,flame_t_in=r(((e,o=l,r=n)=>((e,o=t)=>u*i*(o-e))(e)-f(o,r)),t,s,"shield_t_in"),0!=flame_t_in&&(o=flame_t_in),e.t_in_sh=o}}},170:e=>{const t=function(...arguments){if(0!==arguments.length)switch(arguments[0]){case"warn":for(var e=1;e<arguments.length;e++)console.log(`{"WARN": "${arguments[e]}"}`);break;case"info":for(e=1;e<arguments.length;e++)console.log(`{"INFO": "${arguments[e]}"}`);break;case"error":for(e=1;e<arguments.length;e++)console.error(`{"ERROR": "${arguments[e]}"}`);break;case"debug":for(e=1;e<arguments.length;e++)console.debug(`{"DEBUG": ${arguments[e]}}`);break;default:for(e=0;e<arguments.length;e++)console.log(`{"DEFAULT": "${arguments[e]}"}`)}},o=(...arguments)=>{let e="";for(var t=1;t<arguments.length;t++)e+=arguments[t];console.log(`{'${arguments[0]}': '${e}'}`)},r={info:(...arguments)=>o("INFO",arguments),warn:(...arguments)=>o("WARN",arguments),error:(...arguments)=>o("ERROR",arguments),debug:(...arguments)=>o("DEBUG",arguments),default:(...arguments)=>o("DEFAULT",arguments)},s=273.15,a=298.15,n=(()=>{const e={verbose:!0,tAmb:a,humidity:0,o2Excess:0,airExcess:0,pAtm:101325,unitSystem:"SI",NROptions:{tolerance:1e-4,epsilon:3e-8,maxIterations:20,h:1e-4,verbose:!0},tempToK:s,tempAmbRef:a};return"undefined"==typeof process||(e.verbose="true"==process.argv[2],e.tAmb=s+parseFloat(process.argv[3])||a,e.humidity=1e-10+parseFloat(process.argv[4])||0,e.o2Excess=.01*parseFloat(process.argv[5])||0,e.airExcess=1e-10+.01*parseFloat(process.argv[6])||0,e.pAtm=parseFloat(process.argv[7])||1e5,e.unitSystem=process.argv[8],e.NROptions.verbose="true"==process.argv[2]),e})(),l=e=>(Math.round(1e3*e)/1e3).toFixed(3);n.verbose&&t("debug",JSON.stringify(n,null,2));const c={"energy/mol":e=>l(.9478171203*e)+" Btu/mol","mass/mol":e=>l(2.2046244202*e)+" lb/kmol",heat_flow:e=>l(3.4121416331*e)+" MMBtu/h",heat_flux:e=>l(3.4121416331*e/10.763910417)+" Btu/h-ft2",fouling_factor:e=>l(1*e)+" h-ft2-°F/Btu","energy/mass":e=>l(1*e)+" kJ/kg","energy/vol":e=>l(1*e)+" kJ/m3",area:e=>l(10.763910417*e)+" ft2",length:e=>l(3.280839895*e)+" ft",temp:e=>l(1.8*e)+" °R",tempC:e=>l(9*(e-s)/5+32)+" °F",pressure:e=>l(.0001450377*e)+" psi",mass:e=>l(.0022046244202*e)+" lb",mass_flow:e=>l(2.2046244202*e)+" lb/s",vol_flow:e=>l(35.314666721*e)+" f3/h",cp:e=>l(1*e)+" kJ/kmol K",power:e=>l(3.4121416331*e)+" Btu/h",system:"ENGLISH"},u={"energy/mol":e=>l(1*e)+" kJ/mol","mass/mol":e=>l(1*e)+" kg/kmol",heat_flow:e=>l(1*e)+" MW/h",heat_flux:e=>l(1*e)+" W/m2",fouling_factor:e=>l(1*e)+" m2-K/W","energy/mass":e=>l(1*e)+" kJ/kg","energy/vol":e=>l(1*e)+" kJ/m3",area:e=>l(1*e)+" m2",length:e=>l(1*e)+" m",tempC:e=>l(1*e-s)+" °C",temp:e=>l(1*e)+" K",pressure:e=>l(.001*e)+" kPa",mass:e=>l(.001*e)+" kg",mass_flow:e=>l(1*e)+" kg/s",vol_flow:e=>l(1*e)+" m3/h",cp:e=>l(1*e)+" kJ/kmol K",power:e=>l(1*e)+" W",system:"SI"},i=(e=>{if("string"!=typeof e.unitSystem)return t("warn",`invalid type (${e.unitSystem}) for unit system, using default SI`),u;switch(e.unitSystem.toLowerCase()){case"si":return u;case"english":return c;default:return t("warn",e.unitSystem.toLowerCase()+" - invalid unit system, using default SI"),u}})(n);e.exports={newtonRaphson:function(e,o,r,s,a){let n,l,c,u,i,m,_,O,d,f,p,C,b,h;for("function"!=typeof o&&(a=s,s=r,r=o,o=null),u=void 0===(s=s||{}).tolerance?1e-7:s.tolerance,h=void 0===s.epsilon?222e-17:s.epsilon,i=void 0===s.maxIterations?20:s.maxIterations,p=void 0===s.h?1e-4:s.h,b=void 0!==s.verbose&&s.verbose,C=1/p,m=0;m++<i;){if(l=e(r),o?c=o(r):(_=e(r+p),O=e(r-p),d=e(r+2*p),f=e(r-2*p),c=(f-d+8*(_-O))*C/12),Math.abs(c)<=h*Math.abs(l))return b&&t("info",`Newton-Raphson (${a}): failed to converged due to nearly zero first derivative`),!1;if(n=r-l/c,Math.abs(n-r)<=u*Math.abs(n))return b&&t("info",`Newton-Raphson (${a}): converged to x = ${n} after ${m} iterations`),n;r=n}return b&&t("info",`Newton-Raphson (${a}): Maximum iterations reached (${i})`),!1},options:n,log:t,logger:r,round:l,roundDict:(e={})=>{for(const[t,o]of Object.entries(e))isNaN(o)||(e[t]=l(o))},units:i}},684:e=>{"use strict";e.exports=JSON.parse('[{"ID":0,"Substance":"Carbon","Formula":"C","MW":12.011,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":1,"N2":3.77326968973747,"SO2":0,"CO2":1,"H2O":0},{"ID":1,"Substance":"Hydrogen","Formula":"H2","MW":2.0159,"h0":0,"Cp0":14.209,"c0":13.46,"c1":4.6,"c2":-6.85,"c3":3.79,"O2":0.5,"N2":1.88663484486874,"SO2":0,"CO2":0,"H2O":1},{"ID":2,"Substance":"Oxygen","Formula":"O2","MW":31.9988,"h0":0,"Cp0":0.922,"c0":0.88,"c1":-0.0001,"c2":0.54,"c3":-0.33,"O2":-1,"N2":0,"SO2":0,"CO2":0,"H2O":0},{"ID":3,"Substance":"Nitrogen","Formula":"N2","MW":28.0134,"h0":0,"Cp0":1.042,"c0":1.11,"c1":-0.48,"c2":0.96,"c3":-0.42,"O2":0,"N2":1,"SO2":0,"CO2":0,"H2O":0},{"ID":4,"Substance":"Nitrogen (atm)","Formula":"N2a","MW":28.158,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":0,"N2":1,"SO2":0,"CO2":0,"H2O":0},{"ID":5,"Substance":"Carbon Monoxide","Formula":"CO","MW":28.0104,"h0":-110527,"Cp0":1.041,"c0":1.1,"c1":-0.46,"c2":1,"c3":-0.454,"O2":0.5,"N2":1.88663484486874,"SO2":0,"CO2":1,"H2O":0},{"ID":6,"Substance":"Carbon Dioxide","Formula":"CO2","MW":44.0098,"h0":-393522,"Cp0":0.842,"c0":0.45,"c1":1.67,"c2":-1.27,"c3":0.39,"O2":0,"N2":0,"SO2":0,"CO2":1,"H2O":0},{"ID":7,"Substance":"Methane","Formula":"CH4","MW":16.0428,"h0":-74873,"Cp0":2.254,"c0":1.2,"c1":3.25,"c2":0.75,"c3":-0.71,"O2":2,"N2":7.54653937947494,"SO2":0,"CO2":1,"H2O":2},{"ID":8,"Substance":"Ethane","Formula":"C2H6","MW":30.0697,"h0":-84740,"Cp0":1.766,"c0":0.18,"c1":5.92,"c2":-2.31,"c3":0.29,"O2":3.5,"N2":13.2064439140811,"SO2":0,"CO2":2,"H2O":3},{"ID":9,"Substance":"Propane","Formula":"C3H8","MW":44.0966,"h0":-103900,"Cp0":1.679,"c0":-0.096,"c1":6.95,"c2":-3.6,"c3":0.73,"O2":5,"N2":18.8663484486874,"SO2":0,"CO2":3,"H2O":4},{"ID":10,"Substance":"n-Butane","Formula":"C4H10","MW":58.1235,"h0":-126200,"Cp0":1.716,"c0":0.163,"c1":5.7,"c2":-1.906,"c3":-0.049,"O2":6.5,"N2":24.5262529832936,"SO2":0,"CO2":4,"H2O":5},{"ID":11,"Substance":"Isobutane","Formula":"iC4H10","MW":58.1235,"h0":-135000,"Cp0":1.547,"c0":0.206,"c1":5.67,"c2":-2.12,"c3":0.183,"O2":6.5,"N2":24.5262529832936,"SO2":0,"CO2":4,"H2O":5},{"ID":12,"Substance":"n-Pentane","Formula":"C5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":8,"N2":30.1861575178998,"SO2":0,"CO2":5,"H2O":6},{"ID":13,"Substance":"Isopentane","Formula":"iC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":8,"N2":30.1861575178998,"SO2":0,"CO2":5,"H2O":6},{"ID":14,"Substance":"Neopentane","Formula":"nC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":8,"N2":30.1861575178998,"SO2":0,"CO2":5,"H2O":6},{"ID":15,"Substance":"n-Hexane","Formula":"C6H14","MW":86.1773,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":9.5,"N2":35.846062052506,"SO2":0,"CO2":6,"H2O":7},{"ID":16,"Substance":"Ethylene","Formula":"C2H4","MW":28.0538,"h0":52467,"Cp0":1.548,"c0":0.136,"c1":5.58,"c2":-3,"c3":0.63,"O2":3,"N2":11.3198090692124,"SO2":0,"CO2":2,"H2O":2},{"ID":17,"Substance":"Propylene","Formula":"C3H6","MW":42.0807,"h0":20410,"Cp0":1.437,"c0":0.454,"c1":4.06,"c2":-0.934,"c3":-0.133,"O2":4.5,"N2":16.9797136038186,"SO2":0,"CO2":3,"H2O":3},{"ID":18,"Substance":"n-Butene (Butylene)","Formula":"C4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":6,"N2":22.6396181384248,"SO2":0,"CO2":4,"H2O":4},{"ID":19,"Substance":"Isobutene","Formula":"iC4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":6,"N2":22.6396181384248,"SO2":0,"CO2":4,"H2O":4},{"ID":20,"Substance":"n-Pentene","Formula":"C5H10","MW":70.1345,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":7.5,"N2":28.299522673031,"SO2":0,"CO2":5,"H2O":5},{"ID":21,"Substance":"Benzene","Formula":"C6H6","MW":78.1137,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":7.5,"N2":28.299522673031,"SO2":0,"CO2":6,"H2O":3},{"ID":22,"Substance":"Toluene","Formula":"C7H8","MW":92.1406,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":9,"N2":33.9594272076372,"SO2":0,"CO2":7,"H2O":4},{"ID":23,"Substance":"Xylene","Formula":"C8H10","MW":106.1675,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":10.5,"N2":39.6193317422434,"SO2":0,"CO2":8,"H2O":5},{"ID":24,"Substance":"Acetylene","Formula":"C2H2","MW":26.0379,"h0":226731,"Cp0":1.699,"c0":1.03,"c1":2.91,"c2":-1.92,"c3":0.54,"O2":2.5,"N2":9.43317422434368,"SO2":0,"CO2":2,"H2O":1},{"ID":25,"Substance":"Naphthalene","Formula":"C10H8","MW":128.1736,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":12,"N2":45.2792362768496,"SO2":0,"CO2":10,"H2O":4},{"ID":26,"Substance":"Methyl alcohol (Methanol)","Formula":"CH3OH","MW":32.0422,"h0":-201300,"Cp0":1.405,"c0":0.66,"c1":2.21,"c2":0.81,"c3":-0.89,"O2":1.5,"N2":5.65990453460621,"SO2":0,"CO2":1,"H2O":2},{"ID":27,"Substance":"Ethyl alcohol (Ethanol)","Formula":"C2H5OH","MW":46.0691,"h0":-235000,"Cp0":1.427,"c0":0.2,"c1":-4.65,"c2":-1.82,"c3":0.03,"O2":3,"N2":11.3198090692124,"SO2":0,"CO2":2,"H2O":3},{"ID":28,"Substance":"Ammonia","Formula":"NH3","MW":17.0306,"h0":-45720,"Cp0":2.13,"c0":1.6,"c1":1.4,"c2":1,"c3":-0.7,"O2":0.75,"N2":2.8299522673031,"SO2":0,"CO2":0,"H2O":1.5},{"ID":29,"Substance":"Sulfur","Formula":"S","MW":32.066,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":1,"N2":3.77326968973747,"SO2":1,"CO2":0,"H2O":0},{"ID":30,"Substance":"Hydrogen sulfide","Formula":"H2S","MW":34.0819,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":1.5,"N2":5.65990453460621,"SO2":1,"CO2":0,"H2O":1},{"ID":31,"Substance":"Steam (Water vapor)","Formula":"H2O","MW":18.0153,"h0":-241826,"Cp0":1.872,"c0":1.79,"c1":0.107,"c2":0.586,"c3":-0.2,"O2":0,"N2":0,"SO2":0,"CO2":0,"H2O":1},{"ID":32,"Substance":"Water (liquid)","Formula":"H2Ol","MW":18.0153,"h0":-285830,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":0,"N2":0,"SO2":0,"CO2":0,"H2O":1},{"ID":33,"Substance":"Air","Formula":"N2+O2","MW":28.9625,"h0":0,"Cp0":1.004,"c0":1.05,"c1":-0.365,"c2":0.85,"c3":-0.39,"O2":0.2095,"N2":0.7905,"SO2":0,"CO2":0,"H2O":0},{"ID":34,"Substance":"Sulfur dioxide","Formula":"SO2","MW":62.059,"h0":-296842,"Cp0":0.624,"c0":0.37,"c1":1.05,"c2":-0.77,"c3":0.21,"O2":0,"N2":0,"SO2":1,"CO2":0,"H2O":0}]')}},t={};function o(r){var s=t[r];if(void 0!==s)return s.exports;var a=t[r]={exports:{}};return e[r](a,a.exports,o),a.exports}(()=>{const{newtonRaphson:e,options:t,logger:r,round:s,units:a}=o(170),{combSection:n}=o(392),{radSection:l}=o(113),{shieldSection:c}=o(361),{browserProcess:u}=o(620),i=o(684),m=(t,o)=>{const a=(e=>({Cp_fluid:270.7831152,m_fluid:225700/105.183,N:60,N_shld:8,L:20.024,Do:.219,CtoC:.394,F:.97,alpha:.835,alpha_shld:1,pi:Math.PI,p_atm:e.pAtm,t_in_conv:210+e.tempToK,t_air:e.tAmb,t_fuel:e.tAmb,t_amb:e.tAmb,NROptions:e.NROptions,humidity:s(e.humidity),airExcess:e.airExcess,o2Excess:e.o2Excess,t_out:void 0,m_fuel:100}))(o);if(0!=a.o2Excess){const o=e=>(combO2=n(e,t,a),r.info("O2%: "+combO2.flows["O2_%"]+" vs O2excess: "+100*a.o2Excess),combO2.flows["O2_%"]/100-a.o2Excess),s=e(o,.5,a.NROptions,"o2_excess_to_air");0!=s&&(a.airExcess=s)}else a.airExcess=o.airExcess;const c=n(a.airExcess,t,a),u=l(a);return r.info("Radiant section (K) Tg: "+u.Tg),r.info("Fuel mass (kmol) "+u.m_fuel),c};let _={H2:.1142,N2:.0068,CO:.0066,CO2:.0254,CH4:.5647,C2H6:.1515,C3H8:.0622,C4H10:.0176,iC4H10:.0075,C2H4:.0158,C3H6:.0277};if("undefined"!=typeof window)u(_,i,t,m);else{const e=m(_,t);r.debug(JSON.stringify(e,null,2))}})()})();