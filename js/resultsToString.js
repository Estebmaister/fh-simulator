const {round, initSystem} = require('./utils');

const stringRadResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados sección radiante:`
  } else {
    string = `Radiant section results:`
  }
  
  string += `\n
  t_in:     ${unit.tempC( result_obj.t_in )     }      
  t_out:    ${unit.tempC( result_obj.t_out )    }      
  Tw:       ${unit.tempC( result_obj.Tw )       }      

  tg_out:   ${unit.tempC( result_obj.tg_out )    }     

  rfi:      ${unit.fouling_factor( result_obj.rfi )    }

  Q_in:     ${unit.heat_flow( result_obj.Q_in )     } 
    Q_rls:    ${unit.heat_flow( result_obj.Q_rls )   } 
    Q_air:    ${unit.heat_flow( result_obj.Q_air )  }  
    Q_fuel:   ${unit.heat_flow( result_obj.Q_fuel)  }  

  Q_out:    ${unit.heat_flow( result_obj.Q_out )    } 
    Q_flue:   ${unit.heat_flow( result_obj.Q_flue )  } 
    Q_losses: ${unit.heat_flow( result_obj.Q_losses)}  
    Q_shld:   ${unit.heat_flow( result_obj.Q_shld ) }  
    Q_R:      ${unit.heat_flow( result_obj.Q_R )     } 
      Q_conv: ${unit.heat_flow( result_obj.Q_conv ) }  
      Q_rad:  ${unit.heat_flow( result_obj.Q_rad )   } 
    Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid ) } 

  duty_rad:   ${round(100*result_obj['%'],2)       }%  

  At:       ${unit.area(result_obj.At)            }    
  Ar:       ${unit.area(result_obj.Ar)            }    
  Acp:      ${unit.area(result_obj.Acp)           }    
  αAcp:     ${unit.area(result_obj.aAcp)          }    
  Aw:       ${unit.area(result_obj.Aw)            }    
  Aw/αAcp:  ${round(result_obj.Aw_aAcp)    }           
  Alpha:    ${round(result_obj.Alpha)      }           
  Acp_sh:   ${unit.area(result_obj.Acp_sh)       }     
  Ai:        ${unit.area(result_obj.Ai)         }      

  hi:     ${unit.convect(result_obj.hi)            } 
  h_conv:   ${unit.convect(result_obj.h_conv)        } 

  MBL:      ${result_obj.MBL                     } ft 
  GPpres:   ${round(result_obj.Pco2*1+result_obj.Ph2o*1)} atm 
  PL:       ${result_obj.PL                  } atm-ft 
  GEmiss:   ${result_obj.emiss                      } 
  F:        ${result_obj.F                          } 

  kw_tube:  ${unit.thermal( result_obj.kw_tube )}
  kw_fluid: ${unit.thermal( result_obj.kw_fluid )}
  kw_flue:  ${unit.thermal( result_obj.kw_flue )}
  
  miu_fluid:${unit.viscosity( result_obj.miu_fluid )}
  miu_flue: ${unit.viscosity( result_obj.miu_flue )}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp( result_obj.Cp_flue )}
  
  Cp_fuel:  ${unit.cp( result_obj.Cp_fuel )}
  Cp_air:   ${unit.cp( result_obj.Cp_air )}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    Material:       ${result_obj.TUBING.Material}
    No Tubes Wide:  ${result_obj.TUBING.Nt}
    No Tubes:       ${result_obj.TUBING.N}
    Wall Thickness: ${unit.lengthC(result_obj.TUBING.Sch)}
    Outside Di:     ${unit.lengthC(result_obj.TUBING.Do)}
    Pitch:          ${unit.lengthC(result_obj.TUBING.S_tube)}
    Ef. Length:     ${unit.length(result_obj.TUBING.L)}
    
  `;
  return `\n` + string;
}

const stringShldResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados sección de escudo:`
  } else {
    string = `Shield section results:`
  }
  
  string += `\n
  t_in:     ${unit.tempC( result_obj.t_in )     } 
  t_out:    ${unit.tempC( result_obj.t_out )    } 
  Tw:       ${unit.tempC( result_obj.Tw )       } 
  
  tg_in:      ${unit.tempC( result_obj.tg_in )  } 
  tg_out:     ${unit.tempC( result_obj.tg_out ) } 

  rfi:      ${unit.fouling_factor( result_obj.rfi )    }
  rfo:      ${unit.fouling_factor( result_obj.rfo )    }

  LMTD:     ${unit.temp(result_obj.LMTD)     }    
  DeltaA:     ${unit.temp(result_obj.DeltaA) }
  DeltaB:     ${unit.temp(result_obj.DeltaB) }
  DeltaA-B:   ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(A/B):   ${round(Math.log(result_obj.DeltaA/result_obj.DeltaB))}

  Q_flue:   ${unit.heat_flow( result_obj.Q_flue )  } 
    M_fuel xCp x(Tg_in-Tg_out)
  Q_Shield: ${unit.heat_flow( result_obj.Q_R )     } 
    Q_rad:   ${unit.heat_flow( result_obj.Q_rad )  } 
    Q_conv:  ${unit.heat_flow( result_obj.Q_conv ) } 
  Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid ) } 

  duty_shld: ${round(100*result_obj['%'],2)      }% 

  At:    ${unit.area(result_obj.At)    }     
  An:     ${unit.area(result_obj.An)   }     
  Ai:      ${unit.area(result_obj.Ai)}
  Gn:    ${round(result_obj.Gn/3600)} lb/sec-ft² 

  Uo:    ${unit.convect(result_obj.Uo)    } 
  R_int: ${round(result_obj.R_int, 6)}
  R_tub: ${round(result_obj.R_tube, 6)}
  R_ext: ${round(result_obj.R_ext, 6)}

  hi: ${unit.convect(result_obj.hi)       } 
  hr:   ${unit.convect(result_obj.hr)}
  ho:   ${unit.convect(result_obj.ho)}
  hc:   ${unit.convect(result_obj.hc)}

  kw_tube:  ${unit.thermal( result_obj.kw_tube )}
  kw_fluid: ${unit.thermal( result_obj.kw_fluid )}
  kw_flue:  ${unit.thermal( result_obj.kw_flue )}
  
  miu_fluid:${unit.viscosity( result_obj.miu_fluid )}
  miu_flue: ${unit.viscosity( result_obj.miu_flue )}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp( result_obj.Cp_flue )}

  Pr_flue:  ${result_obj.PrandtlFlue}
  Re_flue:  ${result_obj.ReynoldsFlue}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    Material:       ${result_obj.TUBING.Material}
    No Tubes Wide:  ${result_obj.TUBING.Nt}
    No Tubes:       ${result_obj.TUBING.N}
    Wall Thickness: ${unit.lengthC(result_obj.TUBING.Sch)}
    Outside Di:     ${unit.lengthC(result_obj.TUBING.Do)}
    Tran Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Long Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Ef. Length:     ${unit.length(result_obj.TUBING.L)}

  `;
  return `\n` + string;
}

const stringConvResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados sección convectiva:`
  } else {
    string = `Convective section results:`
  }

  string += `\n
  t_in:     ${unit.tempC( result_obj.t_in )   }
  t_out:    ${unit.tempC( result_obj.t_out )  }      
  Tw:       ${unit.tempC( result_obj.Tw )     }      
  
  tg_in:      ${unit.tempC( result_obj.tg_in )  }   
  tg_stack:   ${unit.tempC( result_obj.tg_out)  }    

  rfi:      ${unit.fouling_factor( result_obj.rfi )    }
  rfo:      ${unit.fouling_factor( result_obj.rfo )    }

  LMTD:     ${unit.temp(result_obj.LMTD)      }      
  DeltaA:     ${unit.temp(result_obj.DeltaA)  }
  DeltaB:     ${unit.temp(result_obj.DeltaB)  }
  DeltaA-B:     ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(|A/B|):   ${round(Math.log(Math.abs(result_obj.DeltaA/result_obj.DeltaB)))}

  Q_flue:   ${unit.heat_flow( result_obj.Q_flue )}
  Q_conv:   ${unit.heat_flow( result_obj.Q_conv )}   
  Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid)}   

  Q_stack:  ${unit.heat_flow( result_obj.Q_stack)}

  duty_conv: ${round(100*result_obj['%'],2)      }% 

  At:   ${unit.area(result_obj.At)          }        
  An:    ${unit.area(result_obj.An)        }         
  Ao:     ${unit.area(result_obj.Ao)       }         
  Afo:    ${unit.area(result_obj.Afo)      }         
  Apo:    ${unit.area(result_obj.Apo)     }          
  Ai:     ${unit.area(result_obj.Ai)      }          
  F_eff:  ${round(result_obj.Ef, 6)      }           
  Gn:    ${round(result_obj.Gn/3600) } lb/sec-ft²    

  Uo:    ${ unit.convect(result_obj.Uo)           }  
  R_int: ${ round(result_obj.R_int, 6)  }
  R_tub: ${ round(result_obj.R_tube,6)  }
  R_ext: ${ round(result_obj.R_ext, 6)  }

  hi:   ${unit.convect(result_obj.hi)              } 
  hr:   ${unit.convect(result_obj.hr)            }
  ho:   ${unit.convect(result_obj.ho)            }   
  hc:   ${unit.convect(result_obj.hc)            }
  he:   ${unit.convect(result_obj.he)            }      

  kw_fin:   ${ unit.thermal( result_obj.kw_fin )   } 
  kw_tube:  ${ unit.thermal( result_obj.kw_tube )  }
  kw_fluid: ${ unit.thermal( result_obj.kw_fluid ) }
  kw_flue:  ${ unit.thermal( result_obj.kw_flue )  }
  
  miu_fluid:${unit.viscosity( result_obj.miu_fluid )}
  miu_flue: ${unit.viscosity( result_obj.miu_flue )}

  Cp_fluid: ${unit.cp(result_obj.Cp_fluid)}
  Cp_flue:  ${unit.cp( result_obj.Cp_flue )}

  Pr_flue:  ${result_obj.PrandtlFlue}
  Re_flue:  ${result_obj.ReynoldsFlue}
  Pr_fluid: ${result_obj.Prandtl}
  Re_fluid: ${result_obj.Reynolds}

  TUBING:
    No Tubes:    ${result_obj.TUBING.N}
    Other props: Same as shield

  FINNING: 
    Material:   ${result_obj.FINING.Material}
    Type:       ${result_obj.FINING.Type}
    Height:     ${unit.lengthC(result_obj.FINING.Height)}
    Thickness:  ${unit.lengthC(result_obj.FINING.Thickness)}
    Dens:       ${unit.lengthInv(result_obj.FINING.Dens)},
    Arrange:    ${result_obj.FINING.Arrange}
  `;
  return `\n` + string;
}

const stringCombResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let outputString
  if (lang == 'es') {
    outputString = `
