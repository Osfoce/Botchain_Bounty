/**
 * Format a numeric value with thousands separators.
 *
 * Rules:
 *   - Whole numbers get commas every 3 digits: 1000000 → "1,000,000"
 *   - Trailing ".00" and trailing zeros in the decimal part are removed:
 *       500.00    → "500"
 *       1234.50   → "1,234.5"
 *       1234.56   → "1,234.56"
 *   - Non-numeric input returns "0"
 *   - Handles strings and numbers
 *
 * @param {number|string} value
 * @param {number} maxDecimals - cap on decimal places (default: 6)
 * @returns {string}
 */
export const formatNumber = (value, maxDecimals = 6) => {
  if (value === undefined || value === null || value === "") return "0";

  const num = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(num)) return "0";

  // Round to maxDecimals to avoid floating-point noise like 0.30000000004
  const rounded = Number(num.toFixed(maxDecimals));

  // Split into integer and decimal parts
  const [intPart, decPart] = rounded.toString().split(".");

  // Add commas every 3 digits to the integer part
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // If there's no decimal part, or it's all zeros, drop it
  if (!decPart) return withCommas;

  const trimmedDec = decPart.replace(/0+$/, "");
  return trimmedDec ? `${withCommas}.${trimmedDec}` : withCommas;
};

/**
 * Format a value that represents a token amount (reward, fee, total).
 * Same rules as formatNumber but defaults to a higher decimal cap so that
 * precise fee values (e.g. 7.35) aren't silently rounded.
 */
export const formatAmount = (value) => formatNumber(value, 6);