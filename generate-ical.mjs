import { getEventsForMonth } from "./common.mjs";
import { writeFileSync } from "fs";

// Generate iCal format date (YYYYMMDD)
function formatICalDate(year, month, day) {
  const monthStr = String(month + 1).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}${monthStr}${dayStr}`;
}

// Generate a unique ID for each event
function generateUID(year, month, day, name) {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "");
  return `${year}${month}${day}-${cleanName}@commemorative-days`;
}

// Escape special characters for iCal format
function escapeICalText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Format current timestamp for iCal
function getICalTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

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
    "X-WR-CALDESC:Commemorative days calendar (2020-2030)",
  ].join("\r\n");

  // Generate events for each year
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const events = await getEventsForMonth(year, month);

      for (const event of events) {
        const dateStr = formatICalDate(year, month, event.day);
        const uid = generateUID(year, month, event.day, event.name);
        const summary = escapeICalText(event.name);

        icalContent += "\r\n";
        icalContent += "BEGIN:VEVENT\r\n";
        icalContent += `UID:${uid}\r\n`;
        icalContent += `DTSTAMP:${timestamp}\r\n`;
        icalContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`;
        icalContent += `DTEND;VALUE=DATE:${dateStr}\r\n`;
        icalContent += `SUMMARY:${summary}\r\n`;

        // Add description if available
        let description = "";
        if (event.description) {
          description = escapeICalText(event.description);
        }
        if (event.descriptionURL) {
          if (description) {
            description += "\\n\\nMore information: " + event.descriptionURL;
          } else {
            description = "More information: " + event.descriptionURL;
          }
          icalContent += `URL:${event.descriptionURL}\r\n`;
        }

        if (description) {
          icalContent += `DESCRIPTION:${description}\r\n`;
        }

        icalContent += "TRANSP:TRANSPARENT\r\n";
        icalContent += "END:VEVENT\r\n";
      }
    }
  }

  icalContent += "END:VCALENDAR\r\n";

  // Write to file
  writeFileSync("days.ics", icalContent, "utf8");
  console.log("✓ Generated days.ics successfully");
  console.log(`✓ Created events for years ${startYear}-${endYear}`);
}

// Run the generator
generateICalFile().catch((error) => {
  console.error("Error generating iCal file:", error);
  process.exit(1);
});
