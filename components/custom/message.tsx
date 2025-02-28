/* eslint-disable import/order */ 
import React, { ReactNode, ComponentProps } from "react";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CopyIcon, ThumbUpIcon, ThumbDownIcon } from "./icons";

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
  const [_, copyToClipboard] = useCopyToClipboard();
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    await copyToClipboard(content as string);
    toast.success("Copied to clipboard!");
  };

  return (
    <motion.div
      className={`flex flex-row gap-3 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 ${
        role === "user" ? "justify-end" : "justify-start"
      }`}
      initial={{ y: 10, opacity: 0, scale: 0.95, filter: "brightness(0.7)" }}
      animate={{ y: 0, opacity: 1, scale: 1, filter: "brightness(1.2)" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
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
          {typeof content === "string" ? content : ""}
        </ReactMarkdown>
        
        {/* Nút hành động */}
        {role !== "user" && (
          <TooltipProvider delayDuration={0}>
            <div className="flex flex-row gap-2 pt-2">
              {/* Copy Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="py-1 px-2 h-fit" variant="outline" onClick={handleCopy}>
                    <CopyIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy</TooltipContent>
              </Tooltip>

              {/* Upvote Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="py-1 px-2 h-fit"
                    variant="outline"
                    disabled={vote === "up"}
                    onClick={() => setVote("up")}
                  >
                    <ThumbUpIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upvote</TooltipContent>
              </Tooltip>

              {/* Downvote Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="py-1 px-2 h-fit"
                    variant="outline"
                    disabled={vote === "down"}
                    onClick={() => setVote("down")}
                  >
                    <ThumbDownIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Downvote</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </motion.div>
  );
};
