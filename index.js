require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const base64 = require("base-64");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ZOOM_API_URL = "https://api.zoom.us/v2/users/me/meetings";
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;

// Helper to get the authorization headers for the Zoom API
const getAuthHeaders = () => {
    return {
        Authorization: `Basic ${base64.encode(
            `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
        )}`,
        "Content-Type": "application/json",
    };
};

// Generate Zoom Access Token
const generateZoomAccessToken = async () => {
    try {
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
            {},
            {
                headers: getAuthHeaders(),
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.log("generateZoomAccessToken Error --> ", error);
        throw error;
    }
};

// Create Zoom Meeting
app.post("/create-meeting", async (req, res) => {
    try {
        const zoomAccessToken = await generateZoomAccessToken();

        const response = await axios.post(
            ZOOM_API_URL,
            {
                topic: "Test Meeting",
                type: 1, // Instant meeting
                duration: 30,
                timezone: "UTC",
                settings: {
                    host_video: true,
                    participant_video: true,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${zoomAccessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log('response from create-meeting:', response.data);
        res.json({ join_url: response.data.join_url, meetingNumber: response.data.id });
    } catch (error) {
        console.log("generateZoomMeeting Error --> ", error);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});


app.get("/", async (req, res) => {
    res.send("Server is running...");
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
