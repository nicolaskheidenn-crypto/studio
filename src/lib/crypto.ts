/**
 * @fileOverview Sovereign Encryption Module (AES-GCM)
 * Provides military-grade client-side encryption for GoalCaps.
 */

const ENCRYPTION_KEY_PREFIX = "nd-vault-";

/**
 * Derives a deterministic key from the user's UID.
 * NOTE: In production, this should involve a user-provided passphrase.
 */
async function deriveKey(uid: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_KEY_PREFIX + uid),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("nd-salt-sovereign"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptVision(text: string, uid: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await deriveKey(uid);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptVision(encoded: string, uid: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encoded)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await deriveKey(uid);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return "Protocol Decryption Failure: Key Mismatch or Corrupted Block";
  }
}
