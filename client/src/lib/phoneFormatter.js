/**
 * Formats phone number with country code
 * Removes existing country codes, leading zeros, and non-digit characters
 * 
 * @param {string} phoneNumber - The raw phone number input
 * @param {string} countryCode - The country dial code (e.g., "+20")
 * @returns {string} - Formatted phone number with country code
 */
export function formatPhoneNumber(phoneNumber, countryCode) {
  if (!phoneNumber) return "";

  let formatted = phoneNumber.trim();

  // Remove any spaces, dashes, or other non-digit characters except +
  formatted = formatted.replace(/[\s\-\(\)]/g, "");

  // Remove any existing country code prefix if it matches our country code
  if (formatted.startsWith(countryCode)) {
    formatted = formatted.substring(countryCode.length);
  }

  // Remove any other country code prefix (like +966, +20, etc.)
  formatted = formatted.replace(/^\+\d{1,3}/, "");

  // Remove leading zeros
  formatted = formatted.replace(/^0+/, "");

  // Remove any remaining non-digit characters
  formatted = formatted.replace(/\D/g, "");

  // Combine with country code
  return `${countryCode}${formatted}`;
}

