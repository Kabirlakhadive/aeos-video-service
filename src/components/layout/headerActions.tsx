"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import SignOutButton from "./signOutButton";

export default function HeaderActions({ user }: { user: User | null }) {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <Link href="/upload">
            <Button variant="default">Upload</Button>
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </>
      ) : (
        <>
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </>
      )}
    </div>
  );
}
