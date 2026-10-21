import { NATIONAL_AVERAGE_RATE, ELECTRICITY_RATES } from "./electricity-rates";
import { EV_VEHICLES } from "./ev-vehicles";

// Worked example = the calculators' default car.
const EX_EV = EV_VEHICLES[0];
const EX_KWH = EX_EV.batteryCapacityKwh;
const EX_RANGE = EX_EV.epaRangeMiles;
import {
  US_GAS_PRICE,
  EXAMPLE_GAS_YEAR,
  EV_SAVE_VS_GAS_LO as SAVE_LO,
  EV_SAVE_VS_GAS_HI as SAVE_HI,
  PUBLIC_DCFC_RATE,
  PUBLIC_DCFC_RATE_PERIOD,
  EV_PER_MILE_LO,
  EV_PER_MILE_HI,
} from "@/data/fuel-prices";

// EV adds 250 to 350 kWh a month at 35 miles a day; same range as the bill-impact FAQ.
const EV_MONTH_LO = Math.round((250 * NATIONAL_AVERAGE_RATE) / 100);
const EV_MONTH_HI = Math.round((350 * NATIONAL_AVERAGE_RATE) / 100);

const RATE_ROWS = Object.values(ELECTRICITY_RATES).sort((a, b) => a.residential - b.residential);
const RATE_LO = RATE_ROWS[0];
const RATE_HI = RATE_ROWS[RATE_ROWS.length - 1];
const HOME_VS_DCFC_PCT = Math.round((1 - NATIONAL_AVERAGE_RATE / 100 / PUBLIC_DCFC_RATE) * 100);

const GAS_MONTH = Math.round(EXAMPLE_GAS_YEAR / 12 / 5) * 5;

export const chargingCostFAQ = [
  {
    question: "How much does it cost to charge an EV at home?",
    answer:
      `At the national average electricity rate of ${NATIONAL_AVERAGE_RATE}\u00A2/kWh, charging a typical EV with a 60 kWh battery from empty to full costs about $${((60 * NATIONAL_AVERAGE_RATE) / 100).toFixed(2)}. Most daily charging sessions cost $2\u20135 depending on how far you drive, since most people only charge 20\u201340% of the battery each night.`,
  },
  {
    question: "Is it cheaper to charge an EV at home or at a public station?",
    answer:
      `Home is cheaper almost everywhere. Residential electricity averages ${NATIONAL_AVERAGE_RATE}\u00A2/kWh nationally (${RATE_LO.residential} to ${RATE_HI.residential}\u00A2 by state), while public DC fast charging averages $${PUBLIC_DCFC_RATE.toFixed(2)}/kWh (Paren, ${PUBLIC_DCFC_RATE_PERIOD}, excluding free sessions). At the national average, charging at home costs about ${HOME_VS_DCFC_PCT}% less than fast charging. Use the public share slider above to see your own mix.`,
  },
  {
    question: "How much does it cost to charge a Tesla Model 3?",
    answer:
      `A ${EX_EV.year} ${EX_EV.make} ${EX_EV.model} has about a ${EX_KWH} kWh battery. At the national average rate of ${NATIONAL_AVERAGE_RATE}\u00A2/kWh, a full charge costs about $${((EX_KWH * NATIONAL_AVERAGE_RATE) / 100).toFixed(2)} and provides roughly ${EX_RANGE} miles of EPA range. That works out to about $${((EX_KWH * NATIONAL_AVERAGE_RATE) / 100 / EX_RANGE).toFixed(3)} per mile, compared to $${(US_GAS_PRICE / 28).toFixed(3)} per mile for a 28 MPG gas car at the US average of $${US_GAS_PRICE.toFixed(2)}/gallon.`,
  },
  {
    question: "Does electricity cost vary by state for EV charging?",
    answer:
      `Yes, by almost 4x. ${RATE_HI.state} has the highest residential rate at ${RATE_HI.residential}\u00A2/kWh and ${RATE_LO.state} the lowest at ${RATE_LO.residential}\u00A2/kWh (EIA). A full ${EX_EV.batteryCapacityKwh} kWh charge of the ${EX_EV.year} ${EX_EV.make} ${EX_EV.model} costs about $${((EX_EV.batteryCapacityKwh * RATE_LO.residential) / 100).toFixed(2)} in ${RATE_LO.state} and $${((EX_EV.batteryCapacityKwh * RATE_HI.residential) / 100).toFixed(2)} in ${RATE_HI.state}. Use your state\u2019s actual rate for an accurate estimate.`,
  },
  {
    question: "How much do EV owners save on fuel per year?",
    answer:
      `The average EV driver covering 12,775 miles per year saves roughly $${SAVE_LO.toLocaleString("en-US")}\u2013$${SAVE_HI.toLocaleString("en-US")} annually compared to a 28 MPG gas car at the US average of $${US_GAS_PRICE.toFixed(2)}/gallon. Savings are higher in states with cheap electricity and for drivers who do more miles. Over 5 years, that adds up to $${(SAVE_LO * 5).toLocaleString("en-US")}\u2013$${(SAVE_HI * 5).toLocaleString("en-US")}.`,
  },
];

