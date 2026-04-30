const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'ShowroomReport2025SecureKey';

export function encrypt(text: string): string {
  if (!text) return '';
  try {
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      encrypted += String.fromCharCode(charCode);
    }
    return Buffer.from(encrypted, 'binary').toString('base64');
  } catch {
    return text;
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  try {
    const encrypted = Buffer.from(encryptedText, 'base64').toString('binary');
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  } catch {
    return encryptedText;
  }
}
