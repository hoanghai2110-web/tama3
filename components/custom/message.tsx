import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { Markdown } from "./markdown";
import { Copy, ThumbsUp } from "lucide-react";

const typingVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const TamaMessage = ({
  role,
  content,
}: {
  role: "user" | "bot";
  content: string | ReactNode;
}) => {
  const [liked, setLiked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof content === "string" ? content : "");
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
            className={`flex flex-col gap-4 ${
              role === "user"
                ? "text-black-500"
                : "text-zinc-800 dark:text-zinc-300"
            }`}
            style={{
              backgroundColor: role === "user" ? "#acb7ff" : "#f3f4f6",
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
                {content.split(" ").map((word, index) => (
                  <motion.span key={index} variants={typingVariants}>
                    {word + " "}
                  </motion.span>
                ))}
              </motion.span>
            ) : (
              <Markdown>{content}</Markdown>
            )}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button onClick={handleCopy} className="text-gray-500 hover:text-gray-700">
            <Copy size={16} />
          </button>
          <button onClick={() => setLiked(!liked)} className="text-gray-500 hover:text-gray-700">
            <ThumbsUp size={16} fill={liked ? "#2563eb" : "none"} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
