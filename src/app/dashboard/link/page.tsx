// @ts-nocheck
// src/app/dashboard/link/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import LinksTable from "./links-table";

async function getLinks() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("share_links")
    .select(
      `
      id,
      token,
      visibility,
      expires_at,
      last_viewed_at,
      videos ( name )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching share links:", error);
    return [];
  }

  return data;
}

export default async function LinkManagementPage() {
  const links = await getLinks();

  return (
    <Card className="mt-10">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>All Share Links</CardTitle>
            <CardDescription>
              Manage all the links you have created for your videos.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <LinksTable links={links} />
      </CardContent>
    </Card>
  );
}
