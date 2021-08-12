const {newtonRaphson, options, log} = require('../index');

const
    m_fuel = 120, // kmol/h
    m_air = 1_589.014, // kmol/h
    m_flue = 1720.9, // kmol/h
    N = 60, // number of tubes in rad section
    N_shld = 8, // number of shield tubes
    L = 20.024, // m effective tube length
    Do = 0.219, // m external diameter conv section
    CtoC = 0.394, // m center to center distance of tube
    NCV = 927_844.41, // kJ/kmol net calorific value
    Cp_fuel = 39.26, // kJ/kmol.KkJ/h

    //alpha = 0.9086, // -
    //Sigma = 5.67e-11, //W.m-2.K-4
    sigma = 2.041e-7, //kJ/h.m2.K4
    alpha = 0.835, // -
    F = 0.97, // -
    alpha_shld = 1, //assumed -
    pi = 3.14159; // -

const
    t_in = 210, // C (process)
    t_out = 355, // C
    t_stack = 400, // C
    t_air = 25, // C (atm)
    t_fuel = 25, // C (atm)
    t_datum = 15, // C (amb)
    T_in = t_in + 273, // K
    T_out = t_out + 273, // K
    T_stack = t_stack + 273, // K
    T_air = t_air + 273, // K
    T_fuel = t_fuel + 273, // K
    T_datum = t_datum + 273; // K

// ******* Heat input to the radiant section ********
// Q_in = Q_rls + Q_air + Q_fuel + Q_fluid 

// Appendix 4:
// Simulation of convection section of fired heater
// Program calculates heat duty, working fluid, flue gas and ...
// tube wall temperature and draft profiles for convection bank on ...
// a row-by-row basis
// Input data required for simulation:
const
    t1 = 210, // Inlet temp of working fluid for heating, C
    t2 = 250, // Outlet temp of working fluid from convection section, C
    T1 = 800, // Leaving flue gas temp from radiation section, C
    T2 = 654-273, // Leaving flue gas temp from convection section, C
    Cpf = 2.5744, // avg specific heat of process fluid, Kj/kg.C
    td = 15, // datum temp, C
    Cpav = 1.0775 + 1.1347e-4 * (T2+td)/2, // avg specific heat of flue gases
    Mfluid = 225700, // Flow rate of process fluid, kg/h
    Mgases = 1720.9, // kmol/h // Flow rate of flue gas, kg/h
    ru = 914.8, // density of process fluid, kg/m3
    G = 30, //cst // Flue gas velocity through convection section, kg/m2.s
    L = 20.024, // Effective tube length, m
    Do = 0.219, // External diameter of tube, m
    Di = , // Internal diameter of tube, m
    n = , // Number of tubes in a layer
    Nshld = 8, // Number of shield tubes
    c = 0.219, // Center-to-center distance of tube spacing, m
    N = , // Number of tube layers
    // ntube=input('Number of tubes at each row of tubes in convection section =');
    Qs = , // Assumed heat absorption by the first layer of tubes, Kj/h

    sigma = 2.041e-7, // Boltzman Constant, kJ/h.m2.K4
    alpha = 1, // Relative effectiveness factor of the shield tubes
    F = 0.97; // Exchange factor

for I=1:N
// Calculation of cold plane area of shield tubes
Acpshld=Nshld*c*L;
// Calculation of inside tube surface area
Si=pi*Di*L;
// Calculation of outside tube surface area
So=pi*Do*L;
// Calculation heat exchange surface area at each layer of tubes
S=n*Si;
// From the assumed heat absorption ,calculate the temperatures of...
// the flue gas process fluid by means of appropriate balances ...
// at each tube layer
// Qs=Mgases*Cpav*(T1-T)
Qc=0;
while abs(Qc-Qs)>=0.001;

