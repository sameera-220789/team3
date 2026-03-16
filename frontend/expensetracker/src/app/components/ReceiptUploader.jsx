import { useRef, useState } from "react";

export default function ReceiptUploader({ onExtracted }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [extractedAmount, setExtractedAmount] = useState(null);
  const [receiptImagePath, setReceiptImagePath] = useState("");
  const [error, setError] = useState("");

  const handleSelect = (e) => {
    const f = e.target.files?.[0] || null;
    setError("");
    setExtractedAmount(null);
    setReceiptImagePath("");
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : "");
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please upload a receipt image (jpg/png) before scanning.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      const res = await fetch("http://localhost:5000/api/receipts/scan", {
        method: "POST",
        body: fd
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to scan receipt");
      }

      setExtractedAmount(typeof data.amount === "number" ? data.amount : null);
      setReceiptImagePath(data.receiptImagePath || "");

      if (typeof onExtracted === "function") {
        onExtracted({
          amount: typeof data.amount === "number" ? data.amount : null,
          receiptImagePath: data.receiptImagePath || "",
          previewUrl
        });
      }
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div className="card-header-section">
        <h2 className="card-title">Receipt Scanner</h2>
        <p className="card-subtitle">Upload a receipt and auto-extract the total amount</p>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleSelect}
            style={{ display: "none" }}
          />

          <button
            className="btn btn-secondary"
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Receipt
          </button>

          <button className="btn btn-primary" type="button" disabled={uploading} onClick={handleScan}>
            {uploading ? "Scanning..." : "Scan"}
          </button>

          <span style={{ color: "var(--color-gray-500)", fontSize: "0.9rem" }}>
            {file ? file.name : "No file selected"}
          </span>
          {receiptImagePath ? (
            <span style={{ color: "var(--color-gray-500)", fontSize: "0.9rem" }}>
              Saved: {receiptImagePath}
            </span>
          ) : null}
        </div>

        {error ? (
          <div style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.95rem" }}>
            {error}
          </div>
        ) : null}

        {previewUrl ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <strong>Preview</strong>
              {uploading ? (
                <span style={{ color: "var(--color-gray-500)" }}>OCR running… this can take ~10–30 seconds.</span>
              ) : extractedAmount != null ? (
                <span style={{ color: "var(--color-gray-700)" }}>
                  Extracted total:{" "}
                  <strong>₹{Number(extractedAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </span>
              ) : (
                <span style={{ color: "var(--color-gray-500)" }}>
                  Click “Scan” to extract the total.
                </span>
              )}
            </div>
            <img
              src={previewUrl}
              alt="Receipt preview"
              style={{ width: "100%", maxHeight: "260px", objectFit: "contain", borderRadius: "10px", border: "1px solid var(--color-gray-200)" }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

