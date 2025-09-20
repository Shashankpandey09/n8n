// Simple encrypt/decrypt using libsodium secretbox (XSalsa20-Poly1305).
import sodium from 'libsodium-wrappers';

// call init() once at app start
export async function init() { await sodium.ready;}
export function encryptObjectWithKeyBase64(keyBase64:any, obj:any) {
  const key = Buffer.from(keyBase64, 'base64'); // Uint8Array OK too
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const cipher = sodium.crypto_secretbox_easy(plaintext, nonce, key); // ciphertext includes MAC
  // pack nonce || cipher into one buffer and base64 it
  const out = Buffer.concat([Buffer.from(nonce), Buffer.from(cipher)]);
  return out.toString('base64');
}

// decrypt base64 blob with keyBase64 -> returns JS object
export function decryptObjectWithKeyBase64(keyBase64:any, blobBase64:any) {
  const key = Buffer.from(keyBase64, 'base64');
  const raw = Buffer.from(blobBase64, 'base64');
  const nonceLen = sodium.crypto_secretbox_NONCEBYTES;
  const nonce = raw.subarray(0, nonceLen);     // view into buffer (no copy)
  const cipher = raw.subarray(nonceLen);       // rest is ciphertext+MAC
  // libsodium returns null/false on failure
  const plaintext = sodium.crypto_secretbox_open_easy(cipher, nonce, key);
  if (!plaintext) throw new Error('Decryption failed: wrong key or tampered data');
  return JSON.parse(Buffer.from(plaintext).toString('utf8'));
}
