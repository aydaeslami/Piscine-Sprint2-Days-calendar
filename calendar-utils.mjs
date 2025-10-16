// calendar-utils.mjs

/**
 * Returns the number of days in a given month and year.
 * @param {number} year - Full year (e.g. 2025)
 * @param {number} month - Month index (0 = January, 11 = December)
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  
  /**
   * Returns the weekday index of the first day of the month,
   * adjusted so that Monday = 0 and Sunday = 6.
   */
  export function getStartDay(year, month) {
    const firstDay = new Date(year, month, 1).getDay(); // JS: 0 = Sunday
    return (firstDay + 6) % 7; // Adjust so Monday = 0
  }
  
  /**
   * Calculates how many weeks (rows) are needed for a month view.
   */
  export function getWeeksNeeded(year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDay(year, month);
    const totalCells = startDay + daysInMonth;
    return Math.ceil(totalCells / 7);
  }
  