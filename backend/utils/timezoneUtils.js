const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert a date from one timezone to UTC for storage
 * @param {string|Date} dateTime - The date/time to convert
 * @param {string} fromTimezone - Source timezone (IANA format)
 * @returns {Date} UTC Date object
 */
const convertToUTC = (dateTime, fromTimezone) => {
    return dayjs.tz(dateTime, fromTimezone).utc().toDate();
};

/**
 * Convert a UTC date to a specific timezone for display
 * @param {Date} utcDate - UTC date from database
 * @param {string} toTimezone - Target timezone (IANA format)
 * @returns {string} Formatted date string in target timezone
 */
const convertFromUTC = (utcDate, toTimezone) => {
    return dayjs.utc(utcDate).tz(toTimezone);
};

/**
 * Format date for display in user's timezone
 * @param {Date} utcDate - UTC date from database
 * @param {string} userTimezone - User's timezone
 * @param {string} format - dayjs format string (optional)
 * @returns {string} Formatted date string
 */
const formatDateForUser = (utcDate, userTimezone, format = 'YYYY-MM-DD HH:mm:ss') => {
    return dayjs.utc(utcDate).tz(userTimezone).format(format);
};

/**
 * Get current timestamp in UTC
 * @returns {Date} Current UTC date
 */
const getCurrentUTC = () => {
    return dayjs.utc().toDate();
};

/**
 * Validate timezone string
 * @param {string} timezone - IANA timezone string
 * @returns {boolean} True if valid
 */
const isValidTimezone = (timezone) => {
    try {
        Intl.DateTimeFormat(undefined, {timeZone: timezone});
        return true;
    } catch (ex) {
        return false;
    }
};

/**
 * Get list of common timezones for frontend dropdown
 * @returns {Array} Array of timezone objects
 */
const getCommonTimezones = () => {
    return [
        { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
        { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
        { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
        { value: 'Europe/London', label: 'London (GMT/BST)' },
        { value: 'Europe/Paris', label: 'Central European Time' },
        { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
        { value: 'Asia/Shanghai', label: 'China Standard Time' },
        { value: 'Asia/Kolkata', label: 'India Standard Time' },
        { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
        { value: 'Pacific/Auckland', label: 'New Zealand Standard Time' }
    ];
};

module.exports = {
    convertToUTC,
    convertFromUTC,
    formatDateForUser,
    getCurrentUTC,
    isValidTimezone,
    getCommonTimezones
};