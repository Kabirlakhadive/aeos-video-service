"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteShareLink } from "./actions";

type Link = {
  id: string;
  token: string;
  visibility: "PUBLIC" | "PRIVATE";
  expires_at: string | null;
  last_viewed_at: string | null;
  videos: { name: string } | { name: string }[] | null;
};

interface LinksTableProps {
  links: Link[];
}

export default function LinksTable({ links }: LinksTableProps) {
  const isLinkActive = (expires_at: string | null) => {
    if (!expires_at) return true;
    return new Date(expires_at) > new Date();
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleDelete = async (linkId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this link? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await deleteShareLink(linkId);

    if (result.failure) {
      toast.error("Failed to delete link", { description: result.failure });
    } else {
      toast.success("Link deleted successfully.");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Video</TableHead>
          <TableHead>Visibility</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Viewed</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              You have not created any share links.
            </TableCell>
          </TableRow>
        ) : (
          links.map((link) => {
            const active = isLinkActive(link.expires_at);
            const videoName = Array.isArray(link.videos)
              ? link.videos[0]?.name
              : link.videos?.name;

            return (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  {videoName ?? "Unknown Video"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      link.visibility === "PUBLIC" ? "secondary" : "default"
                    }
                  >
                    {link.visibility}
                  </Badge>
                </TableCell>
                <TableCell>
                  {link.expires_at
                    ? new Date(link.expires_at).toLocaleString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  <Badge variant={active ? "default" : "destructive"}>
                    {active ? "Active" : "Expired"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {link.last_viewed_at
                    ? new Date(link.last_viewed_at).toLocaleString()
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(link.token)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
