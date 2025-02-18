import { Attachment, ToolInvocation } from "ai"; 
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";

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
              backgroundColor: role === "user" ? "#1c1c1c" : "transparent",
              color: "#f3f0f0",
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
          </div>
        )}
      </div>
    </motion.div>
  );
};
