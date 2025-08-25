"use client";

import { type ShareLink } from "./page";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareLinksListProps {
  links: ShareLink[];
}

export default function ShareLinksList({ links }: ShareLinksListProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopy = (token: string) => {
    const url = `${origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Link</TableHead>
          <TableHead>Visibility</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No share links have been created yet.
            </TableCell>
          </TableRow>
        ) : (
          links.map((link) => (
            <TableRow key={link.id}>
              <TableCell className="font-medium">
                {origin
                  ? `${origin}/share/${link.token.substring(0, 12)}...`
                  : "loading..."}
              </TableCell>
              <TableCell>{link.visibility}</TableCell>
              <TableCell>
                {link.expires_at
                  ? new Date(link.expires_at).toLocaleString()
                  : "Never"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(link.token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
