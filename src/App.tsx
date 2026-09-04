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
} from 'lucide-react'
import { countries, overview, purposes } from './data'

const number = new Intl.NumberFormat('en-US')

function KpiCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
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

const modeOptions: Highcharts.Options = {
  chart: { type: 'pie', backgroundColor: 'transparent', height: 310 },
  title: { text: undefined },
  credits: { enabled: false },
  tooltip: { pointFormat: '<b>{point.y}%</b>' },
  plotOptions: {
    pie: {
      innerSize: '67%',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b><br>{point.y}%',
        distance: 18,
      },
    },
  },
  series: [
    {
      type: 'pie',
      name: 'Mode',
      data: [
        { name: 'Air', y: overview.airPercent },
        { name: 'Sea', y: overview.seaPercent },
      ],
    },
  ],
}

const countryOptions: Highcharts.Options = {
  chart: { type: 'bar', backgroundColor: 'transparent', height: 430 },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    categories: countries.map((d) => d.name),
    title: { text: undefined },
    lineWidth: 0,
    tickWidth: 0,
  },
  yAxis: {
    min: 0,
    max: 50,
    title: { text: 'Share of air visitors (%)' },
    gridLineDashStyle: 'Dot',
  },
  legend: { enabled: false },
  tooltip: { pointFormat: '<b>{point.y}%</b>' },
  plotOptions: {
    bar: {
      borderRadius: 5,
      dataLabels: {
        enabled: true,
        format: '{point.y}%',
      },
    },
  },
  series: [
    {
      type: 'bar',
      name: 'Share',
      data: countries.map((d) => d.value),
    },
  ],
}

const purposeOptions: Highcharts.Options = {
  chart: { type: 'pie', backgroundColor: 'transparent', height: 330 },
  title: { text: undefined },
  credits: { enabled: false },
  tooltip: { pointFormat: '<b>{point.y}%</b>' },
  plotOptions: {
    pie: {
      innerSize: '55%',
      dataLabels: {
        enabled: true,
        format: '<b>{point.name}</b><br>{point.y}%',
        distance: 18,
      },
    },
  },
  series: [
    {
      type: 'pie',
      name: 'Purpose',
      data: purposes.map((d) => ({ name: d.name, y: d.value })),
    },
  ],
}

const departureOptions: Highcharts.Options = {
  chart: { type: 'column', backgroundColor: 'transparent', height: 285 },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    categories: ['Residents', 'Visitors'],
    lineWidth: 0,
    tickWidth: 0,
  },
  yAxis: {
    min: 0,
    max: 100,
    title: { text: 'Percent (%)' },
  },
  legend: { enabled: false },
  tooltip: { pointFormat: '<b>{point.y}%</b>' },
  plotOptions: {
    column: {
      borderRadius: 7,
      dataLabels: {
        enabled: true,
        format: '{point.y}%',
      },
    },
  },
  series: [
    {
      type: 'column',
      name: 'Departures',
      data: [
        overview.residentDeparturePercent,
        overview.visitorDeparturePercent,
      ],
    },
  ],
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">Vanuatu Bureau of Statistics</div>
            <h1>International Visitor Arrivals Dashboard</h1>
            <p>
              Interactive statistics on international visitor arrivals,
              visitor characteristics and departures.
            </p>
          </div>

          <div className="period-box">
            <CalendarDays size={21} />
            <div>
              <span>Reporting period</span>
              <strong>{overview.month} {overview.year}</strong>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="toolbar">
          <div>
            <span className="toolbar-label">Year</span>
            <select defaultValue="2026">
              <option>2026</option>
            </select>
          </div>
          <div>
            <span className="toolbar-label">Month</span>
            <select defaultValue="February">
              <option>February</option>
            </select>
          </div>
          <div className="source-note">
            Source: Immigration Department
          </div>
        </section>

        <section className="kpi-grid">
          <KpiCard
            title="Total Visitor Arrivals"
            value={number.format(overview.totalArrivals)}
            subtitle={`${overview.month} ${overview.year}`}
            icon={<Users size={24} />}
          />
          <KpiCard
            title="Air Arrivals"
            value={number.format(overview.airArrivals)}
            subtitle={`${overview.airPercent}% of arrivals`}
            icon={<Plane size={24} />}
          />
          <KpiCard
            title="Sea Arrivals"
            value={number.format(overview.seaArrivals)}
            subtitle={`${overview.seaPercent}% of arrivals`}
            icon={<Ship size={24} />}
          />
          <KpiCard
            title="Average Length of Stay"
            value={`${overview.averageStay} days`}
            subtitle="All visitors"
            icon={<Clock3 size={24} />}
          />
          <KpiCard
            title="Average Age"
            value={`${overview.averageAge} years`}
            subtitle="All visitors"
            icon={<UserRound size={24} />}
          />
          <KpiCard
            title="Total Departures"
            value={number.format(overview.totalDepartures)}
            subtitle="Residents + visitors"
            icon={<LogOut size={24} />}
          />
        </section>

        <section className="panel-grid two">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">ARRIVALS</span>
                <h2>Mode of Arrival</h2>
              </div>
              <Plane size={22} />
            </div>
            <HighchartsReact highcharts={Highcharts} options={modeOptions} />
            <div className="mini-stats">
              <div>
                <span>Air</span>
                <strong>{number.format(overview.airArrivals)}</strong>
              </div>
              <div>
                <span>Sea</span>
                <strong>{number.format(overview.seaArrivals)}</strong>
              </div>
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">VISITOR PROFILE</span>
                <h2>Main Purpose of Visit</h2>
              </div>
              <Users size={22} />
            </div>
            <HighchartsReact highcharts={Highcharts} options={purposeOptions} />
            <p className="rounding-note">
              Percentages are shown as published and may not total exactly 100%
              because of rounding.
            </p>
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
              <div>
                <span className="section-kicker">DEPARTURES</span>
                <h2>Departure Composition</h2>
              </div>
              <LogOut size={22} />
            </div>
            <div className="big-number">
              {number.format(overview.totalDepartures)}
              <span>Total departures</span>
            </div>
            <HighchartsReact highcharts={Highcharts} options={departureOptions} />
          </article>

          <article className="panel highlight-panel">
            <span className="section-kicker">FEBRUARY 2026 SNAPSHOT</span>
            <h2>Visitor Summary</h2>
            <div className="summary-list">
              <div><span>Total arrivals</span><strong>{number.format(overview.totalArrivals)}</strong></div>
              <div><span>Arriving by sea</span><strong>{overview.seaPercent}%</strong></div>
              <div><span>Arriving by air</span><strong>{overview.airPercent}%</strong></div>
              <div><span>Holiday visitors</span><strong>65%</strong></div>
              <div><span>Largest air source market</span><strong>Australia — 48%</strong></div>
              <div><span>Average stay</span><strong>{overview.averageStay} days</strong></div>
              <div><span>Average age</span><strong>{overview.averageAge} years</strong></div>
            </div>
          </article>
        </section>

        <footer>
          <strong>Vanuatu Bureau of Statistics</strong>
          <span>International Visitor Arrivals — Trial Dashboard</span>
        </footer>
      </main>
    </div>
  )
}
