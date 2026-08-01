const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://monk-stack-ai-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// require all the routes here
const authRoutes = require("./routes/auth.routes");
const resumeRoutes = require("./routes/resume.routes");

// using all the routes here
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

module.exports = app;
