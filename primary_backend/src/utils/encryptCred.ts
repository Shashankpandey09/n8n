// Simple encrypt/decrypt using libsodium secretbox (XSalsa20-Poly1305).
import sodium from 'libsodium-wrappers';

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


