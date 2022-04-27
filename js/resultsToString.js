const {round, initSystem} = require('./utils');

const stringRadResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados para sección radiante:`
  } else {
    string = `Radiant section results:`
  }
  
  string += `\n
  m_fuel:   ${unit.mass_flow( result_obj.m_fuel )  }   vs 4477.
  m_fluid:  ${unit.barrel_flow( result_obj.m_fluid )  } 
  t_in:     ${unit.tempC( result_obj.t_in )     }      vs 711.8
  t_out:    ${unit.tempC( result_obj.t_out )    }      vs 772.0
  Tw:       ${unit.tempC( result_obj.Tw )       }      vs 858.2

  tg_out:   ${unit.tempC( result_obj.tg_out )    }     vs 1495.

  Q_in:     ${unit.heat_flow( result_obj.Q_in )     } 
    Q_rls:    ${unit.heat_flow( result_obj.Q_rls )   } vs 88.00
    Q_air:    ${unit.heat_flow( result_obj.Q_air )  }  vs .4069
    Q_fuel:   ${unit.heat_flow( result_obj.Q_fuel)  }  vs 0

  Q_out:    ${unit.heat_flow( result_obj.Q_out )    } 
    Q_flue:   ${unit.heat_flow( result_obj.Q_flue )  } vs 36.22
    Q_losses: ${unit.heat_flow( result_obj.Q_losses)}  vs .7712
    Q_shld:   ${unit.heat_flow( result_obj.Q_shld ) }  vs 5.680
    Q_R:      ${unit.heat_flow( result_obj.Q_R )     } 
      Q_conv: ${unit.heat_flow( result_obj.Q_conv ) }  vs 5.629
      Q_rad:  ${unit.heat_flow( result_obj.Q_rad )   } vs ${round(45.783 -4.369 -1.311,2)}
    Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid ) } vs 45.78

  duty_total: ${unit.heat_flow(result_obj.duty_total)}
  duty_rad:   ${result_obj['%']                  }%  vs  ${round(45_78.337/71.530,2)}%
  duty_flux:  ${unit.heat_flux(result_obj.duty_flux)  }

  At:       ${unit.area(result_obj.At)            }    vs 5888
  Ar:       ${unit.area(result_obj.Ar)            }    vs 5820
  Acp:      ${unit.area(result_obj.Acp)           }    vs 3969
  αAcp:     ${unit.area(result_obj.aAcp)          }    vs 3590
  Aw:       ${unit.area(result_obj.Aw)            }    vs 2229
  Aw/αAcp:  ${round(result_obj.Aw_aAcp)    }           vs .621
  Alpha:    ${result_obj.Alpha             }           vs .904
  Acp_sh:   ${unit.area(result_obj.Acp_sh)       }     vs NR
  Ai:        ${unit.area(result_obj.Ai)         }      vs NR

  hi:     ${unit.convect(result_obj.hi)            } vs 146.4
  h_conv:   ${unit.convect(result_obj.h_conv)        } vs NR

  MBL:      ${result_obj.MBL                     } ft vs 20.45
  GPpres:   ${round(result_obj.Pco2*1+result_obj.Ph2o*1)} atm vs 0.250
  PL:       ${result_obj.PL                  } atm-ft vs 5.107
  GEmiss:   ${result_obj.emiss                      } vs 0.580
  F:        ${result_obj.F                          } vs 0.635

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
    
  FINING: No
  `;
  return `\n` + string;
}

const stringShldResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados para sección de escudo:`
  } else {
    string = `Shield section results:`
  }
  
  string += `\n
  m_flue:   ${unit.mass_flow( result_obj.m_flue)} vs 88088
  t_in_sup: ${unit.tempC( result_obj.t_in_sup ) }
  t_in:     ${unit.tempC( result_obj.t_in )     } vs 695.6
  t_out:    ${unit.tempC( result_obj.t_out )    } vs 711.8
  Tw:       ${unit.tempC( result_obj.Tw )       } vs 763.8
  
  Tb_g:     ${unit.tempC( result_obj.Tb_g )     }
  tg_in:      ${unit.tempC( result_obj.tg_in )  } vs 1495.
  tg_out:     ${unit.tempC( result_obj.tg_out ) } vs 1246.

  LMTD:     ${unit.temp(result_obj.LMTD)     }    vs 660.2
  DeltaA:     ${unit.temp(result_obj.DeltaA) }
  DeltaB:     ${unit.temp(result_obj.DeltaB) }
  DeltaA-B:   ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(A/B):   ${round(Math.log(result_obj.DeltaA/result_obj.DeltaB))}

  Q_flue:   ${unit.heat_flow( result_obj.Q_flue )  } 
    M_fuel x Cp x (Tg_in - Tg_out)
  Q_Shield: ${unit.heat_flow( result_obj.Q_R )     } vs 12.542
    Q_rad:   ${unit.heat_flow( result_obj.Q_rad )  } vs  ${4.369+1.312}
    Q_conv:  ${unit.heat_flow( result_obj.Q_conv ) } vs  ${3.745+2.931}
  Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid ) } vs 12.357

  duty_shld: ${result_obj['%']                   }%  vs  ${round(12_35.743/71.530,1)}%
  duty_flux: ${unit.heat_flux(result_obj.duty_flux)}

  At:    ${unit.area(result_obj.At)    }     vs 1708.
  An:     ${unit.area(result_obj.An)   }     vs ${round(88_088.02/0.1138/3600,1)}
  Ai:      ${unit.area(result_obj.Ai)}
  Gn:    ${round(result_obj.Gn/3600)} lb/sec-ft² vs .1138

  Uo:    ${unit.convect(result_obj.Uo)    } vs 5.92
  R_int: ${round(result_obj.R_int, 6)}
  R_tub: ${round(result_obj.R_tube, 6)}
  R_ext: ${round(result_obj.R_ext, 6)}

  hi: ${unit.convect(result_obj.hi)       } vs 215.8
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

  FINING: No
  `;
  return `\n` + string;
}

