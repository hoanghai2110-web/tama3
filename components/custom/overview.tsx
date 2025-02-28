import { motion } from "framer-motion";
import Link from "next/link";
import { LogoGoogle, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  // Variants cho container chính
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // Cubic-bezier giống iOS spring animation
        delay: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.98,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  // Variants cho text animation
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1], // Mượt mà kiểu iOS
        delay: 0.4,
      },
    },
  };

  // Variants cho hiệu ứng nhấp nháy nhẹ
  const glowVariants = {
    animate: {
      opacity: [0.6, 1],
      textShadow: [
        "0 0 8px rgba(255, 255, 255, 0.5)",
        "0 0 12px rgba(255, 255, 255, 0.8)",
      ],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="bg-muted/70 backdrop-blur-lg rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
        whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      >
        {/* Icons Section */}
        <motion.p
          className="flex justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50"
          variants={textVariants}
        >
          <motion.span
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <VercelIcon />
          </motion.span>
          <span>+</span>
          <motion.span
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <MessageIcon />
          </motion.span>
        </motion.p>

        {/* Main Text with Glow */}
        <motion.p
          className="text-zinc-800 dark:text-zinc-50 text-center"
          variants={glowVariants}
          animate="animate"
        >
          Gặp Tama – trợ lý AI thông minh, đơn giản và dễ sử dụng! 🚀
        </motion.p>

        {/* Link Section */}
        <motion.p
          className="text-center"
          variants={textVariants}
        >
          Nếu bạn muốn mua Source code của Tama, hãy liên hệ qua{" "}
          <Link
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
            href="t.me/anonymous_start"
            target="_blank"
          >
            Telegram
          </Link>
          . Sở hữu ngay Tama và bắt đầu sử dụng! 😉
        </motion.p>
      </motion.div>
    </motion.div>
  );
};
