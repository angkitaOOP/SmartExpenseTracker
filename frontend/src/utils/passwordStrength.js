// Common weak passwords we never want to allow, even if they
// technically pass the length/character rules below.
const COMMON_WEAK_PASSWORDS = [
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "qwerty",
  "qwerty123",
  "111111",
  "000000",
  "abc123",
  "letmein",
  "iloveyou",
  "admin123",
];

/**
 * Checks each password rule individually so the UI can show a
 * live checklist to the user while they type.
 */
export function getPasswordChecks(password = "") {
  const isSequential = /^(0123456789|1234567890|abcdefgh)/i.test(password);
  const isAllSameChar = password.length > 0 && /^(.)\1+$/.test(password);
  const isCommon = COMMON_WEAK_PASSWORDS.includes(password.toLowerCase());

  return {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    notCommon: !isCommon && !isSequential && !isAllSameChar,
  };
}

/**
 * Returns "empty" | "weak" | "medium" | "strong" for the password.
 */
export function getPasswordStrength(password = "") {
  if (!password) return "empty";

  const checks = getPasswordChecks(password);

  // A password that is common/sequential/repeated is always weak,
  // no matter how long it looks.
  if (!checks.notCommon || !checks.length) return "weak";

  const score = [checks.hasLower, checks.hasUpper, checks.hasNumber, checks.hasSpecial].filter(
    Boolean
  ).length;

  if (score <= 2) return "weak";
  if (score === 3) return "medium";
  return "strong";
}

/**
 * A password is only accepted for submission once it's at least
 * "medium" strength: 8+ chars, not a common/weak password, and a
 * mix of at least (lowercase + uppercase/number) etc.
 */
export function isPasswordAcceptable(password = "") {
  const strength = getPasswordStrength(password);
  return strength === "medium" || strength === "strong";
}
