import React from 'react';
import { useGetIdentity } from '@refinedev/core';
import { UserData } from '@/operatorTypes';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
}) => {
  const { data: user, isLoading, error } = useGetIdentity<UserData>();

  if (isLoading) {
    return <div>Sprawdzanie uprawnień...</div>;
  }

  if (error) {
    return (
      <div>
        <h3>Błąd</h3>
        <p>Nie udało się sprawdzić uprawnień.</p>
      </div>
    );
  }

  // Rola znajduje się w user_metadata
  const role = user?.user_metadata?.role;

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div>
        <h3>Brak uprawnień</h3>
        <p>Nie masz uprawnień do wyświetlania tej zawartości.</p>
      </div>
    );
  }

  // Zwracamy tylko children bez dodatkowego tekstu
  return <>{children}</>;
};