Datos de entrada
  (en caso de no haber sido introducidos, el 
  simulador selecciona los valores predeterminados)

  Sistema de unidades:         ${result_obj.debug_data['unitSystem']}
  Presión atmosférica:         ${result_obj.debug_data['atmPressure']}
  Temperatura de referencia:   ${result_obj.debug_data['ambTemperature']}
  Temperatura del combustible: ${result_obj.debug_data['fuelTemperature']}
  Temperatura del aire:        ${result_obj.debug_data['airTemperature']}

  Humedad Relativa:            ${round(result_obj.debug_data['humidity_%'],0)} %
  Volumen de N2 en aire seco:  ${result_obj.debug_data['dryAirN2_%']} %
  Volumen de O2 en aire seco:  ${result_obj.debug_data['dryAirO2_%']} %

  Presión del aire seco:       ${result_obj.debug_data['dryAirPressure']}
  Presión de vapor de agua:    ${result_obj.debug_data['waterPressure']}

  Fracción molar de H2O: ${result_obj.debug_data['H2OPressure_%']} ÷10²
  Fracción molar de N2: ${result_obj.debug_data['N2Pressure_%']} ÷10²
  Fracción molar de O2: ${result_obj.debug_data['O2Pressure_%']} ÷10²
  Humedad del aire: ${result_obj.debug_data['moisture']} aire seco


  Temperatura de entrada (residuo): ${unit.tempC(result_obj.conv_result.t_in_given,0)}
  Temperatura de salida (residuo):  ${unit.tempC(result_obj.rad_result.t_out,0)}

  Calor específico (Cp) residuo: ${result_obj.debug_data.cpFluidTb}

  Gravedad específica (residuo): ${result_obj.debug_data.spGrav}
  Flujo másico (residuo):     ${unit.mass_flow( result_obj.rad_result.m_fluid,1 ) }

  Calor absorbido ("duty") requerido: ${unit.heat_flow(result_obj.rad_result.duty_total)}
  Calor absorbido ("duty") calculado: ${unit.heat_flow(result_obj.rad_result.duty + result_obj.shld_result.duty + result_obj.conv_result.duty)}

  Eficiencia térmica del horno:   ${round(result_obj.rad_result.eff_thermal(result_obj.conv_result.Q_stack),2)}%


