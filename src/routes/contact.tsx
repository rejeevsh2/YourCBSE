import {
  useState,
  type FormEvent,
} from "react";
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";
import {
  CheckCircle2,
  HelpCircle,
  Mail,
  MessageSquare,
} from "lucide-react";

import {
  PublicLayout,
  PublicPageShell,
} from "@/components/layout/PublicLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { API_BASE_URL, authenticatedFetch } from "@/lib/auth/http";

const title =
  "Contact YourTeacher — Student & Teacher Support";

const description =
  "Send a question, support request or content suggestion to the YourTeacher team.";

type ContactCategory =
  | "general"
  | "account"
  | "content"
  | "technical"
  | "school"
  | "other";

type ContactResponse = {
  message?: string;
  ticket_number?: string;
};

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
    ],
  }),

  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] =
    useState<ContactCategory>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [ticketNumber, setTicketNumber] =
    useState("");

  async function submitContact(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setTicketNumber("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/public/contact`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            category,
            subject: subject.trim(),
            message: message.trim(),
          }),
        },
      );

      const data =
        (await response.json()) as ContactResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Your message could not be sent.",
        );
      }

      setTicketNumber(
        data.ticket_number ?? "",
      );

      setName("");
      setEmail("");
      setCategory("general");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your message could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <PublicPageShell>
        <PageHeader
          breadcrumbs={[
            { label: "Home", to: "/" },
            { label: "Contact" },
          ]}
          title="Contact us"
          description="Questions, feedback or support requests can be sent directly to the YourTeacher support team."
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                Send a message
              </CardTitle>
            </CardHeader>

            <CardContent>
              <form
                className="grid gap-5"
                onSubmit={submitContact}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Full name
                    </Label>

                    <Input
                      id="name"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Your name"
                      autoComplete="name"
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email
                    </Label>

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Topic
                  </Label>

                  <Select
                    value={category}
                    onValueChange={(value) =>
                      setCategory(
                        value as ContactCategory,
                      )
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="general">
                        General enquiry
                      </SelectItem>

                      <SelectItem value="account">
                        Account or student support
                      </SelectItem>

                      <SelectItem value="content">
                        Content feedback
                      </SelectItem>

                      <SelectItem value="technical">
                        Technical problem
                      </SelectItem>

                      <SelectItem value="school">
                        Teacher or school enquiry
                      </SelectItem>

                      <SelectItem value="other">
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">
                    Subject
                  </Label>

                  <Input
                    id="subject"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    placeholder="Briefly describe your request"
                    required
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message
                  </Label>

                  <Textarea
                    id="message"
                    rows={7}
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder="How can we help?"
                    required
                    maxLength={10000}
                  />
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                  >
                    {error}
                  </div>
                ) : null}

                {ticketNumber ? (
                  <div
                    role="status"
                    className="rounded-xl border border-success/30 bg-success/5 p-4"
                  >
                    <div className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />

                      <div>
                        <p className="font-medium text-foreground">
                          Message received
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Your support reference is{" "}
                          <span className="font-semibold text-foreground">
                            {ticketNumber}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-fit"
                  disabled={submitting}
                >
                  <MessageSquare className="size-4" />

                  {submitting
                    ? "Sending..."
                    : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </span>

                <h2 className="mt-4 font-heading font-semibold">
                  Support requests
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Messages submitted here are sent directly
                  to the YourTeacher support system for
                  review by an administrator.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <HelpCircle className="size-5" />
                </span>

                <h2 className="mt-4 font-heading font-semibold">
                  Need quick help?
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Check the Help and FAQ pages for common
                  questions before submitting a request.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                  >
                    <Link to="/help">
                      Help
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                  >
                    <Link to="/faq">
                      FAQ
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicPageShell>
    </PublicLayout>
  );
}