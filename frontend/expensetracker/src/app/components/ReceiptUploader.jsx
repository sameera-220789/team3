import { useRef, useState } from "react";
import { getUser } from "../utils/api";

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
      const user = getUser();
      const fd = new FormData();
      fd.append("receipt", file);
      if (user?.id) {
        fd.append("userId", user.id);
      }

      const res = await fetch("http://localhost:5000/api/receipts/scan", {
        method: "POST",
        body: fd,
        // Increased timeout or signaling could be handled here if needed, 
        // but default fetch doesn't have a timeout property.
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to scan receipt (Server Error)");
      }

      const data = await res.json();
      setExtractedAmount(typeof data.amount === "number" ? data.amount : null);
      setReceiptImagePath(data.receiptImagePath || "");
      setAnalysisData(data); // New state to hold full analysis

      if (typeof onExtracted === "function") {
        onExtracted(data);
      }
    } catch (err) {
      console.error("Scan error:", err);
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
         setError("Failed to connect to server. Please check if the backend is running and the file is not too large.");
      } else {
         setError(err?.message || "Something went wrong during scanning");
      }
    } finally {
      setUploading(false);
    }
  };

  const [analysisData, setAnalysisData] = useState(null);

  return (
    <div className="card" style={{ marginBottom: "1rem" }}>
      <div className="card-header-section">
        <h2 className="card-title">Smart Receipt Scanner</h2>
        <p className="card-subtitle">AI-powered extraction, categorization & conversion</p>
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
            {uploading ? "Analyzing..." : "Scan & Analyze"}
          </button>

          <span style={{ color: "var(--color-gray-500)", fontSize: "0.9rem" }}>
            {file ? file.name : "No file selected"}
          </span>
        </div>

        {error ? (
          <div style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.95rem" }}>
            {error}
          </div>
        ) : null}

        {analysisData && (
          <div className="analysis-results" style={{ 
            padding: "1rem", 
            backgroundColor: "rgba(128, 128, 128, 0.05)", 
            borderRadius: "12px",
            border: "1px solid var(--color-gray-200)",
            fontSize: "0.9rem",
            color: "inherit"
          }}>
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Category:</strong>
              <span className="badge" style={{ 
                textTransform: "capitalize", 
                backgroundColor: "var(--color-primary-light, #e0e7ff)", 
                color: "var(--color-primary, #4338ca)",
                padding: "2px 10px",
                borderRadius: "20px",
                fontWeight: "600"
              }}>{analysisData.detectedCategory}</span>
            </div>
            <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
              <strong>Currency:</strong>
              <span style={{ opacity: 0.8 }}>{analysisData.detectedCurrency} {analysisData.detectedCurrency !== analysisData.currency ? ` -> ${analysisData.currency}` : ""}</span>
            </div>
            {analysisData.conversionNote && (
              <div style={{ marginBottom: "12px", color: "#f59e0b", fontSize: "0.8rem", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "6px", borderRadius: "6px" }}>
                ℹ️ {analysisData.conversionNote}
              </div>
            )}

            {analysisData.items && analysisData.items.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong>Extracted Items:</strong>
                  <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{analysisData.items.length} found</span>
                </div>
                <div style={{ display: "grid", gap: "6px" }}>
                  {analysisData.items.map((item, idx) => (
                    <div key={idx} style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      padding: "8px 12px", 
                      backgroundColor: "rgba(128, 128, 128, 0.08)", 
                      borderRadius: "8px",
                      border: "1px solid rgba(128, 128, 128, 0.1)"
                    }}>
                      <div style={{ display: "grid" }}>
                        <span style={{ fontWeight: "500" }}>{item.description}</span>
                        <span style={{ fontSize: "0.7rem", opacity: 0.6, textTransform: "capitalize" }}>{item.category}</span>
                      </div>
                      <strong style={{ color: "var(--color-primary)" }}>{analysisData.currency === 'USD' ? '$' : '₹'}{item.amount}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {previewUrl ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <strong>Preview</strong>
              {uploading ? (
                <span style={{ color: "var(--color-gray-500)" }}>AI is analyzing... pulling items and categories.</span>
              ) : extractedAmount != null ? (
                <span style={{ color: "var(--color-gray-700)" }}>
                  Extracted total:{" "}
                  <strong>{analysisData?.currency === 'USD' ? '$' : '₹'}{Number(extractedAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong>
                </span>
              ) : (
                <span style={{ color: "var(--color-gray-500)" }}>
                  Click “Scan & Analyze” for full breakdown.
                </span>
              )}
            </div>
            <img
              src={previewUrl}
              alt="Receipt preview"
              style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "10px", border: "1px solid var(--color-gray-200)" }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