Moles de gases de combustión por mol de combustible

  Moles totales:               ${round(result_obj.flows['total_flow'],3)}
  Moles totales (a base seca): ${round(result_obj.flows['dry_total_flow'],3)}

  Componentes 
    N2:   ${result_obj.products['N2'] } 
    O2:   ${result_obj.products['O2'] }
    H2O:  ${result_obj.products['H2O']}
    CO2:  ${result_obj.products['CO2']}
    SO2:  ${result_obj.products['SO2']}

  Porcentajes molares en base húmeda
    N2:  ${round(result_obj.flows['N2_%']) } %
    O2:  ${round(result_obj.flows['O2_%'])} %
    H2O: ${round(result_obj.flows['H2O_%'])} %
    CO2: ${round(result_obj.flows['CO2_%'])} %
    SO2: ${result_obj.flows['SO2_%'] || '0.000'} %

  Exceso de aire: ${round(result_obj.flows['air_excess_%'],2)} %
  Moles O2 estequiométrico/mol combustible: ${round(result_obj.flows['O2_mol_req_theor'],3)}

  Relaciones Aire/Combustible (A/C):

  A/C molar húmeda:  ${round(result_obj.flows['AC'],3)}
  A/C másica húmeda: ${round(result_obj.flows['AC_mass'],3)}
  A/C molar estequiométrica (aire seco):    ${round(result_obj.flows['AC_theor_dryAir'],3)}
  A/C másica estequiométrica (aire húmedo): ${round(result_obj.flows['AC_mass_theor_moistAir'],3)}

  Poder Calorífico Neto (NCV): ${result_obj.flows['NCV']}
  
  Flujo másico (combustible): ${unit.mass_flow( result_obj.rad_result.m_fuel,1 )  }   
  Flujo másico (gases):       ${unit.mass_flow( result_obj.rad_result.m_flue,1)} 
  Flujo másico (aire):        ${unit.mass_flow( result_obj.rad_result.m_air,1)} 

  Peso molecular (combustible): ${result_obj.flows['fuel_MW']}
  Peso molecular (gases):       ${result_obj.flows['flue_MW']}
  
  Calor específico (Cp) combustible: ${result_obj.flows['Cp_fuel']}
  Calor específico (Cp) gases:       ${result_obj.flows['Cp_flue']}
`;
  } else {
    outputString = `
