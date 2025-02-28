"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import cx from "classnames";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { motion } from "framer-motion";

import { Chat } from "@/db/schema";
import { fetcher, getTitleFromChat } from "@/lib/utils";
import {
  InfoIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PencilEditIcon,
  TrashIcon,
} from "./icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

// Variants cho animation
const sheetVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], type: "spring", damping: 20 },
  },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, { method: "DELETE" });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => history?.filter((h) => h.id !== deleteId));
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Button mở Sheet */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Button
          variant="outline"
          className="p-1.5 h-fit rounded-full border-gray-300/50 dark:border-gray-600/50 backdrop-blur-md"
          onClick={() => setIsHistoryVisible(true)}
        >
          <MenuIcon />
        </Button>
      </motion.div>

      {/* Sheet History */}
      <Sheet open={isHistoryVisible} onOpenChange={setIsHistoryVisible}>
        <motion.div
          variants={sheetVariants}
          initial="hidden"
          animate={isHistoryVisible ? "visible" : "hidden"}
          exit="exit"
        >
          <SheetContent
            side="left"
            className="p-3 w-80 bg-muted/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
          >
            <SheetHeader>
              <VisuallyHidden.Root>
                <SheetTitle className="text-left">History</SheetTitle>
                <SheetDescription className="text-left">
                  {history === undefined ? "loading" : history.length} chats
                </SheetDescription>
              </VisuallyHidden.Root>
            </SheetHeader>

            <div className="text-sm flex flex-row items-center justify-between">
              <div className="flex flex-row gap-2">
                <div className="dark:text-zinc-300 font-semibold">History</div>
                <div className="dark:text-zinc-400 text-zinc-500">
                  {history === undefined ? "loading" : history.length} chats
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col">
              {user && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Button
                    className="font-normal text-sm flex flex-row justify-between text-white bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl py-2 shadow-md"
                    asChild
                  >
                    <Link href="/">
                      <div>Start a new chat</div>
                      <PencilEditIcon size={14} />
                    </Link>
                  </Button>
                </motion.div>
              )}

              <div className="flex flex-col overflow-y-scroll p-1 h-[calc(100dvh-124px)] mt-4">
                {!user ? (
                  <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                      <InfoIcon />
                      <div>Login to save and revisit previous chats!</div>
                    </div>
                  </motion.div>
                ) : null}

                {!isLoading && history?.length === 0 && user ? (
                  <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                      <InfoIcon />
                      <div>No chats found</div>
                    </div>
                  </motion.div>
                ) : null}

                {isLoading && user ? (
                  <div className="flex flex-col">
                    {[44, 32, 28, 52].map((item) => (
                      <motion.div
                        key={item}
                        className="p-2 my-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          className={`w-${item} h-[20px] rounded-md bg-zinc-200/50 dark:bg-zinc-600/50 animate-pulse`}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {history &&
                  history.map((chat) => (
                    <motion.div
                      key={chat.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className={cx(
                        "flex flex-row items-center gap-6 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 rounded-xl pr-2",
                        { "bg-zinc-200/80 dark:bg-zinc-700/80": chat.id === id },
                      )}
                    >
                      <Button
                        variant="ghost"
                        className="justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full"
                        asChild
                      >
                        <Link
                          href={`/chat/${chat.id}`}
                          className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg"
                        >
                          {getTitleFromChat(chat)}
                        </Link>
                      </Button>

                      <DropdownMenu modal={true}>
                        <DropdownMenuTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                          >
                            <Button
                              className="p-0 h-fit font-normal text-zinc-500 rounded-full"
                              variant="ghost"
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          </motion.div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="left"
                          className="z-[60] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)] border-gray-200/50 dark:border-gray-800/50"
                        >
                          <DropdownMenuItem asChild>
                            <Button
                              className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm text-red-600 dark:text-red-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80"
                              variant="ghost"
                              onClick={() => {
                                setDeleteId(chat.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <TrashIcon />
                              <div>Delete</div>
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  ))}
              </div>
            </div>
          </SheetContent>
        </motion.div>
      </Sheet>

      {/* Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.1)] border-gray-200/50 dark:border-gray-800/50">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-semibold">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                This action cannot be undone. This will permanently delete your chat and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AlertDialogCancel className="rounded-xl bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300/80 dark:hover:bg-gray-600/80">
                  Cancel
                </AlertDialogCancel>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                >
                  Continue
                </AlertDialogAction>
              </motion.div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </motion.div>
      </AlertDialog>
    </>
  );
};
