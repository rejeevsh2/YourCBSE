import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileFormProps {
  name: string;
  role: string;
  email?: string;
  bioLabel?: string;
}

/** Shared profile form used by every portal. Presentational only in Phase 1. */
export function ProfileForm({
  name,
  role,
  email = "user@yourcbse.com",
  bioLabel = "About",
}: ProfileFormProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary-soft text-lg text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-heading text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Change photo
          </Button>
        </div>

        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" defaultValue={name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" type="email" defaultValue={email} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-bio">{bioLabel}</Label>
            <Textarea id="profile-bio" rows={4} placeholder="Add a short description…" />
          </div>
          <Button type="submit" className="w-fit">
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
