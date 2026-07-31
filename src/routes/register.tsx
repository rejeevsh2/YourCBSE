import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AuthDivider,
  AuthField,
  AuthShell,
  ErrorAlert,
  GoogleAuthButton,
  PasswordInput,
  PrimaryButton,
  ValidationMessage,
} from "@/components/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthAction } from "@/hooks/use-auth-action";
import {
  authService,
  mergeFieldErrors,
  validateEmail,
  validateMatch,
  validateMobile,
  validatePassword,
  validateRequired,
  type FieldErrors,
} from "@/lib/auth";

const title = "Create an Account — YourCBSE";
const description = "Register for YourCBSE to access CBSE notes, videos and practice resources.";

export const Route = createFileRoute("/register")({
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
  component: RegisterPage,
});

const initialValues = {
  fullName: "",
  email: "",
  mobile: "",
  password: "",
  confirm: "",
  role: "student" as "student" | "teacher",
  terms: false,
};

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialValues);
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const { loading, error, fieldErrors, run } = useAuthAction(authService.register);
  const errors = mergeFieldErrors(localErrors, fieldErrors);

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      fullName: validateRequired(values.fullName, "Full name"),
      email: validateEmail(values.email),
      mobile: validateMobile(values.mobile),
      password: validatePassword(values.password),
      confirm: validateMatch(values.password, values.confirm),
      terms: values.terms ? undefined : "Please accept the terms to continue.",
    };
    setLocalErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const result = await run({
      fullName: values.fullName,
      email: values.email,
      mobile: values.mobile,
      password: values.password,
      passwordConfirmation: values.confirm,
      role: values.role,
    });
    if (!result?.ok) return;

    toast.success("Account created", { description: "Verify your email to finish setting up." });
    navigate({ to: "/verify-email", search: { email: values.email } });
  }

  return (
    <AuthShell
      title="Create your account"
      description="Join YourCBSE and keep every chapter in one place."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {error ? <ErrorAlert title="Registration failed">{error}</ErrorAlert> : null}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <AuthField
          label="Full name"
          id="register-name"
          name="full_name"
          autoComplete="name"
          placeholder="Your name"
          value={values.fullName}
          error={errors.fullName}
          onChange={(event) => set("fullName", event.target.value)}
        />
        <AuthField
          label="Email"
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          error={errors.email}
          onChange={(event) => set("email", event.target.value)}
        />
        <AuthField
          label="Mobile number"
          id="register-mobile"
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="98765 43210"
          hint="We use this for exam reminders only."
          value={values.mobile}
          error={errors.mobile}
          onChange={(event) => set("mobile", event.target.value)}
        />
        <div className="space-y-2">
          <Label htmlFor="register-role">I am a</Label>
          <Select
            value={values.role}
            onValueChange={(value) => set("role", value as "student" | "teacher")}
          >
            <SelectTrigger id="register-role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <PasswordInput
          label="Password"
          id="register-password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          showStrength
          value={values.password}
          error={errors.password}
          onChange={(event) => set("password", event.target.value)}
        />
        <PasswordInput
          label="Confirm password"
          id="register-confirm"
          name="password_confirmation"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirm}
          error={errors.confirm}
          onChange={(event) => set("confirm", event.target.value)}
        />
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              className="mt-0.5"
              checked={values.terms}
              onCheckedChange={(checked) => set("terms", checked === true)}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
            <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
              I agree to the terms of use and privacy policy.
            </Label>
          </div>
          <ValidationMessage id="terms-error" message={errors.terms} />
        </div>
        <PrimaryButton type="submit" loading={loading} loadingText="Creating account…">
          Create account
        </PrimaryButton>
      </form>

      <AuthDivider label="or sign up with" />
      <GoogleAuthButton label="Continue with Google" />
    </AuthShell>
  );
}
