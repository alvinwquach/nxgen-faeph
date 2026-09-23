import { createFileRoute } from "@tanstack/react-router";
import { AdminV2 } from "@/components/fae/AdminPanel";

export const Route = createFileRoute("/_authenticated/admin-v2")({
  head: () => ({
    meta: [
      { title: "Operations — FAE Bookings" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminV2,
});
