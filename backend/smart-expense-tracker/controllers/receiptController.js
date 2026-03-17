const User = require("../models/User");
const Tesseract = require("tesseract.js");

// --- Enhanced Helper Data V9 ---
const MERCHANT_PATTERNS = {
    food: ["starbucks", "mcdonald", "kfc", "subway", "zomato", "swiggy", "bakery", "restaurant", "cafe", "coffee", "pizza", "burger", "biryani", "paradise", "bawarchi", "hotel", "food", "dining", "canteen", "punjab", "himalaya"],
    travel: ["uber", "ola", "indigo", "airindia", "vistara", "rapido", "shell", "petrol", "parking", "irctc", "makemytrip", "travel", "airline", "airport"],
    shopping: ["dmart", "walmart", "target", "amazon", "flipkart", "pantaloons", "zara", "h&m", "retail", "reliance", "jiomart", "big*bazaar", "more*retail", "spar", "lifestyle", "shoppers*stop", "groceries", "mart", "supermarket"]
};

const CATEGORY_KEYWORDS = {
  food: ["mcdonald", "cafe", "coffee", "starbucks", "kfc", "subway", "bakery", "restaurant", "swiggy", "zomato", "burger", "pizza", "eat", "dining", "canteen", "lunch", "dinner", "breakfast", "curry", "dosa", "biryani", "makhni", "daal", "dal", "chapati", "rice", "idli", "samosa", "tikka", "paneer", "chicken", "mutton", "fish", "curd", "lassi"],
  travel: ["uber", "ola", "taxi", "flight", "airline", "train", "bus", "transport", "fuel", "petrol", "shell", "bpcl", "hpcl", "auto", "rickshaw", "rapido", "indigo", "airindia", "vistara", "airport"],
  shopping: ["dmart", "walmart", "target", "amazon", "flipkart", "clothing", "fashion", "electronics", "mall", "store", "retail", "supermarket", "grocery", "pantaloons", "zara", "h&m", "reliance", "jiomart", "shoe", "shirt", "jeans", "top", "detergent", "soap", "oil", "sugar", "atta", "brush"],
  bills: ["electricity", "water", "gas", "internet", "wifi", "phone", "mobile", "jio", "airtel", "rent", "recharge", "insurance", "policy", "premium", "broadband", "maintenance"],
  entertainment: ["netflix", "cinema", "movie", "theatre", "spotify", "gaming", "park", "club", "bar", "pub", "disney", "hotstar", "pvr", "inox", "bookmyshow"],
  healthcare: ["hospital", "clinic", "pharmacy", "medicine", "doctor", "drug", "apollo", "care", "diagnostic", "lab", "healthians", "pharmeasy", "medplus"],
  education: ["school", "college", "university", "book", "course", "tuition", "udemy", "coursera", "exam", "fees", "byjus"]
};

function classify(text, merchant = "") {
  const lowText = (text || "").toLowerCase();
  const lowMerchant = (merchant || "").toLowerCase();

  for (const [cat, patterns] of Object.entries(MERCHANT_PATTERNS)) {
      if (patterns.some(p => lowMerchant.includes(p) || lowText.includes(p))) return cat;
  }
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lowText.includes(kw))) return cat;
  }
  return "other";
}

function extractMerchant(lines) {
    for (let i = 0; i < Math.min(lines.length, 12); i++) {
        const line = lines[i].trim();
        const lowLine = line.toLowerCase();
        if (lowLine.includes("dmart") || lowLine.includes("avenue supermarts")) return "DMart";
        if (lowLine.includes("starbucks")) return "Starbucks";
        if (lowLine.includes("reliance")) return "Reliance";
        if (lowLine.includes("mcdonald")) return "McDonald's";
        if (lowLine.includes("punjab")) return "Himalaya Punjab";
        
        if (line.length > 3 && !/^\d/.test(line) && !line.includes(":") && !line.includes("@") && !line.includes("www") && !line.toLowerCase().includes("invoice")) {
            return line;
        }
    }
    return "Merchant";
}

