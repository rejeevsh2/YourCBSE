import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicLayout, PublicPageShell } from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const title = "Contact YourCBSE — Support for Students & Teachers";
const description =
  "Get in touch with the YourCBSE team for support, content suggestions or partnership enquiries.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ContactPage,
});

const details = [
  { icon: Mail, label: "Email", value: "hello@yourcbse.com" },
  { icon: Phone, label: "Phone", value: "+91 00000 00000" },
  { icon: MapPin, label: "Address", value: "New Delhi, India" },
];

function ContactPage() {
  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
          title="Contact us"
          description="Questions, feedback or content suggestions — we read everything."
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Choose a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Student support</SelectItem>
                      <SelectItem value="teacher">Teacher onboarding</SelectItem>
                      <SelectItem value="content">Content feedback</SelectItem>
                      <SelectItem value="other">Something else</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} placeholder="How can we help?" required />
                </div>
                <Button type="submit" className="w-fit">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {details.map((detail) => (
              <Card key={detail.label}>
                <CardContent className="flex items-start gap-3 p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <detail.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{detail.label}</p>
                    <p className="text-sm font-medium">{detail.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}
