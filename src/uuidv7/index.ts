// type for UUIDv7
export type UUIDv7 = string & { readonly __brand: unique symbol };

let lastTimestamp = 0n,
    counter = 0n;

/**
 * Generate a UUIDv7 (time-ordered, monotonic).
 * RFC 9562: https://www.rfc-editor.org/rfc/rfc9562.html
 */
export const uuidv7 = (): UUIDv7 => {
  const bytes = new Uint8Array(16);

  // 1. Current Unix time in ms
  let ms = BigInt(Date.now());

  // Ensure monotonic order for same-millisecond calls
  if (ms === lastTimestamp) {
    counter++;
  } else {
    counter = 0n;
    lastTimestamp = ms;
  }

  ms = ms + counter;

  // Store 48-bit timestamp
  bytes[0] = Number((ms >> 40n) & 0xffn);
  bytes[1] = Number((ms >> 32n) & 0xffn);
  bytes[2] = Number((ms >> 24n) & 0xffn);
  bytes[3] = Number((ms >> 16n) & 0xffn);
  bytes[4] = Number((ms >> 8n) & 0xffn);
  bytes[5] = Number(ms & 0xffn);

  // 2. Fill remaining 10 bytes with random values
  crypto.getRandomValues(bytes.subarray(6));

  // 3. Set version (UUIDv7 = 0111)
  bytes[6] = (bytes[6] & 0x0f) | 0x70;

  // 4. Set variant (RFC 4122 = 10xx)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // 5. Convert to UUID string
  const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");

  return (
    hex.substring(0, 8) +
    "-" +
    hex.substring(8, 12) +
    "-" +
    hex.substring(12, 16) +
    "-" +
    hex.substring(16, 20) +
    "-" +
    hex.substring(20)
  ) as UUIDv7;
}
