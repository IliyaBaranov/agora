import { Button } from "@/components/ui/button";
import { useAgora } from "@/context/AgoraContext";

export function RoleSwitcher({ marketplaceId }: { marketplaceId: string }) {
  const { currentDemoRole, setCurrentDemoRole, getUserRoleInMarketplace } = useAgora();

  // Реальная роль в этом маркетплейсе
  const realRole = getUserRoleInMarketplace(marketplaceId);

  // Разрешённые роли по твоим правилам
  let allowedRoles: ("ADMIN" | "PRODUCER" | "CUSTOMER")[] = [];

  if (realRole === "ADMIN") {
    allowedRoles = ["ADMIN"];
  } else if (realRole === "PRODUCER") {
    allowedRoles = ["PRODUCER"];
  } else {
    allowedRoles = ["CUSTOMER"];
  }

  return (
    <div className="flex gap-2">
      {allowedRoles.map((role) => (
        <Button
          key={role}
          variant={currentDemoRole === role ? "default" : "outline"}
          onClick={() => setCurrentDemoRole(role)}
        >
          {role}
        </Button>
      ))}
    </div>
  );
}
