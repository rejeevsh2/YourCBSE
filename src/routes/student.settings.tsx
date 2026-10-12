import { createFileRoute } from "@tanstack/react-router";
import { PasswordSettings } from "@/components/common/ProfileForm";
import { PortalPage } from "@/components/layout/PortalPage";
export const Route=createFileRoute("/student/settings")({component:()=> <PortalPage portalLabel="Student Portal" portalPath="/student" title="Account settings" showNotice={false}><PasswordSettings/></PortalPage>});
