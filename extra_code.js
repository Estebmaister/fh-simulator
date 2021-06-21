const enthalpy = []
  let i = 0
  for (const fuel in fuels) {
    if (fuel in products) continue
    const compound = compounds.filter(element => element.Formula == fuel)[0]
    //log(`{INFO: H of combustion for ${fuel}: ${combustionH(compound)(tIniCalc)/compound.MW}}` )
    enthalpy[i] = (t) => fuels[fuel]*combustionH(compound)(t)
    i++
  }

// const creatingAdFlame = (enthalpy) => {
//   if (enthalpy === undefined) {
//     log("{WARN: Error calling creatingAdFlame for undefined argument}")
//     return undefined
//   }
//   let adFlame
//   switch (enthalpy.length) {
//     case 1:
//       adFlame = (t) => enthalpy[0](t)
//       break;
//     case 2:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t)
//       break;
//     case 3:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) + 
//       enthalpy[2](t)
//       break;
//     case 4:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) + 
//       enthalpy[2](t) + enthalpy[3](t)
//       break;
//     case 5:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) +
//       enthalpy[2](t) + enthalpy[3](t) + enthalpy[4](t)
//       break;
//     case 6:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) +
//       enthalpy[2](t) + enthalpy[3](t) + enthalpy[4](t) + 
//       enthalpy[5](t)
//       break;
//     case 7:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) +
//       enthalpy[2](t) + enthalpy[3](t) + enthalpy[4](t) + 
//       enthalpy[5](t) + enthalpy[6](t)
//       break;
//     case 8:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) +
//       enthalpy[2](t) + enthalpy[3](t) + enthalpy[4](t) + 
//       enthalpy[5](t) + enthalpy[6](t) + enthalpy[7](t)
//       break;
//     case 9:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) +
//       enthalpy[2](t) + enthalpy[3](t) + enthalpy[4](t) + 
//       enthalpy[5](t) + enthalpy[6](t) + enthalpy[7](t) +
//       enthalpy[8](t)
//       break;
//     case 10:
//       adFlame = (t) => enthalpy[0](t) + enthalpy[1](t) +
//       enthalpy[2](t) + enthalpy[3](t) + enthalpy[4](t) + 
//       enthalpy[5](t) + enthalpy[6](t) + enthalpy[7](t) +
//       enthalpy[8](t) + enthalpy[9](t)
//       break;
//     default:
//     log("{WARN: Problem creating enthalpy array for compounds}")
//       break;
//   }
//   return adFlame
// }