// ========================================
// src/pages/auditor/request-details.tsx
// ========================================

import { useOne, useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Building,
  Square,
  Thermometer,
  FileText,
  User,
  Euro,
  Clock,
  CheckCircle,
  AlertCircle,
  Home
} from "lucide-react";
import { Identity } from "../../operatorTypes";

export const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Pobranie szczegółów zlecenia
  const { data: requestData, isLoading: requestLoading } = useOne({
    resource: "audit_requests",
    id: id!,
    queryOptions: {
      enabled: !!id,
    },
  });

  // Check if user has portfolio
  const { data: portfolio } = useList({
    resource: "auditor_portfolio_items",
    filters: userId ? [
      {
        field: "auditor_id",
        operator: "eq",
        value: userId,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Sprawdź czy już złożono ofertę
  const { data: existingOffer } = useList({
    resource: "auditor_offers",
    filters: userId && id ? [
      {
        field: "auditor_id",
        operator: "eq",
        value: userId,
      },
      {
        field: "request_id",
        operator: "eq",
        value: id,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!(userId && id),
    },
  });

  const request = requestData?.data;
  const hasPortfolio = portfolio?.data && portfolio.data.length > 0;
  const hasExistingOffer = existingOffer?.data && existingOffer.data.length > 0;
  const myOffer = hasExistingOffer ? existingOffer.data[0] : null;

  // Show loading state
  if (!userId || requestLoading || !request) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const buildingTypeLabels: Record<string, string> = {
    "dom_jednorodzinny": "Dom jednorodzinny",
    "dom_wielorodzinny": "Dom wielorodzinny", 
    "apartament": "Apartament",
    "budynek_komercyjny": "Budynek komercyjny",
    "budynek_przemyslowy": "Budynek przemysłowy",
    "budynek_uslugowy": "Budynek usługowy",
    "budynek_zabytkowy": "Budynek zabytkowy",
    "inny": "Inny",
  };

  const heatingSystemLabels: Record<string, string> = {
    "gaz": "Gaz ziemny",
    "wegiel": "Węgiel",
    "olej": "Olej opałowy",
    "elektryczne": "Ogrzewanie elektryczne",
    "pompa_ciepla": "Pompa ciepła",
    "biomasa": "Biomasa",
    "inne": "Inne",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Zweryfikowane</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Oczekuje</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Oczekuje na odpowiedź</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Zaakceptowana</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-700">Odrzucona</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Ukończona</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/auditor/available-requests')}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do zleceń
        </Button>
        <Lead
          title="Szczegóły Zlecenia"
          description="Pełne informacje o zleceniu audytowym"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Główne informacje */}
        <div className="lg:col-span-2 space-y-6">
          {/* Podstawowe dane */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Lokalizacja i dane kontaktowe
                </CardTitle>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    {request.city}, {request.street_address}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {request.postal_code}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Utworzone: {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Dane kontaktowe */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Dane kontaktowe</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {request.first_name} {request.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{request.phone_number}</span>
                    </div>
                    {request.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{request.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cel audytu */}
                {request.audit_purpose && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Cel audytu</h4>
                    <p className="text-sm text-gray-700">{request.audit_purpose}</p>
                  </div>
                )}

                {/* Uwagi */}
                {request.notes && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Dodatkowe uwagi</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {request.notes}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Szczegóły budynku */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Charakterystyka budynku
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {request.building_type && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Typ budynku</div>
                    <Badge variant="outline">
                      <Building className="w-3 h-3 mr-1" />
                      {buildingTypeLabels[request.building_type] || request.building_type}
                    </Badge>
                  </div>
                )}

                {request.building_year && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Rok budowy</div>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {request.building_year}
                    </Badge>
                  </div>
                )}

                {request.living_area && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Powierzchnia użytkowa</div>
                    <Badge variant="outline">
                      <Square className="w-3 h-3 mr-1" />
                      {request.living_area} m²
                    </Badge>
                  </div>
                )}

                {request.heating_system && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">System grzewczy</div>
                    <Badge variant="outline">
                      <Thermometer className="w-3 h-3 mr-1" />
                      {heatingSystemLabels[request.heating_system] || request.heating_system}
                    </Badge>
                  </div>
                )}

                {request.floors_count && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Liczba kondygnacji</div>
                    <Badge variant="outline">
                      {request.floors_count}
                    </Badge>
                  </div>
                )}

                {request.rooms_count && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Liczba pokoi</div>
                    <Badge variant="outline">
                      {request.rooms_count}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Dodatkowe informacje */}
              {(request.has_basement || request.has_garage || request.has_attic) && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Dodatkowe pomieszczenia</div>
                  <div className="flex flex-wrap gap-2">
                    {request.has_basement && (
                      <Badge variant="outline" className="text-xs">Piwnica</Badge>
                    )}
                    {request.has_garage && (
                      <Badge variant="outline" className="text-xs">Garaż</Badge>
                    )}
                    {request.has_attic && (
                      <Badge variant="outline" className="text-xs">Poddasze</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status mojej oferty */}
          {hasExistingOffer && myOffer && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Twoja oferta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-lg">{myOffer.price?.toLocaleString()} zł</div>
                      <div className="text-sm text-muted-foreground">
                        {myOffer.duration_days} dni realizacji
                      </div>
                    </div>
                    {getOfferStatusBadge(myOffer.status)}
                  </div>

                  {myOffer.description && (
                    <div className="text-sm bg-white p-3 rounded border">
                      <span className="font-medium">Opis oferty:</span> {myOffer.description}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Złożona: {new Date(myOffer.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/auditor/offer/${myOffer.id}`)}
                    >
                      Szczegóły oferty
                    </Button>
                    {myOffer.status === 'pending' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/auditor/offer/edit/${myOffer.id}`)}
                      >
                        Edytuj ofertę
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel akcji i informacji */}
        <div className="lg:col-span-1 space-y-4">
          {/* Panel akcji */}
          <Card>
            <CardHeader>
              <CardTitle>Akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!hasExistingOffer ? (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/auditor/offer/create/${request.id}`)}
                      disabled={!hasPortfolio}
                    >
                      <Euro className="w-4 h-4 mr-2" />
                      Złóż ofertę
                    </Button>
                    
                    {!hasPortfolio && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded text-xs">
                        <div className="flex items-center gap-2 text-orange-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Wymagane portfolio</span>
                        </div>
                        <div className="text-orange-700 mt-1">
                          Aby składać oferty, musisz mieć uzupełnione portfolio.
                        </div>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-orange-700 mt-1"
                          onClick={() => navigate('/auditor/portfolio')}
                        >
                          Przejdź do portfolio →
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">Oferta złożona</div>
                    <div className="text-xs text-muted-foreground">
                      Status: {myOffer?.status}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/auditor/available-requests')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót do listy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informacje o zleceniu */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(request.status)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data utworzenia</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>

                {request.updated_at !== request.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ostatnia aktualizacja</span>
                    <span>{new Date(request.updated_at).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="text-xs text-muted-foreground">
                    ID zlecenia: {request.id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wskazówki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wskazówki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>• Dokładnie przeanalizuj charakterystykę budynku</div>
                <div>• Uwzględnij lokalizację przy wycenie</div>
                <div>• Sprawdź cel audytu i dostosuj ofertę</div>
                <div>• Skontaktuj się z klientem w razie pytań</div>
                <div>• Złóż konkurencyjną i realistyczną ofertę</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};