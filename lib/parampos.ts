/**
 * ParamPOS (TurkPos) entegrasyonu - https://dev.param.com.tr/dosya/integration-document.pdf
 * TP_WMD_UCD: 3D ödeme başlat → UCD_HTML döner
 * TP_WMD_Pay: 3D doğrulama sonrası tahsilatı tamamla
 */

import { createHash } from "crypto";

const PARAMPOS_TEST = process.env.PARAMPOS_TEST === "1";
const BASE_URL = PARAMPOS_TEST
  ? "https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx"
  : "https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx";

/** Islem_Hash: SHA256 + Base64 (SHA2B64). TP_WMD_UCD için: CLIENT_CODE & GUID & Taksit & Islem_Tutar & Toplam_Tutar & Siparis_ID */
export function sha2B64(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("base64");
}

/** Callback hash doğrulama: islemGUID + md + mdStatus + orderId + GUID (lowercase). SHA1 + Base64 */
export function verifyCallbackHash(
  islemGUID: string,
  md: string,
  mdStatus: string,
  orderId: string,
  guid: string
): string {
  const str = islemGUID + md + mdStatus + orderId + guid.toLowerCase();
  return createHash("sha1").update(str, "utf8").digest("base64");
}

export type ParamPosConfig = {
  clientCode: string;
  clientUsername: string;
  clientPassword: string;
  guid: string;
};

function getConfig(): ParamPosConfig {
  const clientCode = process.env.PARAMPOS_CLIENT_CODE;
  const clientUsername = process.env.PARAMPOS_CLIENT_USERNAME;
  const clientPassword = process.env.PARAMPOS_CLIENT_PASSWORD;
  const guid = process.env.PARAMPOS_GUID;
  if (!clientCode || !clientUsername || !clientPassword || !guid) {
    throw new Error("ParamPOS env eksik: PARAMPOS_CLIENT_CODE, PARAMPOS_CLIENT_USERNAME, PARAMPOS_CLIENT_PASSWORD, PARAMPOS_GUID");
  }
  return { clientCode, clientUsername, clientPassword, guid };
}

/** Tutar virgüllü format: 99,00 veya 29,00 */
export function formatAmount(tl: number): string {
  return tl.toFixed(2).replace(".", ",");
}

export type TP_WMD_UCDParams = {
  plan: "pro" | "onetime";
  siparisId: string;
  islemTutar: string;   // virgüllü "99,00"
  toplamTutar: string;  // virgüllü, komisyon dahil (komisyon 0 ise = islemTutar)
  basariliUrl: string;
  hataUrl: string;
  ipAdr: string;
  refUrl: string;
  kkSahibi: string;
  kkNo: string;
  kkSkAy: string;   // "04"
  kkSkYil: string; // "28"
  kkCvc: string;
  kkSahibiGsm: string; // 10 hane, başında 0 olmadan
  siparisAciklama: string;
};

