"use client";  // Thêm dòng này ở đầu file

import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history";
import { SlashIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
          <div className="flex flex-row gap-2 items-center">
            <Image
              src="/images/gemini-logo.png"
              height={20}
              width={20}
              alt="gemini logo"
            />
            <div className="text-zinc-500"></div>
            <div className="text-sm dark:text-zinc-300 truncate w-28 md:w-fit"></div>
          </div>
        </div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-1.5 px-2 h-fit font-normal"
                variant="secondary"
                aria-label={`Open user account menu for ${session.user?.email}`}
              >
                {session.user?.email?.slice(0, 10)} {/* Cắt chuỗi chỉ lấy 10 ký tự đầu */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ThemeToggle />
              </DropdownMenuItem>
              <DropdownMenuItem className="p-1 z-50">
                <form
                  className="w-full"
                  action={async () => {
                    "use server";

                    await signOut({
                      redirectTo: "/",
                    });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left px-1 py-0.5 text-red-500"
                    aria-label="Sign out of account"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            className="py-1.5 px-2 h-fit font-normal text-white"
            asChild
            aria-label="Login button"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>

      {/* Style jsx sẽ chỉ hoạt động khi bạn đánh dấu là client */}
      <style jsx>{`
        .btn-submit {
          background-color: #007bff; /* Màu xanh dương */
          color: white;
          padding: 0.75rem 1.25rem;
          font-weight: bold;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .btn-submit:hover {
          background-color: #0056b3; /* Màu xanh đậm khi hover */
        }

        .btn-pending {
          background-color: #6c757d; /* Màu xám khi đang xử lý */
          color: white;
          padding: 0.75rem 1.25rem;
          font-weight: bold;
          border-radius: 4px;
          cursor: not-allowed;
        }

        .btn-pending:hover {
          background-color: #6c757d; /* Không thay đổi khi hover */
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};