function parseSmartNumber(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d.,]/g, "");
    if (!cleaned) return 0;

    const parts = cleaned.split(/[.,]/);
    if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        if (lastPart.length === 2) {
             const whole = parts.slice(0, -1).join("");
             return parseFloat(whole + "." + lastPart);
        } else if (lastPart.length === 3) {
             // Treat 190.000 as 190 if scale is huge
             const val = parseFloat(cleaned.replace(/[.,]/g, ""));
             if (val > 10000 && str.includes(".")) return val / 1000;
             return val;
        }
    }
    return parseFloat(cleaned.replace(/,/g, ""));
}

exports.scanReceipt = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No receipt image uploaded" });

    const imagePath = req.file.path;
    const receiptImagePath = `/uploads/${req.file.filename}`;

    let userProfileCurrency = "INR";
    if (userId) {
      const user = await User.findById(userId);
      if (user) userProfileCurrency = user.currency || "INR";
    }

    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng');
    const lines = text.split('\n');
    const merchantName = extractMerchant(lines);
    
    // 1. Content Area Detection
    let contentStartLine = 0;
    const headerMarkers = ["TAX INVOICE", "PARTICULARS", "BILL NO", "QTY", "RATE", "VALUE", "ITEM NAME"];
    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        if (headerMarkers.some(m => lines[i].toUpperCase().includes(m))) {
            contentStartLine = i;
            break;
        }
    }

    // 2. Currency Context
    const textUpper = text.toUpperCase();
    const localKeywords = ["GST", "INR", "RS.", "RS ", "RUPEE", "₹", "RP", "RUPIAH", "INDIA", "PUNE", "MUMBAI", "AHMEDABAD", "TELANGANA"];
    const hasLocalContext = localKeywords.some(kw => textUpper.includes(kw)) || 
                             /\b(DAAL|MAKHNI|CHAPATI|BIRYANI|ROTI|PANEER|DOSA|CHICKEN|MASALA)\b/.test(textUpper);
    const hasDollar = (/(?:^|\s)\$\s*\d|\bUSD\b/i.test(text));
    
    let detectedCurrency = (hasDollar && !hasLocalContext) ? "USD" : "INR";
    if (!hasDollar && !hasLocalContext) detectedCurrency = userProfileCurrency;

    // 3. Extraction Iteration
    let rawTotalAmount = null;
    let possibleAmounts = [];
    let extractedItems = [];
    const ignoreKeywords = /bill\s*no|id|trans\b|date\b|time\b|phone|tel|tin|gstin|hsn|sac/i;
    const totalKeywordsRegex = /(grand\s*total|total|total\s*due|net\s*pay|payable|sum|amt|t:|paid|amount|charge|payment|gross|balance)/i;

    const isDateOrId = (n) => {
        if (!n || n.length > 10) return true;
        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(n)) return true; // 16/05/2020
        const num = parseInt(n.replace(/[^\d]/g, ""));
        return (num >= 2010 && num <= 2030) || /^[1-8]\d{5}$/.test(n); // Year or Pincode
    };

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (!line) continue;

        // TOTAL DETECTION
        if (totalKeywordsRegex.test(line) && !ignoreKeywords.test(line) && rawTotalAmount === null) {
            const numbers = line.match(/([\d,.]+\d{1,2})/g) || line.match(/(\d+)/g);
            if (numbers) {
                for (let j = numbers.length - 1; j >= 0; j--) {
                    if (isDateOrId(numbers[j])) continue;
                    let val = parseSmartNumber(numbers[j]);
                    if (val > 0 && val < 500000) {
                        rawTotalAmount = val;
                        break;
                    }
                }
            }
        }

        // ITEM EXTRACTION (DMart & Simple)
        const itemRegex = /^(\d{3,}\s+)?(.+?)\s+(\d+x?\s+)?([\d,.]+)\s+([\d,.]+)$/; 
        const match = line.match(itemRegex);
        if (match && i >= contentStartLine && !totalKeywordsRegex.test(line)) {
            let itemName = match[2].trim().replace(/^[^a-z0-9]+/i, "");
            let priceStr = match[5];
            if (!isDateOrId(priceStr) && !itemName.toLowerCase().includes("date")) {
                let itemPrice = parseSmartNumber(priceStr);
                if (itemPrice > 0 && !/^(total|subtotal|amt|price|tax|gst|cash|change|round|items)/i.test(itemName)) {
                    extractedItems.push({
                        description: itemName,
                        amount: itemPrice,
                        category: classify(itemName, merchantName)
                    });
                    continue; // Skip fallback if detected as item
                }
            }
        }

        // FALLBACK AMOUNTS
        const pMatches = line.match(/([\d,.]+\d{1,2})/g);
        if (pMatches && i >= contentStartLine && !ignoreKeywords.test(line)) {
            pMatches.forEach(p => {
                if (!isDateOrId(p)) {
                    let v = parseSmartNumber(p);
                    if (v > 0 && v < 500000) possibleAmounts.push(v);
                }
            });
        }
    }

    if (rawTotalAmount === null && possibleAmounts.length > 0) {
        // Find if any possible amount matches the sum of items
        const itemSum = extractedItems.reduce((acc, curr) => acc + curr.amount, 0);
        if (itemSum > 0) {
            // Find an amount close to the item sum (e.g. including taxes)
            const matchedTotal = possibleAmounts.find(a => a >= itemSum && a <= itemSum * 1.5);
            rawTotalAmount = matchedTotal || itemSum;
        } else {
            rawTotalAmount = possibleAmounts[0];
        }
    }

    // 4. Category Intelligence (Majority-Item Logic)
    let finalCategory = classify(text, merchantName);
    if (finalCategory === "other" && extractedItems.length > 0) {
        const counts = {};
        extractedItems.forEach(it => {
            if (it.category !== "other") {
                counts[it.category] = (counts[it.category] || 0) + 1;
            }
        });
        const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
        if (sorted.length > 0) finalCategory = sorted[0][0];
    }

    // 5. Currency Engine Restored
    console.log("--------------- RECEIPT PARSER DEBUG ---------------");
    console.log("Raw Text Sample:", text.substring(0, 300));
    console.log("Detected Items:", extractedItems);
    console.log("Raw Total Selected:", rawTotalAmount);
    console.log("Detected Currency:", detectedCurrency, "| User Currency:", userProfileCurrency);
    console.log("----------------------------------------------------");

    const EX_RATE = 83.5;
    let finalAmount = rawTotalAmount || 0;
    let conversionNote = "";
    
    // Only apply conversion if the receipt EXPLICITLY has $ or USD and NO local keywords
    if (userProfileCurrency !== detectedCurrency) {
        if (userProfileCurrency === "INR" && detectedCurrency === "USD") {
            finalAmount = Number((finalAmount * EX_RATE).toFixed(2));
            conversionNote = `Converted from USD to INR at ${EX_RATE}`;
            extractedItems = extractedItems.map(it => ({ ...it, amount: Number((it.amount * EX_RATE).toFixed(2)) }));
        } else if (userProfileCurrency === "USD" && detectedCurrency === "INR") {
            finalAmount = Number((finalAmount / EX_RATE).toFixed(2));
            conversionNote = `Converted from INR to USD at 1/${EX_RATE}`;
            extractedItems = extractedItems.map(it => ({ ...it, amount: Number((it.amount / EX_RATE).toFixed(2)) }));
        }
    }
    res.json({
      message: "Receipt analyzed successfully",
      amount: finalAmount,
      currency: userProfileCurrency,
      detectedCurrency: detectedCurrency,
      detectedCategory: finalCategory,
      merchantName: merchantName,
      conversionNote: conversionNote,
      items: extractedItems,
      isMultiCategory: new Set(extractedItems.map(it => it.category)).size > 1,
      receiptImagePath: receiptImagePath
    });

  } catch (error) {
    console.error("V9 ANALYSIS FAILED:", error);
    res.status(500).json({ message: "Analysis failed", error: error.message });
  }
};
;
