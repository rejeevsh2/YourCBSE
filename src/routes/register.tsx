import { useCallback, useEffect, useState } from "react";
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
import { apiRequest } from "@/lib/auth/http";

const title = "Create an Account — YourSchool";
const description =
  "Register for YourSchool to access CBSE notes, videos and practice resources.";

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

type GradeOption = {
  id: number;
  name: string;
  grade_number: number;
};

type GradesResponse = {
  grades?: GradeOption[];
};

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
  const [gradeIds, setGradeIds] = useState<number[]>([]);
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [gradesLoading, setGradesLoading] = useState(true);
  const [gradesError, setGradesError] = useState("");
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const { loading, error, fieldErrors, run } = useAuthAction(authService.register);
  const errors = mergeFieldErrors(localErrors, fieldErrors);

  const loadGrades = useCallback(async () => {
    setGradesLoading(true);
    setGradesError("");

    try {
      const result =
        await apiRequest<GradesResponse>(
          "/registration/grades",
          { method: "GET" },
        );

      if (result.ok && result.data) {
        setGrades(
          result.data.grades ?? [],
        );
      } else {
        setGrades([]);

        setGradesError(
          result.message ??
            "Unable to load classes. Please try again.",
        );
      }
    } catch {
      setGrades([]);

      setGradesError(
        "Unable to load classes. Please try again.",
      );
    } finally {
      setGradesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGrades();
  }, [loadGrades]);

  const set = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => setValues((current) => ({ ...current, [key]: value }));

  function setRole(role: "student" | "teacher") {
    set("role", role);

    if (role === "student") {
      setGradeIds([]);
    }
  }

  function toggleGrade(id: number, checked: boolean) {
    setGradeIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((gradeId) => gradeId !== id),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FieldErrors = {
      fullName: validateRequired(values.fullName, "Full name"),
      email: validateEmail(values.email),
      mobile: validateMobile(values.mobile),
      password: validatePassword(values.password),
      confirm: validateMatch(values.password, values.confirm),
      gradeIds:
        values.role === "teacher" && gradeIds.length === 0
          ? "Select at least one class."
          : undefined,
      terms: values.terms
        ? undefined
        : "Please accept the terms to continue.",
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
      gradeIds:
        values.role === "teacher"
          ? gradeIds
          : undefined,
    });

    if (!result?.ok) return;

    toast.success("Registration submitted", {
      description:
        "Your account is waiting for administrator approval before you can sign in.",
    });

    await navigate({ to: "/login" });
  }

  return (
    <AuthShell
      title="Create your account"
      description="Register as a student or teacher. New accounts require administrator approval."
      footer={
        <>
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {error ? (
        <ErrorAlert title="Registration failed">
          {error}
        </ErrorAlert>
      ) : null}

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
          hint="We use this for account and learning-related communication."
          value={values.mobile}
          error={errors.mobile}
          onChange={(event) => set("mobile", event.target.value)}
        />

        <div className="space-y-2">
          <Label htmlFor="register-role">I am a</Label>
          <Select
            value={values.role}
            onValueChange={(value) =>
              setRole(value as "student" | "teacher")
            }
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

        {values.role === "student" ? (
          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            After registration, an administrator will select your class before
            approving your account.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Classes you teach</Label>
              <p className="mt-1 text-sm text-muted-foreground">
                Select one or more classes. An administrator can adjust these
                before approving your account.
              </p>
            </div>

            {gradesLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading classes…
              </p>
            ) : null}

            {gradesError ? (
              <div className="space-y-2">
                <ErrorAlert title="Classes unavailable">
                  {gradesError}
                </ErrorAlert>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={gradesLoading}
                  onClick={() => {
                    void loadGrades();
                  }}
                >
                  Retry loading classes
                </Button>
              </div>
            ) : null}

            {!gradesLoading &&
            !gradesError &&
            grades.length === 0 ? (
              <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  No active classes are available right now. Please contact the YourSchool administrator.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void loadGrades();
                  }}
                >
                  Retry loading classes
                </Button>
              </div>
            ) : null}

            {!gradesLoading &&
            !gradesError &&
            grades.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {grades.map((grade) => {
                  const id = `register-grade-${grade.id}`;
                  const checked = gradeIds.includes(grade.id);

                  return (
                    <label
                      key={grade.id}
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleGrade(
                            grade.id,
                            value === true,
                          )
                        }
                      />
                      <span className="text-sm font-medium">
                        {grade.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            <ValidationMessage
              id="grade-ids-error"
              message={errors.gradeIds}
            />
          </div>
        )}

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
              onCheckedChange={(checked) =>
                set("terms", checked === true)
              }
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? "terms-error" : undefined}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal text-muted-foreground"
            >
              I agree to the terms of use and privacy policy.
            </Label>
          </div>

          <ValidationMessage
            id="terms-error"
            message={errors.terms}
          />
        </div>

        <PrimaryButton
          type="submit"
          loading={loading}
          loadingText="Submitting registration…"
          disabled={
            loading ||
            (values.role === "teacher" &&
              (gradesLoading ||
                Boolean(gradesError) ||
                grades.length === 0))
          }
        >
          Submit registration
        </PrimaryButton>
      </form>

      <AuthDivider label="or sign up with" />
      <GoogleAuthButton label="Continue with Google" />
    </AuthShell>
  );
}
