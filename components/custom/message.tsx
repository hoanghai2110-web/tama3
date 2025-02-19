/* eslint-disable import/order */
import React, { ReactNode, ComponentProps } from "react";
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
      customStyle={{ fontSize: "12px" }} // 👈 Chỉnh size code
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
  return (
    <motion.div
      className="flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col gap-3 w-full">
        {content && typeof content === "string" && (
          <div
            className={`flex flex-col gap-4 rounded-2xl max-w-full word-wrap break-word text-left leading-relaxed ${
              role === "user" ? "text-white bg-[#1c1c1c] self-end" : "text-zinc-800 dark:text-zinc-300"
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-2" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                code({ className, children, ...props }: ComponentProps<"code">) {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "";
                  return lang ? (
                    renderCodeBlock(String(children), lang)
                  ) : (
                    <code className="px-1 py-0.5 rounded-md" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};
