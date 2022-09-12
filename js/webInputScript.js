/** Round function */
const round = (n,dec) => Math.round(n*(10**dec))/(10**dec);

/** Approx functions extracted from utils.js file */
const linearApprox = ({x1,x2,y1,y2}) => {
  if (typeof y1 !== "number") {
    console.error(new Error(`call for linearApprox with incorrect value type for y1: ${y1}`));
    return () => 0;
  }
  if (x1 == x2 || x2 == undefined || y2 == undefined) 
    return () => y1;
  const m = (y2 - y1) / (x2 - x1);
  return (x) => m * (x - x1) + y1;
};
const viscosityApprox = ({t1,t2,v1,v2}) => {
  if (typeof v1 !== "number") {
    console.error(new Error(`call for viscosityApprox with incorrect value type for v1: ${v1}`));
    return () => 0;
  }
  if (t1 == t2 || t2 == undefined || v2 == undefined) 
    return () => v1;
  const B = Math.log(v1/v2) / (1/t1 - 1/t2)
  const A = v1 * Math.exp(-B/t1);
  return (temp) => A * Math.exp(B/temp);
}

// defaultFuels are the default values set for the combustible
let defaultFuels = {
  CH4: .5647, C2H4: .0158, C2H6: .1515, C3H8: .0622,
  C3H6: .0277, C4H10: .0176, iC4H10: .0075,
  H2: .1142, N2: .0068, CO: .0066, CO2: .0254,
};

// dataFormula is a string list with all the combustible formulas
const dataFormulas = [
  "C","H2","O2","N2","N2a","CO","CO2","CH4","C2H6", "C3H8",
  "C4H10","iC4H10","C5H12","iC5H12","nC5H12","C6H14", "C2H4",
  "C3H6","C4H8","iC4H8","C5H10","C6H6","C7H8","C8H10", "C2H2",
  "C10H8","CH3OH","C2H5OH","NH3","S","H2S","H2O","H2Ol","N2+O2","SO2"
];

// HTML Elements ID's
const tInElementID = "t_in";
const tOutElementID = "t_out";
const cpInElementID = "cp_in";
const cpOutElementID = "cp_out";
const kwInElementID = "kw_in";
const kwOutElementID = "kw_out";
const miuInElementID = "miu_in";
const miuOutElementID = "miu_out";
const spGravElementID = "sp-grav";
const totalElementID = "total";
const subDutyElementID = "sub-duty";

const totalElement = document.getElementById(totalElementID);
// totalRecalculate change the total value for every new entry at the fuel composition
const totalRecalculate = () => {
  let total = 0;
  dataFormulas.forEach(element => {
    const inputElement = document.getElementById(element)
    if (inputElement !== null) {
      if (inputElement.value !== "") total += parseFloat(inputElement.value);
    }
  });
  if (totalElement) {
    totalElement.innerHTML = parseInt(total * 1e4)/1e4
  }
};

const firstFuelEditionCall = () => {
  // set the default fuels at first load
  for (const key in defaultFuels) {
    if (document.getElementById(key)) {
      document.getElementById(key).value = Math.round((parseFloat(defaultFuels[key]) * 10000)) / 100;
    }
  }

  // adding the function to be called at every input field change
  dataFormulas.forEach(element => {
    const inputElement = document.getElementById(element)
    if (inputElement !== null) inputElement.addEventListener('input', totalRecalculate)
  });

  // calls at the first load for default fuels
  totalRecalculate();
}

// Change the content of the span element when clicked
const showHideDiv = (div, span) => {
  if (div.style.height === "auto") {
    span.textContent = "[➡]";
    div.style.height = "0";
    div.style.opacity = "0";
  } else {
    span.textContent = "[⬇]";
    div.style.height = "auto";
    div.style.opacity = "1";
  }
}

let fuelEditionCalled = false;
const spanShowFuelID = "show-hide-fuel";
const fuelDivID = "fuel-div";
// Show or hide the fuel section, for the first call it populates the default fuels
const spanShowFuel = document.getElementById(spanShowFuelID);
const fuelDiv = document.getElementById(fuelDivID);
const showHideFuelDiv = () => {
  if (!fuelEditionCalled) {
    fuelEditionCalled = true;
    firstFuelEditionCall();
  }
  showHideDiv(fuelDiv,spanShowFuel);
}
if (fuelDiv && spanShowFuel) {
  spanShowFuel.style.cursor = "pointer";
  spanShowFuel.onclick = showHideFuelDiv;
}

