const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 5   // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only PDF files are allowed."), false);
        }
    }
});

/**
 * Wraps a multer middleware (e.g. upload.single("resume")) so that
 * errors thrown during upload — invalid file type, file too large,
 * or any other multer error — are converted into clean JSON 400
 * responses instead of crashing or falling through to a generic 500.
 *
 * Usage in routes:
 *   router.post("/resume", uploadPdf(upload.single("resume")), generateResumeController);
 */
function uploadPdf(multerMiddleware) {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (!err) return next();

            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File is too large. Maximum size allowed is 5MB."
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${err.message}`
                });
            }

            // Errors thrown from fileFilter (e.g. "Invalid file type") land here
            return res.status(400).json({
                success: false,
                message: err.message || "Invalid file upload."
            });
        });
    };
}

module.exports = upload;
module.exports.uploadPdf = uploadPdf;