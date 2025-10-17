/*
Iterates through years and months.
Fetches events for each month.
Validates event dates.
Builds a proper .ics calendar structure:
VCALENDAR → container
VEVENT → each event
Handles descriptions and URLs (fetching from URL if necessary).
Writes the final file days.ics.
*/

import { getEventsForMonth } from "./common.mjs"; // Import function to get events
import { getDaysInMonth } from "./calendar-utils.mjs"; // Import function to get days in month share logic code
import { writeFileSync } from "fs";


// Generate ical format date string YYYYMMDD
function formatICalDate(year, month, day) {
  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}${monthStr}${dayStr}`;
}


// Generate a unique UID for each event
function generateUID(year, month, day, name) {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");
  return `${year}${month}${day}-${cleanName}@commemorative-days`;
}


//Function make sure text is properly escaped for iCal format (text strings)
function escapeICalText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// return current timestamp in iCal format required for DTSTAMP
function getICalTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}


 // Try to fetch the description text from a given URL.
 // Returns empty string if request fails or content is not text.

async function fetchDescriptionFromURL(url) {
  try {
    const response = await fetch(url); // Fetch the URL
    if (!response.ok) {
      console.warn(`⚠️  Could not fetch description from ${url}: ${response.statusText}`);
      return "";
    }

    const contentType = response.headers.get("content-type"); // Check content type
    if (!contentType || !contentType.includes("text")) {
      console.warn(`⚠️  Skipping non-text content from ${url}`); 
      return "";
    }

    const text = await response.text(); // 
    // Clean and truncate long HTML/text if needed
    const plainText = text
      .replace(/<[^>]*>/g, "") // Strip HTML tags
      .replace(/\s+/g, " ")
      .trim();

    // Optional: truncate overly long text (Google Calendar has limits)
    return plainText.length > 1000 ? plainText.slice(0, 1000) + "..." : plainText;
  } catch (error) {
    console.warn(`⚠️  Error fetching ${url}:`, error.message);
    return "";
  }
}

// Main function to generate the iCal file
async function generateICalFile() {
  const startYear = 2020;
  const endYear = 2030;
  const timestamp = getICalTimestamp(); // Current timestamp for DTSTAMP

  let icalContent = [ // Header of iCal file
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Commemorative Days Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Commemorative Days",
    "X-WR-TIMEZONE:UTC",
    "X-WR-CALDESC:Commemorative days calendar (2020–2030)",
  ].join("\r\n"); // ensure proper line breaks according to the iCal spececification

  // Loop year by year and month by month
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const events = await getEventsForMonth(year, month); // retrieve all the events for that month
      const daysInMonth = getDaysInMonth(year, month); // ensures the day number is valid

      for (const event of events) {  // loop through each event 
        if (event.day < 1 || event.day > daysInMonth) continue; // skip invalid days 

        const dateStr = formatICalDate(year, month, event.day); // YYYYMMDD format for .ics
        const uid = generateUID(year, month, event.day, event.name); // a unique identifier for the event so calendars know it’s the same event when syncing.
        const summary = escapeICalText(event.name); // the event title

        // Start building VEVENT block
        icalContent += "\r\nBEGIN:VEVENT\r\n";  // 
        icalContent += `UID:${uid}\r\n`; // Unique identifier
        icalContent += `DTSTAMP:${timestamp}\r\n`; // Timestamp of creation
        icalContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`; // All-day event start date
        icalContent += `DTEND;VALUE=DATE:${dateStr}\r\n`; // All-day event end date
        icalContent += `SUMMARY:${summary}\r\n`; // Event title

        // --- Description handling ---
        let description = event.description || ""; // use provided description

        // If no description, try fetching it from the URL
        if (!description && event.descriptionURL) {
          description = await fetchDescriptionFromURL(event.descriptionURL);
        }

        // Always append the URL at the end if available
        if (event.descriptionURL) { // append URL to description
          description += `\n\nMore information: ${event.descriptionURL}`;
          icalContent += `URL:${event.descriptionURL}\r\n`;
        }

        if (description) { // add DESCRIPTION field if we have any description text
          icalContent += `DESCRIPTION:${escapeICalText(description)}\r\n`;
        }

        icalContent += "TRANSP:TRANSPARENT\r\n"; // Make event transparent (does not block time)
        icalContent += "END:VEVENT\r\n"; // End of VEVENT block
      }
    }
  }

  icalContent += "END:VCALENDAR\r\n"; 

  // Write to days.ics file
  writeFileSync("days.ics", icalContent, "utf8");
  console.log("✓ Generated days.ics successfully");
  console.log(`✓ Created events for years ${startYear}–${endYear}`);
}

// Run the iCal generation
generateICalFile().catch((error) => {
  console.error("❌ Error generating iCal file:", error);
  process.exit(1);
});
