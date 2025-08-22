import Link from "next/link";
import { Video } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import HeaderActions from "./headerActions";

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="py-4 px-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2"
        >
          <Video className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Aeos Video</span>
        </Link>
        <HeaderActions user={user} />
      </div>
    </header>
  );
}
