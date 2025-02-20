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
      customStyle={{ fontSize: "12px", borderRadius: "8px", padding: "10px" }}
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
      className="flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
   <div
  className={`flex flex-col gap-2 rounded-2xl max-w-[100%] break-words text-left leading-[1.625] ${
    role === "user"
      ? "text-white bg-[#1c1c1c] self-end"
      : "text-zinc-800 dark:text-zinc-300"
  } min-h-[42px]`}
  style={
    role === "user"
      ? {
          paddingTop: ".6rem",
          paddingBottom: "0rem",
          paddingLeft: ".7rem",
          paddingRight: ".8rem",
        }
      : {}
  }
>



            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-2" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-2" {...props} />,
                p: ({ node, ...props }) => <p {...props} />,
                code({ className, children, ...props }: ComponentProps<"code">) {
                  const match = /language-(\w+)/.exec(className || "");
                  const lang = match ? match[1] : "";
                  return lang ? (
                    renderCodeBlock(String(children), lang)
                  ) : (
                    <code className="py-1 rounded-md text-black">
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
                                           
