import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/app/(auth)/auth";
import { History } from "./history";
import { SlashIcon, MessageIcon, UserIcon, SunIcon, MoonIcon } from "./icons";
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
    <nav className="bg-background/90 backdrop-blur-lg fixed top-0 left-0 w-full py-3 px-4 md:px-6 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.05)] z-50 transition-all duration-300">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-transform duration-200 ease-out hover:scale-105"
        >
          <Image
            src="/images/gemini.png"
            height={28}
            width={28}
            alt="TamaAI logo"
            className="rounded-full transition-transform duration-300 ease-in-out"
          />
          <span className="text-lg font-medium dark:text-white text-gray-900 tracking-tight">
            TamaAI
          </span>
        </Link>
        {session && <History user={session?.user} />}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 ease-in-out"
        >
          <SunIcon className="h-5 w-5 dark:hidden transition-transform duration-300 ease-out" />
          <MoonIcon className="h-5 w-5 hidden dark:block transition-transform duration-300 ease-out" />
        </Button>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="py-1.5 px-2 h-fit font-normal rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 ease-in-out"
                variant="secondary"
              >
                <UserIcon className="h-5 w-5 transition-transform duration-300 ease-out" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mt-2 w-48 rounded-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-800/50 transition-all duration-200 ease-in-out"
            >
              <DropdownMenuItem className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-lg transition-all duration-150 ease-out">
                <UserIcon className="h-4 w-4 mr-2" />
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
                    className="w-full text-left text-sm text-red-600 dark:text-red-500 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 px-2 py-1 rounded-lg transition-all duration-150 ease-out"
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
            className="rounded-full px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 ease-in-out shadow-md"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
};
