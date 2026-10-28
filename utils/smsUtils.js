
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ" +
  "\u001bÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

const GSM_EXTENDED = "\f^{}\\[~]|€";

function normalizeNepaliNumber(number) {
  let normalized = String(number).trim();

  if (normalized.startsWith("+977")) {
    normalized = normalized.slice(4);
  } else if (normalized.startsWith("977")) {
    normalized = normalized.slice(3);
  }

  if (!/^9[78]\d{8}$/.test(normalized)) {
    throw new Error(`Invalid Nepali mobile number: ${number}`);
  }

  return normalized;
}

function calculateSmsParts(message) {
  let gsmUnits = 0;
  let isGsm = true;

  for (const character of message) {
    if (GSM_BASIC.includes(character)) {
      gsmUnits += 1;
    } else if (GSM_EXTENDED.includes(character)) {
      gsmUnits += 2;
    } else {
      isGsm = false;
      break;
    }
  }

  if (isGsm) {
    return {
      encoding: "GSM-7",
      units: gsmUnits,
      parts: gsmUnits <= 160 ? 1 : Math.ceil(gsmUnits / 153)
    };
  }

  const unicodeUnits = [...message].reduce(
    (total, character) =>
      total + (character.codePointAt(0) > 0xffff ? 2 : 1),
    0
  );

  return {
    encoding: "Unicode",
    units: unicodeUnits,
    parts: unicodeUnits <= 70 ? 1 : Math.ceil(unicodeUnits / 67)
  };
}

module.exports = {
  normalizeNepaliNumber,
  calculateSmsParts
};
