import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false, // ❌ Jangan pakai default bodyParser, biar formidable yang handle
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Pastikan folder uploads ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      return res.status(200).json({
        success: true,
        filename: path.basename(file[0].filepath || file.filepath),
        originalName: file[0]?.originalFilename || file.originalFilename,
        size: file[0]?.size || file.size,
      });
    });
  } catch (error) {
    console.error("Upload API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
