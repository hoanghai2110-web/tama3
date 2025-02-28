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
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (typeof content === "string" && role !== "user") {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayText(content.slice(0, i));
        i++;
        if (i > content.length) clearInterval(interval);
      }, 30); // Điều chỉnh tốc độ gõ
      return () => clearInterval(interval);
    } else {
      setDisplayText(content as string);
    }
  }, [content, role]);

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
        filter: "brightness(1.2)",
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
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }: ComponentProps<"code">) {
              const match = /language-(\w+)/.exec(className || "");
              const lang = match ? match[1] : "";
              return lang ? (
                renderCodeBlock(String(children), lang)
              ) : (
                <code className="px-2 bg-gray-200 dark:bg-gray-800 rounded-[3px]">
                  {children}
                </code>
              );
            },
          }}
        >
          {displayText}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};
