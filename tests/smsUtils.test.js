
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

  test("counts a 200-character English message as two GSM-7 parts", () => {
  const result = calculateSmsParts("a".repeat(200));

  expect(result.encoding).toBe("GSM-7");
  expect(result.parts).toBe(2);
  expect(result.units).toBe(200);
});

test("counts a 100-character Nepali message as two Unicode parts", () => {
  const result = calculateSmsParts("न".repeat(100));

  expect(result.encoding).toBe("Unicode");
  expect(result.parts).toBe(2);
  expect(result.units).toBe(100);
});

test("uses Unicode encoding when an English message contains an emoji", () => {
  const result = calculateSmsParts("Hello 😀");

  expect(result.encoding).toBe("Unicode");
  expect(result.units).toBe(8);
  expect(result.parts).toBe(1);
});

test("counts GSM-7 extended characters as two units", () => {
  const result = calculateSmsParts("^");

  expect(result.encoding).toBe("GSM-7");
  expect(result.units).toBe(2);
  expect(result.parts).toBe(1);
});
});
