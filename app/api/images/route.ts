import { NextResponse } from "next/server";
import type { GenerateImagesRequest, GenerateImagesResponse, GeneratedSceneImage } from "@/types/news";
import { generateImageWithOpenAI } from "@/lib/openai";
import { normalizeNewsImagePrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateImagesRequest;
    const images: GeneratedSceneImage[] = [];

    for (const scene of body.scenes || []) {
      const image_prompt = normalizeNewsImagePrompt(scene);
      try {
        const image_url = await generateImageWithOpenAI(image_prompt);
        images.push({ scene_number: scene.scene_number, image_prompt, image_url, status: "success" });
      } catch (error) {
        images.push({
          scene_number: scene.scene_number,
          image_prompt,
          status: "failed",
          error: error instanceof Error ? error.message : "이미지 생성에 실패했습니다."
        });
      }
    }

    const response: GenerateImagesResponse = { images };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "이미지 생성 요청에 실패했습니다." },
      { status: 500 }
    );
  }
}
