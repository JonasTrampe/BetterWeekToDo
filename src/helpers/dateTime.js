import {
  addDays,
  addMonths,
  differenceInDays,
  differenceInMilliseconds,
  format,
  getDate,
  getDaysInMonth,
  getISODay,
  isBefore,
  isValid,
  parse,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
function parseValue(value, inputFormat, utc = false) {
  if (value === undefined) return new Date();
  if (value === null || value === "") return new Date(NaN);
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === "number") return new Date(value);
  if (inputFormat) {
    const tokenFormat = inputFormat === "YYYYMMDD" ? "yyyyMMdd" : inputFormat === "YYYY-MM-DD" ? "yyyy-MM-dd" : inputFormat;
    const parsed = parse(String(value), tokenFormat, new Date());
    return utc && isValid(parsed)
      ? new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), parsed.getHours(), parsed.getMinutes(), parsed.getSeconds(), parsed.getMilliseconds()))
      : parsed;
  }
  if (/^\d{8}$/.test(String(value))) {
    const parsed = parse(String(value), "yyyyMMdd", new Date());
    return utc && isValid(parsed)
      ? new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
      : parsed;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return parseISO(String(value));
  if (/^\d{2}:\d{2}$/.test(String(value))) return parse(String(value), "HH:mm", new Date());
  const parsed = new Date(value);
  if (!utc) return parsed;
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), parsed.getUTCHours(), parsed.getUTCMinutes(), parsed.getUTCSeconds(), parsed.getUTCMilliseconds()));
}

function tokenFormat(pattern) {
  return pattern
    .replaceAll("LT", "p")
    .replaceAll("YYYY", "yyyy")
    .replaceAll("YY", "yy")
    .replaceAll("DD", "dd")
    .replaceAll("dddd", "EEEE")
    .replaceAll("ddd", "EEE")
    .replaceAll("Do", "do")
    .replaceAll("LL", "PP")
    .replaceAll("T", "'T'");
}

class DateTime {
  constructor(value, inputFormat, utc = false, language = "en") {
    this.value = parseValue(value, inputFormat, utc);
    this.language = language;
    this.utc = utc;
  }

  clone(value = this.value) {
    return new DateTime(value, undefined, this.utc, this.language);
  }

  add(amount, unit) {
    if (["d", "day", "days", "weekday", "weekdays"].includes(unit)) return this.clone(addDays(this.value, amount));
    if (unit === "M" || unit === "month" || unit === "months") return this.clone(addMonths(this.value, amount));
    throw new Error(`Unsupported date unit: ${unit}`);
  }

  subtract(amount, unit) {
    if (["d", "day", "days", "weekday", "weekdays"].includes(unit)) return this.clone(subDays(this.value, amount));
    if (unit === "M" || unit === "month" || unit === "months") return this.clone(subMonths(this.value, amount));
    throw new Error(`Unsupported date unit: ${unit}`);
  }

  diff(other, unit) {
    const otherDate = other instanceof DateTime ? other.value : parseValue(other);
    if (unit === "days" || unit === "d") return differenceInDays(this.value, otherDate);
    return differenceInMilliseconds(this.value, otherDate);
  }

  isBefore(other, unit) {
    const otherDate = other instanceof DateTime ? other.value : parseValue(other);
    if (unit === "day" || unit === "date") return isBefore(startOfDay(this.value), startOfDay(otherDate));
    return isBefore(this.value, otherDate);
  }

  startOf(unit) {
    if (unit === "day" || unit === "date") return this.clone(startOfDay(this.value));
    if (unit === "month") return this.clone(startOfMonth(this.value));
    throw new Error(`Unsupported startOf unit: ${unit}`);
  }

  format(pattern) {
    if (pattern === "x") return String(this.value.getTime());
    const language = this.language || "en";
    if (["dddd", "dd", "LL", "MMM Do", "Do"].includes(pattern)) {
      const options = pattern === "dddd"
        ? { weekday: "long" }
        : pattern === "dd"
          ? { weekday: "short" }
          : pattern === "Do"
            ? { day: "numeric" }
            : pattern === "LL"
              ? { year: "numeric", month: "long", day: "numeric" }
              : { month: "short", day: "numeric" };
      return new Intl.DateTimeFormat(language, options).format(this.value);
    }
    const formatOptions = {};
    let output = this.utc
      ? formatInTimeZone(this.value, "UTC", tokenFormat(pattern), formatOptions)
      : format(this.value, tokenFormat(pattern), formatOptions);
    if (pattern.includes("a")) output = output.replaceAll("AM", "am").replaceAll("PM", "pm");
    return output;
  }

  locale(language) {
    return this.clone().withLocale(language);
  }

  withLocale(language) {
    this.language = language;
    return this;
  }

  isoWeekday(day) {
    if (day === undefined) return getISODay(this.value);
    return this.clone(addDays(this.value, day - getISODay(this.value)));
  }

  date(day) {
    if (day !== undefined) {
      const next = new Date(this.value.getTime());
      next.setDate(day);
      return this.clone(next);
    }
    return getDate(this.value);
  }

  day() {
    return this.value.getDay();
  }

  daysInMonth() {
    return getDaysInMonth(this.value);
  }

  toDate() {
    return new Date(this.value.getTime());
  }

  isValid() {
    return isValid(this.value);
  }

  valueOf() {
    return this.value.getTime();
  }
}

export default function dateTime(value, inputFormat, strict = false) {
  const result = new DateTime(value, inputFormat);
  if (strict && inputFormat && result.isValid()) {
    const normalized = inputFormat === "YYYYMMDD" ? result.format("YYYYMMDD") : result.format(inputFormat);
    if (String(value) !== normalized) return new DateTime(NaN);
  }
  return result;
}

dateTime.utc = (value, inputFormat) => new DateTime(value, inputFormat, true);
dateTime.duration = (milliseconds) => ({ asMilliseconds: () => milliseconds });
dateTime.weekdaysShort = () => Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(2024, 0, 1 + index))
);
