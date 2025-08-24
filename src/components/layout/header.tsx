// src/components/layout/header.tsx
import Link from "next/link";
import { Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "../ui/button";
import UserNav from "./user-nav";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 items-center">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <Video className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">
            AEOS Stream
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button asChild>
                <Link href="/upload">Upload</Link>
              </Button>
              <UserNav user={user} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
