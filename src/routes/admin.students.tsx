import { createFileRoute } from "@tanstack/react-router";
import { UserAccounts } from "@/components/admin/UserAccounts";
export const Route=createFileRoute("/admin/students")({component:()=> <UserAccounts role="student"/>});
