const message1 = "Paid: Rs 500 to Swiggy";
const message2 = "Paid: Rs 500 to Zomato";

const regex = /(?:ref\s*no\.?|txn\s*id|utr|reference|id:)\s*[:#-]?\s*([a-z0-9]+)/i;

const match1 = message1.match(regex);
const match2 = message2.match(regex);

console.log("Message 1 Ref:", match1 ? match1[1] : "null");
console.log("Message 2 Ref:", match2 ? match2[1] : "null");
