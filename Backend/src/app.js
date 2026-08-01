const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"monk-stack-ai-frontend.vercel.app",
    credentials: true
}));

// require all the routes here
const authRoutes = require("./routes/auth.routes");
const resumeRoutes = require("./routes/resume.routes");

//using all the routes here
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

module.exports = app;
