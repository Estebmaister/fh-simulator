(()=>{var e={389:(e,t,o)=>{const{newtonRaphson:r,options:a,logger:n,round:s,units:c}=o(170),{combSection:l}=o(392),{radSection:u}=o(113),{shieldSection:i}=o(361),O=(e,t,o)=>{if(0!=o.o2Excess){const t=t=>(combO2=l(t,e,o),n.info("O2%: "+combO2.flows["O2_%"]+" vs O2excess: "+100*o.o2Excess),combO2.flows["O2_%"]/100-o.o2Excess),a=r(t,.5,o.NROptions,"o2_excess_to_air");0!=a&&(o.airExcess=a)}else o.airExcess=t.airExcess;const a=l(o.airExcess,e,o),s=u(o);return n.info("Radiant section (K) Tg: "+s.Tg),n.info("Fuel mass (kmol) "+s.m_fuel),a},m=O({CH4:.5647,C2H6:.1515,C3H8:.0622,C4H10:.0176,iC4H10:.0075,C2H4:.0158,C3H6:.0277,CO:.0066,H2:.1142,N2:.0068,CO2:.0254},a,{Cp_fluid:270.7831152,m_fluid:225700/105.183,N:60,N_shld:8,L:20.024,Do:.219,CtoC:.394,F:.97,alpha:.835,alpha_shld:1,pi:Math.PI,p_atm:a.pAtm,t_in_conv:210+a.tempToK,t_air:a.tAmb,t_fuel:a.tAmb,t_amb:a.tAmb,NROptions:a.NROptions,humidity:s(a.humidity),airExcess:a.airExcess,o2Excess:a.o2Excess,t_out:void 0,m_fuel:100});n.debug(JSON.stringify(m,null,2)),e.exports={combustion:O}},392:(e,t,o)=>{const{newtonRaphson:r,options:a,logger:n,round:s,roundDict:c,units:l}=o(170),u=o(684),i=(e,t,o={})=>{const r=Object.values(e).reduce(((e,t)=>e+t)),a=Math.abs(1-r)<=3e-12;if(a||(o.err+=`fuel percentage not equal to 100, fp: ${100*r}.`),null==t)return a;const n=Math.abs(t.length-Object.keys(e).length),s=0===n;return s||(o.err+=`some fuels aren't in the database, #badFuels: ${n}`),a&&s},O=e=>{normalFuel={...e},total=Object.values(normalFuel).reduce(((e,t)=>e+t));for(const e in normalFuel)normalFuel[e]=normalFuel[e]/total;return normalFuel},m=({c0:e,c1:t,c2:o,c3:r,MW:c,Substance:l},u)=>i=>(i<250?a.verbose&&n.warn(`temp [${s(i)}] bellow range for Cp0 formula`):i>1200&&a.verbose&&n.warn(`temp [${s(i)}] above range for Cp0 formula`),"-"===e?(n.warn(`wrong use of Cp0, called for compound ${l}, no data found`),0):u?c*(e+t*(.001*i)+o*(.001*i)**2+r*(.001*i)**3):e+t*(.001*i)+o*(.001*i)**2+r*(.001*i)**3),_=(e,t)=>{if(0===e.length)return e=>0;let o=JSON.parse(JSON.stringify(e));i(e)||(o=O(o));const r=u.filter((e=>e.Formula in o));let a=0;const n=[];for(const e in o){const s=r.filter((t=>t.Formula==e))[0];n[a]=r=>o[e]*m(s,t)(r),a++}return n.reduce(((e,t)=>o=>e(o)+t(o)),(e=>0))},f=e=>{if(0===e.length)return e=>0;let t=JSON.parse(JSON.stringify(e));i(e)||(t=O(t));const o=u.filter((e=>e.Formula in t));let r=0;for(const e in t)r+=o.filter((t=>t.Formula==e))[0].MW*t[e];return r},p=(e,t)=>"-"===e.Cp0?"-"===e.h0?(a.verbose&&n.warn(`wrong use of deltaH func, called for compound ${e.Substance} without data`),void 0===t?()=>0:0):void 0===t?()=>e.h0:e.h0:void 0===t?t=>e.h0+e.MW*m(e)((a.tempAmbRef+t)/2)*(t-a.tempAmbRef):e.h0+e.MW*m(e)((a.tempAmbRef+t)/2)*(t-a.tempAmbRef),C=(e,t,o,r)=>{const n=p(u[6]),s=p(u[34]),c=p(u[2]);let l=p(u[31]);return!0===r&&(l=p(u[32])),void 0===o&&(o=a.tAmb),void 0===t?t=>e.CO2*n(t)+e.SO2*s(t)+e.H2O*l(t)-p(e)(o)-e.O2*c(o):e.CO2*n(t)+e.SO2*s(t)+e.H2O*l(t)-p(e)(o)-e.O2*c(o)};e.exports={combSection:(e,t,o)=>{const O={err:"",atmPressure:l.pressure(o.p_atm),ambTemperature:l.tempC(o.t_amb),"humidity_%":s(o.humidity),"dryAirN2_%":s(79.05),"dryAirO2_%":s(20.95)},m=u.filter(((e,o,r)=>e.Formula in t));if(!i(t,m,O))return{debug_data:O};const d={O2:0,H2O:0,CO2:0,SO2:0,N2:0},h={O2:.2095,N2:.7905,H2O:0};for(const e of m)for(const o in d)d[o]+=e[o]*t[e.Formula];e-1e-6<0&&(e=0),o.humidity-1e-6<0&&(o.humidity=0);let b=d.O2,S=b*(1+e);if(d.O2<=0)n.error("o2 in fuel is greater than needed, airExcess set to 0"),S=0,b=0,d.N2=0,d.O2=-d.O2;else{const e=((e,t)=>{const o=e-a.tempToK;return 610.78*Math.exp(o/(o+238.3)*17.2694)*t*.01})(o.t_amb,o.humidity),t=o.p_atm-e;h.N2=.7905*t/o.p_atm,h.O2=.2095*t/o.p_atm,h.H2O=e/o.p_atm,O.dryAirPressure=l.pressure(t),O.waterPressure=l.pressure(e),O["H2OPressure_%"]=s(100*h.H2O),O["N2Pressure_%"]=s(100*h.N2),O["O2Pressure_%"]=s(100*h.O2),O.unitSystem=l.system,d.O2=S-d.O2,d.N2+=d.O2*(h.N2/h.O2),d.H2O+=d.N2*(e/(h.N2*o.p_atm))}o.NCV=-((e,t,o,r)=>{let a=0;for(const n in e){if(n in t)continue;const s=o.filter((e=>e.Formula==n))[0];a+=e[n]*C(s)(r)}return a})(t,d,m,o.t_amb),o.adFlame=r(((e,t,o,r)=>{const n=u.filter((t=>t.Formula in e)),s=p(u.filter((e=>"O2"==e.Formula))[0]),c=p(u.filter((e=>"N2"==e.Formula))[0]),l=p(u.filter((e=>"CO2"==e.Formula))[0]),i=p(u.filter((e=>"H2O"==e.Formula))[0]),O=p(u.filter((e=>"SO2"==e.Formula))[0]);void 0===o&&(o=a.tAmb),void 0===r&&(r=0);const m=[];let _=0;for(const t in e){const r=n.filter((e=>e.Formula==t))[0];m[_]=e[t]*p(r)(o),_++}return e=>(e=>t.CO2*l(e)+t.SO2*O(e)+t.H2O*i(e)+t.O2*s(e)+t.N2*c(e)-t.N2*c(o)-r*s(o))(e)-m.reduce(((e,t)=>e+t))})(t,d,o.t_amb,S),1400,o.NROptions,"fuel_adFlame");let N=0;totalPerM_Dry=0;for(const e in d)N+=d[e],"H2O"!==e&&(totalPerM_Dry+=d[e]);const H={total_flow:s(N),dry_total_flow:s(totalPerM_Dry),"N2_%":s(100*d.N2/N),"H2O_%":s(100*d.H2O/N),"CO2_%":s(100*d.CO2/N),"O2_%":s(100*d.O2/N),O2_mol_req_theor:s(b),O2_mass_req_theor:l.mass(b*u[2].MW),"air_excess_%":s(100*o.airExcess),AC:s(S/h.O2),AC_theor_dryAir:s(b/.2095),AC_mass:s(S/h.O2*f(h)/f(t)),AC_mass_theor_moistAir:s(b/h.O2*f(h)/f(t)),fuel_MW:l["mass/mol"](f(t)),fuel_Cp:l.cp(_(t,!0)(o.t_fuel)),flue_MW:l["mass/mol"](f(d)),flue_Cp_Tamb:l.cp(_(d,!0)(o.t_amb)),NCV:l["energy/mol"](o.NCV)};return o.m_fuel_seed=120,o.m_flue_ratio=H.total_flow,o.m_air_ratio=H.AC,o.Cp_flue=_(d,!0),o.Cp_air=_(h,!0),o.Cp_fuel=_(t,!0),c(d),""==O.err&&delete O.err,{flows:H,products:d,debug_data:O}}}},113:(e,t,o)=>{const{newtonRaphson:r,log:a}=o(170),n=(e,t,o)=>{let n=0,s=t||600,c=o.t_in_rad,l=e||o.m_fuel;null==o&&(o={});const u=o.t_air,i=o.t_fuel,O=o.t_amb,m=(e,t=c)=>100+.5*(t+e),_=o.m_fluid||225700,f=o.ncv||927844.41,p=o.Cp_fluid,C=o.Cp_fuel(.5*(i+O))||39.26,d=o.Cp_air(.5*(u+O))||29.142,h=(e,t=O)=>o.Cp_flue(.5*(e+t)),b=o.tubes_rad||60,S=o.shld_tubes_rad||8,N=o.tube_l_rad||20.024,H=o.do_rad||.219,g=o.cToC_rad||.394,v=o.emissive_factor||.97,F=o.alpha_factor||.835,M=o.shld_alpha_factor||1,y=o.h_conv_rad||30.66,W=o.pi||3.14159,I=b*g*N,D=S*g*N,x=2.041e-7,w=b*W*H*N,R=(e,t=u,r=O)=>((e=l)=>o.m_air_ratio*e)(e)*d*(t-r),A=e=>e*f,E=(e,t=i,o=O)=>e*C*(t-o),$=(e,t=u,o=i,r=O)=>A(e)+R(e,t,r)+E(e,o,r),k=(e=l)=>.05*A(e),T=(e,t=s,o=c)=>x*(F*I)*v*(e**4-m(t,o)**4),P=(e,t=s,o=c)=>y*w*(e-m(t,o)),J=(e,t=s,o=c)=>x*(M*D)*v*(e**4-m(t,o)**4),Q=(e,t=l,r=O)=>((e=l)=>o.m_flue_ratio*e)(t)*h(e,r)*(e-r),B=(e,t=s,o=l,r=c,a=O)=>((e,t=s,o=c)=>T(e,t,o)+P(e,t,o))(e,t,r)+J(e,t,r)+k(o)+Q(e,o,a);let K=0,L=0;if(void 0!==t){L=_*p*(t-o.t_in_conv),c=o.t_in_conv+.3*L/(_*p),a(`${c} vs ${o.t_in_rad}`),K=r((e=>_*p*(s-c)-(T(e)+P(e))),1e3,o.NROptions,"rad_Tg_Tout"),0!=K&&(n=K);const e=e=>B(n,s,e)-$(e),u=_*p*(t-o.t_in_conv)/(.75*f);l=r(e,u,o.NROptions,"rad_mFuel"),0!=l&&(o.m_fuel=l)}else void 0!==e?(L=.8*A(e),c=o.t_in_conv+.3*L/(_*p),t=o.t_in_conv+L/(_*p),a(`t_in_rad, seed: ${c} vs problem: ${o.t_in_rad}`),K=r((e=>B(e,t,l)-$(l)),1e3,o.NROptions,"rad_Tg_mFuel"),0!=K&&(n=K),s=r((e=>_*p*(e-c)-(T(n)+P(n))),t,o.NROptions,"rad_Tout"),0!=s&&(o.t_out=s),a(`t_out, seed: ${t} vs calculated: ${s}`),L=_*p*(s-o.t_in_conv),t_in_2=o.t_in_conv+.3*L/(_*p),a(`t_in_rad, seed: ${c} vs calc: ${t_in_2}`)):o.err+="-wrong call for rad section, no seed for mass fuel or out temp.";return o.t_out=s,o.t_in_rad=c,o.Tg=n,{Tw:m(s),m_fuel:l,t_out:s,Tg:n,Q_in:$(l),Q_rls:A(l),Q_air:R(l),Q_fuel:E(l),Q_out:B(n,s,l),Q_losses:k(l),Q_rad:T(n,s),Q_conv:P(n),Q_shld:J(n),Q_flue:Q(n),Q_fluid:((e=s,t=c)=>_*p*(e-t))(),Cp_fluid:p,Cp_fuel:C,Cp_air:d,Cp_flue:h(n)}};e.exports={radSection:e=>{let t={};return void 0!==e.t_out?t=n(void 0,e.t_out,e):void 0!==e.m_fuel?t=n(e.m_fuel,void 0,e):e.err+="-wrong call for rad section, no seed for mass fuel or out temp.",t}}},361:(e,t,o)=>{const{newtonRaphson:r,options:a,log:n}=o(170);e.exports={shieldSection:e=>{let t=e.t_in_rad,o=e.t_in_sh,s=e.Tg,c=0;const l=e.m_fuel,u=e.m_fluid,i=e.Cp_fluid,O=e.h_conv_rad||30.66,m=e.shld_tubes_rad||8,_=e.tube_l_rad||20.024,f=3.14159*m*(e.do_rad||.219)*_,p=(e,o=s)=>O*f*(e-((e,o=t)=>100+.5*(e+o))(e,o)),C=(t,o=s)=>((t=l)=>e.m_flue_ratio*t)()*((t,o=s)=>e.Cp_flue(.5*(o+t)))(t,o)*(t-o);n("Q_conv_sh: "+p(500)+", Q_flue_sh: "+C(500)),flame=r(((e,t=s)=>C(e,t)-p(e,t)),s,a,"shield_Tg"),0!=flame&&(c=flame),e.Tg_sh=c,flame_t_in=r(((e,o=c,r=s)=>((e,o=t)=>u*i*(o-e))(e)-p(o,r)),t,a,"shield_t_in"),0!=flame_t_in&&(o=flame_t_in),e.t_in_sh=o}}},170:e=>{const t=function(...arguments){if(0!==arguments.length)switch(arguments[0]){case"warn":for(var e=1;e<arguments.length;e++)console.log(`{"WARN": "${arguments[e]}"}`);break;case"info":for(e=1;e<arguments.length;e++)console.log(`{"INFO": "${arguments[e]}"}`);break;case"error":for(e=1;e<arguments.length;e++)console.error(`{"ERROR": "${arguments[e]}"}`);break;case"debug":for(e=1;e<arguments.length;e++)console.debug(`{"DEBUG": ${arguments[e]}}`);break;default:for(e=0;e<arguments.length;e++)console.log(`{"DEFAULT": "${arguments[e]}"}`)}},o=(...arguments)=>{for(var e=1;e<arguments.length;e++)console.log(`{"${arguments[0]}": "${arguments[e]}"}`)},r={info:arguments=>o("INFO",arguments),warn:arguments=>o("WARN",arguments),error:arguments=>o("ERROR",arguments),debug:arguments=>o("DEBUG",arguments),default:arguments=>o("DEFAULT",arguments)},a=273.15,n=(()=>{const e={verbose:!0,tAmb:a+26.6667,humidity:50,o2Excess:0,airExcess:.8,pAtm:101325,unitSystem:"SI",NROptions:{tolerance:1e-4,epsilon:3e-8,maxIterations:20,h:1e-4,verbose:!0},tempToK:a,tempAmbRef:298.15};return"undefined"==typeof process||(e.verbose="true"==process.argv[2],e.tAmb=a+parseFloat(process.argv[3])||294.15,e.humidity=1e-10+parseFloat(process.argv[4])||70,e.o2Excess=.01*parseFloat(process.argv[5])||0,e.airExcess=1e-10+.01*parseFloat(process.argv[6])||.8,e.pAtm=parseFloat(process.argv[7])||1e5,e.unitSystem=process.argv[8],e.NROptions.verbose="true"==process.argv[2]),e})(),s=e=>Math.round(1e3*e)/1e3;n.verbose&&t("debug",JSON.stringify(n,null,2));const c={"energy/mol":e=>s(.9478171203*e)+" Btu/mol","mass/mol":e=>s(2.2046244202*e)+" lb/kmol",heat_flow:e=>s(3.4121416331*e)+" MMBtu/h",heat_flux:e=>s(3.4121416331*e/10.763910417)+" Btu/h-ft2",fouling_factor:e=>s(1*e)+" h-ft2-°F/Btu","energy/mass":e=>s(1*e)+" kJ/kg","energy/vol":e=>s(1*e)+" kJ/m3",area:e=>s(10.763910417*e)+" ft2",length:e=>s(3.280839895*e)+" ft",temp:e=>s(1.8*e)+" °R",tempC:e=>s(9*(e-a)/5+32)+" °F",pressure:e=>s(.0001450377*e)+" psi",mass:e=>s(.0022046244202*e)+" lb",mass_flow:e=>s(2.2046244202*e)+" lb/s",vol_flow:e=>s(35.314666721*e)+" f3/h",cp:e=>s(1*e)+" kJ/kmol-K",power:e=>s(3.4121416331*e)+" Btu/h",system:"ENGLISH"},l={"energy/mol":e=>s(1*e)+" kJ/mol","mass/mol":e=>s(1*e)+" kg/kmol",heat_flow:e=>s(1*e)+" MW/h",heat_flux:e=>s(1*e)+" W/m2",fouling_factor:e=>s(1*e)+" m2-K/W","energy/mass":e=>s(1*e)+" kJ/kg","energy/vol":e=>s(1*e)+" kJ/m3",area:e=>s(1*e)+" m2",length:e=>s(1*e)+" m",tempC:e=>s(1*e-a)+" °C",temp:e=>s(1*e)+" K",pressure:e=>s(.001*e)+" kPa",mass:e=>s(.001*e)+" kg",mass_flow:e=>s(1*e)+" kg/s",vol_flow:e=>s(1*e)+" m3/h",cp:e=>s(1*e)+" kJ/kmol-K",power:e=>s(1*e)+" W",system:"SI"},u=(e=>{if("string"!=typeof e.unitSystem)return t("warn",`invalid type (${e.unitSystem}) for unit system, using default SI`),l;switch(e.unitSystem.toLowerCase()){case"si":return l;case"english":return c;default:return t("warn",e.unitSystem.toLowerCase()+" - invalid unit system, using default SI"),l}})(n);e.exports={newtonRaphson:function(e,o,r,a,n){let s,c,l,u,i,O,m,_,f,p,C,d,h,b;for("function"!=typeof o&&(n=a,a=r,r=o,o=null),u=void 0===(a=a||{}).tolerance?1e-7:a.tolerance,b=void 0===a.epsilon?2220446049250313e-31:a.epsilon,i=void 0===a.maxIterations?20:a.maxIterations,C=void 0===a.h?1e-4:a.h,h=void 0!==a.verbose&&a.verbose,d=1/C,O=0;O++<i;){if(c=e(r),o?l=o(r):(m=e(r+C),_=e(r-C),f=e(r+2*C),p=e(r-2*C),l=(p-f+8*(m-_))*d/12),Math.abs(l)<=b*Math.abs(c))return h&&t("info",`Newton-Raphson (${n}): failed to converged due to nearly zero first derivative`),!1;if(s=r-c/l,Math.abs(s-r)<=u*Math.abs(s))return h&&t("info",`Newton-Raphson (${n}): converged to x = ${s} after ${O} iterations`),s;r=s}return h&&t("info",`Newton-Raphson (${n}): Maximum iterations reached (${i})`),!1},options:n,log:t,logger:r,round:s,roundDict:(e={})=>{for(const[t,o]of Object.entries(e))isNaN(o)||(e[t]=Math.round(1e3*o)/1e3)},units:u}},684:e=>{"use strict";e.exports=JSON.parse('[{"ID":0,"Substance":"Carbon","Formula":"C","MW":12.011,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":1,"N2":3.77326968973747,"SO2":0,"CO2":1,"H2O":0},{"ID":1,"Substance":"Hydrogen","Formula":"H2","MW":2.0159,"h0":0,"Cp0":14.209,"c0":13.46,"c1":4.6,"c2":-6.85,"c3":3.79,"O2":0.5,"N2":1.88663484486874,"SO2":0,"CO2":0,"H2O":1},{"ID":2,"Substance":"Oxygen","Formula":"O2","MW":31.9988,"h0":0,"Cp0":0.922,"c0":0.88,"c1":-0.0001,"c2":0.54,"c3":-0.33,"O2":-1,"N2":0,"SO2":0,"CO2":0,"H2O":0},{"ID":3,"Substance":"Nitrogen","Formula":"N2","MW":28.0134,"h0":0,"Cp0":1.042,"c0":1.11,"c1":-0.48,"c2":0.96,"c3":-0.42,"O2":0,"N2":1,"SO2":0,"CO2":0,"H2O":0},{"ID":4,"Substance":"Nitrogen (atm)","Formula":"N2a","MW":28.158,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":0,"N2":1,"SO2":0,"CO2":0,"H2O":0},{"ID":5,"Substance":"Carbon Monoxide","Formula":"CO","MW":28.0104,"h0":-110527,"Cp0":1.041,"c0":1.1,"c1":-0.46,"c2":1,"c3":-0.454,"O2":0.5,"N2":1.88663484486874,"SO2":0,"CO2":1,"H2O":0},{"ID":6,"Substance":"Carbon Dioxide","Formula":"CO2","MW":44.0098,"h0":-393522,"Cp0":0.842,"c0":0.45,"c1":1.67,"c2":-1.27,"c3":0.39,"O2":0,"N2":0,"SO2":0,"CO2":1,"H2O":0},{"ID":7,"Substance":"Methane","Formula":"CH4","MW":16.0428,"h0":-74873,"Cp0":2.254,"c0":1.2,"c1":3.25,"c2":0.75,"c3":-0.71,"O2":2,"N2":7.54653937947494,"SO2":0,"CO2":1,"H2O":2},{"ID":8,"Substance":"Ethane","Formula":"C2H6","MW":30.0697,"h0":-84740,"Cp0":1.766,"c0":0.18,"c1":5.92,"c2":-2.31,"c3":0.29,"O2":3.5,"N2":13.2064439140811,"SO2":0,"CO2":2,"H2O":3},{"ID":9,"Substance":"Propane","Formula":"C3H8","MW":44.0966,"h0":-103900,"Cp0":1.679,"c0":-0.096,"c1":6.95,"c2":-3.6,"c3":0.73,"O2":5,"N2":18.8663484486874,"SO2":0,"CO2":3,"H2O":4},{"ID":10,"Substance":"n-Butane","Formula":"C4H10","MW":58.1235,"h0":-126200,"Cp0":1.716,"c0":0.163,"c1":5.7,"c2":-1.906,"c3":-0.049,"O2":6.5,"N2":24.5262529832936,"SO2":0,"CO2":4,"H2O":5},{"ID":11,"Substance":"Isobutane","Formula":"iC4H10","MW":58.1235,"h0":-135000,"Cp0":1.547,"c0":0.206,"c1":5.67,"c2":-2.12,"c3":0.183,"O2":6.5,"N2":24.5262529832936,"SO2":0,"CO2":4,"H2O":5},{"ID":12,"Substance":"n-Pentane","Formula":"C5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":8,"N2":30.1861575178998,"SO2":0,"CO2":5,"H2O":6},{"ID":13,"Substance":"Isopentane","Formula":"iC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":8,"N2":30.1861575178998,"SO2":0,"CO2":5,"H2O":6},{"ID":14,"Substance":"Neopentane","Formula":"nC5H12","MW":72.1504,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":8,"N2":30.1861575178998,"SO2":0,"CO2":5,"H2O":6},{"ID":15,"Substance":"n-Hexane","Formula":"C6H14","MW":86.1773,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":9.5,"N2":35.846062052506,"SO2":0,"CO2":6,"H2O":7},{"ID":16,"Substance":"Ethylene","Formula":"C2H4","MW":28.0538,"h0":52467,"Cp0":1.548,"c0":0.136,"c1":5.58,"c2":-3,"c3":0.63,"O2":3,"N2":11.3198090692124,"SO2":0,"CO2":2,"H2O":2},{"ID":17,"Substance":"Propylene","Formula":"C3H6","MW":42.0807,"h0":20410,"Cp0":1.437,"c0":0.454,"c1":4.06,"c2":-0.934,"c3":-0.133,"O2":4.5,"N2":16.9797136038186,"SO2":0,"CO2":3,"H2O":3},{"ID":18,"Substance":"n-Butene (Butylene)","Formula":"C4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":6,"N2":22.6396181384248,"SO2":0,"CO2":4,"H2O":4},{"ID":19,"Substance":"Isobutene","Formula":"iC4H8","MW":56.1076,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":6,"N2":22.6396181384248,"SO2":0,"CO2":4,"H2O":4},{"ID":20,"Substance":"n-Pentene","Formula":"C5H10","MW":70.1345,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":7.5,"N2":28.299522673031,"SO2":0,"CO2":5,"H2O":5},{"ID":21,"Substance":"Benzene","Formula":"C6H6","MW":78.1137,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":7.5,"N2":28.299522673031,"SO2":0,"CO2":6,"H2O":3},{"ID":22,"Substance":"Toluene","Formula":"C7H8","MW":92.1406,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":9,"N2":33.9594272076372,"SO2":0,"CO2":7,"H2O":4},{"ID":23,"Substance":"Xylene","Formula":"C8H10","MW":106.1675,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":10.5,"N2":39.6193317422434,"SO2":0,"CO2":8,"H2O":5},{"ID":24,"Substance":"Acetylene","Formula":"C2H2","MW":26.0379,"h0":226731,"Cp0":1.699,"c0":1.03,"c1":2.91,"c2":-1.92,"c3":0.54,"O2":2.5,"N2":9.43317422434368,"SO2":0,"CO2":2,"H2O":1},{"ID":25,"Substance":"Naphthalene","Formula":"C10H8","MW":128.1736,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":12,"N2":45.2792362768496,"SO2":0,"CO2":10,"H2O":4},{"ID":26,"Substance":"Methyl alcohol (Methanol)","Formula":"CH3OH","MW":32.0422,"h0":-201300,"Cp0":1.405,"c0":0.66,"c1":2.21,"c2":0.81,"c3":-0.89,"O2":1.5,"N2":5.65990453460621,"SO2":0,"CO2":1,"H2O":2},{"ID":27,"Substance":"Ethyl alcohol (Ethanol)","Formula":"C2H5OH","MW":46.0691,"h0":-235000,"Cp0":1.427,"c0":0.2,"c1":-4.65,"c2":-1.82,"c3":0.03,"O2":3,"N2":11.3198090692124,"SO2":0,"CO2":2,"H2O":3},{"ID":28,"Substance":"Ammonia","Formula":"NH3","MW":17.0306,"h0":-45720,"Cp0":2.13,"c0":1.6,"c1":1.4,"c2":1,"c3":-0.7,"O2":0.75,"N2":2.8299522673031,"SO2":0,"CO2":0,"H2O":1.5},{"ID":29,"Substance":"Sulfur","Formula":"S","MW":32.066,"h0":0,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":1,"N2":3.77326968973747,"SO2":1,"CO2":0,"H2O":0},{"ID":30,"Substance":"Hydrogen sulfide","Formula":"H2S","MW":34.0819,"h0":"-","Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":1.5,"N2":5.65990453460621,"SO2":1,"CO2":0,"H2O":1},{"ID":31,"Substance":"Steam (Water vapor)","Formula":"H2O","MW":18.0153,"h0":-241826,"Cp0":1.872,"c0":1.79,"c1":0.107,"c2":0.586,"c3":-0.2,"O2":0,"N2":0,"SO2":0,"CO2":0,"H2O":1},{"ID":32,"Substance":"Water (liquid)","Formula":"H2Ol","MW":18.0153,"h0":-285830,"Cp0":"-","c0":"-","c1":"-","c2":"-","c3":"-","O2":0,"N2":0,"SO2":0,"CO2":0,"H2O":1},{"ID":33,"Substance":"Air","Formula":"N2+O2","MW":28.9625,"h0":0,"Cp0":1.004,"c0":1.05,"c1":-0.365,"c2":0.85,"c3":-0.39,"O2":0.2095,"N2":0.7905,"SO2":0,"CO2":0,"H2O":0},{"ID":34,"Substance":"Sulfur dioxide","Formula":"SO2","MW":62.059,"h0":-296842,"Cp0":0.624,"c0":0.37,"c1":1.05,"c2":-0.77,"c3":0.21,"O2":0,"N2":0,"SO2":1,"CO2":0,"H2O":0}]')}},t={};!function o(r){var a=t[r];if(void 0!==a)return a.exports;var n=t[r]={exports:{}};return e[r](n,n.exports,o),n.exports}(389)})();