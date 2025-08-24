import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 px-4 py-24 md:py-32">
      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
        <Video className="h-12 w-12 text-primary" />
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter max-w-3xl">
        The Simple Way to Store and Share Your Videos
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl">
        Upload, process, and generate secure shareable links for your videos
        with ease. Built with a modern, scalable, and secure architecture.
      </p>

      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/signup">Get Started</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
