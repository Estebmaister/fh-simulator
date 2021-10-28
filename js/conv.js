const {newtonRaphson, options, log} = require('./utils');

const convSection_full = (params) => {
  //Tube Spacing, in
  tspc = 8
  //Number Tubes Wide
  Nwide = 8
  //Tube Effective Length, ft
  tlgth = 13.000
  //Number Of Tubes = 48

  // Gas flow, lb/hr = 100,000
  Wgas = 100_000

  // hc = Convection heat transfer coefficient, Btu/hr-ft2-F
  // d_o = Tube outside diameter, in
  d_o = 4.500
  // kb = Gas thermal conductivity, Btu/hr-ft-F
  kb = 0.0315
  // cp = Gas heat capacity, Btu/lb-F
  cp = 0.2909
  // mb = Gas dynamic viscosity, lb/hr-ft
  mb = 0.0823
  //net free area
  NFA = Nwide*tspc/12*tlgth-Nwide*d_o/12*tlgth
  // Gn = Mass velocity of gas, lb/hr-ft2
  Gn = Wgas / NFA

  // hc = Outside heat transfer coefficient, Btu/hr-ft2-F
  // For a staggered tube arrangement,
  hc = 0.33*kb*(12/d_o) * ((cp*mb)/kb)**(1/3) * ((d_o/12)*(Gn/mb))**0.6
  // And for an inline tube arrangement,
  hc_inline = 0.26*kb*(12/d_o) * ((cp*mb)/kb)**(1/3) * ((d_o/12)*(Gn/mb))**0.6

  // hr = Outside radiation heat transfer coefficient, Btu/hr-ft2-F
  hr = 0
  // Rfo = Outside fouling resistance, hr-ft2-F/Btu
  Rfo = 0
  // he = Effective outside heat transfer coefficient, Btu/hr-ft2-F
  he = 1/(1/(hc+hr)+Rfo)
  // hi = Inside film heat transfer coefficient, Btu/hr-ft2-F
  // tw = Tubewall thickness, in
  // kw = Tube wall thermal conductivity, Btu/hr-ft-F
  kw = 
  // Ao = Outside tube surface area, ft2/ft
  Ao = 2
  // Aw = Mean area of tube wall, ft2/ft
  Aw = 1
  // Ai = Inside tube surface area, ft2/ft
  Ai = 1
  // Rfi = Inside fouling resistance, hr-ft2-F/Btu
  Rfi = 0

  // Outside thermal resistance, hr-ft2-F/Btu
  Ro = 1/he
  // Tube wall thermal resistance, hr-ft2-F/Btu
  // Rwo = (tw/12*kw)*(Ao/Aw)
  Rwo = 0
  // Inside thermal resistance, hr-ft2-F/Btu
  // Rio = ((1/hi)+Rfi)*(Ao/Ai)
  Rio = 0
  Rto = Ro + Rwo + Rio
  Uo = 1/Rto
  return Uo
  Q_in = Q_flue_in + Q_fluid_in
  Q_out = Q_flue_out + Q_fluid_out

  Q_conv = m_fluid*Cp_fluid*(Tin-zr - Ta)
  Q_conv = m_flue*Cp_flue*(Tg - Te)
  Q_conv = At*Uconv*TLMD
}

log(convSection_full())

const
  m_fuel = 120, // kmol/h
  m_air = 1_589.014, // kmol/h
  m_flue = 1720.9, // kmol/h
  NCV = 927_844.41, // kJ/kmol net calorific value
  Cp_fuel = 39.26, // kJ/kmol.KkJ/h
  
  //alpha = 0.9086, // -
  //Sigma = 5.67e-11, //W.m-2.K-4
  pi = 3.14159; // -

const
  t_in_rad = 210, // C (process)
  t_out_rad = 355, // C
  t_stack = 400, // C
  t_datum = 15, // C (amb)
  T_in = t_in_rad + 273, // K
  T_out = t_out_rad + 273, // K
  T_stack = t_stack + 273, // K
  T_datum = t_datum + 273; // K


let t2 = t_out_rad, // Outlet temp of working fluid from convection section, C
  T1 = 971; // Tg Leaving flue gas temp from radiation section, C
const
  t1 = t_in_rad, // Inlet temp of working fluid for heating, C
  T2 = t_stack, // Leaving flue gas temp from convection section, C
  td = 15, // datum temp, C
  Mfluid = 225700, // Flow rate of process fluid, kg/h
  Cpf = 2.5744, // avg specific heat of process fluid, Kj/kg.C
  Mgases = 1720.9, // kmol/h // Flow rate of flue gas, kg/h
  ru = 914.8, // density of process fluid, kg/m3
  G = 30, //cst // Flue gas velocity through convection section, kg/m2.s
  L = 20.024, // Effective tube length, m
  CtoC = 0.250, // m center to center distance of tube
  Do = 0.168, // External diameter conv section, m
  Di = Do - 0.008, // Internal diameter of tube, m
  sigma = 2.041e-7, //kJ/h.m2.K4
  alpha = 1, // - Relative effectiveness factor of the shield tubes
  F = 0.97, // - Exchange factor
  Total_tubes = 40,
  Numbers_passes = 2,
  N = 11, // number of tubes layers
  n = 4, // Number of tubes in a layer
  N_shld = 8, // Number of shield tubes
  c = 0.219; // Center-to-center distance of tube spacing, m

/** avg specific heat of flue gases */
let Cp_av = 1.0775 + 1.1347e-4 * (T2+td)/2; 
// Qs=Mgases*Cp_av*(T1-T)
let Qs = 6e8; // Assumed heat absorption by the first layer of tubes, Kj/h

