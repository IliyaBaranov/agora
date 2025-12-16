import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgora } from "@/context/AgoraContext";
import { useLanguage } from "@/context/LanguageContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export function AuthModal({
  open,
  onOpenChange,
  mode,
  onModeChange,
}: AuthModalProps) {
  const { login, register } = useAgora();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(""); // только для регистрации
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      // Закрываем окно и переходим на dashboard
      onOpenChange(false);
      navigate("/dashboard");

      // Очищаем поля
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Auth failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login"
              ? t("auth.loginTitle")
              : t("auth.registerTitle")}
          </DialogTitle>

          <DialogDescription>
            {mode === "login"
              ? t("auth.loginSubtitle")
              : t("auth.registerSubtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {/* NAME — только при регистрации */}
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("auth.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* SUBMIT */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? t("common.loading") ?? "Loading..."
              : mode === "login"
              ? t("auth.signIn")
              : t("auth.signUp")}
          </Button>
        </form>

        {/* SWITCH MODE */}
        <div className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => onModeChange("register")}
              >
                {t("nav.register")}
              </button>
            </>
          ) : (
            <>
              {t("auth.hasAccount")}{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => onModeChange("login")}
              >
                {t("nav.login")}
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
