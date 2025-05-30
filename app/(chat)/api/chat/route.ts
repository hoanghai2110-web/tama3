import type { Message } from "ai";
import {
  saveChat,
  checkAndIncreaseRequestCount,
  getChatById,
  deleteChatById,
} from "@/db/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, messages }: { id: string; messages: Array<Message> } = body;
    
    if (!id || !messages || !Array.isArray(messages)) {
      return new Response("Invalid request body", { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Kiểm tra giới hạn request/ngày cho user thường (user pro không giới hạn)
    const check = await checkAndIncreaseRequestCount(session.user.id);
    if (!check.allowed) {
      return new Response(
        "Bạn đã hết lượt sử dụng hôm nay. Vui lòng nâng cấp Pro để dùng không giới hạn.",
        { status: 429 }
      );
    }

    const coreMessages = convertToCoreMessages(messages).filter(
      (m) => {
        if (typeof m.content === "string") {
          return m.content.trim().length > 0;
        }
        // Keep non-string content (images, etc.)
        return m.content != null;
      }
    );

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

    // SỬA TẠI ĐÂY: Trả về toàn bộ history mới nhất sau khi lưu (sau khi onFinish hoàn thành)
    // Tuy nhiên, vì streamText trả về response dạng stream, nên không thể chờ trực tiếp history.
    // Giải pháp: BỔ SUNG API GET để client gọi lại lấy messages mới nhất

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("API Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// BỔ SUNG API GET để lấy lại lịch sử chat theo id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return new Response("Missing id", { status: 400 });
    const chat = await getChatById({ id });
    if (!chat) return new Response("Not found", { status: 404 });

    return Response.json({ messages: chat.messages });
  } catch (error) {
    console.error("API GET chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

// DELETE giữ nguyên
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Not Found", { status: 404 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chat = await getChatById({ id });
    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    console.error("Delete chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
