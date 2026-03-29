/**
 * Maps IANA timezone names to U.S. state codes.
 * Falls back to "CA" (most EV owners) if detection fails.
 */
const TZ_TO_STATE: Record<string, string> = {
  "America/New_York": "NY",
  "America/Chicago": "IL",
  "America/Denver": "CO",
  "America/Los_Angeles": "CA",
  "America/Phoenix": "AZ",
  "America/Anchorage": "AK",
  "Pacific/Honolulu": "HI",
  "America/Detroit": "MI",
  "America/Indiana/Indianapolis": "IN",
  "America/Kentucky/Louisville": "KY",
  "America/Boise": "ID",
  "America/Juneau": "AK",
  "America/Adak": "HI",
  "America/Menominee": "WI",
  "America/Nome": "AK",
  "America/Sitka": "AK",
  "America/Yakutat": "AK",
  "America/North_Dakota/Beulah": "ND",
  "America/North_Dakota/Center": "ND",
  "America/North_Dakota/New_Salem": "ND",
  "America/Indiana/Knox": "IN",
  "America/Indiana/Marengo": "IN",
  "America/Indiana/Petersburg": "IN",
  "America/Indiana/Tell_City": "IN",
  "America/Indiana/Vevay": "IN",
  "America/Indiana/Vincennes": "IN",
  "America/Indiana/Winamac": "IN",
  "America/Kentucky/Monticello": "KY",
};

// Broader timezone → best-guess state (by largest EV population in that zone)
const TZ_BROAD: Record<string, string> = {
  "America/New_York": "NY",
  "America/Chicago": "TX",
  "America/Denver": "CO",
  "America/Los_Angeles": "CA",
  "America/Phoenix": "AZ",
};

export function getDefaultStateCode(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TZ_TO_STATE[tz]) return TZ_TO_STATE[tz];
    // Try broad match by first two segments
    for (const [prefix, state] of Object.entries(TZ_BROAD)) {
      if (tz.startsWith(prefix.split("/").slice(0, 2).join("/"))) {
        return state;
      }
    }
  } catch {
    // Intl not available
  }
  return "CA";
}
