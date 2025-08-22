// basic page 

import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-semibold">Landing Page</h1>
      <p className="text-lg text-muted-foreground mt-6 mb-6">
        ** some tagline **
      </p>
      <Link href="/login">
        <Button>Get Started</Button>
      </Link>
    </div>
  )
}