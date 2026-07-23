require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");
const { analyzeResume } = require("./src/services/ai.service");
const { resumeText, selfDescription, targetRole, tone } = require("./src/services/temp");

connectDB();
analyzeResume({ resumeText, selfDescription, targetRole, tone })
    .then((result) => {
        console.log("\n✅ Resume Roast Result:\n");
        console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        console.error("\n❌ Resume analysis failed:\n", err.message || err);
    });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});