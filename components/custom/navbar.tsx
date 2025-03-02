import Image from "next/image";
import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history"; // Đảm bảo file history.tsx đã export History
import { SlashIcon, MessageIcon, UserIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5" // Giữ viền nét vẽ rõ hơn
  >
    <rect
      x="0.5"
      y="0.5"
      width="23"
      height="23"
      rx="4"
      fill="none"
      stroke="none"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
    />
  </svg>
);



export const Navbar = async () => {
  let session = await auth();

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
<Button
  variant="outline"
  className="py-1 px-4 h-fit font-normal bg-transparent hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-300 outline-none shadow-none focus:ring-0"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "4px 16px",
    border: "1px solid #ccc", // Thêm border nhẹ để không bị mất
    outline: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
  }}
>
  <PhoneIcon />
  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
    GetApp
  </span>
</Button>





        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button className="py-1.5 px-2 h-fit font-normal bg-transparent hover:bg-transparent border-none shadow-none">
  <UserIcon className="text-gray-700 dark:text-gray-300" />
</Button>


              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-none">
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
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
