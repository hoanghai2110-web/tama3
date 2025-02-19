/* eslint-disable import/order */

import React, { ReactNode, ComponentProps } from "react";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const typingVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const lightEffectVariants = {
  hidden: { opacity: 0, filter: "brightness(0)" },
  visible: { opacity: 1, filter: "brightness(1.5)" },
};

// 👉 Set font size cho code block
const renderCodeBlock = (code: string, language: string) => {
  return (
    <SyntaxHighlighter language={language} style={okaidia} customStyle={{ fontSize: "12px" }}>
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
  return (
    <motion.div
      className="flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div
            className={`flex flex-col gap-4 ${
              role === "user" ? "text-white" : "text-zinc-800 dark:text-zinc-300"
            }`}
            style={{
              backgroundColor: role === "bot" ? "transparent" : "#1c1c1c", // ❌ Bỏ nền bot, ✅ Giữ nền user
              padding: role === "bot" ? "8px 0px 8px 12px" : "0px",
              borderRadius: role === "bot" ? "16px" : "0px", // ✅ Chỉ border-radius cho bot
              marginLeft: role === "user" ? "auto" : "0",
              marginRight: "0",
              textAlign: role === "user" ? "right" : "left",
              maxWidth: "100%",
              wordWrap: "break-word",
              display: "inline-block",
            }}
          >
            {role === "bot" ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={lightEffectVariants}
                transition={{ duration: 0.05, repeat: Infinity, repeatType: "reverse" }}
              >
                <motion.span
                  initial="hidden"
                  animate="visible"
                  variants={typingVariants}
                  transition={{ duration: 0.05, staggerChildren: 0.05 }}
                  className="animate-pulse"
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
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </motion.span>
              </motion.div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }: ComponentProps<"code">) {
                    const match = /language-(\w+)/.exec(className || "");
                    const lang = match ? match[1] : "";
                    return lang ? (
                      renderCodeBlock(String(children), lang)
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
