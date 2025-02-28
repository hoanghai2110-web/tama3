/* eslint-disable import/order */ 
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Hàm giả lập gửi feedback đến Grok
const sendFeedbackToGrok = async (feedback: string) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      if (feedback === "Tôi thích câu trả lời này") {
        resolve("Cảm ơn bạn đã thích câu trả lời của tôi! Tôi rất vui khi được giúp đỡ. Có gì thú vị đang xảy ra không?");
      } else if (feedback === "Tôi không thích câu trả lời này") {
        resolve("Xin lỗi nếu câu trả lời của tôi chưa tốt. Tôi có thể giúp gì thêm để cải thiện không?");
      }
    }, 500);
  });
};

// Hiệu ứng animation đơn giản hóa
const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.02 },
  },
};

const charVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

// Thành phần AnimatedText
const AnimatedText = ({ text, onComplete }) => {
  return (
    <motion.span
      variants={textVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
    >
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={charVariants}>
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const renderCodeBlock = (code: string, language: string) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={okaidia}
      customStyle={{ fontSize: "12px", borderRadius: "8px", padding: "12px" }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

// Component MessageList
export const MessageList = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const animatedIds = useRef(new Set()); // Lưu trữ ID đã animate

  const handleFeedback = async (chatId, isLike) => {
    const feedback = isLike ? "Tôi thích câu trả lời này" : "Tôi không thích câu trả lời này";
    const botResponse = await sendFeedbackToGrok(feedback);
    setMessages((prev) => [
      ...prev,
      { chatId: `${chatId}-response-${Date.now()}`, role: "assistant", content: botResponse },
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      {messages
        .filter((msg) => msg.role === "assistant") // Chỉ hiển thị tin nhắn bot
        .map((msg) => (
          <Message
            key={msg.chatId}
            chatId={msg.chatId}
            content={msg.content}
            onFeedback={handleFeedback}
            animatedIds={animatedIds}
          />
        ))}
    </div>
  );
};

// Component Message
const Message = ({ chatId, content, onFeedback, animatedIds }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(animatedIds.current.has(chatId));

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Đã sao chép!");
  };

  const handleLike = () => {
    if (!liked && !disliked) {
      setLiked(true);
      onFeedback(chatId, true);
    }
  };

  const handleDislike = () => {
    if (!liked && !disliked) {
      setDisliked(true);
      onFeedback(chatId, false);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimationComplete(true);
    animatedIds.current.add(chatId); // Đánh dấu đã animate
  };

  return (
    <motion.div
      className="flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 justify-start"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-2 rounded-2xl max-w-[100%] break-words leading-[1.625] text-zinc-800 dark:text-zinc-300 p-3 bg-gray-100 dark:bg-gray-800">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p {...props}>
                {!animatedIds.current.has(chatId) ? (
                  <AnimatedText text={content} onComplete={handleAnimationComplete} />
                ) : (
                  content
                )}
              </p>
            ),
            code: ({ className, children }) => {
              const match = /language-(\w+)/.exec(className || "");
              return match ? renderCodeBlock(String(children), match[1]) : <code>{children}</code>;
            },
          }}
        >
          {content}
        </ReactMarkdown>

        <AnimatePresence>
          {isAnimationComplete && (
            <motion.div
              className="flex gap-2 mt-2 justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={handleCopy}
                className="p-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                📋 Copy
              </motion.button>
              <motion.button
                onClick={handleLike}
                className={`p-1 text-sm ${liked ? "text-green-500" : "text-gray-500"} hover:text-green-600`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                disabled={liked || disliked}
              >
                👍 {liked ? "Liked" : "Like"}
              </motion.button>
              <motion.button
                onClick={handleDislike}
                className={`p-1 text-sm ${disliked ? "text-red-500" : "text-gray-500"} hover:text-red-600`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                disabled={liked || disliked}
              >
                👎 {disliked ? "Disliked" : "Dislike"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Cách dùng
const initialMessages = [
  { chatId: "1", role: "assistant", content: "Xin chào, tôi có thể giúp gì cho bạn?" },
  { chatId: "2", role: "user", content: "Câu trả lời hay lắm!" }, // Không hiển thị
];

// Trong component cha:
// <MessageList initialMessages={initialMessages} />;
