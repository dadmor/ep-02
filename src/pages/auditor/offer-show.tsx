// ========================================
// src/pages/auditor/offer-show.tsx
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
  Clock,
  FileText,
  Building,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Identity } from "../../operatorTypes";

export const OfferShow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Pobranie szczegółów oferty
  const { data: offerData, isLoading: offerLoading } = useOne({
    resource: "auditor_offers",
    id: id!,
    queryOptions: {
      enabled: !!id,
    },
  });

  // Pobranie szczegółów zlecenia
  const { data: requestData, isLoading: requestLoading } = useOne({
    resource: "audit_requests",
    id: offerData?.data?.request_id,
    queryOptions: {
      enabled: !!offerData?.data?.request_id,
    },
  });

  const offer = offerData?.data;
  const request = requestData?.data;

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
  if (offer.auditor_id !== userId) {
    return (
      <div className="p-6 mx-auto text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Brak dostępu</h2>
        <p className="text-muted-foreground mb-4">Nie masz uprawnień do wyświetlenia tej oferty.</p>
        <Button onClick={() => navigate('/auditor/my-offers')}>
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
            <Clock className="w-3 h-3 mr-1" />
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
          title: "Zlecenie ukończone",
          description: "Audyt został pomyślnie zrealizowany. Możesz dodać ten projekt do swojego portfolio.",
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
  const canWithdraw = offer.status === 'pending';

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

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/auditor/my-offers')}
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
                    <div className="text-sm font-medium text-muted-foreground">Czas realizacji</div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold">{offer.duration_days} dni</span>
                    </div>
                  </div>
                </div>

                {/* Opis oferty */}
                {offer.description && (
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Opis oferty</h4>
                    <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">
                      {offer.description}
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
                  {offer.status === 'accepted' && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-3">Dane kontaktowe zleceniodawcy</h5>
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
                  )}

                  {/* Charakterystyka budynku */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium mb-3">Charakterystyka budynku</h5>
                    <div className="flex flex-wrap gap-2">
                      {request.building_type && (
                        <Badge variant="outline">
                          <Building className="w-3 h-3 mr-1" />
                          {buildingTypeLabels[request.building_type] || request.building_type}
                        </Badge>
                      )}
                      {request.living_area && (
                        <Badge variant="outline">
                          {request.living_area} m²
                        </Badge>
                      )}
                      {request.building_year && (
                        <Badge variant="outline">
                          {request.building_year}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {request.audit_purpose && (
                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2">Cel audytu</h5>
                      <p className="text-sm text-gray-700">{request.audit_purpose}</p>
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
                    onClick={() => navigate(`/auditor/offer/edit/${offer.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj ofertę
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/auditor/request/${offer.request_id}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Zobacz zlecenie
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/auditor/my-offers')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Moje oferty
                </Button>

                {offer.status === 'completed' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/auditor/portfolio/create')}
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

                {request?.living_area && offer.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cena za m²</span>
                    <span>{Math.round(offer.price / request.living_area)} zł/m²</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(offer.status)}
                </div>
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
                    <div>• Średni czas odpowiedzi to 2-5 dni</div>
                  </>
                )}
                
                {offer.status === 'accepted' && (
                  <>
                    <div>• Skontaktuj się z zleceniodawcą w ciągu 24h</div>
                    <div>• Ustal szczegóły realizacji i harmonogram</div>
                    <div>• Pamiętaj o dokumentacji przebiegu audytu</div>
                  </>
                )}
                
                {offer.status === 'completed' && (
                  <>
                    <div>• Dodaj ten projekt do swojego portfolio</div>
                    <div>• Poproś o opinię od klienta</div>
                    <div>• Zachowaj dokumentację na przyszłość</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};