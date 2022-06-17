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
if (resultButton) resultButton.onmousedown = () => {
  formElement.action = "./result.html";
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
  ft3Tolb = 62.371*0.84, // for crude oil @60°F
  BPDtolb_h = barrelsToft3*ft3Tolb/24;

const updateDuty = () => spanDutyField.innerHTML = Math.round(
    +inputFlow.value*BPDtolb_h *
    (+tOut.value-tIn.value) *(+cpOut.value+ +cpIn.value)/2
    /10
  ) /100;
const updateFlow = () => spanFlowField.innerHTML = Math.round(
  +inputFlow.value*BPDtolb_h*1e3 ).toLocaleString();

const tIn = document.getElementById(tInElementID);
const tOut = document.getElementById(tOutElementID);
const cpIn = document.getElementById(cpInElementID);
const cpOut = document.getElementById(cpOutElementID);

const subDuty = document.getElementById(subDutyElementID);
let inputFlow, spanFlowField;
const spanDutyField = document.getElementById('span-duty');
if (subDuty) {
  inputFlow = subDuty.getElementsByTagName('input')[0];
  spanFlowField = subDuty.getElementsByTagName('span')[0];
  if (inputFlow && spanDutyField) {
    inputFlow.addEventListener('input', updateDuty)
    inputFlow.addEventListener('input', updateFlow)
    cpOut.addEventListener('input', updateDuty)
    cpIn.addEventListener('input', updateDuty)
    // Functions for temps are already added at updateTemp()
  }
}

// -- Updating temp input values to show, from fahrenheit to celsius.
function updateTemp(_ev) {
  if (subDuty && spanDutyField) updateDuty();
  if (spanDutyField) updateFlow();
  const inputField = this.getElementsByTagName('input')[0];
  const spanField = this.getElementsByTagName('span')[0];
  if (inputField == undefined || spanField == undefined) return;
  if (inputField.type == "range") {
    spanField.innerHTML = inputField.value; 
    if (spanField.innerHTML.length == 1) spanField.innerHTML = "0"+spanField.innerHTML; 
    return;
  }
  spanField.innerHTML = Math.round((+inputField.value -32) *(5/9) *10) /10;
}
const subTemps = document.getElementsByClassName("sub-temp")
for (const element of subTemps) {
  const inputField = element.getElementsByTagName('input')[0];
  if (inputField == undefined) continue; // should not happen at all.
  element.updateTemp = updateTemp.bind(element);
  element.updateTemp()
  inputField.addEventListener('input', element.updateTemp)
}