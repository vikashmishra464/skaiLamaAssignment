import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

export const convertToTimezone = (isoString: string, fromTimezone: string, toTimezone: string): string => {
  // Parse the ISO string as if it's in the fromTimezone
  const date = dayjs(isoString);
  // Convert to target timezone
  return date.tz(toTimezone).format();
};

export const formatEventTime = (isoString: string, timezone: string): string => {
  return dayjs(isoString).tz(timezone).format('MMM DD, YYYY HH:mm');
};

export const formatEventTimeShort = (isoString: string, timezone: string): string => {
  return dayjs(isoString).tz(timezone).format('HH:mm');
};

export const formatEventDate = (isoString: string, timezone: string): string => {
  return dayjs(isoString).tz(timezone).format('MMM DD, YYYY');
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  return dayjs(startDate).isBefore(dayjs(endDate)) || dayjs(startDate).isSame(dayjs(endDate));
};
