
import CryptoJS from "crypto-js";

const SECRET_KEY = "my-super-secret-key"; 


export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};


export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    console.error("Decryption error:", err);
    return null;
  }
};
