import { useMemo, useState, type ReactNode } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  Database,
  Download,
  ExternalLink,
  LogOut,
  MapPin,
  Minus,
  Plane,
  Printer,
  Ship,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { iva2026, monthOrder, type MonthData, type MonthName } from './data'

const number = new Intl.NumberFormat('en-US')
const pct = (value: number) => `${Math.round(value)}%`

const COLORS = {
  teal: '#2f8799',
  tealDark: '#1f6676',
  sky: '#2ea8df',
  navy: '#173d5b',
  aqua: '#5bb9c4',
  gold: '#e7a632',
  green: '#3aa675',
  coral: '#e76f51',
  purple: '#6556c8',
  grid: '#dfe8ec',
  text: '#17303d',
  muted: '#70838d',
}

type Comparison = {
  value: number
  label: string
  suffix?: string
  decimals?: number
}

function ChangeBadge({ comparison }: { comparison: Comparison }) {
  const decimals = comparison.decimals ?? 1
  const tone = comparison.value > 0 ? 'up' : comparison.value < 0 ? 'down' : 'flat'
  const Icon = comparison.value > 0 ? ArrowUpRight : comparison.value < 0 ? ArrowDownRight : Minus
  const sign = comparison.value > 0 ? '+' : ''

  return (
    <div className={`change-badge ${tone}`}>
      <Icon size={14} />
      <span>{sign}{comparison.value.toFixed(decimals)}{comparison.suffix ?? '%'}</span>
      <small>{comparison.label}</small>
    </div>
  )
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  comparison,
}: {
  title: string
  value: string
  subtitle?: string
  icon: ReactNode
  comparison?: Comparison | null
}) {
  return (
    <article className="kpi-card">
      <div className="kpi-topline">
        <div className="kpi-icon">{icon}</div>
        {comparison && <ChangeBadge comparison={comparison} />}
      </div>
      <div>
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value}</div>
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      </div>
    </article>
  )
}

