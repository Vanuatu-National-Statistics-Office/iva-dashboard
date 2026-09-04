import { useMemo, useState, type ReactNode } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import {
  Plane,
  Ship,
  CalendarDays,
  Users,
  Clock3,
  UserRound,
  LogOut,
  MapPin,
  TrendingUp,
} from 'lucide-react'
import { iva2026, monthOrder, type MonthName } from './data'

const number = new Intl.NumberFormat('en-US')
const pct = (value: number) => `${Math.round(value)}%`

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle?: string
  icon: ReactNode
}) {
  return (
    <article className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div>
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value}</div>
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      </div>
    </article>
  )
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState<MonthName>('June')
  const data = iva2026[selectedMonth]
  const monthIndex = monthOrder.indexOf(selectedMonth)
  const previous = monthIndex > 0 ? iva2026[monthOrder[monthIndex - 1]] : null
  const monthChange = previous
    ? ((data.totalArrivals - previous.totalArrivals) / previous.totalArrivals) * 100
    : null

  const modeOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'pie', backgroundColor: 'transparent', height: 310 },
    title: { text: undefined },
    credits: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      pie: {
        innerSize: '67%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br>{point.y:.0f}%',
          distance: 18,
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
    chart: { type: 'bar', backgroundColor: 'transparent', height: 430 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: {
      categories: data.countries.map((d) => d.name),
      title: { text: undefined },
      lineWidth: 0,
      tickWidth: 0,
    },
    yAxis: {
      min: 0,
      max: Math.max(70, Math.ceil(Math.max(...data.countries.map((d) => d.share)) / 10) * 10),
      title: { text: 'Share of air visitors (%)' },
      gridLineDashStyle: 'Dot',
    },
    legend: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      bar: {
        borderRadius: 5,
        dataLabels: { enabled: true, format: '{point.y:.0f}%' },
      },
    },
    series: [{
      type: 'bar',
      name: 'Share',
      data: data.countries.map((d) => d.share),
    }],
  }), [data])

  const purposeOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'pie', backgroundColor: 'transparent', height: 330 },
    title: { text: undefined },
    credits: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      pie: {
        innerSize: '55%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br>{point.y:.0f}%',
          distance: 18,
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
    xAxis: { categories: ['Residents', 'Visitors'], lineWidth: 0, tickWidth: 0 },
    yAxis: { min: 0, max: 100, title: { text: 'Percent (%)' } },
    legend: { enabled: false },
    tooltip: { pointFormat: '<b>{point.y:.1f}%</b>' },
    plotOptions: {
      column: { borderRadius: 7, dataLabels: { enabled: true, format: '{point.y:.0f}%' } },
    },
    series: [{
      type: 'column',
      name: 'Departures',
      data: [data.residentDeparturePercent, data.visitorDeparturePercent],
    }],
  }), [data])

  const trendOptions = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'spline', backgroundColor: 'transparent', height: 360 },
    title: { text: undefined },
    credits: { enabled: false },
    xAxis: { categories: monthOrder.map((m) => m.slice(0, 3)) },
    yAxis: { min: 0, title: { text: 'Visitor arrivals' }, gridLineDashStyle: 'Dot' },
    tooltip: { shared: true, valueDecimals: 0 },
    legend: { enabled: true, align: 'center', verticalAlign: 'bottom' },
    plotOptions: {
      series: { marker: { enabled: true }, dataLabels: { enabled: false } },
    },
    series: [
      { type: 'spline', name: 'Total arrivals', data: monthOrder.map((m) => iva2026[m].totalArrivals) },
      { type: 'spline', name: 'Air arrivals', data: monthOrder.map((m) => iva2026[m].airArrivals) },
      { type: 'spline', name: 'Sea arrivals', data: monthOrder.map((m) => iva2026[m].seaArrivals) },
    ],
  }), [])

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">Vanuatu Bureau of Statistics</div>
            <h1>International Visitor Arrivals Dashboard</h1>
            <p>Interactive statistics on international visitor arrivals, visitor characteristics and departures.</p>
          </div>
          <div className="period-box">
            <CalendarDays size={21} />
            <div>
              <span>Reporting period</span>
              <strong>{data.month} {data.year}</strong>
              {data.provisional && <em>Provisional</em>}
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="toolbar">
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
            Source: Department of Immigration and Department of Customs
            {data.provisional && <span className="status-badge">Provisional figures</span>}
          </div>
        </section>

        <section className="kpi-grid">
          <KpiCard
            title="Total Visitor Arrivals"
            value={number.format(data.totalArrivals)}
            subtitle={monthChange === null ? `${data.month} ${data.year}` : `${monthChange >= 0 ? '+' : ''}${monthChange.toFixed(1)}% from previous month`}
            icon={<Users size={24} />}
          />
          <KpiCard title="Air Arrivals" value={number.format(data.airArrivals)} subtitle={`${pct(data.airPercent)} of arrivals`} icon={<Plane size={24} />} />
          <KpiCard title="Sea Arrivals" value={number.format(data.seaArrivals)} subtitle={`${pct(data.seaPercent)} of arrivals`} icon={<Ship size={24} />} />
          <KpiCard title="Average Length of Stay" value={`${Math.round(data.averageStay)} days`} subtitle="Visitors arriving by air" icon={<Clock3 size={24} />} />
          <KpiCard title="Average Age" value={`${Math.round(data.averageAge)} years`} subtitle="Visitors arriving by air" icon={<UserRound size={24} />} />
          <KpiCard title="Total Departures" value={number.format(data.totalDepartures)} subtitle="Residents + visitors" icon={<LogOut size={24} />} />
        </section>

        <section className="panel trend-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">JANUARY–JUNE 2026</span>
              <h2>Monthly Visitor Arrivals Trend</h2>
              <p className="panel-description">Total, air and sea visitor arrivals</p>
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
              <div><span>Air</span><strong>{number.format(data.airArrivals)}</strong></div>
              <div><span>Sea</span><strong>{number.format(data.seaArrivals)}</strong></div>
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

        <footer>
          <strong>Vanuatu Bureau of Statistics</strong>
          <span>International Visitor Arrivals Dashboard · January–June 2026</span>
        </footer>
      </main>
    </div>
  )
}
