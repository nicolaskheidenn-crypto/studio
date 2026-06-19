/**
 * @fileOverview Sovereign Encryption Module (AES-GCM)
 * Provides military-grade client-side encryption for GoalCaps.
 */

const ENCRYPTION_KEY_PREFIX = "nd-vault-";

/**
 * Helper to convert ArrayBuffer to Base64 string safely.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Helper to convert Base64 string back to Uint8Array safely.
 */
function base64ToUint8(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a deterministic key from the user's UID.
 */
async function deriveKey(uid: string): Promise<CryptoKey> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error("Secure Context Breach: Cryptographic hardware is unavailable. Ensure you are accessing via HTTPS or Localhost.");
  }

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
  
  return bufferToBase64(combined.buffer);
}

export async function decryptVision(encoded: string, uid: string): Promise<string> {
  try {
    const combined = base64ToUint8(encoded);
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await deriveKey(uid);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (e: any) {
    console.error("[SOVEREIGN CRYPTO] Decryption Error:", e);
    return `Protocol Decryption Failure: ${e.message || "Key Mismatch or Corrupted Block"}`;
  }
}