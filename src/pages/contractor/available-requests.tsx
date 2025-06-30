// ========================================
// src/pages/contractor/available-requests.tsx
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
  Hammer,
  Zap,
  Wind
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const ContractorAvailableRequests = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [heatSourceFilter, setHeatSourceFilter] = useState("all");
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Pobranie dostępnych zleceń serwisowych
  const { data: requests, isLoading } = useList({
    resource: "service_requests",
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

  const allRequests = requests?.data || [];
  const hasProfile = profile?.data && profile.data.length > 0;

  // Filtrowanie
  const filteredRequests = allRequests.filter(request => {
    const matchesSearch = !searchTerm || 
      request.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.street_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.postal_code.includes(searchTerm);
    
    const matchesCity = cityFilter === "all" || request.city === cityFilter;
    const matchesHeatSource = heatSourceFilter === "all" || request.heat_source === heatSourceFilter;
    
    return matchesSearch && matchesCity && matchesHeatSource;
  });

  // Unikalne miasta i źródła ciepła
  const uniqueCities = [...new Set(allRequests.map(r => r.city))].sort();
  const heatSources = [
    { value: "gaz", label: "Gaz ziemny" },
    { value: "wegiel", label: "Węgiel" },
    { value: "biomasa", label: "Biomasa" },
    { value: "olej", label: "Olej opałowy" },
    { value: "elektryczne", label: "Ogrzewanie elektryczne" },
    { value: "pompa_ciepla", label: "Pompa ciepła" },
    { value: "solar", label: "Kolektory słoneczne" },
    { value: "inne", label: "Inne" },
  ];

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
        description="Przeglądaj i składaj oferty na zlecenia termomodernizacyjne"
      />

      {/* Alert jeśli brak profilu */}
      {!hasProfile && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Hammer className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">
                  Musisz uzupełnić profil aby składać oferty
                </div>
                <div className="text-sm text-orange-800">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-orange-700"
                    onClick={() => navigate('/contractor/profile')}
                  >
                    Przejdź do profilu →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Select value={heatSourceFilter} onValueChange={setHeatSourceFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Źródło ciepła" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie źródła</SelectItem>
                {heatSources.map(source => (
                  <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCityFilter("all");
                setHeatSourceFilter("all");
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
            {filteredRequests.map((request: any) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <FlexBox className="mb-4">
                    <div>
                      <h3 className="font-medium text-lg mb-2">
                        {request.city}, {request.street_address}
                      </h3>
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
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/contractor/request/${request.id}`)}
                      >
                        Szczegóły
                      </Button>
                      <Button
                        onClick={() => navigate(`/contractor/offer/create/${request.id}`)}
                        disabled={!hasProfile}
                      >
                        Złóż ofertę
                      </Button>
                    </div>
                  </FlexBox>

                  {/* Szczegóły techniczne budynku */}
                  <div className="space-y-3">
                    {/* Źródło ciepła */}
                    {request.heat_source && (
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Źródło ciepła:</span>
                        <Badge variant="outline">
                          {heatSources.find(s => s.value === request.heat_source)?.label || request.heat_source}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Informacje o izolacjach */}
                    <div className="flex flex-wrap gap-2 text-sm">
                      {request.windows_count && (
                        <Badge variant="outline">
                          <Building className="w-3 h-3 mr-1" />
                          {request.windows_count} okien
                        </Badge>
                      )}
                      {request.doors_count && (
                        <Badge variant="outline">
                          <Building className="w-3 h-3 mr-1" />
                          {request.doors_count} drzwi
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
                    </div>

                    {/* Plik audytu */}
                    {request.audit_file_url && (
                      <div className="flex items-center gap-2 text-sm bg-blue-50 p-3 rounded">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Dołączony audyt energetyczny</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="p-0 h-auto text-blue-600"
                          onClick={() => window.open(request.audit_file_url, '_blank')}
                        >
                          Pobierz →
                        </Button>
                      </div>
                    )}

                    {/* Potencjalne prace do wykonania */}
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2">Potencjalne prace do wykonania:</div>
                      <div className="flex flex-wrap gap-2">
                        {request.wall_insulation_m2 && (
                          <Badge className="bg-green-100 text-green-800">
                            <Building className="w-3 h-3 mr-1" />
                            Izolacja ścian
                          </Badge>
                        )}
                        {request.attic_insulation_m2 && (
                          <Badge className="bg-green-100 text-green-800">
                            <Building className="w-3 h-3 mr-1" />
                            Izolacja strychu
                          </Badge>
                        )}
                        {request.windows_count && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Square className="w-3 h-3 mr-1" />
                            Wymiana okien
                          </Badge>
                        )}
                        {request.doors_count && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Square className="w-3 h-3 mr-1" />
                            Wymiana drzwi
                          </Badge>
                        )}
                        {request.heat_source && ['gaz', 'wegiel', 'olej'].includes(request.heat_source) && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <Zap className="w-3 h-3 mr-1" />
                            Modernizacja ogrzewania
                          </Badge>
                        )}
                        <Badge className="bg-purple-100 text-purple-800">
                          <Wind className="w-3 h-3 mr-1" />
                          Wentylacja mechaniczna
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {searchTerm || (cityFilter !== "all") || (heatSourceFilter !== "all") ? "Brak wyników" : "Brak dostępnych zleceń"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || (cityFilter !== "all") || (heatSourceFilter !== "all")
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