/* eslint-disable import/order */
import React, { ReactNode, ComponentProps, useState } from "react";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

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

// SVG Icons giống phong cách Grok (tối giản)
const LikeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 22V10m-5 4v8h4V10H2zm17-4s-1-6-6-6-5 5-5 5v9h5l2-8 2 8h2V12z" />
  </svg>
);

const DislikeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 2v12m-5-4V2h4v12H2zm17 4s-1 6-6 6-5-5-5-5V2h5l2 8 2-8h2v12z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
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
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000); // Reset sau 1 giây
  };

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      initial={{
        y: 10,
        opacity: 0,
        scale: 0.95,
        filter: "brightness(0.7)",
      }}
      animate={{
        y: 0,
        opacity: 1,
        scale: 1,
        filter: isAssistant ? "brightness(1.2)" : "brightness(1)",
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      <div
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

        {/* Nút Like, Dislike, Copy - chỉ hiển thị cho assistant, nằm bên trái */}
        {isAssistant && (
          <div className="flex gap-3 mt-2 justify-start">
            <motion.button
              className="text-zinc-500 hover:text-green-500 dark:hover:text-green-300 transition-colors p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Like"
            >
              <LikeIcon />
            </motion.button>
            <motion.button
              className="text-zinc-500 hover:text-red-500 dark:hover:text-red-300 transition-colors p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Dislike"
            >
              <DislikeIcon />
            </motion.button>
            <motion.button
              className="text-zinc-500 hover:text-blue-500 dark:hover:text-blue-300 transition-colors p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              title="Copy"
            >
              {isCopied ? <CheckIcon /> : <CopyIcon />}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
