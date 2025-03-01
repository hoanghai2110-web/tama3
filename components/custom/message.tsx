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
        fontSize: "12px",
        borderRadius: "10px",
        padding: "12px",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(4px)",
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
};

// SVG Icons (giữ nguyên từ code của bạn)
const LikeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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
    width="16"
    height="16"
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
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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

  const handleLike = () => setIsLiked(true);
  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  // Variants cho animation của message
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1], // Spring easing giống iOS
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  };

  // Variants cho button animation
  const buttonVariants = {
    hover: { scale: 1.15, rotate: 5 },
    tap: { scale: 0.9 },
  };

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      style={{ willChange: "transform, opacity" }}
    >
      <motion.div
        className={`flex flex-col gap-2 rounded-2xl max-w-[100%] break-words leading-[1.625] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)] ${
          role === "user"
            ? "text-white bg-[#1c1c1c]/90 p-3"
            : "text-zinc-800 dark:text-zinc-300 bg-white/90 dark:bg-gray-800/90 p-4"
        }`}
        whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
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
              <p className="text-sm" {...props}>
                {React.Children.map(props.children, (child, index) =>
                  typeof child === "string" ? (
                    child
                  ) : React.isValidElement(child) && child.type === "strong" ? (
                    <strong
                      key={index}
                      className="font-bold italic"
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
                <motion.code
                  className="px-2 bg-gray-200/80 dark:bg-gray-700/80 rounded-md text-sm"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
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
            className="flex gap-2 mt-2 justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.button
              className={`p-1.5 rounded-full border border-gray-300/50 dark:border-gray-600/50 transition-colors ${
                isLiked ? "text-black dark:text-white" : "text-zinc-500 hover:text-green-500 dark:hover:text-green-400"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={handleLike}
              title="Like"
            >
              <LikeIcon />
            </motion.button>
            <motion.button
              className="p-1.5 rounded-full border border-gray-300/50 dark:border-gray-600/50 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              title="Dislike"
            >
              <DislikeIcon />
            </motion.button>
            <motion.button
              className="p-1.5 rounded-full border border-gray-300/50 dark:border-gray-600/50 text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              onClick={handleCopy}
              title="Copy"
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </motion.button>
            <motion.button
              className="p-1.5 rounded-full border border-gray-300/50 dark:border-gray-600/50 text-zinc-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              title="Link (Chỉ để choi)"
            >
              <LinkIcon />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};
