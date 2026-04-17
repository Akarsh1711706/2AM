// Content filter patterns for detecting personal info sharing

const PHONE_PATTERNS = [
  /\b\d{10}\b/,
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/,
  /\+\d{1,3}\s?\d{10}/,
  /\(\d{3}\)\s?\d{3}[-.\s]\d{4}/,
];

const SOCIAL_PATTERNS = [
  /\bmy\s+insta(?:gram)?\s+is\b/i,
  /\badd\s+me\s+on\s+(?:snap(?:chat)?|insta(?:gram)?|telegram|whatsapp|discord)\b/i,
  /\b@[a-zA-Z0-9._]+\b/,
  /\bsnap(?:chat)?\s*:\s*\w+/i,
  /\bdiscord\s*:\s*\w+/i,
  /\btelegram\s*:\s*@?\w+/i,
  /\bwhatsapp\s*me\b/i,
  /\bfollow\s+me\s+on\b/i,
  /\bmy\s+(?:number|phone|snap|insta|ig)\s+is\b/i,
];

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

export const containsPersonalInfo = (text: string): boolean => {
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  for (const pattern of SOCIAL_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  if (EMAIL_PATTERN.test(text)) return true;
  return false;
};

export const detectViolationType = (text: string): string | null => {
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(text)) return 'phone_number';
  }
  if (EMAIL_PATTERN.test(text)) return 'email';
  for (const pattern of SOCIAL_PATTERNS) {
    if (pattern.test(text)) return 'social_handle';
  }
  return null;
};
