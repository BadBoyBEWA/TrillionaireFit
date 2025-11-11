import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function requireAuth(request: NextRequest) {
  // First try to get token from Authorization header (for API calls with Bearer token)
  let token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  
  // If no Authorization header, try to get token from cookies (for frontend calls)
  if (!token) {
    token = request.cookies.get("token")?.value;
  }
  
  if (!token) {
    throw new Error("Authentication required: No token provided");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new Error("Authentication failed: Invalid or expired token");
  }

  return decoded; // in case you want user info inside the route
}

export function requireAdmin(request: NextRequest) {
  // First try to get token from Authorization header (for API calls with Bearer token)
  let token = request.headers.get("authorization")?.replace("Bearer ", "").trim();
  
  // If no Authorization header, try to get token from cookies (for frontend calls)
  if (!token) {
    token = request.cookies.get("token")?.value;
  }
  
  if (!token) {
    throw new Error("Authentication required: No token provided");
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw new Error("Authentication failed: Invalid or expired token");
  }

  if (decoded.role !== "admin") {
    throw new Error("Admin access required");
  }

  return decoded; // in case you want user info inside the route
}
