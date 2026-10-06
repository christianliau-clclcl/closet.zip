import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Public closets live at /@username (Milestone 15d). Folders starting with
  // @ mean parallel routes in Next.js, so the page itself is /u/[username];
  // this shows it at the @ address without changing what's in the bar.
  async rewrites() {
    return [{ source: "/@:username", destination: "/u/:username" }];
  },
};

export default nextConfig;
