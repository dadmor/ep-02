// ========================================
// src/pages/contractor/offer-show.tsx
// ========================================

import { useOne } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { 
  ArrowLeft,
  Edit,
  Eye,
  Calendar,
  Euro,
  FileText,
  Building,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  Hammer
} from "lucide-react";
import { Identity } from "../../operatorTypes";

export const ContractorOfferShow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Pobranie szczegółów oferty
  const { data: offerData, isLoading: offerLoading } = useOne({
    resource: "contractor_offers",
    id: id!,
    queryOptions: {
      enabled: !!id,
    },
  });

  // Pobranie szczegółów zlecenia
  const { data: requestData, isLoading: requestLoading } = useOne({
    resource: "service_requests",
    id: offerData?.data?.request_id,
    queryOptions: {
      enabled: !!offerData?.data?.request_id,
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

  const offer = offerData?.data;
  const request = requestData?.data;
  const beneficiary = beneficiaryData?.data;

  // Show loading state
  if (!userId || offerLoading || !offer) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if user owns this offer
  if (offer.contractor_id !== userId) {
    return (
      <div className="p-6 mx-auto text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Brak dostępu</h2>
        <p className="text-muted-foreground mb-4">Nie masz uprawnień do wyświetlenia tej oferty.</p>
        <Button onClick={() => navigate('/contractor/my-offers')}>
          Powrót do moich ofert
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            <AlertCircle className="w-3 h-3 mr-1" />
            Oczekuje na odpowiedź
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Zaakceptowana
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Odrzucona
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ukończona
          </Badge>
        );
      case 'withdrawn':
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-700">
            <XCircle className="w-3 h-3 mr-1" />
            Wycofana
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          title: "Oferta oczekuje na odpowiedź",
          description: "Zleceniodawca jeszcze nie podjął decyzji. Możesz edytować ofertę lub ją wycofać.",
          color: "text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        };
      case 'accepted':
        return {
          title: "Gratulacje! Oferta została zaakceptowana",
          description: "Zleceniodawca wybrał Twoją ofertę. Skontaktuj się z nim, aby ustalić szczegóły realizacji.",
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      case 'rejected':
        return {
          title: "Oferta została odrzucona",
          description: "Zleceniodawca wybrał inną ofertę. Dziękujemy za udział w przetargu.",
          color: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      case 'completed':
        return {
          title: "Projekt ukończony",
          description: "Prace zostały pomyślnie zrealizowane. Możesz dodać ten projekt do swojego portfolio.",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200"
        };
      case 'withdrawn':
        return {
          title: "Oferta została wycofana",
          description: "Wycofałeś tę ofertę. Nie można jej już edytować.",
          color: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        };
      default:
        return {
          title: "Status nieznany",
          description: "",
          color: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200"
        };
    }
  };

  const statusInfo = getStatusInfo(offer.status);
  const canEdit = offer.status === 'pending';

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/contractor/my-offers')}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Moje oferty
        </Button>
        <Lead
          title="Szczegóły Oferty"
          description="Pełne informacje o złożonej ofercie"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Główna zawartość */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status oferty */}
          <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(offer.status)}
                  </div>
                  <h3 className={`font-semibold text-lg mb-2 ${statusInfo.color}`}>
                    {statusInfo.title}
                  </h3>
                  <p className={`text-sm ${statusInfo.color}`}>
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Szczegóły oferty */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Szczegóły oferty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Podstawowe parametry */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Cena</div>
                    <div className="flex items-center gap-2">
                      <Euro className="w-5 h-5 text-green-600" />
                      <span className="text-2xl font-bold">{offer.price?.toLocaleString()} zł</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>{getStatusBadge(offer.status)}</div>
                  </div>
                </div>

                {/* Zakres prac */}
                {offer.scope && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Zakres prac</h4>
                    <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                      {offer.scope}
                    </div>
                  </div>
                )}

                {/* Daty */}
                <div className="border-t pt-6">
                  <h4 className="font-medium mb-3">Historia</h4>
                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Złożona: {new Date(offer.created_at).toLocaleDateString()}</span>
                    </div>
                    {offer.updated_at !== offer.created_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Aktualizacja: {new Date(offer.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Szczegóły zlecenia */}
          {request && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Szczegóły zlecenia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-lg mb-2">
                      {request.city}, {request.street_address}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {request.postal_code}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Dane kontaktowe - tylko dla zaakceptowanych ofert */}
                  {offer.status === 'accepted' && beneficiary && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-3 text-green-800">Dane kontaktowe zleceniodawcy</h5>
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

                  {/* Charakterystyka projektu */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">Zakres prac zlecenia</h5>
                    <div className="grid gap-2 md:grid-cols-2">
                      {request.windows_count > 0 && (
                        <div className="text-sm">• Wymiana okien: {request.windows_count} szt.</div>
                      )}
                      {request.doors_count > 0 && (
                        <div className="text-sm">• Wymiana drzwi: {request.doors_count} szt.</div>
                      )}
                      {request.wall_insulation_m2 > 0 && (
                        <div className="text-sm">• Izolacja ścian: {request.wall_insulation_m2} m²</div>
                      )}
                      {request.attic_insulation_m2 > 0 && (
                        <div className="text-sm">• Izolacja strychu: {request.attic_insulation_m2} m²</div>
                      )}
                    </div>
                  </div>

                  {request.audit_file_url && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2">Audyt energetyczny</h5>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(request.audit_file_url, '_blank')}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Pobierz audyt
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel akcji */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {canEdit && (
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/contractor/offer/edit/${offer.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj ofertę
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/contractor/request/${offer.request_id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Zobacz zlecenie
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/contractor/my-offers')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Moje oferty
                </Button>

                {offer.status === 'completed' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/contractor/portfolio/create')}
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Dodaj do portfolio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informacje szczegółowe */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ID oferty</span>
                  <span className="font-mono text-xs">{(offer?.id ?? '').toString().slice(0, 8)}...</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wartość</span>
                  <span className="font-medium">{offer.price?.toLocaleString()} zł</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(offer.status)}
                </div>

                {/* Kalkulacje pomocnicze */}
                {request && (
                  <div className="border-t pt-3 space-y-1 text-xs">
                    {request.wall_insulation_m2 > 0 && (
                      <div className="flex justify-between">
                        <span>Cena za m² izolacji ścian:</span>
                        <span>{Math.round((offer.price * 0.4) / request.wall_insulation_m2)} zł/m²</span>
                      </div>
                    )}
                    {request.windows_count > 0 && (
                      <div className="flex justify-between">
                        <span>Cena za okno:</span>
                        <span>{Math.round((offer.price * 0.3) / request.windows_count)} zł/szt</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Wskazówki w zależności od statusu */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {offer.status === 'pending' ? 'Wskazówki' : 'Informacje'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                {offer.status === 'pending' && (
                  <>
                    <div>• Możesz edytować ofertę do momentu jej zaakceptowania</div>
                    <div>• Zleceniodawca może zadawać dodatkowe pytania</div>
                    <div>• Średni czas odpowiedzi to 3-7 dni</div>
                    <div>• Możesz wycofać ofertę jeśli to konieczne</div>
                  </>
                )}
                
                {offer.status === 'accepted' && (
                  <>
                    <div>• Skontaktuj się ze zleceniodawcą w ciągu 24h</div>
                    <div>• Ustal szczegóły realizacji i harmonogram</div>
                    <div>• Pamiętaj o dokumentacji przebiegu prac</div>
                    <div>• Zachowaj najwyższe standardy wykonawstwa</div>
                  </>
                )}
                
                {offer.status === 'completed' && (
                  <>
                    <div>• Dodaj ten projekt do swojego portfolio</div>
                    <div>• Poproś o opinię od klienta</div>
                    <div>• Zachowaj dokumentację na przyszłość</div>
                    <div>• Możesz wykorzystać zdjęcia w promocji</div>
                  </>
                )}

                {offer.status === 'rejected' && (
                  <>
                    <div>• Przeanalizuj powody odrzucenia</div>
                    <div>• Dostosuj przyszłe oferty do oczekiwań</div>
                    <div>• Skonsultuj cennik z konkurencją</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Następne kroki */}
          {offer.status === 'accepted' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-green-800">Następne kroki</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>Skontaktuj się z klientem</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Ustal harmonogram prac</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Przygotuj dokumentację</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Rozpocznij realizację</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};