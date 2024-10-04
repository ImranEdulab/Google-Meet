const dayjs = require("dayjs");
const { Router } = require("express");
const { google } = require("googleapis")
const { v4: uuidv4 } = require('uuid');
const fs = require("fs");
const path = require("path");
const { calendar } = require("googleapis/build/src/apis/calendar");

require("dotenv").config()

const APIKEY = process.env.API_KEY;

const GoogleMeetRoutes = Router()

const oauth2Client = new google.auth.OAuth2(
    process.env.Client_ID,
    process.env.Client_Secret,
    process.env.Redirect_URI,
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

GoogleMeetRoutes.get("/google", (req, res) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });
    res.redirect(authUrl);
});

GoogleMeetRoutes.get("/google/redirect", async (req, res) => {
    try {
        const { tokens } = await oauth2Client.getToken(req.query.code)
        // let tokens = await token.tokens.access_token
        await oauth2Client.setCredentials(tokens);
        fs.writeFileSync("token.json", JSON.stringify(tokens));
        // const ans = oauth2Client.credentials
        // console.log('oauth2Client', oauth2Client.credentials);

        // console.log("ans----->", ans)
        res.send({ message: "Successfull" })
    } catch (error) {
        res.status(500).send(error)
    }
})

const TOKEN_PATH = process.env.TOKEN_PATH

GoogleMeetRoutes.post("/invites", async (req, res) => {
    const tokenPath = `${TOKEN_PATH}`;
    const token = JSON.parse(fs.readFileSync(tokenPath));
    // const tokens = await token.tokens.access_token
    // const auth = await tokens;
    // console.log("auth", await oauth2Client.getAccessToken(auth))

    oauth2Client.setCredentials(token)

    const calendar = await google.calendar({ version: 'v3', auth: oauth2Client });

    const { summary, description, attendees } = req.body;


    const event = {
        summary,
        description,
        start: {
            dateTime: dayjs(new Date()).add(1, "day").toISOString(),
            timeZone: 'Asia/Kolkata',
        },
        end: {
            dateTime: dayjs(new Date()).add(1, "day").add(1, "hour").toISOString(),
            timeZone: 'Asia/Kolkata',
        },
        attendees: attendees.map(email => ({ email })),
        conferenceData: {
            createRequest: {
                requestId: uuidv4(),
                conferenceSolutionKey: {
                    type: "hangoutsMeet",
                },
            },
        },
    }

    const result = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1
    })
    res.send("Calendar Event Created and Send Successfully")

});


module.exports = {
    GoogleMeetRoutes
}