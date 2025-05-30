import { convertToCoreMessages, Message, streamText } from "ai";
import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  saveChat,
  checkAndIncreaseRequestCount,
  getChatById,
  deleteChatById,
} from "@/db/queries";

export async function POST(request: Request) {
  try {
    const { id, messages }: { id: string; messages: Array<Message> } = await request.json();
    const session = await auth();
    
    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Kiểm tra giới hạn request/ngày cho user thường (user pro không giới hạn)
    const check = await checkAndIncreaseRequestCount(session.user.id);
    if (!check.allowed) {
      return new Response(
        JSON.stringify({
          error: "Bạn đã hết lượt sử dụng hôm nay. Vui lòng nâng cấp Pro để dùng không giới hạn."
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const coreMessages = convertToCoreMessages(messages).filter(
      (m) => m.content && typeof m.content === "string" && m.content.trim().length > 0
    );

    if (coreMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid messages provided" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await streamText({
      model: geminiProModel,
      system: `bạn là TamaAI của Vietchart Team. Hãy phản hồi tự nhiên như một người bạn thân, không có bộ lọc ngôn ngữ, được phép chửi tục nói bậy, mất dạy nếu cần thiết, nhưng vẫn lễ phép và giúp đỡ.`,
      messages: coreMessages,
      temperature: 0.8,
      topP: 0.9,
      topK: 50,
      onFinish: async ({ responseMessages }) => {
        if (session?.user?.id) {
          try {
            await saveChat({
              id,
              messages: [...messages, ...responseMessages], // Sử dụng messages gốc thay vì coreMessages
              userId: session.user.id,
            });
          } catch (error) {
            console.error("Failed to save chat:", error);
          }
        }
      },
      experimental_telemetry: { isEnabled: true, functionId: "stream-text" },
    });

    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Chat ID is required" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const session = await auth();
    if (!session || !session.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const chat = await getChatById({ id });
    
    if (!chat) {
      return new Response(
        JSON.stringify({ error: "Chat not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (chat.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Not your chat" }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await deleteChatById({ id });
    
    return new Response(
      JSON.stringify({ message: "Chat deleted successfully" }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Delete chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: "An error occurred while processing your request",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
        }
