/**
 * Cryptographic utility functions for the UcIDM DApp
 * Uses Web Crypto API for real cryptographic operations
 */

/** Generate a SHA-256 hash of the input string */
export async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

/** Convert ArrayBuffer to hex string */
export function bufferToHex(buffer) {
  return "0x" + Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate an ECDSA key pair (simulates Bob's pk_U / sk_U) */
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: bufferToHex(publicKeyRaw),
    privateKeyJwk: privateKeyJwk,
    publicKeyShort: bufferToHex(publicKeyRaw).slice(0, 20) + "...",
    keyPair: keyPair
  };
}

/** Generate a cryptographic commitment (simulates cmmit_{attr, pk_U}) */
export async function generateCommitment(attribute, publicKey) {
  const nonce = crypto.getRandomValues(new Uint8Array(32));
  const nonceHex = bufferToHex(nonce.buffer);
  const commitment = await sha256(attribute + publicKey + nonceHex);
  return { commitment, nonce: nonceHex };
}

/** Simulate ZKP generation (Groth16-style proof object) */
export async function generateZKProof(attribute, commitment, publicKey) {
  // Simulate proof generation delay
  await sleep(1500);

  const proofA = await sha256("proof_a_" + commitment + Date.now());
  const proofB = await sha256("proof_b_" + attribute + Date.now());
  const proofC = await sha256("proof_c_" + publicKey + Date.now());
  const proofHash = await sha256(proofA + proofB + proofC);

  return {
    pi: {
      a: proofA.slice(0, 22) + "...",
      b: proofB.slice(0, 22) + "...",
      c: proofC.slice(0, 22) + "..."
    },
    proofHash: proofHash,
    protocol: "groth16",
    curve: "bn128",
    verified: true
  };
}

/** Simulate digital signature */
export async function signData(data, keyPair) {
  if (keyPair && keyPair.privateKey) {
    const encoder = new TextEncoder();
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      keyPair.privateKey,
      encoder.encode(data)
    );
    return bufferToHex(signature);
  }
  // Fallback simulation
  return await sha256("sig_" + data + Date.now());
}

/** Generate a random bytes32 value */
export function randomBytes32() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bufferToHex(bytes.buffer);
}

/** Sleep utility */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Format an address for display */
export function formatAddress(address) {
  if (!address) return "0x0000...0000";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

/** Format a bytes32 hash for display */
export function formatHash(hash) {
  if (!hash) return "0x0000...0000";
  return hash.slice(0, 10) + "..." + hash.slice(-8);
}

/** Generate a simulated Merkle tree path */
export function generateMerklePath(leaf, depth = 4) {
  const path = [leaf];
  let current = leaf;
  for (let i = 0; i < depth; i++) {
    const sibling = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    path.push({ node: current, sibling, direction: Math.random() > 0.5 ? "left" : "right" });
    current = sibling;
  }
  return path;
}