export const gasVsElectricFAQ = [
  {
    question: "Are electric cars really cheaper to fuel than gas cars?",
    answer:
      `Yes, in virtually all cases. At the ${NATIONAL_AVERAGE_RATE}\u00A2/kWh national average, an EV using 0.2 to 0.3 kWh a mile costs about ${(EV_PER_MILE_LO * 100).toFixed(1)} to ${(EV_PER_MILE_HI * 100).toFixed(1)} cents per mile for electricity, while the average gas car (23 to 35 MPG) costs $${(US_GAS_PRICE / 35).toFixed(2)}\u2013$${(US_GAS_PRICE / 23).toFixed(2)} per mile at the US average of $${US_GAS_PRICE.toFixed(2)}/gallon. Even in expensive electricity states like California, EVs cost less per mile than gas vehicles.`,
  },
  {
    question: "How much do you save per year driving an EV vs gas?",
    answer:
      `At average electricity prices and the US average gas price of $${US_GAS_PRICE.toFixed(2)}, a driver covering 12,775 miles per year saves roughly $${SAVE_LO.toLocaleString("en-US")}\u2013$${SAVE_HI.toLocaleString("en-US")} annually on fuel alone by driving electric, compared to a 28 MPG gas car. Higher-mileage drivers and those with cheap electricity save even more.`,
  },
  {
    question: "Do EVs produce zero emissions?",
    answer:
      "EVs produce zero tailpipe emissions, but the electricity they use may come from fossil fuel power plants. On average, an EV in the US produces about 60\u201370% less CO2 than a comparable gas car when accounting for power generation. In states with clean grids, the reduction is even greater.",
  },
  {
    question: "Is the total cost of ownership lower for EVs?",
    answer:
      `Generally yes. Fuel is the biggest gap: at the US average gas price ($${US_GAS_PRICE.toFixed(2)}) and average electricity, a typical driver saves about $${SAVE_LO.toLocaleString()} to $${SAVE_HI.toLocaleString()} a year on fuel. EVs also skip oil changes, most brake jobs, and transmission service. Whether that outweighs a higher purchase price depends on the car and your state; the Total Cost of Ownership calculator works it out for yours.`,

  },
  {
    question: "How do EV fuel costs compare when electricity is expensive?",
    answer:
      `Even at ${RATE_HI.state}\u2019s ${RATE_HI.residential}\u00A2/kWh, the highest US residential rate, the ${EX_EV.year} ${EX_EV.make} ${EX_EV.model} (${EX_EV.kwhPer100Miles} kWh/100 mi) costs about $${((RATE_HI.residential / 100) * (EX_EV.kwhPer100Miles / 100)).toFixed(3)} per mile, against $${(US_GAS_PRICE / 28).toFixed(3)} for a 28 MPG gas car at the US average of $${US_GAS_PRICE.toFixed(2)}/gallon. For that car, electricity would have to pass about ${Math.round((US_GAS_PRICE / 28 / (EX_EV.kwhPer100Miles / 100)) * 100)}\u00A2/kWh before gas became cheaper per mile. Public fast charging at $${PUBLIC_DCFC_RATE.toFixed(2)}/kWh is close to that line, which is why charging at home matters most.`,
  },
];

