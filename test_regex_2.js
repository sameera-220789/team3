const message1 = "Paid: Rs 500 to Swiggy";
const message2 = "Paid: Rs 600 to Zomato ref no: 1234abcd";
const message3 = "Debited 500 txn id 9876xyz";

const regex = /(?:\bref\s*no\.?|\btxn\s*id|\butr|\breference|\bid:)\s*[:#-]?\s*([a-z0-9]+)/i;

const tests = [message1, message2, message3];

tests.forEach(msg => {
  const refMatch = msg.match(regex);
  let referenceId = refMatch ? refMatch[1] : null;
  if (referenceId && (referenceId.length < 4 || /^[a-z]+$/i.test(referenceId))) {
    referenceId = null;
  }
  console.log(`Msg: "${msg}" -> Ref: ${referenceId}`);
});
