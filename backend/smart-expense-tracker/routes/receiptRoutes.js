const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const receiptController = require("../controllers/receiptController");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!require("fs").existsSync(uploadDir)) {
      require("fs").mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/scan", upload.simple ? upload.single("receipt") : upload.single("receipt"), receiptController.scanReceipt);

module.exports = router;
