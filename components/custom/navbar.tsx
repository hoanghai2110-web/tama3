import Image from "next/image";  
import Link from "next/link";  
  
import { auth, signOut } from "@/app/(auth)/auth";  
  
import { History } from "./history";  
import { SlashIcon, MessageIcon } from "./icons";  
import { UserIcon } from './icons';  // Đảm bảo đường dẫn đúng nơi chứa UserIcon
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
              src="/images/gemini.png"  
              height={20}  
              width={20}  
              alt="gemini logo"  
            />  
            <div className="text-sm dark:text-zinc-300 truncate w-28 md:w-fit">
              TamaAI
            </div>  
            <div className="text-sm dark:text-zinc-300 truncate w-28 md:w-fit">  
            </div>  
          </div>  
        </div>  
  
        {session ? (  
          <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="py-1.5 px-2 h-fit font-normal" variant="secondary">
      <UserIcon/> {/* Thay thế email bằng icon */}
    </Button>
  </DropdownMenuTrigger>

  <DropdownMenuContent align="end" className="border-none"> {/* Thêm class border-none */}
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
            <Link href="/login"><MessageIcon /> Login</Link>  
          </Button>  
        )}  
      </div>  
    </>  
  );  
};
