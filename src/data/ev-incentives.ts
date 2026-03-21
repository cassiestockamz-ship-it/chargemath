export interface StateCredit {
  name: string;
  amount: string;
  type: "tax_credit" | "rebate" | "exemption";
  notes: string;
  active: boolean;
}

export interface StateIncentive {
  state: string;
  code: string;
  credits: StateCredit[];
}

export const STATE_INCENTIVES: StateIncentive[] = [
  {
    state: "California",
    code: "CA",
    credits: [
      {
        name: "Clean Vehicle Rebate Project (CVRP)",
        amount: "Up to $7,500",
        type: "rebate",
        notes:
          "Income-qualified. Standard rebate $2,000 for BEVs, increased rebate up to $7,500 for low-income applicants. Apply at cleanvehiclerebate.org.",
        active: true,
      },
      {
        name: "Clean Fuel Reward",
        amount: "Up to $750",
        type: "rebate",
        notes:
          "Point-of-sale discount applied by dealer at time of purchase or lease of a new EV.",
        active: true,
      },
    ],
  },
  {
    state: "Colorado",
    code: "CO",
    credits: [
      {
        name: "Innovative Motor Vehicle Tax Credit",
        amount: "$5,000",
        type: "tax_credit",
        notes:
          "For new EVs. $2,500 for used EVs. Available as a point-of-sale credit through dealers.",
        active: true,
      },
    ],
  },
  {
    state: "Connecticut",
    code: "CT",
    credits: [
      {
        name: "CHEAPR Rebate",
        amount: "Up to $7,500",
        type: "rebate",
        notes:
          "Standard rebate $2,250 for new BEVs. Low/moderate income households qualify for up to $7,500. Vehicle MSRP must be under $50,000.",
        active: true,
      },
    ],
  },
  {
    state: "Delaware",
    code: "DE",
    credits: [
      {
        name: "Clean Vehicle Rebate",
        amount: "Up to $2,500",
        type: "rebate",
        notes: "For new BEVs. $1,000 for PHEVs. Subject to funding availability.",
        active: true,
      },
    ],
  },
  {
    state: "Illinois",
    code: "IL",
    credits: [
      {
        name: "EV Rebate",
        amount: "$4,000",
        type: "rebate",
        notes:
          "For new EVs purchased or leased by Illinois residents. Income limits apply. Subject to annual funding.",
        active: true,
      },
    ],
  },
  {
    state: "Maine",
    code: "ME",
    credits: [
      {
        name: "Efficiency Maine EV Rebate",
        amount: "Up to $7,500",
        type: "rebate",
        notes:
          "Standard $2,000 for new BEVs. Enhanced rebates up to $7,500 for income-qualified applicants. MSRP cap applies.",
        active: true,
      },
    ],
  },
  {
    state: "Maryland",
    code: "MD",
    credits: [
      {
        name: "Excise Tax Credit",
        amount: "Up to $3,000",
        type: "tax_credit",
        notes:
          "Applied to the vehicle excise tax at time of registration. For new EVs with battery capacity of 5+ kWh.",
        active: true,
      },
    ],
  },
  {
    state: "Massachusetts",
    code: "MA",
    credits: [
      {
        name: "MOR-EV Rebate",
        amount: "Up to $3,500",
        type: "rebate",
        notes:
          "$3,500 for BEVs, $1,500 for PHEVs. Vehicle MSRP must be under $55,000. Additional $1,000 for income-qualified buyers.",
        active: true,
      },
    ],
  },
  {
    state: "New Jersey",
    code: "NJ",
    credits: [
      {
        name: "Charge Up New Jersey",
        amount: "Up to $4,000",
        type: "rebate",
        notes:
          "Point-of-sale incentive for new BEVs. MSRP must be under $55,000. Also exempt from state sales tax.",
        active: true,
      },
      {
        name: "Sales Tax Exemption",
        amount: "Varies",
        type: "exemption",
        notes:
          "Zero-emission vehicles are exempt from NJ sales tax (6.625%), saving $1,500\u2013$3,500 on most EVs.",
        active: true,
      },
    ],
  },
  {
    state: "New York",
    code: "NY",
    credits: [
      {
        name: "Drive Clean Rebate",
        amount: "Up to $2,000",
        type: "rebate",
        notes:
          "Point-of-sale rebate for new BEVs. Amount varies by vehicle range. MSRP must be under $42,000.",
        active: true,
      },
    ],
  },
  {
    state: "Oregon",
    code: "OR",
    credits: [
      {
        name: "Clean Vehicle Rebate",
        amount: "Up to $7,500",
        type: "rebate",
        notes:
          "Standard $2,500 for new BEVs. Up to $7,500 for income-qualified applicants. MSRP cap of $50,000. Also $2,500 for used EVs (income-qualified).",
        active: true,
      },
    ],
  },
  {
    state: "Pennsylvania",
    code: "PA",
    credits: [
      {
        name: "Alternative Fuel Vehicle Rebate",
        amount: "Up to $3,000",
        type: "rebate",
        notes:
          "For new or used BEVs. Income-qualified applicants may receive higher amounts. Subject to annual program funding.",
        active: true,
      },
    ],
  },
  {
    state: "Rhode Island",
    code: "RI",
    credits: [
      {
        name: "DRIVE EV Rebate",
        amount: "Up to $2,500",
        type: "rebate",
        notes:
          "For new BEVs. Income-qualified applicants eligible for additional amounts. Subject to funding availability.",
        active: true,
      },
    ],
  },
  {
    state: "Vermont",
    code: "VT",
    credits: [
      {
        name: "Replace Your Ride / Incentive Program",
        amount: "Up to $5,000",
        type: "rebate",
        notes:
          "Income-qualified incentive for new or used EVs. Standard incentive $3,000 for new BEVs. Up to $5,000 for low-income applicants.",
        active: true,
      },
    ],
  },
  {
    state: "Washington",
    code: "WA",
    credits: [
      {
        name: "Sales Tax Exemption",
        amount: "Varies",
        type: "exemption",
        notes:
          "New EVs with a sale price up to $45,000 are exempt from state sales tax (6.5%), saving up to $2,925.",
        active: true,
      },
    ],
  },
];

export const FEDERAL_CREDITS = {
  newVehicle: {
    name: "Clean Vehicle Credit (30D)",
    maxAmount: 7500,
    active: false,
    expirationNote: "Expired for vehicles acquired after September 30, 2025",
    incomeLimit: { single: 150000, headOfHousehold: 225000, married: 300000 },
    msrpLimit: { car: 55000, suv_truck_van: 80000 },
  },
  usedVehicle: {
    name: "Used Clean Vehicle Credit (25E)",
    maxAmount: 4000,
    active: true,
    notes:
      "30% of purchase price, up to $4,000. Vehicle must be at least 2 model years old.",
    incomeLimit: { single: 75000, headOfHousehold: 112500, married: 150000 },
    priceLimit: 25000,
  },
  chargerInstallation: {
    name: "EV Charger Tax Credit (30C)",
    maxAmount: 1000,
    active: true,
    notes:
      "30% of cost, up to $1,000 for residential. Must be in eligible census tract.",
    expirationNote:
      "Extended through 2032 by IRA, but subject to census tract eligibility",
  },
};
