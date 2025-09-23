import sodium from 'libsodium-wrappers'
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