import './crypto-polyfill';
import * as crypto from "crypto-js";

export interface MFACodeType {
  id: number;
  code: string;
  secret: string;
  algo: "SHA1" | "SHA256" | "SHA512";
  digits: number;
}
export interface TimeStampMFACodeType extends MFACodeType {
  timeStamp: number;
  interval: number;
}
export interface NonceMFACodeType extends MFACodeType {
  nonce: string;
}

export class TimeStampMFACodeSer implements TimeStampMFACodeType {
  id: number;
  code: string;
  secret: string;
  algo: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  timeStamp: number;
  interval: number;

  constructor(
    id: number,
    code: string,
    secret: string,
    algo: "SHA1" | "SHA256" | "SHA512",
    digits: number,
    timeStamp: number,
    interval: number,
  ) {
    this.id = id;
    this.code = code;
    this.secret = secret;
    this.digits = digits;
    this.timeStamp = timeStamp;
    this.interval = interval;
    this.algo = algo;
  }

  private getCounter(time:number){
    return Math.floor(time/(1000*this.interval));
  }
  private counterToWordArray(counter: number) {
    const hex = counter.toString(16).padStart(16, "0"); // 16 hex chars = 8 bytes
    return crypto.enc.Hex.parse(hex);
  }

  private hmac(counter: CryptoJS.lib.WordArray) {
    switch (this.algo) {
      case "SHA256":
        return crypto.HmacSHA256(counter, this.secret);
      case "SHA512":
        return crypto.HmacSHA512(counter, this.secret);
      default:
        return crypto.HmacSHA1(counter, this.secret);
    }
  }
  async generateCode(time:number=Date.now()) {
    const counter = this.getCounter(time);
    const counterWordArray:crypto.lib.WordArray = this.counterToWordArray(counter);
    const hmac:crypto.lib.WordArray = this.hmac(counterWordArray);
    const hmacHex:string = crypto.enc.Hex.stringify(hmac);
    const offset:number = parseInt(hmacHex.slice(-1), 16);

    const binary =
      (parseInt(hmacHex.slice(offset * 2, offset * 2 + 2), 16) & 0x7f) << 24 |
      (parseInt(hmacHex.slice(offset * 2 + 2, offset * 2 + 4), 16) & 0xff) << 16 |
      (parseInt(hmacHex.slice(offset * 2 + 4, offset * 2 + 6), 16) & 0xff) << 8 |
      (parseInt(hmacHex.slice(offset * 2 + 6, offset * 2 + 8), 16) & 0xff);

    const otp = (binary % 10 ** this.digits).toString().padStart(this.digits, "0");

    return otp;
  }
}


export class NonceMFACodeSer implements NonceMFACodeType {
  id: number;
  code: string;
  secret: string;
  algo: "SHA1" | "SHA256" | "SHA512";
  digits: number;
  nonce: string;

  constructor(
    id: number,
    code: string,
    secret: string,
    algo: "SHA1" | "SHA256" | "SHA512",
    digits: number,
    nonce: string,
  ) {
    this.id = id;
    this.code = code;
    this.secret = secret;
    this.algo = algo;
    this.digits = digits;
    this.nonce = nonce;
  }

  private nonceToWordArray(nonce: string) {
    // Treat nonce as hex (preferred) or utf8
    if (/^[0-9a-fA-F]+$/.test(nonce)) {
      return crypto.enc.Hex.parse(nonce.padStart(16, "0"));
    }
    return crypto.enc.Utf8.parse(nonce);
  }

  private hmac(input: CryptoJS.lib.WordArray) {
    switch (this.algo) {
      case "SHA256":
        return crypto.HmacSHA256(input, this.secret);
      case "SHA512":
        return crypto.HmacSHA512(input, this.secret);
      default:
        return crypto.HmacSHA1(input, this.secret);
    }
  }

  generateCode(): string {
    const input = this.nonceToWordArray(this.nonce);
    const hmac = this.hmac(input);
    const hmacHex = crypto.enc.Hex.stringify(hmac);

    const offset = parseInt(hmacHex.slice(-1), 16);

    const binary =
      (parseInt(hmacHex.slice(offset * 2, offset * 2 + 2), 16) & 0x7f) << 24 |
      (parseInt(hmacHex.slice(offset * 2 + 2, offset * 2 + 4), 16) & 0xff) << 16 |
      (parseInt(hmacHex.slice(offset * 2 + 4, offset * 2 + 6), 16) & 0xff) << 8 |
      (parseInt(hmacHex.slice(offset * 2 + 6, offset * 2 + 8), 16) & 0xff);

    return (binary % 10 ** this.digits)
      .toString()
      .padStart(this.digits, "0");
  }
}