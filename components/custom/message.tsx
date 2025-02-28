import React, { ReactNode, ComponentProps, useState, useEffect, useRef } from "react";
import { Attachment, ToolInvocation } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

// Định nghĩa type của Props component Message
interface MessageProps {
  chatId: string;
  role: "function" | "system" | "user" | "assistant" | "data" | "tool";
  content: ReactNode;
  attachments?: Attachment[];
  toolInvocations?: ToolInvocation[];
  onFeedback?: (chatId: string, isLike: boolean) => void;
}

const Message = ({
  chatId,
  role,
  content,
  attachments,
  toolInvocations,
  onFeedback,
}: MessageProps) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  const isNewMessage = useRef(!localStorage.getItem(`msg-${chatId}`));

  useEffect(() => {
    if (!isNewMessage.current) {
      setIsAnimationComplete(true);
    }
    localStorage.setItem(`msg-${chatId}`, "true");
  }, [chatId]);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setDisliked(false);
      if (onFeedback) onFeedback(chatId, true);
    }
  };

  const handleDislike = () => {
    if (!disliked) {
      setDisliked(true);
      setLiked(false);
      if (onFeedback) onFeedback(chatId, false);
    }
  };

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      initial={isNewMessage.current ? { opacity: 0, y: 10 } : {}}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isNewMessage.current ? 0.4 : 0 }}
      onAnimationComplete={() => setIsAnimationComplete(true)}
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
                  typeof child === "string" && isNewMessage.current ? (
                    <AnimatedText
                      key={`${chatId}-${index}`}
                      text={child}
                      id={`${chatId}-${index}`}
                      onComplete={() => setIsAnimationComplete(true)}
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
          {role !== "user" && isAnimationComplete && (
            <motion.div
              className="flex gap-2 mt-2 justify-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => navigator.clipboard.writeText(content as string)}
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
