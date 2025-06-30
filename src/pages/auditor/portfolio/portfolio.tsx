// ========================================
// src/pages/auditor/portfolio.tsx - FIXED VERSION
// ========================================

import { useState } from "react";
import { useList, useDelete } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Building,
  Square,
  Image,
  Filter,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../../operatorTypes";

export const AuditorPortfolio = () => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  const { mutate: deleteItem } = useDelete();
  
  // Pobranie portfolio items
  const { data: portfolioItems, isLoading, refetch } = useList({
    resource: "auditor_portfolio_items",
    filters: userId ? [
      {
        field: "auditor_id",
        operator: "eq",
        value: userId,
      },
    ] : [],
    sorters: [
      {
        field: "completion_date",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Sprawdź czy ma profil
  const { data: profile } = useList({
    resource: "auditor_profiles",
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

  console.log("Portfolio items:", portfolioItems); // Debug log
  console.log("Profile:", profile); // Debug log

  const hasProfile = profile?.data && profile.data.length > 0;
  const items = portfolioItems?.data || [];

  // Debug - sprawdź strukturę danych
  if (items.length > 0) {
    console.log("First item structure:", items[0]);
  }

  // Filtrowanie
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === "all" || (item.location && item.location.includes(locationFilter));
    const matchesType = typeFilter === "all" || item.building_type === typeFilter;
    
    return matchesSearch && matchesLocation && matchesType;
  });

  // Unikalne lokalizacje i typy - z zabezpieczeniem
  const uniqueLocations = [...new Set(items.map(item => {
    if (!item.location) return "";
    return item.location.split(',')[1]?.trim() || item.location;
  }).filter(Boolean))].sort();
  
  const buildingTypes = [
    { value: "dom_jednorodzinny", label: "Dom jednorodzinny" },
    { value: "dom_wielorodzinny", label: "Dom wielorodzinny" },
    { value: "apartament", label: "Apartament" },
    { value: "budynek_komercyjny", label: "Budynek komercyjny" },
    { value: "budynek_przemyslowy", label: "Budynek przemysłowy" },
    { value: "budynek_uslugowy", label: "Budynek usługowy" },
    { value: "budynek_zabytkowy", label: "Budynek zabytkowy" },
    { value: "inny", label: "Inny" },
  ];

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteItem({
        resource: 'auditor_portfolio_items',
        id: selectedItem.id,
      }, {
        onSuccess: () => {
          setShowDeleteDialog(false);
          setSelectedItem(null);
          refetch();
        }
      });
    }
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
      <FlexBox>
        <Lead
          title="Portfolio Audytów"
          description="Zarządzaj przykładami swoich zrealizowanych projektów audytowych"
        />
        <Button 
          onClick={() => navigate('/auditor/portfolio/create')}
          disabled={!hasProfile}
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj projekt
        </Button>
      </FlexBox>

      {/* Alert jeśli brak profilu */}
      {!hasProfile && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">
                  Musisz najpierw uzupełnić swój profil
                </div>
                <div className="text-sm text-orange-800">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-orange-700"
                    onClick={() => navigate('/auditor/profile')}
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
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtry portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj po tytule, lokalizacji lub opisie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Wszystkie regiony" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie regiony</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Wszystkie typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  {buildingTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("all");
                  setTypeFilter("all");
                }}
              >
                Wyczyść
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statystyki */}
      {items.length > 0 && (
        <GridBox variant="1-2-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{items.length}</div>
                  <div className="text-xs text-muted-foreground">Projektów w portfolio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{uniqueLocations.length}</div>
                  <div className="text-xs text-muted-foreground">Regionów</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-600" />
                <div>
                  <div className="text-xl font-bold">
                    {items.length > 0 && items.some(i => i.completion_date) 
                      ? new Date().getFullYear() - Math.min(...items.filter(i => i.completion_date).map(i => new Date(i.completion_date).getFullYear()))
                      : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Lat aktywności</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Image className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="text-xl font-bold">
                    {items.filter(i => i.main_image_url).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Ze zdjęciami</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </GridBox>
      )}

      {/* Lista projektów portfolio */}
      <div>
        {filteredItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                {/* Zdjęcie główne */}
                {item.main_image_url && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img 
                      src={item.main_image_url} 
                      alt={item.title || "Portfolio item"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        // Ukryj obrazek jeśli się nie załaduje
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Nagłówek */}
                    <div>
                      <h3 className="font-medium text-lg line-clamp-2 mb-1">
                        {item.title || "Bez tytułu"}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {item.location || "Brak lokalizacji"}
                      </div>
                    </div>

                    {/* Szczegóły */}
                    <div className="flex flex-wrap gap-1">
                      {item.building_type && (
                        <Badge variant="outline" className="text-xs">
                          <Building className="w-3 h-3 mr-1" />
                          {buildingTypes.find(t => t.value === item.building_type)?.label || item.building_type}
                        </Badge>
                      )}
                      {item.building_area && (
                        <Badge variant="outline" className="text-xs">
                          <Square className="w-3 h-3 mr-1" />
                          {item.building_area}m²
                        </Badge>
                      )}
                      {item.completion_date && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(item.completion_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    {/* Opis */}
                    {item.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    {/* Kluczowe cechy */}
                    {item.key_features && Array.isArray(item.key_features) && item.key_features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.key_features.slice(0, 3).map((feature: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 border-blue-200">
                            {feature}
                          </Badge>
                        ))}
                        {item.key_features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.key_features.length - 3} więcej
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Klasy energetyczne */}
                    {(item.energy_class_before || item.energy_class_after) && (
                      <div className="flex items-center gap-2 text-xs">
                        {item.energy_class_before && (
                          <div className="flex items-center gap-1">
                            <span>Przed:</span>
                            <Badge variant="outline" className="text-xs">
                              {item.energy_class_before}
                            </Badge>
                          </div>
                        )}
                        {item.energy_class_after && (
                          <div className="flex items-center gap-1">
                            <span>Po:</span>
                            <Badge variant="outline" className="text-xs bg-green-50 border-green-200">
                              {item.energy_class_after}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Wyróżnienie */}
                    {item.is_featured && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                        ⭐ Wyróżniony projekt
                      </Badge>
                    )}
                  </div>

                  {/* Akcje */}
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/auditor/portfolio/${item.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Zobacz
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/auditor/portfolio/edit/${item.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length > 0 ? (
          // Brak wyników po filtrowaniu
          <Card>
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Brak wyników dla wybranych filtrów
              </h3>
              <p className="text-muted-foreground mb-4">
                Spróbuj zmienić kryteria wyszukiwania
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("all");
                  setTypeFilter("all");
                }}
              >
                Wyczyść filtry
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Brak projektów w portfolio
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Twoje portfolio jest puste
              </h3>
              <p className="text-muted-foreground mb-4">
                Dodaj pierwsze przykłady swoich zrealizowanych audytów
              </p>
              <Button 
                onClick={() => navigate('/auditor/portfolio/create')}
                disabled={!hasProfile}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pierwszy projekt
              </Button>
              {!hasProfile && (
                <p className="text-xs text-orange-600 mt-2">
                  Najpierw uzupełnij swój profil
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog usuwania */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń projekt z portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Czy na pewno chcesz usunąć ten projekt z portfolio? Ta akcja jest nieodwracalna.</p>
            {selectedItem && (
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedItem.title || "Bez tytułu"}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedItem.location || "Brak lokalizacji"}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Anuluj
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Usuń projekt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};