#!/usr/bin/env python3
"""Generate src/data.ts from the latest cumulative IVA Excel workbook.

The VBoS monthly IVA workbook contains cumulative 2026 rows. This script finds
which workbook contains the latest reporting month, extracts all 2026 months,
validates the key tables, and writes the TypeScript data file used by the React
IVA dashboard.

No third-party Python package is required. The script reads the cached values
stored in the .xlsx (OOXML) file directly.
"""

from __future__ import annotations

import argparse
import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Optional, Tuple
from zipfile import ZipFile
import xml.etree.ElementTree as ET

MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
DOC_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]
MONTH_INDEX = {name: i for i, name in enumerate(MONTHS)}
MONTH_ALIASES = {
    "jan": "January", "january": "January",
    "feb": "February", "february": "February", "fev": "February", "fév": "February",
    "mar": "March", "march": "March",
    "apr": "April", "april": "April", "avr": "April",
    "may": "May", "mai": "May",
    "jun": "June", "june": "June", "juin": "June",
    "jul": "July", "july": "July", "juil": "July",
    "aug": "August", "august": "August", "aou": "August", "aoû": "August",
    "sep": "September", "sept": "September", "september": "September",
    "oct": "October", "october": "October",
    "nov": "November", "november": "November",
    "dec": "December", "december": "December", "déc": "December",
}

REQUIRED_SHEETS = {
    "summary": "Table 1 Summary",
    "purpose": "Tab 2.Purpose of visit",
    "country": "Tab 3.Count of usual residence",
    "stay": "Tab 5 visit LOS",
    "age": "Tab 6 visitors age",
}

PURPOSE_COLUMNS = [
    ("Holiday", 4),
    ("Other", 12),
    ("Visiting Friends & Relatives", 6),
    ("Business", 8),
    ("Stop-over", 10),
]
COUNTRY_COLUMNS = [
    ("Australia", 4),
    ("Europe", 12),
    ("Other Pacific Island Countries", 10),
    ("Other Countries", 20),
    ("New Zealand", 6),
    ("China", 18),
    ("New Caledonia", 8),
    ("North America", 14),
    ("Japan", 16),
]


class IVAError(RuntimeError):
    pass


