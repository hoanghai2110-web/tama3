import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";

import { ReactNode, useState } from "react";

import { BotIcon, UserIcon, CopyIcon, LikeIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";


const typingVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
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
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  const [liked, setLiked] = useState(false);
  const handleCopy = () => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div
            className={`flex flex-col gap-4 relative ${
              role === "user"
                ? "text-black-500"
                : "text-zinc-800 dark:text-zinc-300"
            }`}
            style={{
              backgroundColor: role === "user" ? "#acb7ff" : "transparent",
              padding: "8px 12px",
              borderRadius: "16px",
              marginLeft: role === "user" ? "auto" : "0",
              marginRight: "0",
              textAlign: role === "user" ? "right" : "left",
              maxWidth: "100%",
              wordWrap: "break-word",
              display: "inline-block",
            }}
          >
            {role === "bot" ? (
              <motion.span
                initial="hidden"
                animate="visible"
                variants={typingVariants}
                transition={{ duration: 0.05, staggerChildren: 0.05 }}
                className="animate-pulse"
              >
                {content.split("").map((char, index) => (
                  <motion.span key={index} variants={typingVariants}>
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            ) : (
              <Markdown>{content}</Markdown>
            )}
            {/* Nút Sao chép & Thích */}
            <div className="flex gap-2 mt-2">
              <button onClick={handleCopy} className="text-gray-500 hover:text-black">
                <CopyIcon />
              </button>
              <button onClick={() => setLiked(!liked)} className={`text-gray-500 hover:text-red-500 ${liked ? "text-red-500" : ""}`}>
                <LikeIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
