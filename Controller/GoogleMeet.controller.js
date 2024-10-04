const dayjs = require("dayjs");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
require("dotenv").config();

const TOKEN_PATH = process.env.TOKEN_PATH;

const oauth2Client = new google.auth.OAuth2(
    process.env.Client_ID,
    process.env.Client_Secret,
    process.env.Redirect_URI,
);

async function createGoogleCalendarEvent({ summary, description, attendees }) {
    const tokenPath = `${TOKEN_PATH}`;
    const token = JSON.parse(fs.readFileSync(tokenPath));

    oauth2Client.setCredentials(token);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
        summary,
        description,
        start: {
            dateTime: dayjs(new Date()).add(1, "day").toISOString(),
            timeZone: "Asia/Kolkata",
        },
        end: {
            dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
            timeZone: "Asia/Kolkata",
        },
        attendees: attendees.map((email) => ({ email })),
        conferenceData: {
            createRequest: {
                requestId: uuidv4(),
                conferenceSolutionKey: {
                    type: "hangoutsMeet",
                },
            },
        },
    };

    const result = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
    });

    return result;
}


module.exports = {
    createGoogleCalendarEvent,
};
