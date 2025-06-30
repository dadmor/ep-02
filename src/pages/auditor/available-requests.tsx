// ========================================
// src/pages/auditor/available-requests.tsx - ZAKTUALIZOWANY
// ========================================

import { useState } from "react";
import { useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  MapPin,
  Calendar,
  Filter,
  Search,
  Building,
  Thermometer,
  Square,
  Phone,
  CheckCircle,
  Clock,
  Eye,
  Euro,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const AvailableRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Pobranie dostępnych zleceń
  const { data: requests, isLoading } = useList({
    resource: "audit_requests",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "verified",
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

  // Pobranie wszystkich ofert audytora
  const { data: myOffers } = useList({
    resource: "auditor_offers",
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

  const allRequests = requests?.data || [];
  const hasPortfolio = portfolio?.data && portfolio.data.length > 0;
  const offers = myOffers?.data || [];

  // Stwórz mapę ofert dla szybkiego wyszukiwania
  const offersByRequestId = offers.reduce((acc: Record<string, any>, offer: any) => {
    if (offer.request_id) {
      acc[offer.request_id] = offer;
    }
    return acc;
  }, {});

  // Filtrowanie
  const filteredRequests = allRequests.filter(request => {
    if (!request.id) return false; // Skip if no ID
    
    const matchesSearch = !searchTerm || 
      request.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.street_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.postal_code?.includes(searchTerm);
    
    const matchesCity = cityFilter === "all" || request.city === cityFilter;
    
    const hasOffer = request.id ? offersByRequestId[request.id] : false;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "no_offer" && !hasOffer) ||
      (statusFilter === "has_offer" && hasOffer);
    
    return matchesSearch && matchesCity && matchesStatus;
  });

  // Unikalne miasta do filtra
  const uniqueCities = [...new Set(allRequests.map(r => r.city).filter(Boolean))].sort();

  // Statystyki
  const stats = {
    total: allRequests.length,
    withOffers: allRequests.filter(r => r.id && offersByRequestId[r.id]).length,
    withoutOffers: allRequests.filter(r => r.id && !offersByRequestId[r.id]).length,
  };

  // Funkcja do renderowania statusu oferty
  const getOfferStatus = (requestId: string | undefined) => {
    if (!requestId) return null;
    const offer = offersByRequestId[requestId];
    if (!offer) return null;

    const statusConfig = {
      pending: {
        label: "Oferta złożona",
        color: "border-yellow-500 text-yellow-700 bg-yellow-50",
        icon: Clock
      },
      accepted: {
        label: "Zaakceptowana",
        color: "border-green-500 text-green-700 bg-green-50", 
        icon: CheckCircle
      },
      rejected: {
        label: "Odrzucona",
        color: "border-red-500 text-red-700 bg-red-50",
        icon: AlertCircle
      },
      completed: {
        label: "Ukończona",
        color: "border-blue-500 text-blue-700 bg-blue-50",
        icon: CheckCircle
      },
      withdrawn: {
        label: "Wycofana",
        color: "border-gray-500 text-gray-700 bg-gray-50",
        icon: AlertCircle
      }
    };

    const config = statusConfig[offer.status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge 
        variant="outline" 
        className={`${config.color} text-xs`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Show loading state
  if (!userId || isLoading) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Lead
        title="Dostępne Zlecenia"
        description="Przeglądaj i składaj oferty na zlecenia audytowe"
      />

      {/* Alert jeśli brak portfolio */}
      {!hasPortfolio && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">
                  Musisz uzupełnić portfolio aby składać oferty
                </div>
                <div className="text-sm text-orange-800">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-orange-700"
                    onClick={() => navigate('/auditor/portfolio')}
                  >
                    Przejdź do portfolio →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statystyki */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Dostępne zlecenia</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-xl font-bold">{stats.withOffers}</div>
                <div className="text-xs text-muted-foreground">Z Twoją ofertą</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Euro className="w-6 h-6 text-purple-600" />
              <div>
                <div className="text-xl font-bold">{stats.withoutOffers}</div>
                <div className="text-xs text-muted-foreground">Bez oferty</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-gray-600" />
              <div>
                <div className="text-xl font-bold">{uniqueCities.length}</div>
                <div className="text-xs text-muted-foreground">Miast</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {/* Filtry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po mieście, adresie lub kodzie pocztowym..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Wszystkie miasta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie miasta</SelectItem>
                {uniqueCities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status oferty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="no_offer">Bez oferty</SelectItem>
                <SelectItem value="has_offer">Z ofertą</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCityFilter("all");
                setStatusFilter("all");
              }}
            >
              Wyczyść
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista zleceń */}
      <div>
        {filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map((request: any) => {
              const hasOffer = offersByRequestId[request.id];
              const offer = hasOffer ? offersByRequestId[request.id] : null;
              
              return (
                <Card key={request.id} className={hasOffer ? "border-l-4 border-l-blue-500" : ""}>
                  <CardContent className="p-6">
                    <FlexBox className="mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-lg">
                            {request.city}, {request.street_address}
                          </h3>
                          {getOfferStatus(request.id)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {request.postal_code}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {request.phone_number}
                          </div>
                        </div>
                        
                        {/* Informacje o ofercie */}
                        {offer && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Euro className="w-3 h-3 text-blue-600" />
                                <span className="font-medium">{offer.price?.toLocaleString()} zł</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-600" />
                                <span>{offer.duration_days} dni</span>
                              </div>
                              <div className="text-muted-foreground">
                                Złożona: {new Date(offer.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/auditor/request/${request.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Szczegóły
                        </Button>
                        
                        {hasOffer ? (
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/auditor/offer/${offer.id}`)}
                          >
                            Zobacz ofertę
                          </Button>
                        ) : (
                          <Button
                            onClick={() => navigate(`/auditor/offer/create/${request.id}`)}
                            disabled={!hasPortfolio}
                          >
                            Złóż ofertę
                          </Button>
                        )}
                      </div>
                    </FlexBox>

                    {/* Dodatkowe informacje o budynku */}
                    <div className="space-y-3">
                      {request.building_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Typ budynku:</span>
                          <Badge variant="outline">{request.building_type}</Badge>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-sm">
                        {request.building_year && (
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {request.building_year}
                          </Badge>
                        )}
                        {request.living_area && (
                          <Badge variant="outline">
                            <Square className="w-3 h-3 mr-1" />
                            {request.living_area}m²
                          </Badge>
                        )}
                        {request.heating_system && (
                          <Badge variant="outline">
                            <Thermometer className="w-3 h-3 mr-1" />
                            {request.heating_system}
                          </Badge>
                        )}
                      </div>

                      {request.audit_purpose && (
                        <div className="text-sm">
                          <span className="font-medium">Cel audytu:</span> {request.audit_purpose}
                        </div>
                      )}

                      {request.notes && (
                        <div className="text-sm bg-gray-50 p-3 rounded">
                          <span className="font-medium">Uwagi:</span> {request.notes}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || cityFilter !== "all" || statusFilter !== "all" ? "Brak wyników" : "Brak dostępnych zleceń"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || cityFilter !== "all" || statusFilter !== "all"
                  ? "Spróbuj zmienić kryteria wyszukiwania"
                  : "Sprawdź ponownie później, aby zobaczyć nowe zlecenia"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};