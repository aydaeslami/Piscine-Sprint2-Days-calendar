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

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

let occurenceArray = [{ first: 1, second: 2, third: 3, fourth: 4, last: -1 }];

export function getTargetDay(
  firstDayMonth,
  targetDay,
  occurrenceIndex,
  currentYear,
  currentMonth
) {
  const targetIndex = weekDays.indexOf(targetDay);

  if (occurrenceIndex > 0) {
    let diff = targetIndex - firstDayMonth;
    if (diff < 0) diff += 7;

    const firstTargetDay = 1 + diff;
    const finalDay = firstTargetDay + (occurrenceIndex - 1) * 7;

    return finalDay;
  } else if (occurrenceIndex === -1) {
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const lastDayWeek = new Date(
      currentYear,
      currentMonth,
      lastDayOfMonth
    ).getDay();
    let diff = lastDayWeek - targetIndex;
    if (diff < 0) diff += 7;

    return lastDayOfMonth - diff;
  }

  return null;
}

// Load days.json data - works in both Node and browser
async function loadDaysData() {
  // Check if we're in Node.js environment
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { readFileSync } = await import('fs');
    const data = readFileSync('days.json', 'utf8');
    return JSON.parse(data);
  } else {
    // Browser environment
    const response = await fetch("days.json");
    return await response.json();
  }
}

export async function getEventsForMonth(year, monthIndex) {
  const data = await loadDaysData();

  const events = [];

  data.forEach((element) => {
    if (
      element.occurence in occurenceArray[0] &&
      getMonths()[monthIndex] === element.monthName
    ) {
      const occurrenceIndex = occurenceArray[0][element.occurence];
      const targetDay = element.dayName;

      const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
      const dayNumber = getTargetDay(
        firstDayOfMonth,
        targetDay,
        occurrenceIndex,
        year,
        monthIndex
      );

      events.push({
        day: dayNumber,
        name: element.name,
        description: element.description || "",
        descriptionURL: element.descriptionURL,
      });
    }
  });

  return events;
}