const { Router } = require("express");
const { google } = require("googleapis")
const fs = require("fs");
const sgMail = require("@sendgrid/mail");
const { createGoogleCalendarEvent } = require("../Controller/GoogleMeet.controller");
const dayjs = require("dayjs");

require("dotenv").config()

const GoogleMeetRoutes = Router()
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
        await oauth2Client.setCredentials(tokens);
        fs.writeFileSync("token.json", JSON.stringify(tokens));
        res.send({ message: "Successfull" })
    } catch (error) {
        res.status(500).send(error)
    }
})

GoogleMeetRoutes.post("/invites", async (req, res) => {
    const { summary, description, attendees } = req.body;

    const result = await createGoogleCalendarEvent({ summary, description, attendees });
    const isoStringStart = result.data.start.dateTime;
    const endTime = result.data.end.dateTime

    const startDate = dayjs(isoStringStart).format('HH:mm');
    const endDate = dayjs(endTime).format('HH:mm');
    const date = dayjs(isoStringStart).format('DD-MM-YYYY')

    const msg = {
        to: attendees,
        from: 'imran@edulab.in',
        subject: `You're invited to: ${summary}`,
        html: `<strong>You have been invited to the following event:</strong><br><br>
            <strong>Event:</strong> ${summary}<br>
            <strong>Description:</strong> ${description}<br>
            <strong>Join the meeting here:</strong> <a href="${result.data.hangoutLink}">${result.data.hangoutLink}</a><br>
            <strong>Date:</strong> ${date}<br>
            <strong>Time:</strong> ${startDate} - ${endDate}`,
    };

    await sgMail.send(msg);
    res.status(200).send("Calendar Event Created and Send Successfully",)

});


module.exports = {
    GoogleMeetRoutes
}