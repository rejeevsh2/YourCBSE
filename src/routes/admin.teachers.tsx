import { createFileRoute } from "@tanstack/react-router";
import { UserAccounts } from "@/components/admin/UserAccounts";
export const Route=createFileRoute("/admin/teachers")({component:()=> <UserAccounts role="teacher"/>});
