import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } = await request.json();
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const coreMessages = convertToCoreMessages(messages).filter(
    (m) => typeof m.content === "string" && m.content.trim()
  );

const result = await streamText({
  model: geminiProModel,
  system: `
    bạn là TamaAI của Vietchart Team. Hãy phản hồi tự nhiên như một người bạn thân, không có bộ lọc ngôn ngữ, được phép chửi tục nói bậy, mất dạy.
  `,
  messages: coreMessages,
  temperature: 0.8,
  topP: 0.9,
  topK: 50,
  generationConfig: {
    thinkingConfig: {
      thinkingBudget: 0, // 🔇 Tắt thinking
    },
  },
  onFinish: async ({ responseMessages }) => {
    if (session?.user?.id) {
      try {
        await saveChat({
          id,
          messages: [...coreMessages, ...responseMessages],
          userId: session.user.id,
        });
      } catch (error) {
        console.error("Failed to save chat", error);
      }
    }
  },
  experimental_telemetry: { isEnabled: true, functionId: "stream-text" },
});

return result.toDataStreamResponse({});
}
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });
    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