/** TP_WMD_UCD çağrısı - 3D ödeme başlat. Islem_Hash = CLIENT_CODE & GUID & Taksit & Islem_Tutar & Toplam_Tutar & Siparis_ID */
export async function tpWmdUcd(params: TP_WMD_UCDParams): Promise<{
  sonuc: number;
  sonucStr: string;
  ucdHtml: string | null;
  ucdMd: string | null;
  islemId: number;
  islemGuid: string | null;
}> {
  const { clientCode, clientUsername, clientPassword, guid } = getConfig();
  const taksit = "1";
  const islemGuvenlikStr = clientCode + guid + taksit + params.islemTutar + params.toplamTutar + params.siparisId;
  const islemHash = sha2B64(islemGuvenlikStr);

  const inner = `
  <G>
    <CLIENT_CODE>${escapeXml(clientCode)}</CLIENT_CODE>
    <CLIENT_USERNAME>${escapeXml(clientUsername)}</CLIENT_USERNAME>
    <CLIENT_PASSWORD>${escapeXml(clientPassword)}</CLIENT_PASSWORD>
  </G>
  <GUID>${escapeXml(guid)}</GUID>
  <KK_Sahibi>${escapeXml(params.kkSahibi)}</KK_Sahibi>
  <KK_No>${escapeXml(params.kkNo)}</KK_No>
  <KK_SK_Ay>${escapeXml(params.kkSkAy)}</KK_SK_Ay>
  <KK_SK_Yil>${escapeXml(params.kkSkYil)}</KK_SK_Yil>
  <KK_CVC>${escapeXml(params.kkCvc)}</KK_CVC>
  <KK_Sahibi_GSM>${escapeXml(params.kkSahibiGsm)}</KK_Sahibi_GSM>
  <Hata_URL>${escapeXml(params.hataUrl)}</Hata_URL>
  <Basarili_URL>${escapeXml(params.basariliUrl)}</Basarili_URL>
  <Siparis_ID>${escapeXml(params.siparisId)}</Siparis_ID>
  <Siparis_Aciklama>${escapeXml(params.siparisAciklama)}</Siparis_Aciklama>
  <Taksit>${taksit}</Taksit>
  <Islem_Tutar>${params.islemTutar}</Islem_Tutar>
  <Toplam_Tutar>${params.toplamTutar}</Toplam_Tutar>
  <Islem_Hash>${escapeXml(islemHash)}</Islem_Hash>
  <Islem_Guvenlik_Tip>3D</Islem_Guvenlik_Tip>
  <IPAdr>${escapeXml(params.ipAdr)}</IPAdr>
  <Ref_URL>${escapeXml(params.refUrl)}</Ref_URL>`;

  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <TP_WMD_UCD xmlns="https://turkpos.com.tr/">${inner}
    </TP_WMD_UCD>
  </soap:Body>
</soap:Envelope>`;

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "https://turkpos.com.tr/TP_WMD_UCD",
    },
    body: envelope,
  });

  const text = await res.text();
  return parseTP_WMD_UCDResponse(text);
}

function escapeXml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function parseTP_WMD_UCDResponse(xml: string): {
  sonuc: number;
  sonucStr: string;
  ucdHtml: string | null;
  ucdMd: string | null;
  islemId: number;
  islemGuid: string | null;
} {
  const getTag = (tag: string): string | null => {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const i = xml.indexOf(open);
    if (i === -1) return null;
    const j = xml.indexOf(close, i);
    if (j === -1) return null;
    let raw = xml.slice(i + open.length, j).trim();
    if (raw.includes("<![CDATA[")) {
      const cdata = raw.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
      raw = cdata;
    }
    return raw;
  };
  const getNum = (tag: string): number => {
    const v = getTag(tag);
    return v ? parseInt(v, 10) || 0 : 0;
  };
  return {
    sonuc: getNum("Sonuc"),
    sonucStr: getTag("Sonuc_Str") || "",
    ucdHtml: getTag("UCD_HTML"),
    ucdMd: getTag("UCD_MD"),
    islemId: getNum("Islem_ID"),
    islemGuid: getTag("Islem_GUID"),
  };
}

/** TP_WMD_Pay - 3D doğrulama sonrası tahsilatı tamamla */
export async function tpWmdPay(
  ucdMd: string,
  islemGuid: string,
  siparisId: string
): Promise<{ sonuc: number; sonucAck: string; dekontId: number; bankaSonucKod: number }> {
  const { clientCode, clientUsername, clientPassword, guid } = getConfig();

  const soapBody = `
  <G>
    <CLIENT_CODE>${escapeXml(clientCode)}</CLIENT_CODE>
    <CLIENT_USERNAME>${escapeXml(clientUsername)}</CLIENT_USERNAME>
    <CLIENT_PASSWORD>${escapeXml(clientPassword)}</CLIENT_PASSWORD>
  </G>
  <GUID>${escapeXml(guid)}</GUID>
  <UCD_MD>${escapeXml(ucdMd)}</UCD_MD>
  <Islem_GUID>${escapeXml(islemGuid)}</Islem_GUID>
  <Siparis_ID>${escapeXml(siparisId)}</Siparis_ID>`;

  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <TP_WMD_Pay xmlns="https://turkpos.com.tr/">${soapBody}</TP_WMD_Pay>
  </soap:Body>
</soap:Envelope>`;

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: "https://turkpos.com.tr/TP_WMD_Pay",
    },
    body: envelope,
  });

  const text = await res.text();
  return parseTP_WMD_PayResponse(text);
}

function parseTP_WMD_PayResponse(xml: string): {
  sonuc: number;
  sonucAck: string;
  dekontId: number;
  bankaSonucKod: number;
} {
  const getTag = (tag: string): string | null => {
    const open = `<${tag}>`;
    const close = `</${tag}>`;
    const i = xml.indexOf(open);
    if (i === -1) return null;
    const j = xml.indexOf(close, i);
    if (j === -1) return null;
    return xml.slice(i + open.length, j).trim();
  };
  const getNum = (tag: string): number => {
    const v = getTag(tag);
    return v ? parseInt(v, 10) || 0 : 0;
  };
  return {
    sonuc: getNum("Sonuc"),
    sonucAck: getTag("Sonuc_Ack") || "",
    dekontId: getNum("Dekont_ID"),
    bankaSonucKod: getNum("Bank_Sonuc_Kod") || getNum("Banka_Sonuc_Kod"),
  };
}

export function isParamPosConfigured(): boolean {
  return !!(
    process.env.PARAMPOS_CLIENT_CODE &&
    process.env.PARAMPOS_CLIENT_USERNAME &&
    process.env.PARAMPOS_CLIENT_PASSWORD &&
    process.env.PARAMPOS_GUID
  );
}
