// src/lib/country-narratives.ts
//
// Researched "why did GDP move this way" context for major economies, by
// decade. This is hand-written from real sources (see research notes), not
// generated from the GDP numbers themselves -- the numeric change is still
// computed separately from the database so the stats stay accurate even as
// this narrative content is expanded over time.
//
// Only countries with enough reliable public information are included here.
// Countries without an entry simply fall back to the data-only description.

export const COUNTRY_NARRATIVES: Record<string, Record<number, string>> = {
  USA: {
    1990: "A rapid expansion through the Clinton era, fueled by the internet-driven productivity boom and low inflation, followed a brief early-decade recession.",
    2000: "Growth was interrupted twice: first by the 2000-2001 dot-com crash, then by the 2008 financial crisis triggered by the collapse of the housing market and major financial institutions.",
    2010: "A long recovery from the Great Recession was powered by near-zero interest rates, quantitative easing, and the rise of major technology companies.",
    2020: "A sharp COVID-19 contraction in 2020 gave way to a stimulus-fueled rebound, followed by a period of high inflation as the economy reopened.",
  },
  CHN: {
    1990: "Deng Xiaoping's market reforms deepened, shifting the economy from central planning toward a hybrid market system and setting up rapid industrialization.",
    2000: "WTO entry in 2001 triggered an export-led manufacturing boom, with growth peaking near 14% before the 2008 crisis, which China weathered with a large stimulus package.",
    2010: "Growth moderated as the economy shifted from investment-driven expansion toward consumption and services, while state control over private enterprise increased.",
    2020: "COVID-19 lockdowns, a deepening property market crisis, and rising trade tensions with the West slowed growth to its lowest sustained pace in decades.",
  },
  DEU: {
    1990: "Reunification in 1990 brought a short-lived boom, followed by the costly integration of the former East Germany that weighed on growth for years.",
    2000: "Persistently high unemployment earned Germany the label 'the sick man of Europe,' prompting Agenda 2010 labor reforms that began paying off by mid-decade.",
    2010: "Export-driven manufacturing strength and the earlier labor reforms helped Germany recover faster than most of Europe from the financial crisis.",
    2020: "COVID-19 was followed by an energy crisis after Russia's invasion of Ukraine cut off cheap gas supplies, hitting industrial output hard.",
  },
  JPN: {
    1990: "The bursting of a massive asset price bubble in 1990-1992 triggered the 'Lost Decade,' as stock and land prices collapsed and banks were left holding bad loans.",
    2000: "Deflation took hold and growth stayed weak, with recovery efforts repeatedly undercut by premature tax hikes and lingering effects of the banking crisis.",
    2010: "Prime Minister Shinzo Abe's 'Abenomics' combined aggressive monetary easing, fiscal stimulus, and reforms to try to break the deflationary cycle.",
    2020: "COVID-19 disruption gave way to a weaker yen and the pressures of a rapidly aging, shrinking population weighing on long-term growth.",
  },
  GBR: {
    1990: "The pound's forced exit from the European Exchange Rate Mechanism on 'Black Wednesday' in 1992 was followed by nearly 16 years of uninterrupted growth.",
    2000: "That long expansion ended abruptly with the 2008 global financial crisis, which hit London's large financial sector especially hard.",
    2010: "A decade of austerity policies aimed at cutting the deficit was followed by the 2016 Brexit referendum, which introduced years of trade uncertainty.",
    2020: "COVID-19 caused the sharpest GDP drop in centuries, followed by a bumpy recovery complicated by new EU trade terms and a global energy price shock.",
  },
  IND: {
    1990: "A 1991 balance-of-payments crisis forced sweeping liberalization reforms that dismantled decades of licensing restrictions and opened the economy to foreign investment.",
    2000: "Growth accelerated toward 8-9% a year as the IT and outsourcing sectors boomed, turning India into a global hub for software and business services.",
    2010: "Growth stayed strong despite disruptions from the 2016 demonetization of high-value currency notes and the 2017 rollout of a nationwide goods and services tax.",
    2020: "A severe COVID-19 contraction was followed by one of the fastest recoveries among major economies.",
  },
  FRA: {
    1990: "Labor market reforms helped restore corporate profitability, though they did little to boost domestic demand or set up faster growth.",
    2000: "Euro adoption and EU integration supported steady but modest growth until the 2008 crisis and Eurozone debt crisis pushed unemployment sharply higher.",
    2010: "Growth stayed weak for most of the decade until President Macron's 2017 labor market and tax reforms aimed to boost competitiveness.",
    2020: "A historic COVID-19 contraction in 2020 was followed by a strong rebound, before growth settled back into a slow, steady pace.",
  },
  RUS: {
    1990: "The Soviet collapse triggered a severe contraction, hyperinflation, and mass privatization, culminating in the 1998 financial crisis and currency default.",
    2000: "Rising oil prices fueled a powerful boom under President Putin, with the economy growing roughly 7% a year as reserves were rebuilt.",
    2010: "Growth slowed sharply after the 2014 annexation of Crimea triggered Western sanctions and a collapse in oil prices, pushing the economy into stagnation.",
    2020: "The 2022 invasion of Ukraine brought sweeping sanctions, frozen central bank reserves, and a pivot toward a war economy with soaring defense spending.",
  },
};

export function getCountryNarrative(
  code: string,
  decadeStart: number
): string | undefined {
  return COUNTRY_NARRATIVES[code]?.[decadeStart];
}
