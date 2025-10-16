import { getEventsForMonth } from "./common.mjs";
import { getDaysInMonth } from "./calendar-utils.mjs";
import { writeFileSync } from "fs";

/**
 * Format date as YYYYMMDD for iCal.
 */
function formatICalDate(year, month, day) {
  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}${monthStr}${dayStr}`;
}

/**
 * Generate a unique ID for each event.
 */
function generateUID(year, month, day, name) {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");
  return `${year}${month}${day}-${cleanName}@commemorative-days`;
}

/**
 * Escape text for iCal format.
 */
function escapeICalText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/**
 * Return the current UTC timestamp for DTSTAMP.
 */
function getICalTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Try to fetch the description text from a given URL.
 * Returns empty string if request fails or content is not text.
 */
async function fetchDescriptionFromURL(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️  Could not fetch description from ${url}: ${response.statusText}`);
      return "";
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text")) {
      console.warn(`⚠️  Skipping non-text content from ${url}`);
      return "";
    }

    const text = await response.text();
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

/**
 * Main function to generate the .ics calendar file.
 */
async function generateICalFile() {
  const startYear = 2020;
  const endYear = 2030;
  const timestamp = getICalTimestamp();

  let icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Commemorative Days Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Commemorative Days",
    "X-WR-TIMEZONE:UTC",
    "X-WR-CALDESC:Commemorative days calendar (2020–2030)",
  ].join("\r\n");

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const events = await getEventsForMonth(year, month);
      const daysInMonth = getDaysInMonth(year, month);

      for (const event of events) {
        if (event.day < 1 || event.day > daysInMonth) continue;

        const dateStr = formatICalDate(year, month, event.day);
        const uid = generateUID(year, month, event.day, event.name);
        const summary = escapeICalText(event.name);

        icalContent += "\r\nBEGIN:VEVENT\r\n";
        icalContent += `UID:${uid}\r\n`;
        icalContent += `DTSTAMP:${timestamp}\r\n`;
        icalContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`;
        icalContent += `DTEND;VALUE=DATE:${dateStr}\r\n`;
        icalContent += `SUMMARY:${summary}\r\n`;

        // --- Description handling ---
        let description = event.description || "";

        // If no description, try fetching it from the URL
        if (!description && event.descriptionURL) {
          description = await fetchDescriptionFromURL(event.descriptionURL);
        }

        // Always append the URL at the end if available
        if (event.descriptionURL) {
          description += `\n\nMore information: ${event.descriptionURL}`;
          icalContent += `URL:${event.descriptionURL}\r\n`;
        }

        if (description) {
          icalContent += `DESCRIPTION:${escapeICalText(description)}\r\n`;
        }

        icalContent += "TRANSP:TRANSPARENT\r\n";
        icalContent += "END:VEVENT\r\n";
      }
    }
  }

  icalContent += "END:VCALENDAR\r\n";

  writeFileSync("days.ics", icalContent, "utf8");
  console.log("✓ Generated days.ics successfully");
  console.log(`✓ Created events for years ${startYear}–${endYear}`);
}

generateICalFile().catch((error) => {
  console.error("❌ Error generating iCal file:", error);
  process.exit(1);
});
