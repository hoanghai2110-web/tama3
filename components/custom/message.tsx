/* eslint-disable import/order */
import React, { ReactNode, ComponentProps, useState } from "react";
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
        fontSize: "14px", // Tăng nhẹ font cho dễ đọc
        borderRadius: "8px",
        padding: "12px",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(6px)", // Tăng blur cho đẹp
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

// SVG Icons (giữ nguyên)
const LikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const DislikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

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
  const [isCopied, setIsCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleLike = () => setIsLiked(true);
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

  // Animation mượt hơn, loại bỏ scale
  const messageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut", // Trượt mượt mà hơn
      },
    },
  };

  // Button animation nhẹ nhàng hơn
  const buttonVariants = {
    hover: { scale: 1.05 }, // Giảm scale để không bị giật
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[600px] md:px-0 first-of-type:pt-20 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform, opacity" }}
    >
      <motion.div
        className={`flex flex-col gap-3 rounded-lg max-w-[85%] break-words leading-relaxed backdrop-blur-lg shadow-lg ${
          role === "user"
            ? "text-white bg-gradient-to-br from-[#1c1c1c] to-[#2a2a2a] p-3"
            : "text-zinc-800 dark:text-zinc-200 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4"
        }`}
        whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: "easeOut" } }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-xl font-bold pt-3 pb-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-lg font-semibold pt-2 pb-1" {...props} />,
            p: ({ node, ...props }) => (
              <p className="text-[15px]" {...props}> {/* Tăng font cho dễ đọc */}
                {React.Children.map(props.children, (child, index) =>
                  typeof child === "string" ? (
                    child
                  ) : React.isValidElement(child) && child.type === "strong" ? (
                    <strong key={index} className="font-bold">{child.props.children}</strong>
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
                  className="px-2 py-1 bg-gray-200/90 dark:bg-gray-700/90 rounded-md text-[14px]"
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

        {/* Buttons for Assistant */}
        {isAssistant && (
          <motion.div
            className="flex gap-3 mt-2 justify-start"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
          >
            <motion.button
              className={`p-2 rounded-full border border-gray-300/40 dark:border-gray-600/40 transition-all ${
                isLiked ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" : "text-zinc-500 hover:bg-green-50 dark:hover:bg-green-900/50 hover:text-green-500 dark:hover:text-green-400"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleLike}
              title="Like"
            >
              <LikeIcon />
            </motion.button>
            <motion.button
              className="p-2 rounded-full border border-gray-300/40 dark:border-gray-600/40 text-zinc-500 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-500 dark:hover:text-red-400 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              title="Dislike"
            >
              <DislikeIcon />
            </motion.button>
            <motion.button
              className="p-2 rounded-full border border-gray-300/40 dark:border-gray-600/40 text-zinc-500 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleCopy}
              title="Copy"
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </motion.button>
            <motion.button
              className={`p-2 rounded-full border border-gray-300/40 dark:border-gray-600/40 transition-all ${
                isSpeaking ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400" : "text-zinc-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/50 hover:text-yellow-500 dark:hover:text-yellow-400"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              onClick={handleSpeak}
              title={isSpeaking ? "Dừng đọc" : "Đọc nội dung"}
            >
              <SpeakerIcon />
            </motion.button>
            <motion.button
              className="p-2 rounded-full border border-gray-300/40 dark:border-gray-600/40 text-zinc-500 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:text-purple-500 dark:hover:text-purple-400 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
