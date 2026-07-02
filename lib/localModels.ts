import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { generateImageWithOpenAI, hasOpenAIKey } from "@/lib/openaiMedia";

type LocalImageResponse = {
  image_url?: string;
  output_path?: string;
  error?: string;
};

type LocalTTSResponse = {
  audio_url?: string;
  output_path?: string;
  error?: string;
};

type LocalModelError = {
  detail?: unknown;
  error?: string;
};

const DEFAULT_LOCAL_MODEL_SERVICE_URL = "http://127.0.0.1:8001";
const LOCAL_IMAGE_OUTPUT_DIR = path.join(process.cwd(), "public", "static", "output", "uploads");

function getLocalModelServiceUrl() {
  return (process.env.LOCAL_MODEL_SERVICE_URL || DEFAULT_LOCAL_MODEL_SERVICE_URL).replace(/\/$/, "");
}

function getLocalImageApiUrl() {
  const raw = process.env.LOCAL_IMAGE_API_URL?.trim().replace(/\/$/, "");
  if (!raw) return "";
  if (raw.endsWith("/generate")) return raw;
  if (raw.endsWith("/images")) return raw.replace(/\/images$/, "/generate");
  return `${raw}/generate`;
}

async function postLocalModel<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getLocalModelServiceUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const raw = await response.text();
  const payload: T & LocalModelError = raw ? (JSON.parse(raw) as T & LocalModelError) : ({} as T & LocalModelError);

  if (!response.ok) {
    throw new Error(formatLocalModelError(payload, raw));
  }

  return payload;
}

function formatLocalModelError(payload: LocalModelError | null | undefined, raw: string) {
  if (!payload) return raw || "로컬 모델 서비스 요청에 실패했습니다.";
  if (payload.error) return payload.error;
  if (typeof payload.detail === "string") return payload.detail;
  if (payload.detail) return JSON.stringify(payload.detail);
  return raw || "로컬 모델 서비스 요청에 실패했습니다.";
}

export async function generateImageWithLocalModel(prompt: string) {
  const externalImageUrl = getLocalImageApiUrl();
  if (externalImageUrl) {
    try {
      const response = await fetch(externalImageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const raw = await response.text();
        const payload = tryParseJson<LocalImageResponse & LocalModelError>(raw);
        throw new Error(formatLocalModelError(payload, raw));
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("image/") || contentType.includes("application/octet-stream")) {
        const buffer = Buffer.from(await response.arrayBuffer());
        return await saveGeneratedImage(buffer, contentType);
      }

      const raw = await response.text();
      const payload = tryParseJson<LocalImageResponse & LocalModelError>(raw);
      if (payload?.image_url) {
        return payload.image_url;
      }
    } catch {
      // Fall through to other backends.
    }
  }

  try {
    const payload = await postLocalModel<LocalImageResponse>("/images", { prompt });
    if (payload.image_url) {
      return payload.image_url;
    }
  } catch {
    // Fall through to OpenAI fallback when available.
  }

  if (hasOpenAIKey()) {
    return generateImageWithOpenAI(prompt);
  }

  throw new Error("사용 가능한 이미지 생성 백엔드가 없습니다.");
}

async function saveGeneratedImage(buffer: Buffer, contentType: string) {
  await mkdir(LOCAL_IMAGE_OUTPUT_DIR, { recursive: true });
  const extension = contentType.includes("png") ? "png" : contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
  const fileName = `${randomUUID()}.${extension}`;
  const filePath = path.join(LOCAL_IMAGE_OUTPUT_DIR, fileName);
  await writeFile(filePath, buffer);
  return `/static/output/uploads/${fileName}`;
}

function tryParseJson<T>(raw: string): T | null {
  try {
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function generateSpeechWithLocalModel(text: string, voice?: string) {
  const payload = await postLocalModel<LocalTTSResponse>("/tts", { text, voice });
  if (!payload.audio_url) {
    throw new Error(payload.error || "로컬 TTS 생성 결과가 비어 있습니다.");
  }
  return payload.audio_url;
}
