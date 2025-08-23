// src/app/video/[videoId]/links-list.tsx
"use client";

import { type ShareLink } from "./page";
import { Copy } from "lucide-react";

interface ShareLinksListProps {
  links: ShareLink[];
}

export default function ShareLinksList({ links }: ShareLinksListProps) {
  if (links.length === 0) {
    return (
      <p className="p-4 text-sm text-center">
        No share links have been created yet.
      </p>
    );
  }

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);

    alert("Link copied to clipboard!");
  };

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                >
                  Link
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold"
                >
                  Visibility
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold"
                >
                  Expires
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">Copy</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {links.map((link) => (
                <tr key={link.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                    {`${window.location.origin}/share/${link.token.substring(
                      0,
                      12
                    )}...`}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {link.visibility}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {link.expires_at
                      ? new Date(link.expires_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <button
                      onClick={() => handleCopy(link.token)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
