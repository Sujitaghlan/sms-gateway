
const {
  normalizeNepaliNumber,
  calculateSmsParts,
} = require("../utils/smsUtils");

describe("normalizeNepaliNumber", () => {
  test("accepts a valid Nepali mobile number", () => {
    expect(normalizeNepaliNumber("9841234567")).toBe("9841234567");
  });

  test("removes the Nepal country code", () => {
    expect(normalizeNepaliNumber("+9779841234567")).toBe("9841234567");
  });

  test("rejects an invalid number", () => {
    expect(() => normalizeNepaliNumber("12345")).toThrow();
  });
});

describe("calculateSmsParts", () => {
  test("counts a short GSM message as one part", () => {
    const result = calculateSmsParts("Hello");
    expect(result.parts).toBe(1);
  });

  test("counts a 161-character GSM message as two parts", () => {
    const result = calculateSmsParts("a".repeat(161));
    expect(result.parts).toBe(2);
  });

  test("counts a short Unicode message as one part", () => {
    const result = calculateSmsParts("नमस्ते");
    expect(result.parts).toBe(1);
  });
});
