import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { useAgora } from "@/context/AgoraContext";
import { useLanguage } from "@/context/LanguageContext";

import { Navbar } from "@/components/agora/Navbar";
import { RoleSwitcher } from "@/components/agora/RoleSwitcher";

import { AdminPanel } from "@/components/agora/AdminPanel";
import { ProducerDashboard } from "@/components/agora/ProducerDashboard";
import { CustomerDashboard } from "@/components/agora/CustomerDashboard";
import { RegisterProducerModal } from "@/components/agora/RegisterProducerModal";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { ArrowLeft, MapPin, Briefcase, UserPlus } from "lucide-react";
import { toast } from "sonner";

const API = import.meta.env.VITE_API_URL;

const Marketplace = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();

  const {
    currentUser,
    getMarketplace,
    getUserRoleInMarketplace,
    currentDemoRole,
    setCurrentDemoRole,
    bootstrapFromMe,
  } = useAgora();

  const [registerProducerOpen, setRegisterProducerOpen] = useState(false);
  const [showCreateJobForm, setShowCreateJobForm] = useState(false);

  // Marketplace найден?
  const marketplace = getMarketplace(slug || "");

  // Реальная роль пользователя в этом marketplace
  const realRole = currentUser && marketplace
    ? getUserRoleInMarketplace(marketplace.id)
    : null;

  // Авто-установка demo-role после загрузки realRole
  useEffect(() => {
    if (!realRole) return;
    // Устанавливаем вкладку только если еще не выбран demo-role вручную
    setCurrentDemoRole((prev) => {
      // Если prev уже совпадает — не трогаем
      if (prev === realRole) return prev;
      return realRole;
    });

  }, [realRole]);

  // Auto-join marketplace request
  useEffect(() => {
    if (!currentUser || !marketplace) return;
  
    (async () => {
      try {
        const res = await fetch(`${API}/api/marketplace_autojoin.php`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketplaceId: marketplace.id }),
        });
  
        const data = await res.json();
  
        // если пользователь добавлен впервые
        if (data.status === "created") {
          // !!! Перезагружаем глобальные данные
          bootstrapFromMe();
        }
  
      } catch (err) {
        console.error("autojoin failed", err);
      }
    })();
  }, [currentUser, marketplace]);
  

  // Если не авторизован — просто пусто
  if (!currentUser) return null;

  // Если marketplace не найден
  if (!marketplace) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="container py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">{t("marketplace.notFound")}</h1>

            <p className="mb-6 text-muted-foreground">
              {t("marketplace.notFoundDesc")} "{slug}"
            </p>

            <Button asChild>
              <Link to="/dashboard">{t("common.backToDashboard")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleQuickCreateJob = () => {
    toast.info(t("marketplace.switchToCustomer"));
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="container py-8">
        {/* ---------- HEADER ---------- */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1 h-4 w-4" />
                {t("marketplace.backToDashboard")}
              </Link>
            </Button>

            <h1 className="text-2xl font-bold">Agora — {marketplace.name}</h1>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{marketplace.city}</span>
            </div>
          </div>

          <RoleSwitcher marketplaceId={marketplace.id} />
        </div>

        {/* ---------- MAIN CONTENT ---------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Buttons only for CUSTOMER */}
            {realRole === "CUSTOMER" && (
              <Card className="mb-6">
                <CardContent className="flex flex-wrap gap-4 p-4">
                  <Button
                    onClick={
                      currentDemoRole === "CUSTOMER"
                        ? () => setShowCreateJobForm(true)
                        : handleQuickCreateJob
                    }
                    className="gap-2"
                  >
                    <Briefcase className="h-4 w-4" />
                    {t("marketplace.createJob")}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setRegisterProducerOpen(true)}
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    {t("marketplace.registerProducer")}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Role Panels */}
            {realRole === "ADMIN" && <AdminPanel marketplace={marketplace} />}
            {realRole === "PRODUCER" && <ProducerDashboard marketplace={marketplace} />}
            {realRole === "CUSTOMER" && <CustomerDashboard marketplace={marketplace} />}
          </div>
        </div>
      </main>

      <RegisterProducerModal
        open={registerProducerOpen}
        onOpenChange={setRegisterProducerOpen}
        marketplaceId={marketplace.id}
      />
    </div>
  );
};

export default Marketplace;
