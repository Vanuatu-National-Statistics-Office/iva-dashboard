export type ShareItem = {
  name: string
  count: number
  share: number
}

export type MonthData = {
  year: number
  month: string
  provisional: boolean
  totalArrivals: number
  airArrivals: number
  seaArrivals: number
  airPercent: number
  seaPercent: number
  averageStay: number
  averageAge: number
  totalDepartures: number
  residentDepartures: number
  visitorDepartures: number
  residentDeparturePercent: number
  visitorDeparturePercent: number
  countries: ShareItem[]
  purposes: ShareItem[]
}

export const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June'] as const
export type MonthName = (typeof monthOrder)[number]

export const iva2026: Record<string, MonthData> = {
  January: {
    year: 2026,
    month: 'January',
    provisional: false,
    totalArrivals: 49664,
    airArrivals: 9657,
    seaArrivals: 40007,
    airPercent: 19.444668170103093,
    seaPercent: 80.5553318298969,
    averageStay: 9.575244492563298,
    averageAge: 36.079320700010356,
    totalDepartures: 14882,
    residentDepartures: 2698,
    visitorDepartures: 12184,
    residentDeparturePercent: 18.12928369842763,
    visitorDeparturePercent: 81.87071630157237,
    countries: [
      { name: 'Australia', count: 6044, share: 62.586724655690176 },
      { name: 'Europe', count: 1164, share: 12.053432743087916 },
      { name: 'Other Pacific Island Countries', count: 582, share: 6.026716371543958 },
      { name: 'Other Countries', count: 461, share: 4.773739256497877 },
      { name: 'New Zealand', count: 416, share: 4.307756031893963 },
      { name: 'China', count: 363, share: 3.7589313451382416 },
      { name: 'New Caledonia', count: 298, share: 3.08584446515481 },
      { name: 'North America', count: 264, share: 2.7337682510096304 },
      { name: 'Japan', count: 65, share: 0.6730868799834316 },
    ],
    purposes: [
      { name: 'Holiday', count: 7470, share: 77.35321528424977 },
      { name: 'Other', count: 1257, share: 13.01646474060267 },
      { name: 'Visiting Friends & Relatives', count: 605, share: 6.2648855752304025 },
      { name: 'Business', count: 297, share: 3.075489282385834 },
      { name: 'Stop-over', count: 28, share: 0.28994511753132446 },
    ],
  },
  February: {
    year: 2026,
    month: 'February',
    provisional: false,
    totalArrivals: 18761,
    airArrivals: 5064,
    seaArrivals: 13697,
    airPercent: 26.992164596769896,
    seaPercent: 73.0078354032301,
    averageStay: 7.989010649831015,
    averageAge: 41.96208530805687,
    totalDepartures: 9018,
    residentDepartures: 3667,
    visitorDepartures: 5351,
    residentDeparturePercent: 40.663118208028386,
    visitorDeparturePercent: 59.33688179197161,
    countries: [
      { name: 'Australia', count: 2418, share: 47.74881516587678 },
      { name: 'Europe', count: 707, share: 13.96129541864139 },
      { name: 'Other Pacific Island Countries', count: 427, share: 8.432069510268562 },
      { name: 'China', count: 406, share: 8.017377567140601 },
      { name: 'New Zealand', count: 310, share: 6.121642969984202 },
      { name: 'Other Countries', count: 310, share: 6.121642969984202 },
      { name: 'North America', count: 242, share: 4.778830963665087 },
      { name: 'New Caledonia', count: 177, share: 3.495260663507109 },
      { name: 'Japan', count: 67, share: 1.3230647709320695 },
    ],
    purposes: [
      { name: 'Holiday', count: 3290, share: 64.96840442338072 },
      { name: 'Other', count: 1006, share: 19.865718799368086 },
      { name: 'Business', count: 404, share: 7.977883096366509 },
      { name: 'Visiting Friends & Relatives', count: 338, share: 6.6745655608214856 },
      { name: 'Stop-over', count: 26, share: 0.5134281200631912 },
    ],
  },
  March: {
    year: 2026,
    month: 'March',
    provisional: false,
    totalArrivals: 35529,
    airArrivals: 7127,
    seaArrivals: 28402,
    airPercent: 20.059669565706887,
    seaPercent: 79.94033043429312,
    averageStay: 11.23249697332691,
    averageAge: 43.13608611825193,
    totalDepartures: 10036,
    residentDepartures: 3468,
    visitorDepartures: 6568,
    residentDeparturePercent: 34.55559984057393,
    visitorDeparturePercent: 65.44440015942607,
    countries: [
      { name: 'Australia', count: 4128, share: 57.92058369580468 },
      { name: 'Europe', count: 751, share: 10.537393012487723 },
      { name: 'Other Pacific Island Countries', count: 539, share: 7.562789392451242 },
      { name: 'China', count: 497, share: 6.973481128104392 },
      { name: 'New Zealand', count: 469, share: 6.580608951873159 },
      { name: 'Other Countries', count: 335, share: 4.700434965623685 },
      { name: 'North America', count: 215, share: 3.0166970674898272 },
      { name: 'Japan', count: 111, share: 1.557457555773818 },
      { name: 'New Caledonia', count: 82, share: 1.150554230391469 },
    ],
    purposes: [
      { name: 'Holiday', count: 5075, share: 71.20808194191103 },
      { name: 'Other', count: 1114, share: 15.630700154342641 },
      { name: 'Business', count: 507, share: 7.113792619615547 },
      { name: 'Visiting Friends & Relatives', count: 409, share: 5.73874000280623 },
      { name: 'Stop-over', count: 22, share: 0.3086852813245405 },
    ],
  },
  April: {
    year: 2026,
    month: 'April',
    provisional: false,
    totalArrivals: 43693,
    airArrivals: 9941,
    seaArrivals: 33752,
    airPercent: 22.75192822648937,
    seaPercent: 77.24807177351063,
    averageStay: 8.014966518609711,
    averageAge: 38.26017329413585,
    totalDepartures: 12894,
    residentDepartures: 2630,
    visitorDepartures: 10264,
    residentDeparturePercent: 20.397083914999225,
    visitorDeparturePercent: 79.60291608500077,
    countries: [
      { name: 'Australia', count: 6336, share: 63.73604265164471 },
      { name: 'Europe', count: 900, share: 9.05341514938135 },
      { name: 'New Zealand', count: 689, share: 6.930892264359723 },
      { name: 'China', count: 526, share: 5.2912181873051 },
      { name: 'Other Pacific Island Countries', count: 410, share: 4.124333568051504 },
      { name: 'New Caledonia', count: 379, share: 3.812493712906146 },
      { name: 'Other Countries', count: 353, share: 3.550950608590685 },
      { name: 'North America', count: 266, share: 2.675787144150488 },
      { name: 'Japan', count: 82, share: 0.8248667136103008 },
    ],
    purposes: [
      { name: 'Holiday', count: 7926, share: 79.73040941555175 },
      { name: 'Other', count: 1008, share: 10.139824967307112 },
      { name: 'Visiting Friends & Relatives', count: 573, share: 5.764007645106126 },
      { name: 'Business', count: 395, share: 3.973443315561815 },
      { name: 'Stop-over', count: 39, share: 0.3923146564731918 },
    ],
  },
  May: {
    year: 2026,
    month: 'May',
    provisional: true,
    totalArrivals: 23895,
    airArrivals: 8958,
    seaArrivals: 14937,
    airPercent: 37.489014438166976,
    seaPercent: 62.510985561833024,
    averageStay: 8.771713747002144,
    averageAge: 42.729292252734986,
    totalDepartures: 11794,
    residentDepartures: 3384,
    visitorDepartures: 8410,
    residentDeparturePercent: 28.69255553671358,
    visitorDeparturePercent: 71.30744446328642,
    countries: [
      { name: 'Australia', count: 5416, share: 60.459924090198705 },
      { name: 'New Zealand', count: 766, share: 8.551015851752624 },
      { name: 'Europe', count: 680, share: 7.590980129493191 },
      { name: 'China', count: 535, share: 5.972315248939496 },
      { name: 'Other Pacific Island Countries', count: 524, share: 5.849519982138871 },
      { name: 'Other Countries', count: 408, share: 4.554588077695914 },
      { name: 'North America', count: 361, share: 4.0299173922750615 },
      { name: 'New Caledonia', count: 170, share: 1.8977450323732978 },
      { name: 'Japan', count: 98, share: 1.0939941951328422 },
    ],
    purposes: [
      { name: 'Holiday', count: 6839, share: 76.34516633177049 },
      { name: 'Other', count: 1127, share: 12.580933244027683 },
      { name: 'Business', count: 497, share: 5.548113418173699 },
      { name: 'Visiting Friends & Relatives', count: 476, share: 5.313686090645233 },
      { name: 'Stop-over', count: 19, share: 0.21210091538289796 },
    ],
  },
  June: {
    year: 2026,
    month: 'June',
    provisional: true,
    totalArrivals: 17933,
    airArrivals: 11183,
    seaArrivals: 6750,
    airPercent: 62.35989516533764,
    seaPercent: 37.64010483466235,
    averageStay: 7.992249327447555,
    averageAge: 39.56111955646964,
    totalDepartures: 12634,
    residentDepartures: 2280,
    visitorDepartures: 10354,
    residentDeparturePercent: 18.046541079626405,
    visitorDeparturePercent: 81.95345892037359,
    countries: [
      { name: 'Australia', count: 7050, share: 63.04211749977645 },
      { name: 'New Zealand', count: 891, share: 7.967450594652598 },
      { name: 'Europe', count: 689, share: 6.161137440758294 },
      { name: 'Other Pacific Island Countries', count: 623, share: 5.570955915228472 },
      { name: 'China', count: 613, share: 5.481534471966378 },
      { name: 'Other Countries', count: 490, share: 4.381650719842618 },
      { name: 'North America', count: 475, share: 4.247518554949477 },
      { name: 'New Caledonia', count: 259, share: 2.316015380488241 },
      { name: 'Japan', count: 93, share: 0.8316194223374765 },
    ],
    purposes: [
      { name: 'Holiday', count: 8868, share: 79.29893588482518 },
      { name: 'Other', count: 1230, share: 10.998837521237592 },
      { name: 'Business', count: 566, share: 5.061253688634534 },
      { name: 'Visiting Friends & Relatives', count: 490, share: 4.381650719842618 },
      { name: 'Stop-over', count: 29, share: 0.2593221854600733 },
    ],
  },
}