const spanShowGraphID = "show-hide-graph";
const graphDivID = "graph-div";
// Show or hide the graph section
const spanShowGraph = document.getElementById(spanShowGraphID);
const graphDiv = document.getElementById(graphDivID);
const showHideGraphDiv = () => {
  showHideDiv(graphDiv,spanShowGraph);
}
if (graphDiv && spanShowGraph) {
  spanShowGraph.style.cursor = "pointer";
  spanShowGraph.onclick = showHideGraphDiv;
}
const graphButtonID = "graph-action";
const resultButtonID = "result-action";
const formElementID = "data-form";
const graphButton = document.getElementById(graphButtonID);
const resultButton = document.getElementById(resultButtonID);
const formElement = document.getElementById(formElementID);
if (graphButton) graphButton.onmousedown = () => {
  formElement.action = `../${formElement.lang || "en"}_graph/`;
}
if (graphButton && resultButton) resultButton.onmousedown = () => {
  formElement.action = "./fullResult.html";
}

formElement.addEventListener('submit', function () {
  const allInputs = formElement.getElementsByTagName('input');

  for (const element of allInputs) {
    let input = element;
    if (input.name && !input.value) input.name = '';
  }
});

// -- Updating duty value to show in MBtu/h.
const 
  barrelsToft3 = 5.6145833333,
  ft3Tolb = 62.371, // for Water @60°F
  m3ToBarrels = 1/(0.158987295),
  lbtokg = 1/2.20462,
  BPDtolb_h = (SG) => barrelsToft3*ft3Tolb*SG/24,
  BPDtokg_h = (SG) => m3ToBarrels*barrelsToft3*ft3Tolb*lbtokg*SG/24/3.6;
let BDPtoMass = BPDtolb_h;

const warnings = {
  normal: (d) => `El calor absorbido ("duty") es <strong>${d}</strong> veces el valor de diseño.`,
  design: () => `El calor absorbido ("duty") es igual al valor de diseño.`,
  
  //Si el calor absorbido fuese superior a 23 MW (o 78,79 MMBtu/h).
  above: (d) => `El calor absorbido ("duty") es <strong>${d}</strong> veces superior al diseño. ` +
    `Sostener esta condición operacional requiere atención especial.`,

  extreme: (d) => `El calor absorbido ("duty") es <strong>${d}</strong> veces superior al diseño. ` +
    `Sostener esta condición operacional perjudicaría la integridad mecánica del horno.`,

  //Si el calor absorbido fuese inferior a 10,45 MW (o 35.8 MMBtu/h)
  down: () => `El calor absorbido ("duty") es inferior al mínimo operacional ("turndown"). ` +
    `Sostener esta condición operacional no es recomendable.`
}

const updateDuty = () => {
  const newDuty = round(
    +inputFlow.value*BDPtoMass(+spGrav.value) *
    (+tOut.value-tIn.value) *(+cpOut.value+ +cpIn.value)/2
    /1e6, 2);
  spanDutyField.innerHTML = newDuty;
  if (!alertDuty || !alertDiv) return;
  const dutyDifference = round(newDuty/designDuty,2);
  if (1 > dutyDifference && 0.453 < dutyDifference) {
    alertDuty.className = '';
    alertDuty.innerHTML = warnings.normal(dutyDifference);
    alertDiv.className = '';
  } else if (1.01 > dutyDifference && 0.99 < dutyDifference) {
    alertDuty.className = '';
    alertDuty.innerHTML = warnings.design(dutyDifference);
    alertDiv.className = '';
  } else if (1.2 <= dutyDifference) {
    alertDuty.innerHTML = warnings.extreme(dutyDifference);
    alertDuty.className = 'alert';
    alertDiv.className = '';
  } else if (1.01 <= dutyDifference) {
    alertDuty.innerHTML = warnings.above(dutyDifference);
    alertDuty.className = 'alert';
    alertDiv.className = '';
  } else if (0.453 >= dutyDifference) {
    alertDuty.innerHTML = warnings.down(dutyDifference);
    alertDuty.className = 'alert';
    alertDiv.className = '';
  } else {
    alertDiv.className = 'hidden';
  }
}

const updateFlow = () => spanFlowField.innerHTML = Math.round(
  +inputFlow.value*BPDtolb_h(+spGrav.value) ).toLocaleString();

