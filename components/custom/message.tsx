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

// SVG Icons (width, height = 15)
const LikeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const DislikeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

const CopyIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const SpeakerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

// Component Message
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
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-16 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform, opacity, filter" }}
    >
      <motion.div
        className={`flex flex-col gap-2 rounded-2xl max-w-full break-words leading-relaxed ${
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
              <h1 className="text-2xl font-bold py-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-xl font-semibold py-3" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p {...props}>
                {React.Children.map(props.children, (child, index) =>
                  typeof child === "string" ? (
                    child
                  ) : React.isValidElement(child) && child.type === "strong" ? (
                    <strong
                      key={index}
                      className="text-[18px] font-bold italic inline py-3"
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
              className={`p-1.5 rounded-md border border-gray-400/50 dark:border-gray-600/50 transition-all ${
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
              className={`p-1.5 rounded-md border border-gray-400/50 dark:border-gray-600/50 transition-all ${
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
              className="p-1.5 rounded-md border border-gray-400/50 dark:border-gray-600/50 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
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
              className={`p-1.5 rounded-md border border-gray-400/50 dark:border-gray-600/50 transition-all ${
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
              className="p-1.5 rounded-md border border-gray-400/50 dark:border-gray-600/50 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600/30 hover:text-purple-500 dark:hover:text-purple-400 transition-all"
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
      <div className="pt-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg min-h-screen px-4">
        {messages.map((msg) => (
          <Message key={msg.chatId} {...msg} />
        ))}
      </div>
    </div>
  );
};

export default App;