export const chargingTimeFAQ = [
  {
    question: "How long does it take to fully charge an electric car?",
    answer:
      "It depends on the charger type. A Level 1 (120V) home outlet takes 24\u201360+ hours for a full charge. A Level 2 (240V) charger takes 6\u201312 hours. A DC fast charger can go from 10% to 80% in 20\u201345 minutes. Most EV owners charge overnight on Level 2 and rarely need a full charge.",
  },
  {
    question:
      "What is the difference between Level 1, Level 2, and DC fast charging?",
    answer:
      "Level 1 uses a standard 120V outlet and adds about 3\u20135 miles of range per hour. Level 2 uses a 240V outlet (like a dryer plug) and adds 25\u201330 miles per hour. DC fast charging can add 150\u2013200+ miles in 30 minutes but is only available at public stations.",
  },
  {
    question: "Can you charge an EV with a regular household outlet?",
    answer:
      "Yes, every EV comes with a Level 1 charging cable that plugs into a standard 120V outlet. It\u2019s slow, adding only 3\u20135 miles of range per hour, but it works fine for drivers who travel less than 30\u201340 miles per day and can charge overnight.",
  },
  {
    question: "Why does DC fast charging slow down above 80%?",
    answer:
      "Battery chemistry requires slower charging at high states of charge to prevent overheating and degradation. Above 80%, the charging speed typically drops by 50% or more. This is why most fast-charging sessions target 80% rather than 100%: the last 20% can take as long as the first 70%.",
  },
  {
    question: "How many miles of range do you get per hour of charging?",
    answer:
      "Level 1 (120V): 3\u20135 miles per hour. Level 2 (240V): 25\u201330 miles per hour. DC fast charging: 150\u2013300+ miles per hour (varies by vehicle and charger power). A Level 2 charger overnight gives most people more than enough range for daily driving.",
  },
];

export const chargerRoiFAQ = [
  {
    question: "Is installing a Level 2 home charger worth it?",
    answer:
      "For most EV owners, yes. A Level 2 charger charges 5\u201310x faster than a standard outlet and pays for itself within 1\u20133 years through savings on public charging costs. The convenience of waking up to a full battery every morning is a significant quality-of-life benefit as well.",
  },
  {
    question: "How much does it cost to install a home EV charger?",
    answer:
      "The charger is usually the smaller part; current prices for popular models are on our Charger ROI page. Installation depends mostly on whether you need a new 240V circuit, a panel upgrade, or a long conduit run, so it varies more than the charger does. Get a quote from a licensed electrician and enter the total in the Charger ROI calculator to see your payback.",

  },
  {
    question: "How long until a home EV charger pays for itself?",
    answer:
      `Switching from public DC fast charging (US average $${PUBLIC_DCFC_RATE.toFixed(2)}/kWh, Paren ${PUBLIC_DCFC_RATE_PERIOD}) to home charging at the ${NATIONAL_AVERAGE_RATE} cents national average saves about $${Math.round(((35 * 365) / 12) * (EX_EV.kwhPer100Miles / 100) * (PUBLIC_DCFC_RATE - NATIONAL_AVERAGE_RATE / 100))} a month for a ${EX_EV.make} ${EX_EV.model} driven 35 miles a day. Divide your installed cost by your monthly saving for the payback in months; the Charger ROI calculator does it with your state rate. Drivers with higher mileage break even faster.`,

  },
  {
    question:
      "Do I need to upgrade my electrical panel for a Level 2 charger?",
    answer:
      "Not always. A Level 2 charger needs a 240V, 40\u201350 amp circuit. If your panel has spare capacity (at least 40 amps available), you can add a circuit without an upgrade. Older homes with 100-amp panels may need an upgrade to 200 amps, which an electrician quotes separately; the Panel Load Check calculator estimates whether yours needs one.",
  },
  {
    question: "What is the best Level 2 EV home charger?",
    answer:
      "Top-rated options include the ChargePoint Home Flex (adjustable 16\u201350A, WiFi-enabled), the Emporia Smart Charger (energy monitoring integration), and the Grizzl-E Classic (rugged, weather-resistant). All work with every EV and offer reliable performance.",
  },
];