const stringConvResult = (lang, result_obj, unitSystem) => {
  const unit = initSystem(unitSystem);
  let string
  if (lang == "es") {
    string = `Resultados para sección convectiva:`
  } else {
    string = `Convective section results:`
  }

  string += `\n
  t_fin:    ${unit.tempC( result_obj.t_fin )  }      vs 688.0
  t_in_data:${unit.tempC( result_obj.t_in_given)}
  t_in:     ${unit.tempC( result_obj.t_in )   }
  t_out:    ${unit.tempC( result_obj.t_out )  }      vs 695.6
  Tw:       ${unit.tempC( result_obj.Tw )     }      vs 681.9
  
  Tb_g:     ${unit.tempC( result_obj.Tb_g )}
  tg_in:      ${unit.tempC( result_obj.tg_in )   }   vs 1246.
  tg_stack:   ${unit.tempC( result_obj.tg_out)  }    vs 719.9

  LMTD:     ${unit.temp(result_obj.LMTD)      }      vs 197.5
  DeltaA:     ${unit.temp(result_obj.DeltaA)  }
  DeltaB:     ${unit.temp(result_obj.DeltaB)  }
  DeltaA-B:     ${unit.temp(result_obj.DeltaA - result_obj.DeltaB)}
  Log(|A/B|):   ${round(Math.log(Math.abs(result_obj.DeltaA/result_obj.DeltaB)))}

  Q_flue:   ${unit.heat_flow( result_obj.Q_flue )}
  Q_conv:   ${unit.heat_flow( result_obj.Q_conv )}   vs 13.640
  Q_fluid:  ${unit.heat_flow( result_obj.Q_fluid)}   vs 13.439
  Q_stack:  ${unit.heat_flow( result_obj.Q_stack )}

  duty_conv: ${result_obj['%']                   }%  vs  ${round(13_43.901/71.530,2)}%
  duty_flux: ${unit.heat_flux(result_obj.duty_flux)}

  At:   ${unit.area(result_obj.At)          }        vs 52448
  An:    ${unit.area(result_obj.An)        }         vs ${round(88_088.02/0.1281/3600,1)}
  Ao:     ${unit.area(result_obj.Ao)       }         vs NR
  Afo:    ${unit.area(result_obj.Afo)      }         vs NR
  Apo:    ${unit.area(result_obj.Apo)     }          vs NR
  Ai:     ${unit.area(result_obj.Ai)      }          vs NR
  F_eff:  ${round(result_obj.Ef, 6)      }           vs NR
  Gn:    ${round(result_obj.Gn/3600) } lb/sec-ft²    vs .1281

  Uo:    ${ unit.convect(result_obj.Uo)           }  vs 1.296
  R_int: ${ round(result_obj.R_int, 6)  }
  R_tub: ${ round(result_obj.R_tube,6)  }
  R_ext: ${ round(result_obj.R_ext, 6)  }

  hi:   ${unit.convect(result_obj.hi)              } vs 211.89
  hr:   ${unit.convect(result_obj.hr)            }
  ho:   ${unit.convect(result_obj.ho)            }   vs 1.7126
  hc:   ${unit.convect(result_obj.hc)            }
  he:   ${unit.convect(result_obj.he)            }   vs 1.5013

  gr:   ${round(result_obj.gr,6) }
  j:    ${round(result_obj.j, 6)            }        vs .0055 esteem

  kw_fin:   ${ unit.thermal( result_obj.kw_fin )   } vs 16.08
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
    Material:       ${result_obj.TUBING.Material}
    No Tubes Wide:  ${result_obj.TUBING.Nt}
    No Tubes:       ${result_obj.TUBING.N}
    Wall Thickness: ${unit.lengthC(result_obj.TUBING.Sch)}
    Outside Di:     ${unit.lengthC(result_obj.TUBING.Do)}
    Tran Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Long Pitch:     ${unit.lengthC(result_obj.TUBING.S_tube)}
    Ef. Length:     ${unit.length(result_obj.TUBING.L)}

  FINING: 
    Material:       ${result_obj.FINING.Material}
    Type:           ${result_obj.FINING.Type}
    Height:         ${unit.lengthC(result_obj.FINING.Height)}
    Thickness:      ${unit.lengthC(result_obj.FINING.Thickness)}
    Dens:           ${unit.lengthInv(result_obj.FINING.Dens)},
    Arrange:        ${result_obj.FINING.Arrange}
  `;
  return `\n` + string;
}

module.exports = {
	stringRadResult,
  stringShldResult,
  stringConvResult
};