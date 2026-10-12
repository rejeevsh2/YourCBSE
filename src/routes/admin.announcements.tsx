import { createFileRoute } from "@tanstack/react-router";
import { Announcements } from "@/components/admin/Announcements";
export const Route = createFileRoute("/admin/announcements")({ component: Announcements });
