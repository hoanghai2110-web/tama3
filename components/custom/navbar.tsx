import Link from "next/link";

import { auth, signOut } from "@/app/(auth)/auth";

import { History } from "./history";
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

  const getAppButtonStyle = {
    background: "transparent",
    border: "1px solid black",
    color: "black",
    padding: "0.375rem 0.5rem",
    height: "fit-content",
    fontWeight: "normal" as const,
  };

  const getAppButtonHoverStyle = {
    background: "#f3f4f6",
    transition: "background-color 0.2s ease-in-out",
  };

  const userIconButtonStyle = {
    background: "transparent",
    padding: "0.375rem 0.5rem",
    height: "fit-content",
    fontWeight: "normal" as const,
  };

  const userIconSvgStyle = {
    color: "#4a5568", // gray-800
  };

  const dropdownContentStyle = {
    border: "none",
    background: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(12px)",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={session?.user} />
          <Button
            asChild
            style={getAppButtonStyle}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, getAppButtonHoverStyle)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, getAppButtonStyle)}
          >
            <Link href="/get-app" target="_blank">
              Get App
            </Link>
          </Button>
        </div>

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button style={userIconButtonStyle}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={userIconSvgStyle}
                >
                  <path
                    d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 14.5C6.20101 14.5 1.5 19.201 1.5 25H22.5C22.5 19.201 17.799 14.5 12 14.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              style={dropdownContentStyle}
            >
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
          <Button className="py-1.5 px-2 h-fit font-normal text-white" asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </>
  );
};
