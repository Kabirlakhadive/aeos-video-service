// @ts-nocheck
// src/app/dashboard/links/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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

  const isLinkActive = (expires_at: string | null) => {
    if (!expires_at) return true;
    return new Date(expires_at) > new Date();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>All Share Links</h1>
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>

      <div style={{ border: "1px solid #ccc", marginTop: "1rem" }}>
        {links.length === 0 ? (
          <p style={{ padding: "1rem", textAlign: "center" }}>
            You have not created any share links.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Video
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Visibility
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Expires
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Last Viewed
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {link.videos?.name ?? "Unknown Video"}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {link.visibility}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {link.expires_at
                      ? new Date(link.expires_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {isLinkActive(link.expires_at) ? "Active" : "Expired"}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {link.last_viewed_at
                      ? new Date(link.last_viewed_at).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
