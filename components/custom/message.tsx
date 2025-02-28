/* eslint-disable import/order */ 
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Hàm gửi feedback đến bot (giả lập)
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

// Hiệu ứng animation
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

const AnimatedText = ({ text, onComplete, id }) => {
  return (
    <motion.span
      key={id}
      variants={textVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onComplete}
    >
      {text.split("").map((char, index) => (
        <motion.span key={`${id}-${index}`} variants={charVariants}>
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
export const MessageList = ({ messages }) => {
  const [messageList, setMessageList] = useState(messages);
  const animatedIds = useRef(new Set()); // Lưu trữ chatId đã animate

  // Khởi tạo danh sách đã animate từ messages ban đầu
  const initialized = useRef(false);
  if (!initialized.current) {
    messages.forEach((msg) => animatedIds.current.add(msg.chatId));
    initialized.current = true;
  }

  const handleFeedback = async (chatId: string, isLike: boolean) => {
    const feedback = isLike ? "Bạn đã thích tin nhắn này" : "Bạn không thích tin nhắn này";
    const botResponse = await sendFeedbackToBot(feedback);
    setMessageList((prev) => [
      ...prev,
      { chatId: `${chatId}-response-${Date.now()}`, role: "assistant", content: botResponse },
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      {messageList
        .filter((msg) => msg.role === "assistant") // Chỉ hiển thị tin nhắn bot
        .map((msg) => (
          <Message
            key={msg.chatId}
            chatId={msg.chatId}
            content={msg.content}
            onFeedback={handleFeedback}
            isAnimated={animatedIds.current.has(msg.chatId)}
          />
        ))}
    </div>
  );
};

// Component Message
export const Message = ({ chatId, content, onFeedback, isAnimated }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(isAnimated);

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
                {!isAnimated ? (
                  <AnimatedText
                    text={content}
                    onComplete={handleAnimationComplete}
                    id={chatId}
                  />
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
