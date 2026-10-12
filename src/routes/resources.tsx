import { createFileRoute } from "@tanstack/react-router";
import { LiveLibrary } from "@/components/resource-center/LiveLibrary";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
export const Route=createFileRoute("/resources")({component:()=> <PublicLayout><PublicPageShell><LiveLibrary/></PublicPageShell></PublicLayout>});
