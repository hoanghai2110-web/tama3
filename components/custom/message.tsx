/* eslint-disable import/order */
import React, { ReactNode, ComponentProps, useState, useEffect } from "react";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Render Code Block
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

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations?: ToolInvocation[];
  attachments?: Attachment[];
}) => {
  const fullContent = typeof content === "string" ? content : "";
  const isAssistant = role === "assistant";
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleLike = () => setIsLiked(!isLiked);
  const handleDislike = () => setIsDisliked(!isDisliked);
  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(fullContent);
      utterance.lang = "vi-VN";
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setIsDisliked(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const messageVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95, filter: "brightness(0.7)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "brightness(1.2)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-24 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform, opacity, filter" }}
    >
      <motion.div
        className={`flex flex-col gap-2 rounded-2xl max-w-[100%] break-words leading-[1.625] ${
          role === "user"
            ? "text-white bg-[#1c1c1c] self-end ml-auto p-3"
            : "text-zinc-800 dark:text-zinc-300 p-1"
        }`}
        style={
          role === "user"
            ? {
                paddingTop: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingBottom: "0.5rem",
                willChange: "transform, opacity",
              }
            : undefined
        }
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
                  typeof child === "string" ? (
                    child
                  ) : React.isValidElement(child) && child.type === "strong" ? (
                    <strong
                      key={index}
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
          {fullContent}
        </ReactMarkdown>

        {isAssistant && (
          <motion.div
            className="flex gap-2 mt-1 justify-start"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.button
              className={`p-1.5 rounded-md border border-gray-200/50 dark:border-gray-600/50 transition-all ${
                isLiked ? "bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-green-500 dark:hover:text-green-400"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              title="Like"
            >
              <LikeIcon />
            </motion.button>
            <motion.button
              className={`p-1.5 rounded-md border border-gray-200/50 dark:border-gray-600/50 transition-all ${
                isDisliked ? "bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-red-500 dark:hover:text-red-400"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDislike();
              }}
              title="Dislike"
            >
              <DislikeIcon />
            </motion.button>
            <motion.button
              className="p-1.5 rounded-md border border-gray-200/50 dark:border-gray-600/50 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              title="Copy"
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </motion.button>
            <motion.button
              className={`p-1.5 rounded-md border border-gray-200/50 dark:border-gray-600/50 transition-all ${
                isSpeaking ? "bg-yellow-100 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-yellow-500 dark:hover:text-yellow-400"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              title={isSpeaking ? "Dừng đọc" : "Đọc nội dung"}
            >
              <SpeakerIcon />
            </motion.button>
            <motion.button
              className="p-1.5 rounded-md border border-gray-200/50 dark:border-gray-600/50 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-purple-500 dark:hover:text-purple-400 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              title="Link"
            >
              <LinkIcon />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Sử dụng trực tiếp trong App
const App = () => {
  const messages = [
    { chatId: "1", role: "user", content: "Ê thằng này, có cái đó không? Lâu rồi không thấy mày đâu, Đạo này làm ăn không ra gì? Khổ thân tao nhờ mày mà" },
    { chatId: "2", role: "assistant", content: "Chào bạn! Mình ổn, cảm ơn. Bạn khỏe không?" },
    { chatId: "3", role: "user", content: "Bạn khỏe không?" },
    { chatId: "4", role: "assistant", content: "Khỏe, cảm ơn!" },
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Giả lập menu cố định */}
      <div className="fixed top-0 w-full h-16 bg-blue-500 text-white flex items-center justify-center z-10">
        Menu
      </div>
      {/* Wrapper với nền mờ */}
      <div className="pt-24 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg min-h-screen px-4">
        {messages.map((msg) => (
          <Message key={msg.chatId} {...msg} />
        ))}
      </div>
    </div>
  );
};

export default App;
