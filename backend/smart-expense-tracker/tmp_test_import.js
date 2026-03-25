try {
  const { Parser } = require("json2csv");
  console.log("Parser imported successfully");
} catch (e) {
  console.error("Error importing Parser:", e.message);
}