function percentChange(current: number, previous: number | undefined) {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

function csvEscape(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const content = rows.map((row) => row.map(csvEscape).join(',')).join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function selectedMonthRows(data: MonthData): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [
    ['International Visitor Arrivals', `${data.month} ${data.year}`],
    ['Status', data.provisional ? 'Provisional' : 'Published'],
    [],
    ['Indicator', 'Value'],
    ['Total visitor arrivals', data.totalArrivals],
    ['Air arrivals', data.airArrivals],
    ['Air share (%)', data.airPercent.toFixed(1)],
    ['Sea arrivals', data.seaArrivals],
    ['Sea share (%)', data.seaPercent.toFixed(1)],
    ['Average length of stay (days)', data.averageStay.toFixed(1)],
    ['Average age (years)', data.averageAge.toFixed(1)],
    ['Total departures', data.totalDepartures],
    ['Resident departures', data.residentDepartures],
    ['Visitor departures', data.visitorDepartures],
    [],
    ['Country of usual residence', 'Count', 'Share (%)'],
    ...data.countries.map((item) => [item.name, item.count, item.share.toFixed(1)]),
    [],
    ['Purpose of visit', 'Count', 'Share (%)'],
    ...data.purposes.map((item) => [item.name, item.count, item.share.toFixed(1)]),
  ]
  return rows
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState<MonthName>('June')
  const data = iva2026[selectedMonth]
  const monthIndex = monthOrder.indexOf(selectedMonth)
  const previousMonth = monthIndex > 0 ? monthOrder[monthIndex - 1] : null
  const previous = previousMonth ? iva2026[previousMonth] : null
  const comparisonLabel = previousMonth ? `vs ${previousMonth.slice(0, 3)}` : 'first month'

  const totalChange = previous ? percentChange(data.totalArrivals, previous.totalArrivals) : null
  const airChange = previous ? percentChange(data.airArrivals, previous.airArrivals) : null
  const seaChange = previous ? percentChange(data.seaArrivals, previous.seaArrivals) : null
  const departureChange = previous ? percentChange(data.totalDepartures, previous.totalDepartures) : null
  const stayChange = previous ? data.averageStay - previous.averageStay : null
  const ageChange = previous ? data.averageAge - previous.averageAge : null

  const modeOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'pie', backgroundColor: 'transparent', height: 310, spacing: [5, 5, 5, 5] },
    title: { text: undefined },
    credits: { enabled: false },
    colors: [COLORS.sky, COLORS.navy],
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      pie: {
        innerSize: '68%',
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br>{point.y:.0f}%',
          distance: 18,
          style: { fontSize: '12px', textOutline: 'none', color: COLORS.text },
        },
      },
    },
    series: [{
      type: 'pie',
      name: 'Mode',
      data: [
        { name: 'Air', y: data.airPercent },
        { name: 'Sea', y: data.seaPercent },
      ],
    }],
  }), [data])

  const countryOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'bar', backgroundColor: 'transparent', height: 440, spacingLeft: 8, spacingRight: 12 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: {
      categories: data.countries.map((d) => d.name),
      title: { text: undefined },
      lineWidth: 0,
      tickWidth: 0,
      labels: { style: { fontSize: '12px', color: COLORS.text } },
    },
    yAxis: {
      min: 0,
      max: Math.max(70, Math.ceil(Math.max(...data.countries.map((d) => d.share)) / 10) * 10),
      title: { text: 'Share of air visitors (%)', style: { color: COLORS.muted } },
      gridLineColor: COLORS.grid,
      gridLineDashStyle: 'Dot',
      labels: { style: { color: COLORS.muted } },
    },
    legend: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      bar: {
        borderRadius: 6,
        pointPadding: 0.08,
        groupPadding: 0.08,
        dataLabels: {
          enabled: true,
          format: '{point.y:.0f}%',
          style: { fontSize: '12px', textOutline: 'none', color: COLORS.text },
        },
      },
    },
    series: [{
      type: 'bar',
      name: 'Share',
      data: data.countries.map((d, index) => ({
        y: d.share,
        color: index === 0 ? COLORS.tealDark : index < 3 ? COLORS.teal : COLORS.aqua,
      })),
    }],
  }), [data])

  const purposeOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'pie', backgroundColor: 'transparent', height: 330, spacing: [5, 5, 5, 5] },
    title: { text: undefined },
    credits: { enabled: false },
    colors: [COLORS.sky, COLORS.navy, COLORS.gold, COLORS.green, COLORS.coral],
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      pie: {
        innerSize: '58%',
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br>{point.y:.0f}%',
          distance: 18,
          style: { fontSize: '11px', textOutline: 'none', color: COLORS.text },
        },
      },
    },
    series: [{
      type: 'pie',
      name: 'Purpose',
      data: data.purposes.map((d) => ({ name: d.name, y: d.share })),
    }],
  }), [data])

  const departureOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'column', backgroundColor: 'transparent', height: 285 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: {
      categories: ['Residents', 'Visitors'],
      lineWidth: 0,
      tickWidth: 0,
      labels: { style: { fontSize: '12px', color: COLORS.text } },
    },
    yAxis: {
      min: 0,
      max: 100,
      title: { text: 'Percent (%)', style: { color: COLORS.muted } },
      gridLineColor: COLORS.grid,
      labels: { style: { color: COLORS.muted } },
    },
    legend: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      column: {
        borderRadius: 8,
        borderWidth: 0,
        pointWidth: 76,
        dataLabels: {
          enabled: true,
          format: '{point.y:.0f}%',
          style: { fontSize: '12px', textOutline: 'none', color: COLORS.text },
        },
      },
    },
    series: [{
      type: 'column',
      name: 'Departures',
      data: [
        { y: data.residentDeparturePercent, color: COLORS.gold },
        { y: data.visitorDeparturePercent, color: COLORS.teal },
      ],
    }],
  }), [data])

  const trendOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'spline', backgroundColor: 'transparent', height: 365, spacingTop: 16 },
    title: { text: undefined },
    credits: { enabled: false },
    colors: [COLORS.tealDark, COLORS.sky, COLORS.navy],
    xAxis: {
      categories: monthOrder.map((m) => m.slice(0, 3)),
      lineColor: '#b9c7cd',
      tickColor: '#b9c7cd',
      labels: { style: { fontSize: '12px', color: COLORS.muted } },
      plotLines: [{
        value: monthIndex,
        color: COLORS.gold,
        width: 2,
        dashStyle: 'ShortDash',
        zIndex: 4,
        label: {
          text: selectedMonth,
          rotation: 0,
          y: -8,
          style: { color: '#7c5a12', fontSize: '11px', fontWeight: '600' },
        },
      }],
    },
    yAxis: {
      min: 0,
      title: { text: 'Visitor arrivals', style: { color: COLORS.muted } },
      gridLineColor: COLORS.grid,
      gridLineDashStyle: 'Dot',
      labels: { style: { color: COLORS.muted } },
    },
    tooltip: { shared: true, valueDecimals: 0, valueSuffix: ' visitors' },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { color: COLORS.text, fontSize: '12px' },
    },
    plotOptions: {
      series: {
        lineWidth: 3,
        marker: { enabled: true, radius: 4 },
        dataLabels: { enabled: false },
      },
    },
    series: [
      { type: 'spline', name: 'Total arrivals', data: monthOrder.map((m) => iva2026[m].totalArrivals) },
      { type: 'spline', name: 'Air arrivals', data: monthOrder.map((m) => iva2026[m].airArrivals) },
      { type: 'spline', name: 'Sea arrivals', data: monthOrder.map((m) => iva2026[m].seaArrivals) },
    ],
  }), [monthIndex, selectedMonth])

  const downloadAllMonths = () => {
    const rows: Array<Array<string | number>> = [
      ['Year', 'Month', 'Status', 'Total arrivals', 'Air arrivals', 'Air share (%)', 'Sea arrivals', 'Sea share (%)', 'Average stay (days)', 'Average age (years)', 'Total departures', 'Resident departures', 'Visitor departures'],
      ...monthOrder.map((month) => {
        const item = iva2026[month]
        return [
          item.year,
          item.month,
          item.provisional ? 'Provisional' : 'Published',
          item.totalArrivals,
          item.airArrivals,
          item.airPercent.toFixed(1),
          item.seaArrivals,
          item.seaPercent.toFixed(1),
          item.averageStay.toFixed(1),
          item.averageAge.toFixed(1),
          item.totalDepartures,
          item.residentDepartures,
          item.visitorDepartures,
        ]
      }),
    ]
    downloadCsv('vanuatu-iva-jan-jun-2026.csv', rows)
  }

  const downloadSelectedMonth = () => {
    downloadCsv(`vanuatu-iva-${selectedMonth.toLowerCase()}-2026.csv`, selectedMonthRows(data))
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-inner">
         <div className="hero-copy">

  <div className="brand-line">
    <img
      src={`${import.meta.env.BASE_URL}images/VBoS_logo.png`}
      alt="Vanuatu Bureau of Statistics"
      className="vbos-header-logo"
    />

    <div>
      <div className="eyebrow">
        Vanuatu Bureau of Statistics
      </div>

      <div className="brand-subtitle">
        Official Statistics · Tourism
      </div>
    </div>
  </div>

  <h1>International Visitor Arrivals</h1>

  <p className="hero-title-sub">
    Statistics Dashboard
  </p>

  <p className="hero-description">
    Interactive statistics on visitor arrivals, source markets,
    purpose of visit and departures.
  </p>

</div>


<div className="hero-side">

  <img
    src={`${import.meta.env.BASE_URL}images/Coat of arms.png`}
    alt="Vanuatu Coat of Arms"
    className="coat-arms-logo"
  />

  <div className="period-box">
    <CalendarDays size={21} />

    <div>
      <span>Reporting period</span>

      <strong>
        {data.month} {data.year}
      </strong>

      {data.provisional && <em>Provisional</em>}
    </div>
  </div>

  <a
    className="website-link"
    href="https://vbos.gov.vu"
    target="_blank"
    rel="noreferrer"
  >
    vbos.gov.vu <ExternalLink size={14} />
  </a>

</div>
            <div className="period-box">
              <CalendarDays size={21} />
              <div>
                <span>Reporting period</span>
                <strong>{data.month} {data.year}</strong>
                {data.provisional && <em>Provisional</em>}
              </div>
            </div>
            <a className="website-link" href="https://vbos.gov.vu" target="_blank" rel="noreferrer">
              vbos.gov.vu <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="toolbar surface-bar">
          <div>
            <span className="toolbar-label">Year</span>
            <select value="2026" disabled><option>2026</option></select>
          </div>
          <div>
            <span className="toolbar-label">Month</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value as MonthName)}>
              {monthOrder.map((month) => <option key={month}>{month}</option>)}
            </select>
          </div>
          <div className="source-note">
            <span>Source: Department of Immigration and Department of Customs</span>
            {data.provisional && <span className="status-badge">Provisional figures</span>}
          </div>
          <div className="toolbar-actions">
            <button type="button" className="action-button secondary" onClick={downloadSelectedMonth}>
              <Download size={16} /> Selected month
            </button>
            <button type="button" className="action-button" onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>
        </section>

        <section className="kpi-grid">
          <KpiCard
            title="Total Visitor Arrivals"
            value={number.format(data.totalArrivals)}
            subtitle={`${data.month} ${data.year}`}
            comparison={totalChange === null ? null : { value: totalChange, label: comparisonLabel }}
            icon={<Users size={24} />}
          />
          <KpiCard
            title="Air Arrivals"
            value={number.format(data.airArrivals)}
            subtitle={`${pct(data.airPercent)} of arrivals`}
            comparison={airChange === null ? null : { value: airChange, label: comparisonLabel }}
            icon={<Plane size={24} />}
          />
          <KpiCard
            title="Sea Arrivals"
            value={number.format(data.seaArrivals)}
            subtitle={`${pct(data.seaPercent)} of arrivals`}
            comparison={seaChange === null ? null : { value: seaChange, label: comparisonLabel }}
            icon={<Ship size={24} />}
          />
          <KpiCard
            title="Average Length of Stay"
            value={`${Math.round(data.averageStay)} days`}
            subtitle="Visitors arriving by air"
            comparison={stayChange === null ? null : { value: stayChange, label: comparisonLabel, suffix: ' days', decimals: 1 }}
            icon={<Clock3 size={24} />}
          />
          <KpiCard
            title="Average Age"
            value={`${Math.round(data.averageAge)} years`}
            subtitle="Visitors arriving by air"
            comparison={ageChange === null ? null : { value: ageChange, label: comparisonLabel, suffix: ' yrs', decimals: 1 }}
            icon={<UserRound size={24} />}
          />
          <KpiCard
            title="Total Departures"
            value={number.format(data.totalDepartures)}
            subtitle="Residents + visitors"
            comparison={departureChange === null ? null : { value: departureChange, label: comparisonLabel }}
            icon={<LogOut size={24} />}
          />
        </section>

        <section className="panel trend-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">JANUARY–JUNE 2026</span>
              <h2>Monthly Visitor Arrivals Trend</h2>
              <p className="panel-description">Total, air and sea visitor arrivals. The gold marker shows the selected reporting month.</p>
            </div>
            <TrendingUp size={22} />
          </div>
          <HighchartsReact highcharts={Highcharts} options={trendOptions} />
        </section>

        <section className="panel-grid two">
          <article className="panel">
            <div className="panel-heading">
              <div><span className="section-kicker">ARRIVALS</span><h2>Mode of Arrival</h2></div>
              <Plane size={22} />
            </div>
            <HighchartsReact highcharts={Highcharts} options={modeOptions} />
            <div className="mini-stats">
              <div><span>Air</span><strong>{number.format(data.airArrivals)}</strong><small>{data.airPercent.toFixed(1)}%</small></div>
              <div><span>Sea</span><strong>{number.format(data.seaArrivals)}</strong><small>{data.seaPercent.toFixed(1)}%</small></div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div><span className="section-kicker">VISITOR PROFILE</span><h2>Main Purpose of Visit</h2></div>
              <Users size={22} />
            </div>
            <HighchartsReact highcharts={Highcharts} options={purposeOptions} />
            <p className="rounding-note">Shares are calculated from visitors arriving by air. Displayed percentages are rounded.</p>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">SOURCE MARKET</span>
              <h2>Country of Usual Residence</h2>
              <p className="panel-description">Visitors arriving by air</p>
            </div>
            <MapPin size={22} />
          </div>
          <HighchartsReact highcharts={Highcharts} options={countryOptions} />
        </section>

        <section className="panel-grid two">
          <article className="panel">
            <div className="panel-heading">
              <div><span className="section-kicker">DEPARTURES</span><h2>Departure Composition</h2></div>
              <LogOut size={22} />
            </div>
            <div className="big-number">{number.format(data.totalDepartures)}<span>Total departures</span></div>
            <HighchartsReact highcharts={Highcharts} options={departureOptions} />
            <div className="departure-counts">
              <span>Residents <strong>{number.format(data.residentDepartures)}</strong></span>
              <span>Visitors <strong>{number.format(data.visitorDepartures)}</strong></span>
            </div>
          </article>

          <article className="panel highlight-panel">
            <span className="section-kicker">{data.month.toUpperCase()} 2026 SNAPSHOT</span>
            <h2>Visitor Summary</h2>
            <div className="summary-list">
              <div><span>Total arrivals</span><strong>{number.format(data.totalArrivals)}</strong></div>
              <div><span>Arriving by sea</span><strong>{pct(data.seaPercent)}</strong></div>
              <div><span>Arriving by air</span><strong>{pct(data.airPercent)}</strong></div>
              <div><span>Holiday visitors</span><strong>{pct(data.purposes.find((d) => d.name === 'Holiday')?.share ?? 0)}</strong></div>
              <div><span>Largest air source market</span><strong>{data.countries[0].name} — {pct(data.countries[0].share)}</strong></div>
              <div><span>Average stay</span><strong>{Math.round(data.averageStay)} days</strong></div>
              <div><span>Average age</span><strong>{Math.round(data.averageAge)} years</strong></div>
              <div><span>Visitor departures</span><strong>{pct(data.visitorDeparturePercent)}</strong></div>
            </div>
          </article>
        </section>

        <section className="panel data-panel">
          <div className="panel-heading data-heading">
            <div>
              <span className="section-kicker">DATA & DOWNLOADS</span>
              <h2>January–June 2026 Monthly Data</h2>
              <p className="panel-description">Use the table for quick checks or download the dashboard data as CSV.</p>
            </div>
            <div className="data-actions">
              <button type="button" className="action-button" onClick={downloadAllMonths}>
                <Database size={16} /> Download Jan–Jun CSV
              </button>
              <button type="button" className="action-button secondary" onClick={downloadSelectedMonth}>
                <Download size={16} /> {selectedMonth} detail CSV
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total arrivals</th>
                  <th>Air</th>
                  <th>Sea</th>
                  <th>Avg stay</th>
                  <th>Avg age</th>
                  <th>Departures</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthOrder.map((month) => {
                  const item = iva2026[month]
                  const active = month === selectedMonth
                  return (
                    <tr key={month} className={active ? 'selected-row' : undefined} onClick={() => setSelectedMonth(month)}>
                      <td><strong>{month}</strong></td>
                      <td>{number.format(item.totalArrivals)}</td>
                      <td>{number.format(item.airArrivals)} <small>({item.airPercent.toFixed(1)}%)</small></td>
                      <td>{number.format(item.seaArrivals)} <small>({item.seaPercent.toFixed(1)}%)</small></td>
                      <td>{item.averageStay.toFixed(1)} days</td>
                      <td>{item.averageAge.toFixed(1)} yrs</td>
                      <td>{number.format(item.totalDepartures)}</td>
                      <td><span className={`table-status ${item.provisional ? 'provisional' : 'published'}`}>{item.provisional ? 'Provisional' : 'Published'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-grid two detail-grid">
          <article className="panel compact-panel">
            <div className="panel-heading">
              <div><span className="section-kicker">{selectedMonth.toUpperCase()} DETAIL</span><h2>Source Markets</h2></div>
              <MapPin size={22} />
            </div>
            <div className="rank-list">
              {data.countries.map((item, index) => (
                <div key={item.name} className="rank-row">
                  <span className="rank-number">{index + 1}</span>
                  <span className="rank-name">{item.name}</span>
                  <span className="rank-count">{number.format(item.count)}</span>
                  <strong>{item.share.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel compact-panel">
            <div className="panel-heading">
              <div><span className="section-kicker">{selectedMonth.toUpperCase()} DETAIL</span><h2>Purpose of Visit</h2></div>
              <Building2 size={22} />
            </div>
            <div className="rank-list purpose-list">
              {data.purposes.map((item, index) => (
                <div key={item.name} className="rank-row">
                  <span className="rank-number">{index + 1}</span>
                  <span className="rank-name">{item.name}</span>
                  <span className="rank-count">{number.format(item.count)}</span>
                  <strong>{item.share.toFixed(1)}%</strong>
                </div>
              ))}
            </div>
            <div className="method-note">
              <strong>Coverage note</strong>
              <span>Country, purpose, average stay and average age indicators relate to visitors arriving by air.</span>
            </div>
          </article>
        </section>

        <footer>
          <div>
            <strong>Vanuatu Bureau of Statistics</strong>
            <span>International Visitor Arrivals Dashboard · January–June 2026</span>
          </div>
          <a href="https://vbos.gov.vu" target="_blank" rel="noreferrer">vbos.gov.vu <ExternalLink size={13} /></a>
        </footer>
      </main>
    </div>
  )
}
