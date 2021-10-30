let defaultFuels = {
  CH4: .5647,
  C2H6: .1515,
  C3H8: .0622,
  C4H10: .0176,
  iC4H10: .0075,
  C2H4: .0158,
  C3H6: .0277,
  CO: .0066,
  H2: .1142,
  N2: .0068,
  CO2: .0254,
}

const dataFormulas = ["C","H2","O2","N2","N2a","CO","CO2","CH4","C2H6","C3H8","C4H10","iC4H10","C5H12","iC5H12","nC5H12","C6H14",
"C2H4","C3H6","C4H8","iC4H8","C5H10","C6H6","C7H8","C8H10","C2H2","C10H8","CH3OH","C2H5OH","NH3","S","H2S","H2O","H2Ol","N2+O2","SO2"]

for (const key in defaultFuels) {
  document.getElementById(key).value = parseFloat(defaultFuels[key]) *100;
}

const totalRecalculate = () => {
  let total = 0;
  dataFormulas.forEach(element => {
    inputElement = document.getElementById(element)
    if (inputElement !== null) {
      if (inputElement.value !== "") total += parseFloat(inputElement.value);
    }
  });
  document.getElementById("total").innerHTML = total
}
totalRecalculate()

dataFormulas.forEach(element => {
  inputElement = document.getElementById(element)
  if (inputElement !== null) {
    inputElement.addEventListener('input', totalRecalculate)
  }
});