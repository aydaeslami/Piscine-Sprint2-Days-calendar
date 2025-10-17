// calendar-utils.mjs

/**
 * Returns the number of days in a given month and year.
 * @param {number} year - Full year (e.g. 2025)
 * @param {number} month - Month index (0 = January, 11 = December)
 * @returns {number}
 */

// --- SHARED LOGIC CODE ---
// creates a date for day 0 of the next month, which is the last day of the given month. geetdate() extracts the day number
export function getDaysInMonth(year, month) { // 
    return new Date(year, month + 1, 0).getDate();
  }
  
  // Calculates which weekday the month starts on
  // Adjusts it so that Monday = 0 and Sunday = 6 (European-style week)
  export function getStartDay(year, month) {
    const firstDay = new Date(year, month, 1).getDay(); 
    return (firstDay + 6) % 7; 
  }
  
  // Determines how many rows (weeks) the calendar grid needs to display that month
  export function getWeeksNeeded(year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDay(year, month);
    const totalCells = startDay + daysInMonth;
    return Math.ceil(totalCells / 7);
  }
  