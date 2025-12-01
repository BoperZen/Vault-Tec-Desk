import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const DEFAULT_LOCALE = 'es-CR';
const DEFAULT_TIMEZONE = 'America/Costa_Rica';
const DEFAULT_TIMEZONE_OFFSET = '-06:00';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseUtcDate(dateString) {
  if (!dateString) {
    return null;
  }

  const trimmed = dateString.trim();
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed);
  const normalized = trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T");
  const isoString = hasTimezone ? normalized : `${normalized}${DEFAULT_TIMEZONE_OFFSET}`;
  const parsedDate = new Date(isoString);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatWithLocale(dateString, options) {
  const parsedDate = parseUtcDate(dateString);
  if (!parsedDate) {
    return '—';
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    timeZone: DEFAULT_TIMEZONE,
    ...options,
  }).format(parsedDate);
}

export function formatUtcToLocalTime(dateString) {
  return formatWithLocale(dateString, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatUtcToLocalDate(dateString, { includeYear = false } = {}) {
  return formatWithLocale(dateString, {
    day: '2-digit',
    month: '2-digit',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

export function formatUtcToLocalDateTime(dateString, { includeSeconds = false } = {}) {
  return formatWithLocale(dateString, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  });
}
