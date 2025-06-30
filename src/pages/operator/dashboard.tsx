// ========================================
// src/pages/operator/dashboard.tsx
// ========================================

import { useState, useMemo } from "react";
import { useList, useUpdate } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Star,
  Euro,
  Calendar,
  User,
  AlertTriangle,
  Shield,
  BarChart3,
  MapPin,
  Phone,
  Building,
  Thermometer,
  Square,
  Check,
  X,
  AlertCircle,
  ScanEye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Stany dla dialogów weryfikacji
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    type: "service" | "audit" | null;
    item: any;
    action: "verify" | "reject" | null;
  }>({
    open: false,
    type: null,
    item: null,
    action: null,
  });
  const [verificationReason, setVerificationReason] = useState("");

  // Get authenticated user
  const { data: identity, isLoading: identityLoading } =
    useGetIdentity<Identity>();
  const userId = identity?.id;

  // Hooks do aktualizacji
  const { mutate: updateServiceRequest, isLoading: updatingServiceRequest } =
    useUpdate();
  const { mutate: updateAuditRequest, isLoading: updatingAuditRequest } =
    useUpdate();

  // WSZYSTKIE service_requests - bez filtra statusu!
  const {
    data: serviceRequests,
    isLoading: loadingServiceRequests,
    refetch: refetchServiceRequests,
  } = useList({
    resource: "service_requests",
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId, // Zapytanie wykona się tylko gdy userId istnieje
    },
  });

  // WSZYSTKIE audit_requests
  const {
    data: auditRequests,
    isLoading: loadingAuditRequests,
    refetch: refetchAuditRequests,
  } = useList({
    resource: "audit_requests",
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Wszystkie oferty wykonawców
  const { data: contractorOffers } = useList({
    resource: "contractor_offers",
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Wszystkie oferty audytorów
  const { data: auditorOffers } = useList({
    resource: "auditor_offers",
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Memoizacja daty dla kontaktów - zapobiega przeliczaniu przy każdym renderze
  const sevenDaysAgo = useMemo(() => {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }, []); // Pusta dependency array - data zostanie obliczona tylko raz

  // Kontakty z kalkulatora (tabela user_profiles lub podobna)
  const { data: contactRequests } = useList({
    resource: "user_profiles",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value: sevenDaysAgo,
      },
    ],
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Funkcje weryfikacji
  const handleVerificationDialog = (
    type: "service" | "audit",
    item: any,
    action: "verify" | "reject"
  ) => {
    setVerificationDialog({
      open: true,
      type,
      item,
      action,
    });
    setVerificationReason("");
  };

  const handleCloseVerificationDialog = () => {
    setVerificationDialog({
      open: false,
      type: null,
      item: null,
      action: null,
    });
    setVerificationReason("");
  };

  const handleConfirmVerification = () => {
    const { type, item, action } = verificationDialog;

    if (!type || !item || !action) return;

    const newStatus = action === "verify" ? "verified" : "rejected";
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Dodaj log moderacji
    const moderationLogData = {
      operator_id: userId,
      target_table: type === "service" ? "service_requests" : "audit_requests",
      target_id: item.id,
      action: action === "verify" ? "verified" : "rejected",
      reason: verificationReason || null,
    };

    if (type === "service") {
      updateServiceRequest(
        {
          resource: "service_requests",
          id: item.id,
          values: updateData,
        },
        {
          onSuccess: () => {
            // Zapisz log moderacji
            fetch("/api/moderation_logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(moderationLogData),
            });

            toast.success(
              action === "verify"
                ? "Zlecenie zweryfikowane"
                : "Zlecenie odrzucone",
              {
                description:
                  action === "verify"
                    ? "Zlecenie zostało pomyślnie zweryfikowane i opublikowane."
                    : "Zlecenie zostało odrzucone.",
              }
            );
            refetchServiceRequests();
            handleCloseVerificationDialog();
          },
          onError: (error) => {
            toast.error("Błąd", {
              description: "Nie udało się zaktualizować statusu zlecenia.",
            });
          },
        }
      );
    } else if (type === "audit") {
      updateAuditRequest(
        {
          resource: "audit_requests",
          id: item.id,
          values: updateData,
        },
        {
          onSuccess: () => {
            // Zapisz log moderacji
            fetch("/api/moderation_logs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(moderationLogData),
            });

            toast.success(
              action === "verify"
                ? "Zlecenie audytu zweryfikowane"
                : "Zlecenie audytu odrzucone",
              {
                description:
                  action === "verify"
                    ? "Zlecenie audytu zostało pomyślnie zweryfikowane i opublikowane."
                    : "Zlecenie audytu zostało odrzucone.",
              }
            );
            refetchAuditRequests();
            handleCloseVerificationDialog();
          },
          onError: (error) => {
            toast.error("Błąd", {
              description:
                "Nie udało się zaktualizować statusu zlecenia audytu.",
            });
          },
        }
      );
    }
  };

  // Sprawdź stan loading - uwzględnij loading identity
  const isLoading =
    identityLoading || loadingServiceRequests || loadingAuditRequests;

  // Jeśli identity nie zostało jeszcze załadowane, pokaż loading
  if (identityLoading) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Jeśli brak identity (nie zalogowany), przekieruj lub pokaż błąd
  if (!identity) {
    return (
      <div className="p-6 mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">
                  Brak dostępu
                </h3>
                <p className="text-red-800">
                  Nie jesteś zalogowany lub nie masz uprawnień do tego panelu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Jeśli dane się ładują, pokaż loading
  if (loadingServiceRequests || loadingAuditRequests) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const allServiceRequests = serviceRequests?.data || [];
  const allAuditRequests = auditRequests?.data || [];
  const allContractorOffers = contractorOffers?.data || [];
  const allAuditorOffers = auditorOffers?.data || [];
  const allContactRequests = contactRequests?.data || [];

  // Statystyki dla operatora
  const stats = {
    // Zlecenia serwisowe
    pendingServiceRequests: allServiceRequests.filter(
      (r) => r.status === "pending"
    ).length,
    verifiedServiceRequests: allServiceRequests.filter(
      (r) => r.status === "verified"
    ).length,
    rejectedServiceRequests: allServiceRequests.filter(
      (r) => r.status === "rejected"
    ).length,
    totalServiceRequests: allServiceRequests.length,

    // Zlecenia audytorskie
    pendingAuditRequests: allAuditRequests.filter((r) => r.status === "pending")
      .length,
    verifiedAuditRequests: allAuditRequests.filter(
      (r) => r.status === "verified"
    ).length,
    rejectedAuditRequests: allAuditRequests.filter(
      (r) => r.status === "rejected"
    ).length,
    totalAuditRequests: allAuditRequests.length,

    // Oferty
    pendingContractorOffers: allContractorOffers.filter(
      (o) => o.status === "pending"
    ).length,
    pendingAuditorOffers: allAuditorOffers.filter((o) => o.status === "pending")
      .length,

    // Kontakty
    newContacts: allContactRequests.length,
  };

  // Elementy wymagające moderacji
  const pendingServiceRequests = allServiceRequests
    .filter((r) => r.status === "pending")
    .slice(0, 5);
  const pendingAuditRequests = allAuditRequests
    .filter((r) => r.status === "pending")
    .slice(0, 5);
  const recentServiceRequests = allServiceRequests.slice(0, 5);
  const recentAuditRequests = allAuditRequests.slice(0, 5);

  return (
    <>
      <Lead
        title="Panel Operatora"
        description="Moderacja zleceń, weryfikacja użytkowników i zarządzanie systemem"
      />

      {/* Alerty dla operatora */}
      {(stats.pendingServiceRequests > 0 || stats.pendingAuditRequests > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-2">
                  Wymagają moderacji
                </h3>
                <p className="text-orange-800 mb-3">
                  {stats.pendingServiceRequests} zleceń wykonawców i{" "}
                  {stats.pendingAuditRequests} zleceń audytorów czeka na
                  weryfikację.
                </p>
                <div className="flex gap-2">
                  {stats.pendingServiceRequests > 0 && (
                    <Button
                      onClick={() => setActiveTab("service-moderation")}
                      className="bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Moderuj zlecenia ({stats.pendingServiceRequests})
                    </Button>
                  )}
                  {stats.pendingAuditRequests > 0 && (
                    <Button
                      onClick={() => setActiveTab("audit-moderation")}
                      className="bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Moderuj audyty ({stats.pendingAuditRequests})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statystyki operatora */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                
                  <div className="text-2xl font-bold">
                    {stats.totalServiceRequests}
                  </div>
                  
                

                <div className="text-sm text-muted-foreground">
                  Wszystkie zlecenia wykonawców
                </div>

            
              </div>
            </div>
          </CardContent>
          <CardFooter>    <div className="flex justify-end gap-4 text-xs mt-1 w-full">
                    <div className="text-orange-600 flex gap-1 border border-orange-200 p-1 px-2 rounded">
                      {stats.pendingServiceRequests}{" "}
                      <ScanEye className="w-4 h-4" />
                    </div>
                    <div className="text-green-600 flex gap-1 border border-green-200 p-1 px-2 rounded">
                      {stats.verifiedServiceRequests}{" "}
                      <Check className="w-4 h-4" />
                    </div>
                    {stats.rejectedServiceRequests > 0 && (
                      <div className="text-red-600 flex gap-1 border border-red-200 p-1 px-2 rounded">
                        {stats.rejectedServiceRequests}{" "}
                        <X className="w-4 h-4" />
                      </div>
                    )}
                  </div></CardFooter>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.totalAuditRequests}
                </div>
                <div className="text-sm text-muted-foreground">
                  Wszystkie zlecenia audytorów
                </div>
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-orange-600">
                    {stats.pendingAuditRequests} do weryfikacji
                  </span>
                  <span className="text-green-600">
                    {stats.verifiedAuditRequests} zweryfikowanych
                  </span>
                  {stats.rejectedAuditRequests > 0 && (
                    <span className="text-red-600">
                      {stats.rejectedAuditRequests} odrzuconych
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Euro className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.pendingContractorOffers}
                </div>
                <div className="text-sm text-muted-foreground">
                  Nowe oferty wykonawców
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-indigo-600" />
              <div>
                <div className="text-2xl font-bold">{stats.newContacts}</div>
                <div className="text-sm text-muted-foreground">
                  Nowe kontakty (7 dni)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {/* Główne tabs operatora */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="service-moderation">
            Moderacja Wykonawców{" "}
            {stats.pendingServiceRequests > 0 &&
              `(${stats.pendingServiceRequests})`}
          </TabsTrigger>
          <TabsTrigger value="audit-moderation">
            Moderacja Audytorów{" "}
            {stats.pendingAuditRequests > 0 &&
              `(${stats.pendingAuditRequests})`}
          </TabsTrigger>
          <TabsTrigger value="reports">Raporty</TabsTrigger>
        </TabsList>

        {/* Tab: Przegląd */}
        <TabsContent value="overview">
          <GridBox>
            {/* Szybkie akcje */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Szybkie akcje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => setActiveTab("service-moderation")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Moderuj zlecenia ({stats.pendingServiceRequests})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("audit-moderation")}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Moderuj audyty ({stats.pendingAuditRequests})
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/operator/users")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Zarządzaj użytkownikami
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("reports")}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generuj raporty
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Ostatnie zlecenia */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <FlexBox>
                    <CardTitle>Ostatnie zlecenia wykonawców</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("service-moderation")}
                    >
                      Zobacz wszystkie
                    </Button>
                  </FlexBox>
                </CardHeader>
                <CardContent>
                  {recentServiceRequests.length > 0 ? (
                    <div className="space-y-3">
                      {recentServiceRequests.map((request: any) => (
                        <div key={request.id} className="border rounded-lg p-3">
                          <FlexBox>
                            <div>
                              <div className="font-medium">
                                {request.city}, {request.postal_code}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    request.created_at
                                  ).toLocaleDateString()}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={
                                    request.status === "pending"
                                      ? "border-orange-500 text-orange-700"
                                      : request.status === "verified"
                                      ? "border-green-500 text-green-700"
                                      : request.status === "rejected"
                                      ? "border-red-500 text-red-700"
                                      : "border-gray-500 text-gray-700"
                                  }
                                >
                                  {request.status === "pending"
                                    ? "Do weryfikacji"
                                    : request.status === "verified"
                                    ? "Zweryfikowane"
                                    : request.status === "rejected"
                                    ? "Odrzucone"
                                    : request.status}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/operator/service-request/${request.id}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </FlexBox>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Brak zleceń</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </GridBox>
        </TabsContent>

        {/* Tab: Moderacja Wykonawców */}
        <TabsContent value="service-moderation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Zlecenia wykonawców do moderacji
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingServiceRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingServiceRequests.map((request: any) => (
                    <Card key={request.id} className="border-orange-200">
                      <CardContent className="p-4">
                        <FlexBox className="mb-3">
                          <div>
                            <h4 className="font-medium">
                              {request.city}, {request.street_address}
                            </h4>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {request.postal_code}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {request.phone_number}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/operator/service-request/${request.id}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Szczegóły
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleVerificationDialog(
                                  "service",
                                  request,
                                  "reject"
                                )
                              }
                              className="border-red-500 text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Odrzuć
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleVerificationDialog(
                                  "service",
                                  request,
                                  "verify"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Zweryfikuj
                            </Button>
                          </div>
                        </FlexBox>

                        {/* Szczegóły techniczne */}
                        <div className="flex flex-wrap gap-2 text-sm">
                          {request.heat_source && (
                            <Badge variant="outline">
                              <Thermometer className="w-3 h-3 mr-1" />
                              {request.heat_source}
                            </Badge>
                          )}
                          {request.windows_count && (
                            <Badge variant="outline">
                              <Building className="w-3 h-3 mr-1" />
                              {request.windows_count} okien
                            </Badge>
                          )}
                          {request.wall_insulation_m2 && (
                            <Badge variant="outline">
                              <Square className="w-3 h-3 mr-1" />
                              Ściany: {request.wall_insulation_m2}m²
                            </Badge>
                          )}
                          {request.attic_insulation_m2 && (
                            <Badge variant="outline">
                              <Square className="w-3 h-3 mr-1" />
                              Strych: {request.attic_insulation_m2}m²
                            </Badge>
                          )}
                          {request.audit_file_url && (
                            <Badge variant="outline">
                              <FileText className="w-3 h-3 mr-1" />
                              Audyt załączony
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak zleceń oczekujących na moderację</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Moderacja Audytorów */}
        <TabsContent value="audit-moderation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Zlecenia audytorów do moderacji
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingAuditRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingAuditRequests.map((request: any) => (
                    <Card key={request.id} className="border-orange-200">
                      <CardContent className="p-4">
                        <FlexBox>
                          <div>
                            <h4 className="font-medium">
                              {request.city}, {request.street_address}
                            </h4>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {request.postal_code}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {request.phone_number}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/operator/audit-request/${request.id}`
                                )
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Szczegóły
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleVerificationDialog(
                                  "audit",
                                  request,
                                  "reject"
                                )
                              }
                              className="border-red-500 text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Odrzuć
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleVerificationDialog(
                                  "audit",
                                  request,
                                  "verify"
                                )
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Zweryfikuj
                            </Button>
                          </div>
                        </FlexBox>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Brak zleceń audytorskich oczekujących na moderację</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Raporty */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Generowanie raportów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Moduł raportów - do implementacji</p>
                <p className="text-sm">
                  Statystyki aktywności, zleceń, użytkowników
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog weryfikacji */}
      <Dialog
        open={verificationDialog.open}
        onOpenChange={handleCloseVerificationDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verificationDialog.action === "verify" ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Potwierdź weryfikację
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Potwierdź odrzucenie
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">
                {verificationDialog.type === "service"
                  ? "Zlecenie wykonawcy"
                  : "Zlecenie audytu"}
              </h4>
              {verificationDialog.item && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    {verificationDialog.item.city},{" "}
                    {verificationDialog.item.street_address}
                  </p>
                  <p>Kod: {verificationDialog.item.postal_code}</p>
                  <p>Tel: {verificationDialog.item.phone_number}</p>
                  <p>
                    Data:{" "}
                    {new Date(
                      verificationDialog.item.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {verificationDialog.action === "verify"
                  ? "Uwagi do weryfikacji (opcjonalne)"
                  : "Powód odrzucenia (opcjonalne)"}
              </label>
              <Textarea
                value={verificationReason}
                onChange={(e) => setVerificationReason(e.target.value)}
                placeholder={
                  verificationDialog.action === "verify"
                    ? "Dodatkowe uwagi dotyczące weryfikacji..."
                    : "Podaj powód odrzucenia zlecenia..."
                }
                rows={3}
              />
            </div>

            <div
              className={`p-3 rounded-lg ${
                verificationDialog.action === "verify"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {verificationDialog.action === "verify" ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="text-sm">
                  {verificationDialog.action === "verify" ? (
                    <>
                      <p className="font-medium text-green-900">
                        Zlecenie zostanie zweryfikowane
                      </p>
                      <p className="text-green-700">
                        Po weryfikacji zlecenie będzie widoczne dla{" "}
                        {verificationDialog.type === "service"
                          ? "wykonawców"
                          : "audytorów"}
                        i będą mogli składać oferty.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-red-900">
                        Zlecenie zostanie odrzucone
                      </p>
                      <p className="text-red-700">
                        Odrzucone zlecenie nie będzie widoczne dla{" "}
                        {verificationDialog.type === "service"
                          ? "wykonawców"
                          : "audytorów"}
                        . Beneficjent zostanie poinformowany o odrzuceniu.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseVerificationDialog}
              disabled={updatingServiceRequest || updatingAuditRequest}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleConfirmVerification}
              disabled={updatingServiceRequest || updatingAuditRequest}
              className={
                verificationDialog.action === "verify"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {(updatingServiceRequest || updatingAuditRequest) && (
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {verificationDialog.action === "verify" ? "Zweryfikuj" : "Odrzuć"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
