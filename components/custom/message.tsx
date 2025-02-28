/* eslint-disable import/order */ 
import React, { ReactNode, ComponentProps, useState, useEffect, useRef } from "react";
import { Attachment, ToolInvocation } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Giả lập gửi feedback đến Grok (thay bằng API thực tế nếu có)
const sendFeedbackToGrok = async (feedback: string, chatId: string) => {
  // Giả lập phản hồi từ Grok (thực tế sẽ là API call)
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

const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1,
    },
  },
};

const charVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    },
  },
};

const AnimatedText = ({ text, onComplete, id }: { text: string; onComplete: () => void; id: string }) => {
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

// Component MessageList để quản lý tin nhắn
export const MessageList = ({
  messages,
}: {
  messages: { chatId: string; role: string; content: string; toolInvocations?: ToolInvocation[]; attachments?: Attachment[] }[];
}) => {
  const [messageList, setMessageList] = useState(messages);
  const animatedMessages = useRef(new Set<string>()); // Lưu trữ chatId đã animate

  // Khởi tạo danh sách tin nhắn đã animate khi load trang
  useEffect(() => {
    const initialAnimated = new Set(messages.map((msg) => msg.chatId));
    animatedMessages.current = initialAnimated;
    setMessageList(messages);
  }, [messages]);

  const handleFeedback = async (chatId: string, isLike: boolean) => {
    const feedback = isLike
      ? "Tôi thích câu trả lời này"
      : "Tôi không thích câu trả lời này";
    
    // Gửi feedback đến Grok (ẩn)
    const botResponse = await sendFeedbackToGrok(feedback, chatId);
    
    // Thêm phản hồi của bot vào danh sách
    setMessageList((prev) => [
      ...prev,
      {
        chatId: `${chatId}-response-${Date.now()}`,
        role: "assistant",
        content: botResponse,
      },
    ]);
  };

  return (
    <div>
      {messageList.map((msg) =>
        msg.role === "assistant" ? ( // Chỉ hiển thị tin nhắn từ bot
          <Message
            key={msg.chatId}
            chatId={msg.chatId}
            role={msg.role}
            content={msg.content}
            toolInvocations={msg.toolInvocations}
            attachments={msg.attachments}
            onFeedback={handleFeedback}
            isAnimated={animatedMessages.current.has(msg.chatId)} // Truyền trạng thái animate
          />
        ) : null
      )}
    </div>
  );
};

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  onFeedback,
  isAnimated,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations?: ToolInvocation[];
  attachments?: Attachment[];
  onFeedback?: (chatId: string, isLike: boolean) => void;
  isAnimated?: boolean; // Trạng thái đã animate
}) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(isAnimated || false);

  useEffect(() => {
    if (isAnimated) {
      setIsAnimationComplete(true); // Nếu đã animate, bỏ qua animation
    } else {
      setIsAnimationComplete(false); // Chạy animation cho tin nhắn mới
    }
  }, [chatId, content, isAnimated]);

  const handleCopy = () => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content);
      alert("Đã sao chép!");
    }
  };

  const handleLike = () => {
    if (!liked && !disliked) {
      setLiked(true);
      if (onFeedback) onFeedback(chatId, true); // Gửi "Tôi thích câu trả lời này"
    }
  };

  const handleDislike = () => {
    if (!disliked && !liked) {
      setDisliked(true);
      if (onFeedback) onFeedback(chatId, false); // Gửi "Tôi không thích câu trả lời này"
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimationComplete(true);
  };

  const shouldAnimate = !isAnimated;

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 justify-start`}
      initial={{ y: 10, opacity: 0, scale: 0.95, filter: "brightness(0.7)" }}
      animate={{ y: 0, opacity: 1, scale: 1, filter: "brightness(1.2)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      <div
        className="flex flex-col gap-2 rounded-2xl max-w-[100%] break-words leading-[1.625] text-zinc-800 dark:text-zinc-300 p-1"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold pt-4 pb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold pt-3 pb-3" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p {...props}>
                {React.Children.map(props.children, (child, index) =>
                  typeof child === "string" && shouldAnimate ? (
                    <AnimatedText
                      key={`${chatId}-${index}`}
                      text={child}
                      id={`${chatId}-${index}`}
                      onComplete={handleAnimationComplete}
                    />
                  ) : typeof child === "string" ? (
                    <span key={`${chatId}-${index}`}>{child}</span>
                  ) : React.isValidElement(child) && child.type === "strong" ? (
                    <strong
                      key={`${chatId}-${index}`}
                      className="text-[18px] font-bold italic inline pt-3 pb-3"
                    >
                      {child.props.children}
                    </strong>
                  ) : (
                    child
                  )
                )}
              </p>
            ),
            code({ className, children, ...props }: ComponentProps<"code">) {
              const match = /language-(\w+)/.exec(className || "");
              const lang = match ? match[1] : "";
              return lang ? (
                renderCodeBlock(String(children), lang)
              ) : (
                <code
                  className="px-2 bg-gray-200 dark:bg-gray-800 rounded-[3px]"
                  style={{
                    backgroundColor: "hsl(var(--muted))",
                    paddingTop: "0.05rem",
                    paddingBottom: "0.05rem",
                    willChange: "transform, opacity",
                  }}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {typeof content === "string" ? content : ""}
        </ReactMarkdown>

        <AnimatePresence>
          {isAnimationComplete && (
            <motion.div
              className="flex gap-2 mt-2 justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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
                className={`p-1 text-sm ${
                  liked ? "text-green-500" : "text-gray-500"
                } hover:text-green-600`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                disabled={liked || disliked}
              >
                👍 {liked ? "Liked" : "Like"}
              </motion.button>
              <motion.button
                onClick={handleDislike}
                className={`p-1 text-sm ${
                  disliked ? "text-red-500" : "text-gray-500"
                } hover:text-red-600`}
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
