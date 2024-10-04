const express = require("express")
const cors = require("cors");
const { GoogleMeetRoutes } = require("./Routes/GoogleMeet.routes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT

app.get("/", (req, res) => {
    res.send("Welcome");
});

app.use("/meet", GoogleMeetRoutes)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});