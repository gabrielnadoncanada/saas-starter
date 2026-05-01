import "server-only";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export type GmailMessageHeader = { name: string; value: string };

export type GmailMessagePayload = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailMessageHeader[];
  body?: { size?: number; data?: string };
  parts?: GmailMessagePayload[];
};

export type GmailMessage = {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePayload;
};

export type GmailMessageListItem = { id: string; threadId: string };

export type GmailListResponse = {
  messages?: GmailMessageListItem[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

async function gmailFetch(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${GMAIL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

async function gmailJson<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await gmailFetch(accessToken, path, init);
  if (!res.ok) {
    const text = await res.text();
    throw new GmailApiError(res.status, `Gmail API ${path} failed: ${text}`);
  }
  return (await res.json()) as T;
}

class GmailApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GmailApiError";
    this.status = status;
  }
}

export async function listMessages(
  accessToken: string,
  options: { query?: string; pageToken?: string; maxResults?: number } = {},
): Promise<GmailListResponse> {
  const params = new URLSearchParams();
  if (options.query) params.set("q", options.query);
  if (options.pageToken) params.set("pageToken", options.pageToken);
  params.set("maxResults", String(options.maxResults ?? 25));
  return gmailJson<GmailListResponse>(
    accessToken,
    `/messages?${params.toString()}`,
  );
}

export async function getMessage(
  accessToken: string,
  messageId: string,
): Promise<GmailMessage> {
  return gmailJson<GmailMessage>(
    accessToken,
    `/messages/${messageId}?format=full`,
  );
}

export async function getProfile(
  accessToken: string,
): Promise<{ emailAddress: string; historyId?: string }> {
  return gmailJson(accessToken, "/profile");
}

export async function sendRawMessage(
  accessToken: string,
  rawBase64Url: string,
  threadId?: string,
): Promise<{ id: string; threadId: string }> {
  return gmailJson(accessToken, "/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw: rawBase64Url, threadId }),
  });
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function findHeader(
  headers: GmailMessageHeader[] | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  return headers.find((h) => h.name.toLowerCase() === lower)?.value;
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractPlainText(payload: GmailMessagePayload | undefined): string {
  if (!payload) return "";
  const queue: GmailMessagePayload[] = [payload];
  let plain = "";
  let html = "";
  while (queue.length > 0) {
    const part = queue.shift()!;
    if (part.parts && part.parts.length > 0) {
      queue.push(...part.parts);
      continue;
    }
    const data = part.body?.data;
    if (!data) continue;
    const text = decodeBase64Url(data);
    if (part.mimeType === "text/plain" && !plain) plain = text;
    else if (part.mimeType === "text/html" && !html) html = text;
  }
  if (plain) return plain.trim();
  if (html) return stripHtml(html);
  return "";
}

export function buildRawMimeMessage(input: {
  from: string;
  to: string;
  subject: string;
  bodyText: string;
  inReplyTo?: string;
  references?: string;
}): string {
  const headers = [
    `From: ${input.from}`,
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];
  if (input.inReplyTo) headers.push(`In-Reply-To: ${input.inReplyTo}`);
  if (input.references) headers.push(`References: ${input.references}`);
  const message = `${headers.join("\r\n")}\r\n\r\n${input.bodyText}`;
  return encodeBase64Url(message);
}
