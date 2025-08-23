// src/app/video/[videoId]/create-share-link.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createShareLink } from "./actions";
import { toast } from "sonner";
interface CreateShareLinkProps {
  videoId: string;
}

export default function CreateShareLink({ videoId }: CreateShareLinkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [emails, setEmails] = useState("");
  const [expiry, setExpiry] = useState<"1h" | "12h" | "1d" | "30d" | "never">(
    "30d"
  );
  const [error, setError] = useState<string | null>(null);

  const handleCreateLink = async () => {
    setError(null);
    const result = await createShareLink({
      videoId,
      visibility,
      emails:
        visibility === "PRIVATE"
          ? emails
              .split(",")
              .map((e) => e.trim())
              .filter(Boolean)
          : [],
      expiry,
    });

    if (result.failure) {
      setError(result.failure);
    } else {
      toast.success("Link Created Successfully!", {
        description: "The shareable link has been added to the list below.",
      });

      if (visibility === "PRIVATE" && emails.length > 0) {
        toast.info("Email Notification Sent", {
          description:
            "For this demo, all emails are sent to a pre-verified address.",
        });
      }

      setIsOpen(false);
      setVisibility("PUBLIC");
      setEmails("");
      setExpiry("30d");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Share Link</DialogTitle>
          <DialogDescription>
            Configure the settings for your new link.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid gap-2">
            <Label>Visibility</Label>
            <RadioGroup
              value={visibility}
              onValueChange={(value: "PUBLIC" | "PRIVATE") =>
                setVisibility(value)
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PUBLIC" id="r1" />
                <Label htmlFor="r1">
                  Public (anyone with the link can view)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PRIVATE" id="r2" />
                <Label htmlFor="r2">
                  Private (only specific emails can access)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {visibility === "PRIVATE" && (
            <div className="grid gap-2">
              <Label htmlFor="emails">Allowed Emails</Label>
              <Input
                id="emails"
                placeholder="user1@example.com, user2@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter email addresses separated by commas.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Link Expiry</Label>
            <Select
              value={expiry}
              onValueChange={(value) => setExpiry(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an expiry duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 Hour</SelectItem>
                <SelectItem value="12h">12 Hours</SelectItem>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateLink}>Generate Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
