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
// EV electricity for the same miles runs about $400 to $800 a year.
export const EV_SAVE_VS_GAS_LO = Math.round((EXAMPLE_GAS_YEAR - 800) / 100) * 100;
export const EV_SAVE_VS_GAS_HI = Math.round((EXAMPLE_GAS_YEAR - 400) / 100) * 100;
export const EV_PCT_BELOW_GAS_LO = Math.round((1 - 800 / EXAMPLE_GAS_YEAR) * 100);
export const EV_PCT_BELOW_GAS_HI = Math.round((1 - 400 / EXAMPLE_GAS_YEAR) * 100);
// EV ($0.03 to $0.05 a mile) vs a 50 MPG hybrid over 12,000 miles.
export const EV_SAVE_VS_HYBRID_LO = Math.round(((US_GAS_PRICE / 50 - 0.05) * 12000) / 10) * 10;
export const EV_SAVE_VS_HYBRID_HI = Math.round(((US_GAS_PRICE / 50 - 0.03) * 12000) / 10) * 10;
