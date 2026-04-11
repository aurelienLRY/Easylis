const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 4100);
const STORAGE_ROOT = path.resolve(process.env.PHOTO_STORAGE_ROOT || "./storage");
const BASE_URL = process.env.PHOTO_STORAGE_BASE_URL || `http://localhost:${PORT}`;
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

fs.mkdirSync(STORAGE_ROOT, { recursive: true });

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/files", express.static(STORAGE_ROOT));

const metadataPath = path.join(STORAGE_ROOT, "metadata.json");

const readMetadata = () => {
  if (!fs.existsSync(metadataPath)) {
    return [];
  }
  const raw = fs.readFileSync(metadataPath, "utf8");
  return raw ? JSON.parse(raw) : [];
};

const writeMetadata = (items) => {
  fs.writeFileSync(metadataPath, JSON.stringify(items, null, 2), "utf8");
};

const cleanupExpiredPhotos = () => {
  const now = Date.now();
  const all = readMetadata();
  const kept = [];

  for (const entry of all) {
    const isExpired = new Date(entry.expiresAt).getTime() <= now;
    const filePath = path.join(STORAGE_ROOT, entry.sessionId, entry.fileName);

    if (isExpired) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      continue;
    }
    kept.push(entry);
  }

  writeMetadata(kept);
};

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return cb(new Error("sessionId requis"));
    }
    const destination = path.join(STORAGE_ROOT, sessionId);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, _file, cb) => {
    const fileName = req.body.fileName;
    if (!fileName) {
      return cb(new Error("fileName requis"));
    }
    cb(null, fileName);
  },
});

const upload = multer({ storage });

app.get("/health", (_req, res) => {
  cleanupExpiredPhotos();
  res.json({ success: true, status: "ok" });
});

app.post("/photos/upload", upload.single("file"), (req, res) => {
  try {
    cleanupExpiredPhotos();

    if (!req.file || !req.body.sessionId || !req.body.fileName) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "sessionId, fileName et file sont requis",
      });
    }

    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt.getTime() + MAX_AGE_MS);
    const fileUrl = `${BASE_URL}/files/${req.body.sessionId}/${req.body.fileName}`;

    const metadata = readMetadata();
    metadata.push({
      sessionId: req.body.sessionId,
      fileName: req.body.fileName,
      fileUrl,
      uploadedAt: uploadedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
    writeMetadata(metadata);

    return res.status(200).json({
      success: true,
      data: {
        fileName: req.body.fileName,
        fileUrl,
        uploadedAt: uploadedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

app.get("/photos", (req, res) => {
  cleanupExpiredPhotos();
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      data: null,
      error: "sessionId requis",
    });
  }

  const photos = readMetadata().filter((entry) => entry.sessionId === sessionId);
  return res.json({
    success: true,
    data: photos,
    error: null,
  });
});

app.delete("/photos", (req, res) => {
  try {
    cleanupExpiredPhotos();

    const { sessionId, fileName } = req.body || {};
    if (!sessionId || !fileName) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "sessionId et fileName requis",
      });
    }

    const targetPath = path.join(STORAGE_ROOT, sessionId, fileName);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    const metadata = readMetadata().filter(
      (entry) => !(entry.sessionId === sessionId && entry.fileName === fileName)
    );
    writeMetadata(metadata);

    return res.json({ success: true, data: null, error: null });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Photo API running on port ${PORT}`);
});