export const rangeFAQ = [
  {
    question: "What affects EV range the most?",
    answer:
      "Temperature and speed have the biggest impact. Cold weather (below 20\u00B0F) can reduce range by 30\u201340% due to battery chemistry and cabin heating. Highway driving at 75+ mph can reduce range by 15\u201325% compared to city driving. Towing has the most dramatic effect, cutting range by roughly 40\u201350%.",
  },
  {
    question: "How much range do electric cars lose in cold weather?",
    answer:
      "At 20\u00B0F many EVs lose a third or more of their EPA-rated range, and more below 0\u00B0F; the Winter Range calculator estimates it for your car and temperature. Using seat heaters instead of cabin heat helps: seat heaters use about 75 watts versus 3,000\u20135,000 watts for full cabin heating. Pre-conditioning the cabin while plugged in also helps.",
  },
  {
    question: "Does driving fast reduce EV range?",
    answer:
      "Yes, significantly. Air resistance increases with the square of speed, so going from 65 to 80 mph can reduce range by 15\u201325%. For maximum range on a road trip, staying at 60\u201365 mph is optimal. City driving at 25\u201345 mph is actually the most efficient thanks to regenerative braking.",
  },
  {
    question: "How does towing affect electric vehicle range?",
    answer:
      "Towing dramatically reduces EV range, typically by 40\u201350% depending on the trailer weight and aerodynamics. A Tesla Model Y rated at 310 miles might only get 150\u2013180 miles while towing. Plan charging stops more frequently and stick to lower speeds when towing with an EV.",
  },
  {
    question: "Why is my EV's real-world range less than the EPA rating?",
    answer:
      "EPA range is tested under controlled conditions at moderate temperatures and speeds. Real-world factors like cold or hot weather, highway speeds, climate control use, elevation changes, tire pressure, and cargo all reduce actual range. Most owners see 10\u201320% less than the EPA number under typical mixed driving.",
  },
];

export const billImpactFAQ = [
  {
    question: "How much will an EV increase my electricity bill?",
    answer:
      `For the average driver doing 35 miles per day, an EV adds about 250\u2013350 kWh per month to your electricity usage. At the national average rate of ${NATIONAL_AVERAGE_RATE}\u00A2/kWh, that\u2019s roughly $${EV_MONTH_LO}\u2013$${EV_MONTH_HI}/month added to your bill. The exact amount depends on your vehicle\u2019s efficiency, your electricity rate, and how much you drive.`,
  },
  {
    question: "Is it cheaper to charge at home or at a public charger?",
    answer:
      `Home charging is almost always cheaper. Residential electricity averages ${NATIONAL_AVERAGE_RATE}\u00A2/kWh nationally (${RATE_LO.residential} to ${RATE_HI.residential}\u00A2 by state), while public DC fast charging averages $${PUBLIC_DCFC_RATE.toFixed(2)}/kWh (Paren, ${PUBLIC_DCFC_RATE_PERIOD}, excluding free sessions). At the national average, charging at home costs about ${HOME_VS_DCFC_PCT}% less than relying on fast chargers.`,
  },
  {
    question: "What is a time-of-use (TOU) rate plan?",
    answer:
      "TOU plans charge different electricity rates based on the time of day. Off-peak hours are usually overnight, and that is when most EV charging happens, so a TOU plan can cut what charging adds to your bill. How much depends on your utility's peak and off-peak rates; the TOU Optimizer calculator works it out from yours. Most smart EV chargers let you schedule charging during off-peak hours automatically.",
  },
  {
    question: "Will my electric panel handle an EV charger?",
    answer:
      "A Level 2 EV charger typically needs a dedicated 240V, 40\u201350 amp circuit. If your home has a 200-amp panel with available capacity, you likely won\u2019t need an upgrade. Older homes with 100-amp panels may need a panel upgrade; our Panel Load Check estimates whether yours does. A qualified electrician can assess your panel in about 30 minutes.",
  },
  {
    question: "How does EV charging compare to gas in total monthly costs?",
    answer:
      `At the ${NATIONAL_AVERAGE_RATE}\u00A2/kWh national average, EV charging adds about $${EV_MONTH_LO}\u2013$${EV_MONTH_HI}/month to your electric bill. Compare that to about $${GAS_MONTH}/month for gas at 12,775 miles per year and the US average of $${US_GAS_PRICE.toFixed(2)}/gallon in a 28 MPG car. Even accounting for the electricity increase, you\u2019re saving $${GAS_MONTH - EV_MONTH_HI}\u2013$${GAS_MONTH - EV_MONTH_LO}/month by driving electric.`,
  },
];

