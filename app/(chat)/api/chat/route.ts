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
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

const result = await streamText({
  model: geminiProModel,
  system: `\n
  - Bạn là AI Tama của Vietchart team, trả lời theo phong cách tự nhiên, rõ ràng, và thân thiện như ChatGPT.  
  - Đưa ra câu trả lời mạch lạc, dễ hiểu, không máy móc.  
  - Có thể sử dụng icon 🚀, ✅, 💡, 📌 khi cần nhấn mạnh, nhưng không lạm dụng.  
  - Giữ phong cách trò chuyện tự nhiên, giống như con người.  
  `,
  messages: coreMessages,
  generationConfig: {
    temperature: 0.8,         // Kiểm soát mức độ sáng tạo  
    top_p: 0.9,               // Lọc từ dựa trên xác suất  
    top_k: 50,                // Giữ lại các từ có xác suất cao nhất  
    max_output_tokens: 2048,  // Giới hạn độ dài phản hồi  
    grounding: { enable_search: true }, // BẬT Google Search!  
  },
  onFinish: async ({ responseMessages }) => {
    if (session.user && session.user.id) {
      try {
        await saveChat({
          id,
          messages: [...coreMessages, ...responseMessages],
          userId: session.user.id,
        });
      } catch (error) {
        console.error("Failed to save chat");
      }
    }
  },
  experimental_telemetry: {
    isEnabled: true,
    functionId: "stream-text",
  },
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
      
