import Image from "next/image";  
import Link from "next/link";  
import { auth, signOut } from "@/app/(auth)/auth";  
import { History } from "./history";  
import { SlashIcon, MessageIcon, UserIcon } from "./icons";  
import { ThemeToggle } from "./theme-toggle";  
import { Button } from "../ui/button";  
import {  
  DropdownMenu,  
  DropdownMenuContent,  
  DropdownMenuItem,  
  DropdownMenuTrigger,  
} from "../ui/dropdown-menu";  

// SVG component cho icon điện thoại
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12" y2="18"></line>
  </svg>
);

export const Navbar = async () => {  
  let session = await auth();  

  return (  
    <>  
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">  
        <div className="flex flex-row gap-3 items-center">  
          <History user={session?.user} />  
          {/* Đã bỏ logo và text TamaAI */}
        </div>  

        <div className="flex items-center gap-3">
          {/* Thêm nút GetApp */}
          <Button 
            variant="outline" 
            className="py-1.5 px-2 h-fit font-normal border-black bg-transparent hover:bg-gray-100"
          >
            <PhoneIcon />
            <span className="ml-1">GetApp</span>
          </Button>

          {session ? (  
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="py-1.5 px-2 h-fit font-normal" variant="secondary">
                  <UserIcon/>
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
            <Button className="py-1.5 px-2 h-fit font-normal text-white" asChild>  
              <Link href="/login">Login</Link>  
            </Button>  
          )}  
        </div>
      </div>  
    </>  
  );  
};
