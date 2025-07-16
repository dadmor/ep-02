import { useGetIdentity } from "@refinedev/core";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

// Interfejs zgodny z typem User z authProvider
interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  city?: string;
  postal_code?: string;
  name?: string;
  street_address?: string;
  operator_id?: string;
  _timestamp?: number;
}

interface UserProfileProps {
  className?: string;
}

export const UserMicroProfile: React.FC<UserProfileProps> = ({ className }) => {
  const { data: user, isLoading, error } = useGetIdentity<User>();

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-3 p-3 ${className}`}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center space-x-3 p-3 text-destructive ${className}`}
      >
        <User className="h-6 w-6" />
        <div className="text-sm">
          <div className="font-medium">Błąd danych</div>
          <div className="text-xs opacity-70">Nie można pobrać profilu</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`flex items-center space-x-3 p-3 text-muted-foreground ${className}`}
      >
        <User className="h-6 w-6" />
        <div className="text-sm">
          <div className="font-medium">Brak danych</div>
          <div className="text-xs opacity-70">Użytkownik nieznany</div>
        </div>
      </div>
    );
  }

  // Wyciągnij inicjały z imienia i nazwiska lub email
  const getInitials = (firstName?: string, lastName?: string, name?: string, email?: string) => {
    // Najpierw spróbuj z first_name i last_name
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    // Potem z name
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    // Na końcu z email
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  // Konstruuj pełne imię
  const getDisplayName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.name) {
      return user.name;
    }
    if (user.email) {
      return user.email;
    }
    return "Użytkownik";
  };

  const displayName = getDisplayName();
  const initials = getInitials(user.first_name, user.last_name, user.name, user.email);

  // Mapowanie ról na czytelne nazwy
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrator",
      operator: "Operator",
      supervisor: "Supervisor",
      user: "Użytkownik",
      driver: "Kierowca",
      customer: "Klient"
    };
    return roleMap[role] || role;
  };

  return (
    <div className={`flex items-center space-x-3 p-3 ${className}`}>
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="font-medium text-sm truncate" title={displayName}>
          {displayName}
        </div>
        {user.email && displayName !== user.email && (
          <div
            className="text-xs text-muted-foreground truncate"
            title={user.email}
          >
            {user.email}
          </div>
        )}
        {user.role && (
          <div 
            className="text-xs text-muted-foreground truncate" 
            title={`Rola: ${getRoleDisplayName(user.role)}`}
          >
            {getRoleDisplayName(user.role)}
          </div>
        )}
      </div>
    </div>
  );
};