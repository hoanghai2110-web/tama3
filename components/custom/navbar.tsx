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
          </div>
        </div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-1.5 px-2 h-fit font-normal btn-secondary"
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
                    className="w-full text-left px-1 py-0.5 text-white btn-sign-out"
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
            className="py-1.5 px-2 h-fit font-normal text-white btn-login"
            asChild
            aria-label="Login button"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>

      <style jsx>{`
        .btn-default {
          background-color: #007bff; /* Xanh dương đậm */
          color: #ffffff; /* Màu chữ trắng */
          padding: 0.5rem 1rem;
          font-weight: bold;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .btn-default:hover {
          background-color: #0056b3; /* Xanh đậm hơn khi hover */
        }

        .btn-secondary {
          background-color: #6c757d; /* Màu xám */
          color: #ffffff;
          padding: 0.5rem 1rem;
          font-weight: bold;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .btn-secondary:hover {
          background-color: #5a6268; /* Xám đậm hơn khi hover */
        }

        .btn-sign-out {
          background-color: #dc3545; /* Màu đỏ cho button đăng xuất */
          color: #ffffff;
          padding: 0.5rem 1rem;
          font-weight: bold;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .btn-sign-out:hover {
          background-color: #c82333; /* Màu đỏ đậm hơn khi hover */
        }

        .btn-login {
          background-color: #28a745; /* Xanh lá cho login */
          color: #ffffff;
          padding: 0.5rem 1rem;
          font-weight: bold;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }

        .btn-login:hover {
          background-color: #218838; /* Màu xanh lá đậm hơn khi hover */
        }

        .btn-disabled {
          background-color: #6c757d; /* Màu xám cho trạng thái không thể nhấn */
          color: #ffffff;
          cursor: not-allowed;
        }

        .btn-disabled:hover {
          background-color: #6c757d; /* Không thay đổi màu khi hover */
        }
      `}</style>
    </>
  );
};
