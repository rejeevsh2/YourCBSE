import { useState } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { toast } from "sonner";

import {
  AuthDivider,
  AuthField,
  AuthShell,
  ErrorAlert,
  GoogleAuthButton,
  PasswordInput,
  PrimaryButton,
} from "@/components/auth";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuthAction } from "@/hooks/use-auth-action";

import {
  authService,
  mergeFieldErrors,
  saveSession,
  validateEmail,
  validatePassword,
  type FieldErrors,
} from "@/lib/auth";

const title = "Login — YourSchool";

const description =
  "Sign in to your YourSchool student, teacher or admin portal.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});

  const {
    loading,
    error,
    fieldErrors,
    run,
  } = useAuthAction(authService.login);

  const errors = mergeFieldErrors(
    localErrors,
    fieldErrors,
  );

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setLocalErrors(nextErrors);

    if (
      nextErrors.email ||
      nextErrors.password
    ) {
      return;
    }

    const result = await run({
      email,
      password,
      remember,
    });

    if (!result) {
      return;
    }

    if (!result.ok) {
      if (result.code === "account-locked") {
        await navigate({
          to: "/account-locked",
        });

        return;
      }

      if (
        result.code ===
        "email-not-verified"
      ) {
        await navigate({
          to: "/verify-email",
          search: { email },
        });

        return;
      }

      return;
    }

    /*
     * Successful Laravel login.
     *
     * 1. Save token and authenticated user.
     * 2. Invalidate TanStack Router so protected
     *    route guards read the new authentication state.
     * 3. Navigate to the correct portal.
     */
    if (result.data) {
      saveSession(
        result.data,
        remember,
      );

      await router.invalidate();

      const role =
        result.data.user.role;

      if (role === "admin") {
        toast.success(
          "Welcome back!",
          {
            description:
              "Opening your admin portal.",
          },
        );

        await navigate({
          to: "/admin",
        });

        return;
      }

      if (role === "teacher") {
        toast.success(
          "Welcome back!",
          {
            description:
              "Opening your teacher portal.",
          },
        );

        await navigate({
          to: "/teacher",
        });

        return;
      }

      toast.success(
        "Welcome back!",
        {
          description:
            "Opening your student portal.",
        },
      );

      await navigate({
        to: "/student",
      });
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue learning."
      footer={
        <>
          New to YourSchool?{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {error ? (
        <ErrorAlert title="Sign in failed">
          {error}
        </ErrorAlert>
      ) : null}

      <form
        className="space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <AuthField
          label="Email"
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          error={errors.email}
          onChange={(event) =>
            setEmail(
              event.target.value,
            )
          }
        />

        <PasswordInput
          label="Password"
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          error={errors.password}
          onChange={(event) =>
            setPassword(
              event.target.value,
            )
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(
                checked,
              ) =>
                setRemember(
                  checked === true,
                )
              }
            />

            <Label
              htmlFor="remember"
              className="text-sm font-normal text-muted-foreground"
            >
              Remember me
            </Label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <PrimaryButton
          type="submit"
          loading={loading}
          loadingText="Signing in…"
        >
          Sign in
        </PrimaryButton>
      </form>

      <AuthDivider label="or continue with" />

      <GoogleAuthButton />

      <div className="space-y-2 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Preview a portal interface:
        </p>

        <div className="grid grid-cols-3 gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to="/student">
              Student
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to="/teacher">
              Teacher
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
          >
            <Link to="/admin">
              Admin
            </Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}