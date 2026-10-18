import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/admin-auth.server";

export async function GET(request: Request) {
  const isAuthenticated = await authenticateAdminRequest(request);
  return NextResponse.json(
    { authenticated: isAuthenticated },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
