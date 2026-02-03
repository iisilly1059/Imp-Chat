
export class CryptoService {
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  static async exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  static async importPublicKey(keyData: string): Promise<CryptoKey> {
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    return window.crypto.subtle.importKey(
      "spki",
      binaryKey,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );
  }

  static async encrypt(text: string, publicKey: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      enc.encode(text)
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  static async decrypt(encryptedData: string, privateKey: CryptoKey): Promise<string> {
    const dec = new TextDecoder();
    const binaryData = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      binaryData
    );
    return dec.decode(decrypted);
  }
}
