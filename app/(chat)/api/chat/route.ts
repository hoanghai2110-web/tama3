import { convertToCoreMessages, Message, streamText } from "ai";

import { geminiProModel } from "@/ai";  
import { auth } from "@/app/(auth)/auth";

import { deleteChatById, getChatById, saveChat } from "@/db/queries";


export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } = 
    await request.json();

  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  // ✅ Đổi tên tránh trùng `messages`
  const formattedMessages = [
    { role: "system", content: `Bạn là Tama của Vietchart Team. Trả lời rõ ràng, theo từng phần:  
    1️⃣ Mở đầu: Tóm tắt ngắn gọn.  
    2️⃣ Giải thích: Chi tiết, dễ hiểu.  
    3️⃣ Kết luận: Tóm tắt ý chính.  
    Dùng icon ✅✨📌 khi cần nhấn mạnh.` },
    ...coreMessages,
  ];

  // ✅ Chạy `streamText` đúng cách
  const result = await streamText({ 
    model: geminiProModel,  
    messages: formattedMessages,
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...formattedMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("❌ Failed to save chat");
        }
      }
    },
  });

  return result.toDataStreamResponse();
}

// ✅ Đóng dấu `}` trước khi khai báo DELETE
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
