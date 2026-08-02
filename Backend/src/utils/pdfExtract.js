const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");

/**
 * Extracts plain text from a PDF buffer.
 * Throws a clean, user-facing error if the PDF truly can't be read
 * (corrupted file, password-protected, or a scanned/image-only PDF
 * with no text layer).
 */
async function extractPdfText(buffer) {
    let pdfDocument;

    try {
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            // Disable worker (not needed/available in Node backend context)
            disableWorker: true,
            // Don't fetch external resources like fonts
            useSystemFonts: true
        });

        pdfDocument = await loadingTask.promise;
    } catch (err) {
        console.error("PDF load failed:", err.message);
        const error = new Error(
            "This PDF couldn't be opened. It may be corrupted, password-protected, " +
            "or exported by a tool that produces non-standard PDF structure. " +
            "Try re-exporting it (e.g. Print to PDF from your browser) and upload again."
        );
        error.isPdfParseError = true;
        throw error;
    }

    let fullText = "";

    try {
        for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(" ");
            fullText += pageText + "\n";
        }
    } catch (err) {
        console.error("PDF text extraction failed:", err.message);
        const error = new Error(
            "This PDF's content couldn't be extracted. It may be a scanned image " +
            "rather than a text-based document. Please upload a text-based PDF resume."
        );
        error.isPdfParseError = true;
        throw error;
    } finally {
        if (pdfDocument) {
            await pdfDocument.destroy();
        }
    }

    const trimmed = fullText.trim();

    if (!trimmed) {
        const error = new Error(
            "No text could be found in this PDF. If it's a scanned document or an " +
            "image-based PDF, please upload a text-based PDF instead."
        );
        error.isPdfParseError = true;
        throw error;
    }

    return trimmed;
}

module.exports = { extractPdfText };