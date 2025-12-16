import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAgora } from "@/context/AgoraContext";
import { useLanguage } from "@/context/LanguageContext";

import { Navbar } from "@/components/agora/Navbar";
import { CreateMarketplaceModal } from "@/components/agora/CreateMarketplaceModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Star, MapPin, ArrowRight } from "lucide-react";

const Dashboard = () => {
  const { currentUser, marketplaces, favorites, isFavorite, addFavorite, removeFavorite } =
    useAgora();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) navigate("/");
  }, [currentUser]);

  if (!currentUser) return null;

  // --- favorite marketplaces ---
  const favoriteMarketplaces = marketplaces.filter((m) =>
    favorites.some(
      (f) => f.userId === currentUser.id && f.marketplaceId === m.id
    )
  );

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {t("dashboard.welcome")}, {currentUser.name}
          </h1>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* ------------------ FAVORITES ------------------ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-status-working" />
                  {t("dashboard.favorites")}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {favoriteMarketplaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("dashboard.noFavorites")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {favoriteMarketplaces.map((marketplace) => (
                      <Link
                        key={marketplace.id}
                        to={`/marketplace/${marketplace.slug}`}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 transition-all hover:border-primary/50 hover:shadow-card"
                      >
                        <div>
                          <h3 className="font-medium">{marketplace.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{marketplace.city}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ------------------ ALL MARKETPLACES ------------------ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Все рабочие сайты</CardTitle>
              </CardHeader>

              <CardContent>
                {marketplaces.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Ни одного сайта ещё не создано.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {marketplaces.map((m) => {
                      const fav = isFavorite(m.id);

                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                        >
                          <Link
                            to={`/marketplace/${m.slug}`}
                            className="flex flex-col"
                          >
                            <span className="font-medium">{m.name}</span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {m.city}
                            </span>
                          </Link>

                          <Button
                            size="sm"
                            variant={fav ? "secondary" : "outline"}
                            onClick={() =>
                              fav
                                ? removeFavorite(m.id)
                                : addFavorite(m.id)
                            }
                          >
                            <Star
                              className={`mr-1 h-4 w-4 ${
                                fav
                                  ? "fill-status-working text-status-working"
                                  : ""
                              }`}
                            />
                            {fav ? "В избранном" : "В избранное"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ---------------- CREATE MARKETPLACE ---------------- */}
          <div>
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>

                <h3 className="mb-2 font-semibold">
                  {t("dashboard.createMarketplace")}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {t("dashboard.createMarketplaceDesc")}
                </p>

                <Button onClick={() => setCreateModalOpen(true)}>
                  {t("dashboard.createBtn")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CreateMarketplaceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
};

export default Dashboard;
