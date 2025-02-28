/* eslint-disable import/order */ 
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Giả lập gửi feedback đến AI
const sendFeedbackToGrok = async (feedback) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(feedback === "Tôi thích câu trả lời này" 
        ? "Cảm ơn bạn đã thích câu trả lời của tôi! Tôi rất vui khi được giúp đỡ."
        : "Xin lỗi nếu câu trả lời của tôi chưa tốt. Tôi có thể giúp gì thêm để cải thiện không?"
      );
    }, 500);
  });
};

// Hiệu ứng gõ chữ dần dần
const AnimatedText = ({ text, onComplete }) => {
  const [displayText, setDisplayText] = useState("");
  const index = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayText((prev) => prev + text[index.current]);
      index.current++;

      if (index.current >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayText}</span>;
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
    animatedIds.current.add(chatId);
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
              return match ? (
                <SyntaxHighlighter language={match[1]} style={okaidia}>
                  {String(children)}
                </SyntaxHighlighter>
              ) : (
                <code>{children}</code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
        
        <motion.div className="flex gap-2 mt-2 justify-end">
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
      </div>
    </motion.div>
  );
};

// Component MessageList
export const MessageList = ({ initialMessages }) => {
  const [messages, setMessages] = useState(initialMessages);
  const animatedIds = useRef(new Set());

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
        .filter((msg) => msg.role === "assistant")
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

// Dữ liệu mẫu
const initialMessages = [
  { chatId: "1", role: "assistant", content: "Xin chào, tôi có thể giúp gì cho bạn?" },
  { chatId: "2", role: "user", content: "Câu trả lời hay lắm!" },
];

// Trong component cha:
// <MessageList initialMessages={initialMessages} />;