export const taxCreditFAQ = [
  {
    question: "Is the federal EV tax credit still available in 2026?",
    answer:
      "No. The One Big Beautiful Bill Act ended the Clean Vehicle Credit (Section 30D, new EVs) and the Used Clean Vehicle Credit (Section 25E) for vehicles acquired after September 30, 2025. State, local, and utility incentives may still apply, so check your state program.",
  },
  {
    question: "Is there still a federal tax credit for used EVs?",
    answer:
      "No. The Used Clean Vehicle Credit (25E) was 30% of the purchase price, up to $4,000, and ended for vehicles acquired after September 30, 2025. If you acquired a qualifying used EV on or before that date, you can still claim it on that year\'s return with IRS Form 8936.",
  },
  {
    question: "Is the EV charger installation tax credit still available?",
    answer:
      "No. The Alternative Fuel Vehicle Refueling Property Credit (Section 30C) ended for property placed in service after June 30, 2026. It covered 30% of charger equipment and installation costs, up to $1,000 for residential installs in eligible census tracts. Some utilities and states still offer charger rebates.",
  },
  {
    question: "Do state EV incentives stack with federal credits?",
    answer:
      "Yes, state incentives were designed to stack with the old federal credits and now stand on their own. Some state programs have their own income limits, waiting lists, or limited funding pools.",
  },
  {
    question: "What income limits apply to EV tax credits?",
    answer:
      "The federal credits no longer apply to new purchases. For reference, the expired 25E used credit capped AGI at $75,000 single, $112,500 head of household, and $150,000 married filing jointly, and the expired 30D credit at $150,000, $225,000, and $300,000. State incentive income limits vary by program.",
  },
];

export const paybackPeriodFAQ = [
  {
    question: "How long does it take for an EV to pay for itself?",
    answer:
      "The average EV pays for itself in 3 to 7 years compared to a similar gas car, depending on gas prices, electricity rates, daily mileage, and incentives. Drivers in states with cheap electricity and high gas prices break even fastest. Federal and state incentives can shorten the payback period by 1 to 3 years.",
  },
  {
    question: "What factors affect EV payback period the most?",
    answer:
      "The biggest factors are (1) the price difference between the EV and a comparable gas car, (2) how many miles you drive daily, (3) local gas and electricity prices, and (4) available tax credits or rebates. Maintenance savings also contribute, since EVs have no oil changes, fewer brake replacements, and no transmission service.",
  },
  {
    question: "Do EVs really save money on maintenance?",
    answer:
      "Yes. Consumer Reports found that EV owners spend roughly 50% less on maintenance and repairs over the life of the vehicle. EVs have no engine oil, fewer brake pad replacements (thanks to regenerative braking), no transmission fluid, and no exhaust system. Typical savings are $30 to $60 per month compared to a gas car.",
  },
  {
    question: "Should I include tax credits in my payback calculation?",
    answer:
      "Yes, if you qualify. The federal 30D clean vehicle credit ended for vehicles acquired after September 30, 2025, but many states still offer EV rebates or tax credits ranging from $1,000 to $7,500. These incentives directly reduce the effective price premium of the EV, shortening your payback period. Check your state's current programs before purchasing.",
  },
  {
    question: "Is an EV worth it if I only drive 20 miles a day?",
    answer:
      "Low-mileage drivers still save on fuel and maintenance, but the payback period is longer since monthly savings are smaller. At 20 miles per day with average gas and electricity prices, expect a payback period of 5 to 8 years. If you also value lower emissions or a better driving experience, the non-financial benefits may tip the scales.",
  },
];
