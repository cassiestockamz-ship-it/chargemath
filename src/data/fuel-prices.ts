import { NATIONAL_AVERAGE_RATE } from "./electricity-rates";
// US average retail regular gasoline, EIA Gasoline and Diesel Fuel Update
// (https://www.eia.gov/petroleum/gasdiesel/). Refresh weekly-ish; the label
// below is shown next to gas price inputs so visitors know how old it is.
export const US_GAS_PRICE = 4.35;
export const US_GAS_PRICE_WEEK = "2026-10-05";
export const US_GAS_PRICE_LABEL = "US average $4.35 (EIA, week of Oct 5)";
export const US_GAS_PRICE_SOURCE = "https://www.eia.gov/petroleum/gasdiesel/";

// Shared worked-example figures, so every page quotes the same savings.
// Gas side: 12,775 miles a year (35 a day) in a 28 MPG car.
export const EXAMPLE_GAS_YEAR = (12775 / 28) * US_GAS_PRICE;
// EV electricity for the same miles at the national average rate, 0.2 to 0.3 kWh a mile.
const EV_PER_MILE_LO = (0.2 * NATIONAL_AVERAGE_RATE) / 100;
const EV_PER_MILE_HI = (0.3 * NATIONAL_AVERAGE_RATE) / 100;
const EV_YEAR_LO = 12775 * EV_PER_MILE_LO;
const EV_YEAR_HI = 12775 * EV_PER_MILE_HI;
export const EV_SAVE_VS_GAS_LO = Math.round((EXAMPLE_GAS_YEAR - EV_YEAR_HI) / 100) * 100;
export const EV_SAVE_VS_GAS_HI = Math.round((EXAMPLE_GAS_YEAR - EV_YEAR_LO) / 100) * 100;
export const EV_PCT_BELOW_GAS_LO = Math.round((1 - EV_YEAR_HI / EXAMPLE_GAS_YEAR) * 100);
export const EV_PCT_BELOW_GAS_HI = Math.round((1 - EV_YEAR_LO / EXAMPLE_GAS_YEAR) * 100);
// EV per mile (above) vs a 50 MPG hybrid over 12,000 miles.
export const EV_SAVE_VS_HYBRID_LO = Math.round(((US_GAS_PRICE / 50 - EV_PER_MILE_HI) * 12000) / 10) * 10;
export const EV_SAVE_VS_HYBRID_HI = Math.round(((US_GAS_PRICE / 50 - EV_PER_MILE_LO) * 12000) / 10) * 10;
