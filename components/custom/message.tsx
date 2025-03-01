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
      customStyle={{
        fontSize: "12px",
        borderRadius: "6px",
        padding: "10px",
        background: "rgba(0, 0, 0, 0.9)",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

// SVG Icons (width, height = 15)
const LikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const DislikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={`flex flex-row gap-2 px-3 w-full md:w-[550px] md:px-0 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={`flex flex-col gap-2 rounded-xl max-w-[100%] break-words leading-snug ${
          role === "user" ? "text-white bg-gray-800/95 p-2.5" : "text-gray-900 dark:text-gray-100 p-3"
        }`}
        whileHover={{ scale: 1.005, transition: { duration: 0.15, ease: "easeOut" } }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-lg font-semibold pt-2 pb-1" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-base font-medium pt-1.5 pb-1" {...props} />,
            p: ({ node, ...props }) => (
              <p className="text-sm" {...props}>
                {React.Children.map(props.children, (child, index) =>
                  typeof child === "string" ? (
                    child
                  ) : React.isValidElement(child) && child.type === "strong" ? (
                    <strong key={index} className="font-semibold">{child.props.children}</strong>
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
                <motion.code
                  className="px-1.5 py-0.5 bg-gray-200/90 dark:bg-gray-600/90 rounded text-xs"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {children}
                </motion.code>
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

// Component MessageList với nền mờ đục và padding-top
export const MessageList = ({ messages }: { messages: any[] }) => {
  return (
    <motion.div
      className="w-full h-[80vh] overflow-y-auto px-3 pt-20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg" // Tăng blur và điều chỉnh opacity
      style={{ WebkitOverflowScrolling: "touch" }}
      drag="y"
      dragConstraints={{ top: -100, bottom: 50 }}
      dragElastic={0.2}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
    >
      {messages.map((msg, index) => (
        <Message key={index} {...msg} />
      ))}
    </motion.div>
  );
};