Input Data 
  (Default values will be taken in case 
    of no entries)

  Unit System:           ${result_obj.debug_data['unitSystem']}
  Atmospheric Pressure:  ${result_obj.debug_data['atmPressure']}
  Reference Temperature: ${result_obj.debug_data['ambTemperature']}
  Air Temperature:       ${result_obj.debug_data['airTemperature']}
  Fuel Temperature:      ${result_obj.debug_data['fuelTemperature']}

  Relative Humidity:     ${round(result_obj.debug_data['humidity_%'],0)} %
  N2 volume in dry air:  ${result_obj.debug_data['dryAirN2_%']} %
  O2 volume in dry air:  ${result_obj.debug_data['dryAirO2_%']} %

  Dry Air Pressure:     ${result_obj.debug_data['dryAirPressure']}
  Water Vapor Pressure:  ${result_obj.debug_data['waterPressure']}

  Molar Fraction H2O:  ${result_obj.debug_data['H2OPressure_%']} ÷10²
  Molar Fraction N2:  ${result_obj.debug_data['N2Pressure_%']} ÷10²
  Molar Fraction O2:  ${result_obj.debug_data['O2Pressure_%']} ÷10²
  Air Moisture: ${result_obj.debug_data['moisture']} dry Air


  Process fluid Inlet Temperature:  ${unit.tempC(result_obj.conv_result.t_in_given,0)}
  Process fluid Outlet Temperature: ${unit.tempC(result_obj.rad_result.t_out,0)}

  Process fluid Sp. Heat, Cp: ${result_obj.debug_data.cpFluidTb}

  Process fluid Sp Grav:   ${result_obj.debug_data.spGrav}
  Process fluid Mass Flow: ${unit.mass_flow( result_obj.rad_result.m_fluid,1 ) }

  Required Duty:   ${unit.heat_flow(result_obj.rad_result.duty_total)}
  Calculated Duty: ${unit.heat_flow(result_obj.rad_result.duty + result_obj.shld_result.duty + result_obj.conv_result.duty)}

  Heater Thermal Efficiency: ${round(result_obj.rad_result.eff_thermal(result_obj.conv_result.Q_stack),2)}%


Flue gas moles and components (per mol of fuel)

  Total moles:     ${round(result_obj.flows['total_flow'],3)}
  Total moles dry: ${round(result_obj.flows['dry_total_flow'],3)}

  Components                      
    N2:  ${result_obj.products['N2'] }
    O2:  ${result_obj.products['O2'] } 
    H2O: ${result_obj.products['H2O']} 
    CO2: ${result_obj.products['CO2']} 
    SO2: ${result_obj.products['SO2']} 

  Components (Wet basis)
    N2:  ${round(result_obj.flows['N2_%'],3)} %
    O2:  ${round(result_obj.flows['O2_%'],3)} %
    H2O: ${round(result_obj.flows['H2O_%'],3)} %
    CO2: ${round(result_obj.flows['CO2_%'],3)} %
    SO2: ${result_obj.flows['SO2_%'] ||'0.000'} %

  Air excess: ${round(result_obj.flows['air_excess_%'],3)} %
  Moles O2 stoichiometric/mol of fuel: ${round(result_obj.flows['O2_mol_req_theor'],3)}

  A/F Ratios
  A/C molar (wet basis):   ${round(result_obj.flows['AC'],3)}
  A/C mass (wet basis):    ${round(result_obj.flows['AC_mass'],3)}
  A/C molar stoichiometric (dry basis): ${round(result_obj.flows['AC_theor_dryAir'],3)}
  A/C mass stoichiometric (dry basis):  ${round(result_obj.flows['AC_mass_theor_moistAir'],3)}

  Fuel Mass Flow:           ${unit.mass_flow( result_obj.rad_result.m_fuel,1 )}   
  Flue Gas Mass Flow:       ${unit.mass_flow( result_obj.shld_result.m_flue,1)}
  Combustion Air Mass Flow: ${unit.mass_flow( result_obj.rad_result.m_air,1)} 

  Fuel MW:             ${result_obj.flows['fuel_MW']}
  Fuel Sp. Heat, Cp:   ${result_obj.flows['Cp_fuel']}
  Fuel Net Calorific Value, NCV: ${result_obj.flows['NCV']} 

  Flue MW:             ${result_obj.flows['flue_MW']}
  Flue Sp. Heat, Cp:   ${result_obj.flows['Cp_flue']}
`;
  }
  return outputString;
}

module.exports = {
	stringRadResult,
  stringShldResult,
  stringConvResult,
  stringCombResult
};