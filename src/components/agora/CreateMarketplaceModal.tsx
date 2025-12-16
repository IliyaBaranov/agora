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

interface CreateMarketplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateMarketplaceModal({
  open,
  onOpenChange,
  }: CreateMarketplaceModalProps) {
    
  const { createMarketplace } = useAgora();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !city) return;

    setLoading(true);

    try {
      const marketplace = await createMarketplace(name, slug, city);

      // закрываем модалку
      onOpenChange(false);

      // сбрасываем форму
      setName("");
      setSlug("");
      setCity("");

      // переход
      navigate(`/marketplace/${marketplace.slug}`);
    } catch (err) {
      console.error("Failed to create marketplace", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);

    // авто-генерация slug
    const newSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    setSlug(newSlug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createMarketplace.title")}</DialogTitle>
          <DialogDescription>
            {t("createMarketplace.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("createMarketplace.name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("createMarketplace.namePlaceholder")}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          {/* SLUG */}
          <div className="space-y-2">
            <Label htmlFor="slug">{t("createMarketplace.slug")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">agora.com/marketplace/</span>
              <Input
                id="slug"
                type="text"
                placeholder="my-marketplace"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                className="flex-1"
                required
              />
            </div>
          </div>

          {/* CITY */}
          <div className="space-y-2">
            <Label htmlFor="city">{t("createMarketplace.city")}</Label>
            <Input
              id="city"
              type="text"
              placeholder={t("createMarketplace.cityPlaceholder")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t("common.loading") ?? "Loading..." : t("createMarketplace.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
