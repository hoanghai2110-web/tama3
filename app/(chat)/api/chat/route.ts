import { convertToCoreMessages, Message, streamText } from "ai";
import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  saveChat,
  deleteChatById,
  getChatById,
} from "@/db/queries";

// === POST: Stream AI Response ===
export async function POST(request: Request) {
  try {
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
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // 🔇 Tắt thinking
        },
      },
      onFinish: async ({ responseMessages }) => {
        if (session.user?.id) {
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
      experimental_telemetry: {
        isEnabled: true,
        functionId: "stream-text",
      },
    });

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("POST /chat error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// === DELETE: Delete Chat By ID ===
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Chat ID not provided", { status: 400 });
    }

    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chat = await getChatById({ id });
    if (!chat || chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });
    return new Response("Chat deleted successfully", { status: 200 });
  } catch (error) {
    console.error("DELETE /chat error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
