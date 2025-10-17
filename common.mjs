// This file contains functions that can be used in both browser and Node environments.

export function getGreeting() {
  return "Hello";
}

export function getMonths() {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
}

// -----------------------------
// Array of weekday names (0 = Sunday, 6 = Saturday)
// Used to convert weekday names into numeric indexes
// -----------------------------
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// -----------------------------
// Object that maps textual occurrence names to numeric values
// Example: "first" -> 1, "last" -> -1
// -----------------------------

let occurenceArray = [{ first: 1, second: 2, third: 3, fourth: 4, last: -1 }];

/**
 * ----------------------------------------------------------
 * getTargetDay()
 * ----------------------------------------------------------
 * Finds the exact date (day number) in a month for an event.
 * Example:
 * - Second Tuesday of March 2025
 *
 *
 * Inputs:
 * firstDayMonth: weekday number (0–6) of the first day of the month
 * targetDay: the weekday name (like "Tuesday")
 * occurrenceIndex: which time it happens (1 = first, 2 = second, -1 = last)
 * currentYear: the year
 * currentMonth: the month number (0 = January, 11 = December)
 *
 * Output:
 * Returns the day number or null if something is wrong
 */

export function getTargetDay(
  firstDayMonth,
  targetDay,
  occurrenceIndex,
  currentYear,
  currentMonth
) {
  const targetIndex = weekDays.indexOf(targetDay);

  if (occurrenceIndex > 0) {
    // Calculate how far the first target day is from the first day of the month
    let diff = targetIndex - firstDayMonth;

    // If the target day is before the first day of the month, move to the next week
    if (diff < 0) diff += 7;

    // Find the date of the first occurrence of the target weekday
    const firstTargetDay = 1 + diff;

    // Calculate the final date based on which occurrence we want
    const finalDay = firstTargetDay + (occurrenceIndex - 1) * 7;

    return finalDay;

    // -----------------------------
    // Case 2: "last" occurrence
    // -----------------------------
  } else if (occurrenceIndex === -1) {
    // Get the date number of the last day in this month (e.g. 31 for October).
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayWeek = new Date(
      currentYear,
      currentMonth,
      lastDayOfMonth
    ).getDay();

    // Find how far the target day is from the last day
    let diff = lastDayWeek - targetIndex;
    if (diff < 0) diff += 7;

    // Subtract to get the exact date of the last occurrence
    return lastDayOfMonth - diff;
  }
  // Return null if occurrenceIndex is not valid
  return null;
}

// Load days.json data - works in both Node and browser
async function loadDaysData() {
  // Check if we're in Node.js environment
  if (typeof process !== "undefined" && process.versions?.node) {
    const { readFileSync } = await import("fs");
    const data = readFileSync("days.json", "utf8");
    return JSON.parse(data);
  } else {
    // Browser environment
    const response = await fetch("days.json");
    return await response.json();
  }
}

// This function loads all special days (from days.json)
// and returns only the events that happen in the given
// month and year. It calculates the exact day number
// (like "second Tuesday of March" → March 11).
export async function getEventsForMonth(year, monthIndex) {
  const data = await loadDaysData(); // Load days.json data
  // Array to store all events found in this month

  const events = [];
  // Loop through every item (day/event) in the JSON file

  data.forEach((element) => {
    // Check if:
    // 1. The "occurence" field is valid (like 'first', 'second', 'last')
    // 2. The month name in the JSON matches the given month
    if (
      element.occurence in occurenceArray[0] &&
      getMonths()[monthIndex] === element.monthName
    ) {
      // Convert "first", "second", etc. into a number (1, 2, -1)

      const occurrenceIndex = occurenceArray[0][element.occurence];
      // Get the target weekday (like "Tuesday")

      const targetDay = element.dayName;
      // Find which weekday the first day of this month is (0 = Sunday, 6 = Saturday)

      const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
      // Use getTargetDay() to calculate the exact day number in the month

      const dayNumber = getTargetDay(
        firstDayOfMonth,
        targetDay,
        occurrenceIndex,
        year,
        monthIndex
      );
      // Add this event to the list

      events.push({
        day: dayNumber,
        name: element.name,
        description: element.description || "", // push description if exists
        descriptionURL: element.descriptionURL,
      });
    }
  });
  // Return the list of events for this month

  return events;
}
