"use client";

import { Attachment, Message as AIMessage, ToolInvocation } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";
import { MessageList } from "@/components/custom/message"; // Import MessageList
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

// Hàm gửi feedback đến bot (giả lập, có thể thay bằng API thật)
const sendFeedbackToBot = async (feedback: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      if (feedback.includes("thích")) {
        resolve("Cảm ơn bạn đã khen mình, mình rất vui! 😊");
      } else {
        resolve("Mình sẽ cố gắng hơn, cảm ơn bạn đã góp ý! 😅");
      }
    }, 500);
  });
};

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<AIMessage>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  // Xử lý feedback từ Like/Dislike
  const handleFeedback = async (chatId: string, isLike: boolean) => {
    const feedback = isLike ? "Bạn đã thích tin nhắn này" : "Bạn không thích tin nhắn này";
    const botResponse = await sendFeedbackToBot(feedback);
    append({
      id: `${chatId}-response-${Date.now()}`,
      role: "assistant",
      content: botResponse,
    });
  };

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && <Overview />}

          {/* Dùng MessageList thay vì map trực tiếp */}
          <MessageList
            messages={messages.map((msg) => ({
              chatId: msg.id, // Dùng msg.id thay vì chatId
              role: msg.role,
              content: msg.content,
              attachments: msg.experimental_attachments,
              toolInvocations: msg.toolInvocations,
            }))}
            onFeedback={handleFeedback} // Truyền hàm xử lý feedback
          />

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  );
      }