if Qc~=0
Qs=Qc;
end
T=T1-Qs/(Mgases*Cpav);
// Qs=Mfluid*Cpf*(t2-t)
// x=0.01;
// H=286.8;
t=t2-Qs/(Mfluid*Cpf);
// Calcualtion of the logarithm mean temperature difference (LMTD)
Def1=T1-t2;
Def2=T-t;
LMTD=(Def1-Def2)/logarithm(Def1/Def2);
// Calculation of Escaping radiation
// Caculation tubewall temperature at tube layer
Tw=100+0.5*(t+t2)+273;
Qe_rad=sigma*alpha*Acpshld*F*((T+273)^4-Tw^4);
// Calculation of overall heat exchange coefficient :
// 1/U=(1/hi)+fy+(1/ho)*(Si/So)
// Calculation of convection coefficient between the process fluid and ...
// the inside wall of the tubes
// hi=0.023*(k/Di)*pr^(1/3)*Re^0.8*(u/uw)^0.14
// Let u/uw=1.0 for small variation in viscosity between ...
// bulk and wall temperatures
// k is thermal conductivity of oil(process fluid)
k=0.49744-29.4604*10^(-5)*(t2+t)/2;
// Calculation of Reynolds number ,Re=Di*w*ro/u
// u is viscosity of process fluid at average temperatute of process fluid
u=-0.1919*logarithm((t2+t)/2)*logarithm((t2+t)/2)+0.2295*logarithm((t2+t)/2)-2.9966;
u=u/3600;
u=exp(u);
ri=Di/2;
ro=Do/2;
w=Mfluid/(pi*ri^2*ru);
Re=Di*w*ru/u;
// Calc of prandtl number at the average temperature of process fluid
pr=Cpf*u/k;
hi=0.023*(k/Di)*pr^(1/3)*Re^0.8;
// Calculation of radiation and convection coefficient .....
// between the flue gases and the outside surface of the tubes:
// Estimating of a film coefficient based on pure convection...
// for flue gas flowing normal to a bank of bare tubes
// hc=0.018*Cpg*G^(2/3)*Tgai^0.3/Do
// Tga is average flue gas temperature at each a tybe layer
Tga=(T1+T)/2;
Cpav=1.0775+1.1347*10^(-4)*(T1+T)/2;
hc=0.018*Cpav*G^(2/3)*Tga^0.3/Do;

// Estimating of a radiation coefficient of the hot gases :
hrg=9.2*10^(-2)*Tga-34;
// Estimating of the total heat-transfer coefficient for the bare tube...
// convection section :
ho=1.1*(hc+hrg);
// calculation of f(e,lampda)=fy:
// fy=(ro/lampda)*logarithm(ro/ri)
// Lampda is thermal coductivity of the tube wall:
lampda=-0.157*10^(-4)*(Tw)^2+79.627*10^(-3)*(Tw)+28.803;
// Assume uniform distribution of the the flux over ...
// the whole periphery of the tube.
fy=(ro/lampda)*logarithm(ro/ri);
// Calculation of the overall heat exchange coefficient:
// 1/U=(1/hi)+fy+(1/ho)*(Si/So)
K=1/((1/hi)+fy+(1/ho)*(Si/So));
// U=1/K;
// Uc=U;
Uc=K;
// The heat transferred by convection and radiation ...
// into the tubes:
// Qc=Qe_rad+Uc*Atubes*LMTD
// Atube is exchange surface are at each raw of tubes
Atubes=S;
Qc=Qe_rad+Uc*Atubes*LMTD;
end
I
Tg=T+273;
log('The temperature of the flue gas is //5.1f Kelvin \n\n',Tg)
t;
Tf=t+273;
log('The temperature of the process fluid is //5.1f Kelvin \n\n',Tf)
Tw=Tw;
log('The tube wall temperature is //5.1f Kelvin \n\n',Tw)
Qc;
log('Heat absorbed by heated fluid is //10.2e kJ/h\n',Qc)
if t==t1
T==T2
break
else
t2=t;
T1=T;
Cpav=1.0775+1.1347*10^(-4)*(T2+T)/2;
end
end