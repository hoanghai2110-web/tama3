import { motion } from "framer-motion";
import Link from "next/link";

import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700"> 
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <VercelIcon />
          <span>+</span>
          <MessageIcon />
        </p>
        <p>
          Meet <strong>Tama</strong> – your witty, confident, and all-knowing AI assistant! 🚀
        </p>
        <p>
          Tama is built with Next.js and the AI SDK by Vercel, powered by the Google Gemini model. 
          It leverages the 
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            streamText
          </code> 
          function on the server and the 
          <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">
            useChat
          </code> 
          hook on the client to provide a seamless, entertaining, and ultra-intelligent chat experience.
        </p>
        <p>
          Want to know more about how Tama works? Check out the 
          <Link
            className="text-blue-500 dark:text-blue-400"
            href="https://sdk.vercel.ai/docs"
            target="_blank"
          >
            Docs
          </Link>
          . But trust Tama, you won't need it! 😉
        </p>
      </div>

    </motion.div>
  );
};
