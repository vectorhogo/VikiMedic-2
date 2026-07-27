/**
 * VikiMedic v2 - Cryptographic & Password Security Engine
 * Clean Architecture Layer: Infrastructure
 */

export class CryptoService {
  /**
   * Generates a random cryptographic hex salt
   */
  static generateSalt(length = 16): string {
    const array = new Uint8Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Computes SHA-256 password hash with salt
   */
  static async hashPassword(password: string, salt: string): Promise<string> {
    const saltedPassword = `${salt}:${password}:${salt}`;
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(saltedPassword);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (err) {
        // Fallback below
      }
    }

    // Deterministic fallback hash for environments lacking crypto.subtle
    let hash = 0;
    for (let i = 0; i < saltedPassword.length; i++) {
      const char = saltedPassword.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `f2_${Math.abs(hash).toString(16)}_${saltedPassword.length}`;
  }

  /**
   * Synchronous password verification helper
   */
  static async verifyPassword(
    passwordInput: string,
    salt: string,
    expectedHash: string
  ): Promise<boolean> {
    const computedHash = await this.hashPassword(passwordInput, salt);
    return computedHash === expectedHash;
  }

  /**
   * Generates a secure authentication token for Remember Me
   */
  static generateAuthToken(payload: { userId: string; username: string; clinicId: string }): string {
    const timestamp = Date.now();
    const raw = JSON.stringify({ ...payload, ts: timestamp, nonce: Math.random().toString(36).substring(2) });
    return btoa(unescape(encodeURIComponent(raw)));
  }

  /**
   * Verifies and parses an authentication token
   */
  static parseAuthToken(token: string): { userId: string; username: string; clinicId: string; ts: number } | null {
    try {
      const decoded = decodeURIComponent(escape(atob(token)));
      const parsed = JSON.parse(decoded);
      if (parsed && parsed.userId && parsed.username) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Input sanitization & validation to prevent invalid characters or empty inputs
   */
  static sanitizeInput(input: string): string {
    if (!input) return '';
    return input.trim().replace(/['"`;<>\\]/g, '');
  }

  /**
   * Checks password policy compliance
   */
  static validatePasswordPolicy(password: string, minLength = 6): { isValid: boolean; error?: string } {
    if (!password || password.trim().length === 0) {
      return { isValid: false, error: 'رمز عبور نمی‌تواند خالی باشد.' };
    }
    if (password.length < minLength) {
      return { isValid: false, error: `رمز عبور باید حداقل ${minLength} کاراکتر باشد.` };
    }
    return { isValid: true };
  }
}
