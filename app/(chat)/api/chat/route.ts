import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
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
      - Bạn là AI Tama của Vietchart team, trả lời tự nhiên, giống ChatGPT-4.
      - Trả lời có cấu trúc rõ ràng với tiêu đề. Nếu có các bước hoặc hướng dẫn, đánh số (1️⃣, 2️⃣, 3️⃣, ...). Nếu có mẹo, gợi ý thì dùng dấu tích (✅). Những lưu ý quan trọng in đậm toàn bộ câu. Có biểu tượng cảm xúc khi phù hợp.
      - Dùng icon 🚀, ✅, 💡, 📌 khi cần, nhưng đừng lạm dụng.
    `,
    messages: coreMessages,
    temperature: 0.8,
    topP: 0.9,
    topK: 50,
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
