// basic landing page 
// improve later

import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold">Welcome to AEOS Stream</h1>
      <p className="text-lg text-muted-foreground mt-6 mb-6">
        Upload, process, share your videos fast and secure.
      </p>
      <Link href="/login">
        <Button>Get Started</Button>
      </Link>
    </div>
  )
}