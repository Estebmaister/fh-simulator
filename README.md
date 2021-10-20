# Fire-Heater Simulator

Run this simulator with the following command:

```sh
node . true false 21 70 5 20 1e5 SI
```

Arguments:
1. [boolean] Verbose logs at the console
1. [boolean] Process the compounds data sheet
1. [number] Ambient temperature (°C)
1. [number] Relative humidity (0-100%)
1. [number] O2 excess (0-30%) // if greater than possible or equal to 0, Air excess is used.
1. [number] Air excess (0-1000%) // overshadowed by O2 excess
1. [number] Ambient pressure (Pa)
1. [string] Unit System (SI)

### Example return

```json
{"INFO": "Radiant section (K) Tg: 920.6321107253049"}
{"DEBUG": {
  "flows": {
    "TOTAL": 16.848,
    "DRY_TOTAL": 14.401,
    "AC": 15.86,
    "AC_MASS": 20.925,
    "N2_%": 72.751,
    "H2O_%": 14.525,
    "CO2_%": 7.724,
    "O2_%": 5,
    "AirExcess_%": 35.603,
    "Fuel_MW": "21.149 kg/kmol",
    "Flue_MW": "27.996 kg/kmol",
    "NCV": "966864.924 kj/kmol"
  },
  "products": {
    "O2": 0.842,
    "H2O": 2.447,
    "CO2": 1.301,
    "SO2": 0,
    "N2": 12.257
  }
}}
```