for (let I = 1; I < N; I++) {
  log("info", "for started")
  // Calculation of cold plane area of shield tubes
  let Acp_shld = N_shld*CtoC*L;
  let Si = pi*Di*L; // Calc of inside tube surface area
  let So = pi*Do*L; // Calc of outside tube surface area
  let S = n*Si; // Calc heat exchange surface area at each layer of tubes
  /** 
   * From the assumed heat absorption, calculate the temperatures of
   * the flue gas process fluid by means of appropriate balances
   * at each tube layer
   */
  // Qs=Mgases*Cp_av*(T1-T)
  let Qc = 0;
  let t = 0;
  let T = 0;
  let Tw = 0;
  while (Math.abs(Qc-Qs) >= 0.001) {
    if (Qc != 0) {
      Qs = Qc;
    }// 1.end
    T = T1 - Qs/(Mgases*Cp_av);
    // Qs=Mfluid*Cpf*(t2-t)
    // x=0.01;
    // H=286.8;
    t = t2 - Qs/(Mfluid*Cpf);
    // Calcualtion of the logarithm mean temperature difference (LMTD)
    const Def1 = T1 - t2;
    const Def2 = T - t;
    const LMTD = (Def1-Def2)/(Math.log(Def1/(Def2+1e-1000)))+1e-1000;
    log(`T1 ${T1}; t2 ${t2}; t ${t}; T ${T}; Def2 ${Def2}; Def1 ${Def1}; LMTD: ${LMTD}`)
    // Calculation tube_wall temperature at tube layer
    Tw = 100 + 0.5*(t + t2) + 273;
    // Calculation of Escaping radiation
    const Qe_rad = sigma*alpha*Acp_shld*F*((T+273)**4-Tw**4);
    /** Calculation of overall heat exchange coefficient :
    1/U=(1/hi)+fy+(1/ho)*(Si/So)
    Calculation of convection coefficient between the 
    process fluid and the inside wall of the tubes
    hi=0.023*(k/Di)*pr**(1/3)*Re**0.8*(u/uw)**0.14
    Let u/uw=1.0 for small variation in viscosity between
    bulk and wall temperatures
    k is thermal conductivity of oil(process fluid)
    */
    let k = 0.49744 - 29.4604e-5*(t2 + t)/2;
    // Calculation of Reynolds number, Re = Di*w*ro/u
    // u is viscosity of process fluid at avg temp of process fluid
    let u = -0.1919*Math.log((t2+t)/2)*Math.log((t2+t)/2)+0.2295*Math.log((t2+t)/2)-2.9966;
    u = u/3600;
    u = Math.exp(u);
    let ri = Di/2;
    let ro = Do/2;
    let w = Mfluid/ (pi*(ri**2)*ru);
    let Re = Di*w*ru/u;
    // Calc of prandtl number at the average temp of process fluid
    const pr = Cpf*u/k;
    const hi = 0.023*(k/Di)*pr**(1/3)*Re**0.8;
    /** Calculation of radiation and convection coefficient
    between the flue gases and the outside surface of the tubes:
    Estimating of a film coefficient based on pure convection
    for flue gas flowing normal to a bank of bare tubes
    hc=0.018*Cpg*G**(2/3)*Tgai**0.3/Do
    Tga is average flue gas temperature at each a tybe layer
      */
    const Tga = (T1 + T)/ 2;
    Cp_av = 1.0775 + 1.1347e-4*(T1+T)/2;
    const hc = 0.018*Cp_av*(G**(2/3)) * (Tga**0.3)/Do;
    // Estimating of a radiation coefficient of the hot gases :
    const hrg = 9.2e-2*Tga - 34;
    // Estimating of the total heat-transfer coff for the bare tube conv sec:
    const ho = 1.1*(hc + hrg);
    // calculation of f(e,lambda)=fy:
    // fy=(ro/lambda)*Math.log(ro/ri)
    // Lambda is thermal conductivity of the tube wall:
    const lambda = -0.157e-4*(Tw**2) + 79.627e-3*(Tw) + 28.803;
    // Assume uniform distribution of the the flux over the whole periphery of the tube.
    const fy = (ro/ lambda)*Math.log(ro/ ri);
    // Calculation of the overall heat exchange coefficient:
    // 1/U=(1/hi)+fy+(1/ho)*(Si/So)
    const K = 1/( (1/ hi) + fy + (1/ ho)*(Si/ So) );
    // U=1/K;
    // Uc=U;
    const Uc = K;
    // The heat transferred by convection and radiation ...
    // into the tubes:
    // Qc=Qe_rad+Uc*Atubes*LMTD
    // Atube is exchange surface are at each raw of tubes
    const Atubes = S;
    Qc = Qe_rad + Uc*Atubes*LMTD;
  }// 2.end
  log("Iteration " + I)
  let Tg = T + 273;
  log(`The temperature of the flue gas is ${Tg} Kelvin`)
  let Tf = t+273;
  log(`The temperature of the process fluid is ${Tf} Kelvin`)
  log(`The tube wall temperature is ${Tw} Kelvin`)
  log(`Heat absorbed by heated fluid is //10.2e kJ/h :` + Qc)
  Qc = 0;
  if (t==t1) {
    T = T2;
    break
  } else {
    t2 = t;
    T1 = T;
    Cp_av = 1.0775+1.1347*10**(-4)*(T2+T)/2;
  } // 4.end
}// 3.end