def column_number(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        raise IVAError(f"Invalid cell reference: {cell_ref}")
    result = 0
    for char in match.group(1):
        result = result * 26 + (ord(char) - 64)
    return result


def clean_month(raw: object) -> Optional[str]:
    if raw is None:
        return None
    text = str(raw).strip().lower()
    text = re.sub(r"\[[^\]]*\]", "", text)
    text = text.replace(".", "").strip()
    return MONTH_ALIASES.get(text)


def is_provisional(raw: object) -> bool:
    return "[p]" in str(raw).lower().replace(" ", "")


def number(value: object, *, field: str) -> float:
    if value is None:
        raise IVAError(f"Missing value for {field}")
    text = str(value).strip()
    if text.lower() in {"", "-", "na", "n/a", "#n/a", "#value!", "#div/0!"}:
        raise IVAError(f"Missing/non-numeric value for {field}: {value!r}")
    try:
        result = float(text.replace(",", ""))
    except ValueError as exc:
        raise IVAError(f"Invalid number for {field}: {value!r}") from exc
    if not math.isfinite(result):
        raise IVAError(f"Invalid number for {field}: {value!r}")
    return result


def integer(value: object, *, field: str) -> int:
    result = number(value, field=field)
    rounded = int(round(result))
    if abs(result - rounded) > 1e-6:
        raise IVAError(f"Expected whole number for {field}, got {result}")
    return rounded


@dataclass
class SheetData:
    rows: Dict[int, Dict[int, str]]

    def get(self, row: int, col: int) -> Optional[str]:
        return self.rows.get(row, {}).get(col)


class XlsxCachedReader:
    """Small OOXML reader for cached cell values in an xlsx workbook."""

    def __init__(self, path: Path):
        self.path = path
        self.zip = ZipFile(path)
        self.shared_strings = self._read_shared_strings()
        self.sheet_paths = self._read_sheet_paths()

    def close(self) -> None:
        self.zip.close()

    def __enter__(self) -> "XlsxCachedReader":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def _read_shared_strings(self) -> List[str]:
        if "xl/sharedStrings.xml" not in self.zip.namelist():
            return []
        root = ET.fromstring(self.zip.read("xl/sharedStrings.xml"))
        result: List[str] = []
        for si in root.findall(f"{{{MAIN_NS}}}si"):
            result.append("".join((node.text or "") for node in si.iter(f"{{{MAIN_NS}}}t")))
        return result

    def _read_sheet_paths(self) -> Dict[str, str]:
        workbook = ET.fromstring(self.zip.read("xl/workbook.xml"))
        rels = ET.fromstring(self.zip.read("xl/_rels/workbook.xml.rels"))
        rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
        paths: Dict[str, str] = {}
        sheets = workbook.find(f"{{{MAIN_NS}}}sheets")
        if sheets is None:
            raise IVAError(f"No worksheets found in {self.path.name}")
        for sheet in sheets:
            rid = sheet.attrib[f"{{{DOC_REL_NS}}}id"]
            target = rel_map[rid]
            if target.startswith("/"):
                path = target.lstrip("/")
            elif target.startswith("xl/"):
                path = target
            else:
                path = "xl/" + target
            paths[sheet.attrib["name"]] = path
        return paths

    def read_sheet(self, name: str) -> SheetData:
        if name not in self.sheet_paths:
            raise IVAError(
                f"Workbook {self.path.name!r} is missing required sheet {name!r}. "
                f"Available sheets: {', '.join(self.sheet_paths)}"
            )
        root = ET.fromstring(self.zip.read(self.sheet_paths[name]))
        rows: Dict[int, Dict[int, str]] = {}
        for cell in root.iter(f"{{{MAIN_NS}}}c"):
            ref = cell.attrib.get("r")
            if not ref:
                continue
            row_match = re.search(r"(\d+)$", ref)
            if not row_match:
                continue
            row = int(row_match.group(1))
            col = column_number(ref)
            kind = cell.attrib.get("t")
            value_node = cell.find(f"{{{MAIN_NS}}}v")
            inline = cell.find(f"{{{MAIN_NS}}}is")

            if kind == "s" and value_node is not None:
                try:
                    value = self.shared_strings[int(value_node.text or "0")]
                except (ValueError, IndexError):
                    value = value_node.text or ""
            elif kind == "inlineStr" and inline is not None:
                value = "".join((n.text or "") for n in inline.iter(f"{{{MAIN_NS}}}t"))
            elif kind == "b" and value_node is not None:
                value = "TRUE" if value_node.text == "1" else "FALSE"
            elif value_node is not None:
                value = value_node.text or ""
            else:
                value = ""

            if value != "":
                rows.setdefault(row, {})[col] = value
        return SheetData(rows)


def year_month_rows(sheet: SheetData, *, year: int, year_col: int, month_col: int) -> Dict[str, Tuple[int, str]]:
    current_year: Optional[int] = None
    found: Dict[str, Tuple[int, str]] = {}
    for row in sorted(sheet.rows):
        raw_year = sheet.get(row, year_col)
        if raw_year is not None:
            try:
                current_year = int(float(str(raw_year).strip()))
            except ValueError:
                pass
        raw_month = sheet.get(row, month_col)
        month = clean_month(raw_month)
        if current_year == year and month:
            found[month] = (row, str(raw_month))
    return found


def workbook_months(path: Path, year: int) -> List[str]:
    try:
        with XlsxCachedReader(path) as book:
            summary = book.read_sheet(REQUIRED_SHEETS["summary"])
            rows = year_month_rows(summary, year=year, year_col=2, month_col=3)
            return sorted(rows, key=MONTH_INDEX.get)
    except Exception:
        return []


def select_latest_workbook(source_dir: Path, year: int) -> Tuple[Path, List[str]]:
    candidates: List[Tuple[int, int, Path, List[str]]] = []
    for path in sorted(source_dir.glob("*.xlsx")):
        months = workbook_months(path, year)
        if not months:
            continue
        latest_index = max(MONTH_INDEX[m] for m in months)
        candidates.append((latest_index, len(months), path, months))
    if not candidates:
        raise IVAError(f"No usable .xlsx workbook with {year} IVA data found in {source_dir}")
    candidates.sort(key=lambda item: (item[0], item[1], item[2].name.lower()))
    _, _, path, months = candidates[-1]
    return path, months


def extract_year(path: Path, year: int) -> Dict[str, dict]:
    with XlsxCachedReader(path) as book:
        sheets = {key: book.read_sheet(name) for key, name in REQUIRED_SHEETS.items()}

    summary_rows = year_month_rows(sheets["summary"], year=year, year_col=2, month_col=3)
    purpose_rows = year_month_rows(sheets["purpose"], year=year, year_col=2, month_col=3)
    country_rows = year_month_rows(sheets["country"], year=year, year_col=2, month_col=3)
    stay_rows = year_month_rows(sheets["stay"], year=year, year_col=2, month_col=3)
    age_rows = year_month_rows(sheets["age"], year=year, year_col=2, month_col=4)

    if not summary_rows:
        raise IVAError(f"No {year} rows found in {REQUIRED_SHEETS['summary']}")

    months = sorted(summary_rows, key=MONTH_INDEX.get)
    result: Dict[str, dict] = {}

    for month in months:
        for label, lookup in [
            ("purpose", purpose_rows), ("country", country_rows),
            ("average stay", stay_rows), ("average age", age_rows),
        ]:
            if month not in lookup:
                raise IVAError(f"{month} {year}: row missing from {label} table")

        summary_row, summary_raw_month = summary_rows[month]
        purpose_row, _ = purpose_rows[month]
        country_row, _ = country_rows[month]
        stay_row, _ = stay_rows[month]
        age_row, _ = age_rows[month]

        air = integer(sheets["summary"].get(summary_row, 14), field=f"{month} air visitors")
        yacht = integer(sheets["summary"].get(summary_row, 26), field=f"{month} yacht visitors")
        cruise = integer(sheets["summary"].get(summary_row, 28), field=f"{month} cruise visitors")
        sea = yacht + cruise
        total = air + sea

        resident_departures = integer(sheets["summary"].get(summary_row, 22), field=f"{month} resident departures")
        visitor_departures = integer(sheets["summary"].get(summary_row, 24), field=f"{month} visitor departures")
        total_departures = resident_departures + visitor_departures

        purpose_total = integer(sheets["purpose"].get(purpose_row, 15), field=f"{month} purpose total")
        country_total = integer(sheets["country"].get(country_row, 23), field=f"{month} country total")
        if purpose_total != air:
            raise IVAError(f"{month}: purpose total {purpose_total:,} does not equal air visitors {air:,}")
        if country_total != air:
            raise IVAError(f"{month}: country total {country_total:,} does not equal air visitors {air:,}")

        purposes = []
        for name, col in PURPOSE_COLUMNS:
            count = integer(sheets["purpose"].get(purpose_row, col), field=f"{month} purpose {name}")
            purposes.append({"name": name, "count": count, "share": count / air * 100 if air else 0.0})
        if sum(item["count"] for item in purposes) != air:
            raise IVAError(f"{month}: purpose categories do not add to air visitors")

        countries = []
        for name, col in COUNTRY_COLUMNS:
            count = integer(sheets["country"].get(country_row, col), field=f"{month} country {name}")
            countries.append({"name": name, "count": count, "share": count / air * 100 if air else 0.0})
        if sum(item["count"] for item in countries) != air:
            raise IVAError(f"{month}: country categories do not add to air visitors")

        average_stay = number(sheets["stay"].get(stay_row, 8), field=f"{month} average stay")
        average_age = number(sheets["age"].get(age_row, 9), field=f"{month} average age")

        if not (0 < average_stay < 365):
            raise IVAError(f"{month}: average stay outside expected range: {average_stay}")
        if not (0 < average_age < 120):
            raise IVAError(f"{month}: average age outside expected range: {average_age}")
        if total <= 0 or air <= 0 or total_departures <= 0:
            raise IVAError(f"{month}: one or more headline totals are zero/negative")

        result[month] = {
            "year": year,
            "month": month,
            "provisional": is_provisional(summary_raw_month),
            "totalArrivals": total,
            "airArrivals": air,
            "seaArrivals": sea,
            "airPercent": air / total * 100,
            "seaPercent": sea / total * 100,
            "averageStay": average_stay,
            "averageAge": average_age,
            "totalDepartures": total_departures,
            "residentDepartures": resident_departures,
            "visitorDepartures": visitor_departures,
            "residentDeparturePercent": resident_departures / total_departures * 100,
            "visitorDeparturePercent": visitor_departures / total_departures * 100,
            "countries": countries,
            "purposes": purposes,
            "reportFile": f"iva-{month.lower()}-{year}.pdf",
        }

    return result


def ts_number(value: float | int) -> str:
    if isinstance(value, int):
        return str(value)
    return repr(float(value))


def ts_string(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def write_data_ts(data: Mapping[str, dict], output: Path, source_name: str, year: int) -> None:
    months = sorted(data, key=MONTH_INDEX.get)
    if not months:
        raise IVAError("No months extracted")

    lines: List[str] = [
        "// AUTO-GENERATED FILE — DO NOT EDIT MONTHLY FIGURES BY HAND.",
        f"// Generated from: {source_name}",
        "// Run: python scripts/update_iva.py",
        "",
        "export type ShareItem = {",
        "  name: string",
        "  count: number",
        "  share: number",
        "}",
        "",
        "export type MonthData = {",
        "  year: number",
        "  month: string",
        "  provisional: boolean",
        "  totalArrivals: number",
        "  airArrivals: number",
        "  seaArrivals: number",
        "  airPercent: number",
        "  seaPercent: number",
        "  averageStay: number",
        "  averageAge: number",
        "  totalDepartures: number",
        "  residentDepartures: number",
        "  visitorDepartures: number",
        "  residentDeparturePercent: number",
        "  visitorDeparturePercent: number",
        "  countries: ShareItem[]",
        "  purposes: ShareItem[]",
        "  reportFile: string",
        "}",
        "",
        "export const monthOrder = [" + ", ".join(ts_string(m) for m in months) + "] as const",
        "export type MonthName = (typeof monthOrder)[number]",
        f"export const latestMonth: MonthName = {ts_string(months[-1])}",
        f"export const periodLabel = {ts_string(months[0] + '–' + months[-1] + ' ' + str(year))}",
        "",
        "export const iva2026: Record<MonthName, MonthData> = {",
    ]

    for month in months:
        item = data[month]
        lines.extend([
            f"  {month}: {{",
            f"    year: {item['year']},",
            f"    month: {ts_string(item['month'])},",
            f"    provisional: {'true' if item['provisional'] else 'false'},",
            f"    totalArrivals: {item['totalArrivals']},",
            f"    airArrivals: {item['airArrivals']},",
            f"    seaArrivals: {item['seaArrivals']},",
            f"    airPercent: {ts_number(item['airPercent'])},",
            f"    seaPercent: {ts_number(item['seaPercent'])},",
            f"    averageStay: {ts_number(item['averageStay'])},",
            f"    averageAge: {ts_number(item['averageAge'])},",
            f"    totalDepartures: {item['totalDepartures']},",
            f"    residentDepartures: {item['residentDepartures']},",
            f"    visitorDepartures: {item['visitorDepartures']},",
            f"    residentDeparturePercent: {ts_number(item['residentDeparturePercent'])},",
            f"    visitorDeparturePercent: {ts_number(item['visitorDeparturePercent'])},",
            "    countries: [",
        ])
        for x in item["countries"]:
            lines.append(
                f"      {{ name: {ts_string(x['name'])}, count: {x['count']}, share: {ts_number(x['share'])} }},"
            )
        lines.extend(["    ],", "    purposes: ["])
        for x in item["purposes"]:
            lines.append(
                f"      {{ name: {ts_string(x['name'])}, count: {x['count']}, share: {ts_number(x['share'])} }},"
            )
        lines.extend([
            "    ],",
            f"    reportFile: {ts_string(item['reportFile'])},",
            "  },",
        ])
    lines.append("}")
    lines.append("")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate IVA dashboard data.ts from the latest Excel release")
    parser.add_argument("--source-dir", default="source-data/2026", help="Folder containing IVA xlsx releases")
    parser.add_argument("--output", default="src/data.ts", help="TypeScript output path")
    parser.add_argument("--year", type=int, default=2026)
    args = parser.parse_args()

    source_dir = Path(args.source_dir)
    output = Path(args.output)
    try:
        workbook, detected_months = select_latest_workbook(source_dir, args.year)
        data = extract_year(workbook, args.year)
        write_data_ts(data, output, workbook.name, args.year)
    except IVAError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    months = sorted(data, key=MONTH_INDEX.get)
    latest = months[-1]
    latest_data = data[latest]
    print(f"Selected workbook: {workbook}")
    print(f"Detected months: {', '.join(months)}")
    print(f"Latest month: {latest} {args.year}")
    print(
        f"Latest totals: total={latest_data['totalArrivals']:,}, "
        f"air={latest_data['airArrivals']:,}, sea={latest_data['seaArrivals']:,}, "
        f"departures={latest_data['totalDepartures']:,}"
    )
    print(f"Wrote: {output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
