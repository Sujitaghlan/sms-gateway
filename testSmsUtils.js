
const {
  normalizeNepaliNumber,
  calculateSmsParts
} = require("./utils/smsUtils");

console.log(normalizeNepaliNumber("+9779812345678"));
console.log(calculateSmsParts("Hello Nepal!"));
console.log(calculateSmsParts("नमस्ते नेपाल"));
