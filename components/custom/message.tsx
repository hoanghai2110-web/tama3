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
      customStyle={{ fontSize: "12px", borderRadius: "8px", padding: "8px" }}
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
      className="flex flex-row gap-3 px-3 md:px-4 w-full md:w-[500px] first-of-type:pt-20"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col gap-3 w-full">
        {content && typeof content === "string" && (
          <div
            className={`flex flex-col px-4 py-2 gap-2 rounded-2xl max-w-fit break-words text-left leading-normal items-center ${
              role === "user"
                ? "text-white bg-[#1c1c1c] self-end" // Căn phải cho user
                : "text-zinc-800 dark:text-zinc-300 self-start" // Căn trái cho bot
            } min-h-[44px]`} // Tăng chiều cao tối thiểu để tránh text bị lệch
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
                    <code className="py-0.5 px-1 rounded-md text-white" {...props}>
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
                    
