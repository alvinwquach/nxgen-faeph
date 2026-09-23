import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/fae/AdminPanel";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — F.A.E. Court" },
      { name: "description", content: "F.A.E. Court operations panel." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});