const tIn = document.getElementById(tInElementID);
const tOut = document.getElementById(tOutElementID);
const cpIn = document.getElementById(cpInElementID);
const cpOut = document.getElementById(cpOutElementID);
const kwIn = document.getElementById(kwInElementID);
const kwOut = document.getElementById(kwOutElementID);
const miuIn = document.getElementById(miuInElementID);
const miuOut = document.getElementById(miuOutElementID);
const spGrav = document.getElementById(spGravElementID);
const subDuty = document.getElementById(subDutyElementID);

let designDuty = 78.79; // MMBtu/h
if (tIn && tIn.name.includes("si")) designDuty = 23.0; //MW
const alertDiv = document.getElementById("alert-div");
const alertDuty = document.getElementById("alert-duty");

let inputFlow, spanFlowField;
const spanDutyField = document.getElementById('span-duty');
if (subDuty) {
  inputFlow = subDuty.getElementsByTagName('input')[0];
  spanFlowField = subDuty.getElementsByTagName('span')[0];
  if (tIn && tIn.name.includes("si")) BDPtoMass = BPDtokg_h;
  if (inputFlow && spanDutyField) {
    inputFlow.addEventListener('input', updateDuty)
    inputFlow.addEventListener('input', updateFlow)
    cpOut.addEventListener('input', updateDuty)
    cpIn.addEventListener('input', updateDuty)
    spGrav.addEventListener('input', updateDuty)
    // Functions for temps are already added at updateTemp()
  }
}

const cp = linearApprox({
  x1: tIn.value,  y1: cpIn ? +cpIn.value :0,
  x2: tOut.value, y2: cpOut ? +cpOut.value :0
});
const kw = linearApprox({
  x1: tIn.value,  y1: kwIn ? +kwIn.value :0,
  x2: tOut.value, y2: kwOut ? +kwOut.value :0
});
const miu = viscosityApprox({
  t1: tIn.value,  v1: miuIn ? +miuIn.value :0,
  t2: tOut.value, v2: miuOut ? +miuOut.value :0
});

// -- Updating temp input values to show, from fahrenheit to celsius.
function updateTemp(_ev) {
  if (subDuty && spanDutyField) updateDuty();
  if (spanDutyField) updateFlow();
  if (this.getElementsByTagName("input") && 
    this.getElementsByTagName("input")[0]) {
    let tInput = this.getElementsByTagName("input")[0];
    if (tInput.id.includes("in")) {
      if (cpIn) cpIn.value = round(cp(tInput.value),3);
      if (kwIn) kwIn.value = round(kw(tInput.value),3);
      if (miuIn) miuIn.value = round(miu(tInput.value),2);
    }
    if (tInput.id.includes("out")) {
      if (cpOut) cpOut.value = round(cp(tInput.value),3);
      if (kwOut) kwOut.value = round(kw(tInput.value),3);
      if (miuOut) miuOut.value = round(miu(tInput.value),2);
    }
  }
  const inputField = this.getElementsByTagName('input')[0];
  const spanField = this.getElementsByTagName('span')[0];
  if (inputField == undefined || spanField == undefined) return;
  if (inputField.type == "range") {
    spanField.innerHTML = inputField.value; 
    if (spanField.innerHTML.length == 1) spanField.innerHTML = "0"+spanField.innerHTML; 
    return;
  }
  spanField.innerHTML = round((+inputField.value -32) *(5/9), 1);
}
const subTemps = document.getElementsByClassName("sub-temp")
for (const element of subTemps) {
  const inputField = element.getElementsByTagName('input')[0];
  if (inputField == undefined) continue; // should not happen at all.
  element.updateTemp = updateTemp.bind(element);
  element.updateTemp()
  inputField.addEventListener('input', element.updateTemp)
}

const AmbTempInput = document.getElementById("t_amb");
const FuelTempInput = document.getElementById("t_fuel");
if (AmbTempInput) {
  AmbTempInput.addEventListener('input', () => 
    FuelTempInput.value = AmbTempInput.value
  );
}

window.addEventListener('keydown',function(e){
    if(e.keyIdentifier=='U+000A' || e.keyIdentifier=='Enter' || e.keyCode==13) {
      if(e.target.nodeName=='INPUT'){ // && e.target.type=='text'){
        e.preventDefault();
        return false;
      }
    }
  },true
);