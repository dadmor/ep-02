// ========================================
// src/pages/contractor/request-details.tsx
// ========================================

import { useOne, useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Phone,
  FileText,
  Building,
  Square,
  Thermometer,
  Euro,
  CheckCircle,
  AlertCircle,
  Hammer,
  Eye,
  Download,
  User,
  Mail
} from "lucide-react";
import { Identity } from "../../operatorTypes";

export const ContractorRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Pobranie szczegółów zlecenia
  const { data: requestData, isLoading: requestLoading } = useOne({
    resource: "service_requests",
    id: id!,
    queryOptions: {
      enabled: !!id,
    },
  });

  // Check if user has profile
  const { data: profile } = useList({
    resource: "contractor_profiles",
    filters: userId ? [
      {
        field: "contractor_id",
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
    resource: "contractor_offers",
    filters: userId && id ? [
      {
        field: "contractor_id",
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

  // Pobranie danych beneficjenta
  const { data: beneficiaryData } = useOne({
    resource: "users",
    id: requestData?.data?.beneficiary_id,
    queryOptions: {
      enabled: !!requestData?.data?.beneficiary_id,
    },
  });

  const request = requestData?.data;
  const beneficiary = beneficiaryData?.data;
  const hasProfile = profile?.data && profile.data.length > 0;
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

  const heatSourceLabels: Record<string, string> = {
    "gaz": "Gaz ziemny",
    "wegiel": "Węgiel",
    "biomasa": "Biomasa",
    "olej": "Olej opałowy",
    "elektryczne": "Ogrzewanie elektryczne",
    "pompa_ciepla": "Pompa ciepła",
    "solar": "Kolektory słoneczne",
    "inne": "Inne",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Oczekujące</Badge>;
      case 'verified':
        return <Badge variant="outline" className="border-green-500 text-green-700">Zweryfikowane</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Ukończone</Badge>;
      default:
        return <Badge variant="outline" className="border-red-500 text-red-700">Odrzucone</Badge>;
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
          onClick={() => navigate('/contractor/available-requests')}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do zleceń
        </Button>
        <Lead
          title="Szczegóły Zlecenia"
          description="Pełne informacje o zleceniu termomodernizacyjnym"
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
                  <Building className="w-5 h-5" />
                  Informacje o zleceniu
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
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {request.phone_number}
                    </div>
                  </div>
                </div>

                {/* Dane kontaktowe beneficjenta - tylko dla zaakceptowanych ofert */}
                {myOffer?.status === 'accepted' && beneficiary && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-green-800">Dane kontaktowe zleceniodawcy</h4>
                    <div className="grid gap-3 md:grid-cols-2 bg-green-50 p-4 rounded border border-green-200">
                      {(beneficiary.first_name || beneficiary.last_name) && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {beneficiary.first_name} {beneficiary.last_name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{request.phone_number}</span>
                      </div>
                      {beneficiary.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{beneficiary.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Szczegóły techniczne */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Zakres prac do wykonania</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {request.heat_source && (
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Źródło ciepła:</span>
                        <Badge variant="outline">
                          {heatSourceLabels[request.heat_source] || request.heat_source}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {request.windows_count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span>Wymiana okien: <strong>{request.windows_count} szt.</strong></span>
                      </div>
                    )}
                    {request.doors_count > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-blue-600" />
                        <span>Wymiana drzwi: <strong>{request.doors_count} szt.</strong></span>
                      </div>
                    )}
                    {request.wall_insulation_m2 > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Square className="w-4 h-4 text-green-600" />
                        <span>Izolacja ścian: <strong>{request.wall_insulation_m2} m²</strong></span>
                      </div>
                    )}
                    {request.attic_insulation_m2 > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Square className="w-4 h-4 text-green-600" />
                        <span>Izolacja strychu: <strong>{request.attic_insulation_m2} m²</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audyt energetyczny */}
                {request.audit_file_url && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Audyt energetyczny</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium text-blue-900">
                            Dołączony audyt energetyczny
                          </div>
                          <div className="text-sm text-blue-800">
                            Szczegółowa analiza stanu energetycznego budynku
                          </div>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(request.audit_file_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Pobierz
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                        Złożona: {new Date(myOffer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {getOfferStatusBadge(myOffer.status)}
                  </div>

                  {myOffer.scope && (
                    <div className="text-sm bg-white p-3 rounded border">
                      <span className="font-medium">Zakres prac:</span>
                      <div className="mt-1 line-clamp-3">{myOffer.scope}</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/contractor/offer/${myOffer.id}`)}
                    >
                      Szczegóły oferty
                    </Button>
                    {myOffer.status === 'pending' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/contractor/offer/edit/${myOffer.id}`)}
                      >
                        Edytuj ofertę
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Potencjalne prace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                Potencjalne prace do wykonania
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {request.wall_insulation_m2 > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="font-medium text-green-800">Izolacja ścian zewnętrznych</div>
                    <div className="text-sm text-green-700">
                      {request.wall_insulation_m2} m² - styropian/wełna mineralna
                    </div>
                  </div>
                )}

                {request.attic_insulation_m2 > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div className="font-medium text-green-800">Izolacja strychu/poddasza</div>
                    <div className="text-sm text-green-700">
                      {request.attic_insulation_m2} m² - wełna mineralna
                    </div>
                  </div>
                )}

                {request.windows_count > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium text-blue-800">Wymiana okien</div>
                    <div className="text-sm text-blue-700">
                      {request.windows_count} szt. - okna energooszczędne
                    </div>
                  </div>
                )}

                {request.doors_count > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium text-blue-800">Wymiana drzwi</div>
                    <div className="text-sm text-blue-700">
                      {request.doors_count} szt. - drzwi termoizolacyjne
                    </div>
                  </div>
                )}

                {request.heat_source && ['gaz', 'wegiel', 'olej'].includes(request.heat_source) && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                    <div className="font-medium text-orange-800">Modernizacja ogrzewania</div>
                    <div className="text-sm text-orange-700">
                      Wymiana źródła ciepła na bardziej efektywne
                    </div>
                  </div>
                )}

                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                  <div className="font-medium text-purple-800">Wentylacja mechaniczna</div>
                  <div className="text-sm text-purple-700">
                    System rekuperacji lub VMC
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel boczny */}
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
                      onClick={() => navigate(`/contractor/offer/create/${request.id}`)}
                      disabled={!hasProfile}
                    >
                      <Euro className="w-4 h-4 mr-2" />
                      Złóż ofertę
                    </Button>
                    
                    {!hasProfile && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded text-xs">
                        <div className="flex items-center gap-2 text-orange-800">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Wymagany profil</span>
                        </div>
                        <div className="text-orange-700 mt-1">
                          Aby składać oferty, musisz mieć uzupełniony profil.
                        </div>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-orange-700 mt-1"
                          onClick={() => navigate('/contractor/profile')}
                        >
                          Przejdź do profilu →
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
                  onClick={() => navigate('/contractor/available-requests')}
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

          {/* Szacunkowa wartość */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Szacunkowa wartość</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {request.windows_count > 0 && (
                  <div className="flex justify-between">
                    <span>Okna ({request.windows_count} szt.)</span>
                    <span>{(request.windows_count * 1500).toLocaleString()} zł</span>
                  </div>
                )}
                {request.doors_count > 0 && (
                  <div className="flex justify-between">
                    <span>Drzwi ({request.doors_count} szt.)</span>
                    <span>{(request.doors_count * 2000).toLocaleString()} zł</span>
                  </div>
                )}
                {request.wall_insulation_m2 > 0 && (
                  <div className="flex justify-between">
                    <span>Izolacja ścian ({request.wall_insulation_m2}m²)</span>
                    <span>{(request.wall_insulation_m2 * 120).toLocaleString()} zł</span>
                  </div>
                )}
                {request.attic_insulation_m2 > 0 && (
                  <div className="flex justify-between">
                    <span>Izolacja strychu ({request.attic_insulation_m2}m²)</span>
                    <span>{(request.attic_insulation_m2 * 80).toLocaleString()} zł</span>
                  </div>
                )}
                
                <div className="border-t pt-2 font-medium">
                  <div className="flex justify-between">
                    <span>Szacunkowa wartość:</span>
                    <span>
                      {(
                        (request.windows_count || 0) * 1500 +
                        (request.doors_count || 0) * 2000 +
                        (request.wall_insulation_m2 || 0) * 120 +
                        (request.attic_insulation_m2 || 0) * 80 +
                        10000
                      ).toLocaleString()} zł
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  *Orientacyjne ceny rynkowe
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
                <div>• Dokładnie przeanalizuj zakres prac</div>
                <div>• Sprawdź audyt energetyczny jeśli dostępny</div>
                <div>• Uwzględnij lokalizację przy wycenie</div>
                <div>• Skontaktuj się z klientem w razie pytań</div>
                <div>• Złóż konkurencyjną i realistyczną ofertę</div>
                <div>• Podkreśl swoje doświadczenie i kwalifikacje</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};