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
    // Lấy và validate input
    const { id, messages } = await request.json();
    if (!id || !messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Dữ liệu không hợp lệ" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Kiểm tra authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Vui lòng đăng nhập" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Kiểm tra giới hạn request
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

    // Xử lý tin nhắn
    const validMessages = messages.filter(m => 
      m && typeof m.content === "string" && m.content.trim().length > 0
    );

    const coreMessages = convertToCoreMessages(validMessages);

    if (coreMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Không có tin nhắn hợp lệ" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Stream response
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
            // Lưu chat với tin nhắn đã validate
            const allMessages = [...coreMessages, ...responseMessages];
            await saveChat({
              id,
              messages: allMessages,
              userId: session.user.id,
            });
          } catch (error) {
            console.error("Lỗi khi lưu chat:", error);
          }
        }
      }
    });

    // Trả về response
    return result.toDataStreamResponse({
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Lỗi hệ thống",
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
        JSON.stringify({ error: "Thiếu ID chat" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Vui lòng đăng nhập" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const chat = await getChatById({ id });
    if (!chat) {
      return new Response(
        JSON.stringify({ error: "Không tìm thấy chat" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (chat.userId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Bạn không có quyền xóa chat này" }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await deleteChatById({ id });
    
    return new Response(
      JSON.stringify({ message: "Đã xóa chat thành công" }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Delete chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Lỗi khi xóa chat",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
