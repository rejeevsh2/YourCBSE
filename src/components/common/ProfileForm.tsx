import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/auth/http";
import { refreshStoredUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
type Profile = {
  name: string;
  email: string;
  role: string;
  mobile: string | null;
  bio: string | null;
};
export function ProfileForm(_props: {
  name?: string;
  role?: string;
  email?: string;
  bioLabel?: string;
}) {
  const [user, setUser] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void apiRequest<{ user: Profile }>("/profile", { method: "GET" }).then((r) => {
      if (r.ok && r.data) setUser(r.data.user);
      else setMessage(r.message);
    });
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage("");
    const r = await apiRequest<{ user: Profile }>("/profile", {
      method: "PUT",
      body: { name: user.name, mobile: user.mobile, bio: user.bio },
    });
    if (r.ok && r.data) {
      setUser(r.data.user);
      refreshStoredUser({ fullName: r.data.user.name, mobile: r.data.user.mobile ?? undefined });
      setMessage("Profile saved.");
    } else setMessage(r.message);
    setBusy(false);
  }
  return (
    <div className="space-y-5">
      {message && (
        <p role="status" className="tile p-4">
          {message}
        </p>
      )}
      {!user && !message && <p>Loading your profile…</p>}
      {user && (
        <form className="tile max-w-2xl space-y-4 p-6" onSubmit={save}>
          <h2 className="text-xl font-bold">Your profile</h2>
          <p className="text-sm text-muted-foreground">
            {user.email} · {user.role}
          </p>
          <label className="block">
            Name
            <Input
              required
              maxLength={255}
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </label>
          <label className="block">
            Mobile
            <Input
              maxLength={30}
              type="tel"
              value={user.mobile ?? ""}
              onChange={(e) => setUser({ ...user, mobile: e.target.value })}
            />
          </label>
          <label className="block">
            About you
            <Textarea
              maxLength={2000}
              value={user.bio ?? ""}
              onChange={(e) => setUser({ ...user, bio: e.target.value })}
            />
          </label>
          <Button disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button>
        </form>
      )}
      <PasswordSettings />
    </div>
  );
}
export function PasswordSettings() {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <form
      className="tile max-w-2xl space-y-4 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (password !== confirmation) {
          setMessage("New passwords must match.");
          return;
        }
        setBusy(true);
        const r = await apiRequest("/profile/password", {
          method: "PUT",
          body: { current_password: current, password, password_confirmation: confirmation },
        });
        setMessage(r.message);
        if (r.ok) {
          setCurrent("");
          setPassword("");
          setConfirmation("");
        }
        setBusy(false);
      }}
    >
      <h2 className="text-xl font-bold">Change password</h2>
      <label className="block">
        Current password
        <Input
          required
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
      </label>
      <label className="block">
        New password
        <Input
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className="block">
        Confirm password
        <Input
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
        />
      </label>
      <Button disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
