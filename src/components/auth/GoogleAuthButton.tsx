import { toast } from "sonner";
import { GoogleIcon, SocialLoginButton } from "@/components/auth/AuthButtons";
import { useAuthAction } from "@/hooks/use-auth-action";
import { authService } from "@/lib/auth";

/**
 * Google sign-in entry point shared by login and register.
 * Talks to `authService` so the Laravel Socialite redirect drops straight in.
 */
export function GoogleAuthButton({ label = "Continue with Google" }: { label?: string }) {
  const { loading, run } = useAuthAction(authService.signInWithGoogle);

  if (import.meta.env.VITE_ENABLE_GOOGLE_AUTH !== "true") return null;

  return (
    <SocialLoginButton
      type="button"
      icon={<GoogleIcon />}
      loading={loading}
      onClick={async () => {
        const result = await run();
        if (result?.ok) toast("Google sign-in", { description: result.message });
        else if (result) toast.error("Google sign-in failed", { description: result.message });
      }}
    >
      {label}
    </SocialLoginButton>
  );
}

