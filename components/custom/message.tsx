/* eslint-disable import/order */
import React, { ReactNode, ComponentProps, useState, useEffect } from "react";
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
  const [displayedContent, setDisplayedContent] = useState("");
  const isAssistant = role === "assistant";
  const fullContent = typeof content === "string" ? content : "";

  // Typing effect cho assistant
  useEffect(() => {
    if (isAssistant && fullContent) {
      let currentIndex = 0;
      setDisplayedContent(""); // Reset nội dung hiển thị

      const typeText = () => {
        if (currentIndex < fullContent.length) {
          setDisplayedContent(fullContent.slice(0, currentIndex + 1));
          currentIndex++;
          setTimeout(typeText, 15); // Tốc độ gõ: 15ms mỗi ký tự, có thể điều chỉnh
        }
      };

      typeText();
    } else {
      // Nếu không phải assistant, hiển thị ngay toàn bộ nội dung
      setDisplayedContent(fullContent);
    }
  }, [isAssistant, fullContent]);

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
        filter: isAssistant ? "brightness(1.2)" : "brightness(1)", // Tăng sáng cho bot
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
          {displayedContent}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};
