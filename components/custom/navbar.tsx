import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/app/(auth)/auth";
import { History } from "./history";
import { UserIcon, SunIcon, MoonIcon } from "./icons"; // Giả sử có thêm icons
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
    <nav className="bg-background/95 backdrop-blur-md fixed top-0 left-0 w-full py-3 px-4 md:px-6 flex items-center justify-between shadow-sm z-50">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Image
            src="/images/gemini.png"
            height={28}
            width={28}
            alt="TamaAI logo"
            className="rounded-full"
          />
          <span className="text-lg font-semibold dark:text-white text-gray-900 tracking-tight">
            TamaAI
          </span>
        </Link>
        {session && (
          <History user={session?.user} className="hidden md:block" />
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle as a separate button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <SunIcon className="h-5 w-5 dark:hidden" />
          <MoonIcon className="h-5 w-5 hidden dark:block" />
        </Button>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {session.user?.name?.[0] || <UserIcon className="h-4 w-4" />}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {session.user?.name || "User"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mt-2 w-48 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                <UserIcon className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2">
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                  className="w-full"
                >
                  <button
                    type="submit"
                    className="w-full text-left text-sm text-red-600 dark:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-md"
                  >
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            className="rounded-full px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all shadow-md"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};
