"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import useSWR from "swr";

import { Chat } from "@/db/schema";
import { fetcher, getTitleFromChat } from "@/lib/utils";
import { MenuIcon, MoreHorizontalIcon, PencilEditIcon, TrashIcon } from "./icons";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const { data: history, mutate } = useSWR<Array<Chat>>(
    user ? "/api/history" : null,
    fetcher,
    { fallbackData: [] }
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    mutate();
  }, [pathname, mutate]);

  const handleDelete = async () => {
    await fetch(`/api/chat?id=${deleteId}`, { method: "DELETE" });
    mutate((history) => history?.filter((h) => h.id !== deleteId));
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Button
        variant="outline"
        className="p-1.5 h-fit"
        onClick={() => setIsHistoryVisible(true)}
      >
        <MenuIcon />
      </Button>

      <Sheet open={isHistoryVisible} onOpenChange={setIsHistoryVisible}>
        <SheetContent
          side="left"
          className="p-3 w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ease-in-out"
        >
          <div className="text-sm flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <div className="text-gray-800">History</div>
              <div className="text-gray-500">{history?.length} chats</div>
            </div>
          </div>

          <div className="mt-10 flex flex-col">
            {user && (
              <Button
                className="font-normal text-sm flex flex-row justify-between text-white bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
                asChild
              >
                <Link href="/">
                  <div>Start a new chat</div>
                  <PencilEditIcon size={14} />
                </Link>
              </Button>
            )}

            <div className="flex flex-col overflow-y-scroll p-1 h-[calc(100dvh-124px)]">
              {history?.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex flex-row items-center gap-6 hover:bg-gray-100/50 rounded-md pr-2 transition-colors duration-200 ${
                    chat.id === id ? "bg-gray-100/70" : ""
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="hover:bg-gray-100/50 justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full transition-colors duration-200"
                    asChild
                  >
                    <Link
                      href={`/chat/${chat.id}`}
                      className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg text-gray-800"
                    >
                      {getTitleFromChat(chat)}
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="p-0 h-fit font-normal text-gray-500 transition-colors duration-200 hover:bg-gray-100/50"
                        variant="ghost"
                      >
                        <MoreHorizontalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="left"
                      className="bg-white/95 backdrop-blur-md"
                    >
                      <DropdownMenuItem asChild>
                        <Button
                          className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm text-gray-800 hover:bg-gray-100"
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
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will permanently delete your chat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100 transition-colors duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gray-900 hover:bg-gray-800 text-white transition-colors duration-200"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
