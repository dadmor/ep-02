// ========================================
// src/pages/contractor/offer-create.tsx
// ========================================

import { useForm, SubmitHandler } from 'react-hook-form';
import { useOne, useCreate, useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button, Input, Label } from "@/components/ui";
import { Lead } from "@/components/reader";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Save,
  Euro,
  Calendar,
  FileText,
  Building,
  MapPin,
  Square,
  Thermometer,
  AlertCircle,
  CheckCircle,
  Calculator,
  Hammer
} from "lucide-react";
import { Identity } from "../../operatorTypes";

// Define the form data type
interface ContractorOfferFormData {
  price: number;
  scope: string;
}

export const ContractorOfferCreate = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  const { mutate: createOffer } = useCreate();

  // Pobranie szczegółów zlecenia
  const { data: requestData, isLoading: requestLoading } = useOne({
    resource: "service_requests",
    id: requestId!,
    queryOptions: {
      enabled: !!requestId,
    },
  });

  // Sprawdź czy już złożono ofertę
  const { data: existingOffer } = useList({
    resource: "contractor_offers",
    filters: userId && requestId ? [
      {
        field: "contractor_id",
        operator: "eq",
        value: userId,
      },
      {
        field: "request_id",
        operator: "eq",
        value: requestId,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!(userId && requestId),
    },
  });

  // Sprawdź profil
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractorOfferFormData>({
    defaultValues: {
      price: 0,
      scope: "",
    },
  });

  const request = requestData?.data;
  const hasExistingOffer = existingOffer?.data && existingOffer.data.length > 0;
  const hasProfile = profile?.data && profile.data.length > 0;
  const watchPrice = watch("price");

  // Redirect if offer already exists
  if (hasExistingOffer) {
    navigate(`/contractor/offer/${existingOffer.data[0].id}`);
    return null;
  }

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

  // Suggested pricing based on request details
  const getSuggestedPrice = () => {
    let basePrice = 10000; // Base price
    
    if (request.windows_count) {
      basePrice += request.windows_count * 1500; // 1500 zł per window
    }
    if (request.doors_count) {
      basePrice += request.doors_count * 2000; // 2000 zł per door
    }
    if (request.wall_insulation_m2) {
      basePrice += request.wall_insulation_m2 * 120; // 120 zł per m2
    }
    if (request.attic_insulation_m2) {
      basePrice += request.attic_insulation_m2 * 80; // 80 zł per m2
    }
    
    return {
      min: Math.round(basePrice * 0.8),
      suggested: Math.round(basePrice),
      max: Math.round(basePrice * 1.3),
    };
  };

  const priceRange = getSuggestedPrice();

  const handleFormSubmit: SubmitHandler<ContractorOfferFormData> = (data) => {
    if (!userId || !requestId) {
      console.error("Missing required data");
      return;
    }

    const formData = {
      contractor_id: userId,
      request_id: requestId,
      price: data.price,
      scope: data.scope,
      status: "pending",
    };

    createOffer({
      resource: "contractor_offers",
      values: formData,
    }, {
      onSuccess: (response) => {
        navigate(`/contractor/offer/${response.data.id}`);
      },
      onError: (error) => {
        console.error("Error creating offer:", error);
      }
    });
  };

  const fillSuggestedContent = () => {
    let comprehensiveScope = `🏗️ KOMPLEKSOWA TERMOMODERNIZACJA\n\n`;
    
    comprehensiveScope += `📋 ZAKRES PRAC:\n`;
    
    if (request.wall_insulation_m2) {
      comprehensiveScope += `• Izolacja ścian zewnętrznych - ${request.wall_insulation_m2}m²\n`;
      comprehensiveScope += `  - Demontaż istniejącego tynku\n`;
      comprehensiveScope += `  - Oczyszczenie i gruntowanie powierzchni\n`;
      comprehensiveScope += `  - Montaż styropianu grafitowego 15cm\n`;
      comprehensiveScope += `  - Wykonanie tynku strukturalnego\n\n`;
    }

    if (request.attic_insulation_m2) {
      comprehensiveScope += `• Izolacja strychu/poddasza - ${request.attic_insulation_m2}m²\n`;
      comprehensiveScope += `  - Wełna mineralna 25cm\n`;
      comprehensiveScope += `  - Paroizolacja\n`;
      comprehensiveScope += `  - Wentylacja przestrzeni dachowej\n\n`;
    }

    if (request.windows_count) {
      comprehensiveScope += `• Wymiana okien - ${request.windows_count} szt.\n`;
      comprehensiveScope += `  - Okna PVC 5-komorowe\n`;
      comprehensiveScope += `  - Szyby 3-szybowe, Uw=0.9\n`;
      comprehensiveScope += `  - Parapety wewnętrzne i zewnętrzne\n`;
      comprehensiveScope += `  - Montaż zgodnie z ITB\n\n`;
    }

    if (request.doors_count) {
      comprehensiveScope += `• Wymiana drzwi - ${request.doors_count} szt.\n`;
      comprehensiveScope += `  - Drzwi termoizolacyjne\n`;
      comprehensiveScope += `  - Okucia antywłamaniowe\n`;
      comprehensiveScope += `  - Próg termoizolacyjny\n\n`;
    }

    if (request.heat_source && ['gaz', 'wegiel', 'olej'].includes(request.heat_source)) {
      comprehensiveScope += `• Modernizacja systemu ogrzewania\n`;
      comprehensiveScope += `  - Wymiana kotła na kondensacyjny\n`;
      comprehensiveScope += `  - Termostatyczne zawory grzejnikowe\n`;
      comprehensiveScope += `  - Izolacja instalacji c.o.\n`;
      comprehensiveScope += `  - Automatyka pogodowa\n\n`;
    }

    comprehensiveScope += `⚙️ TECHNOLOGIE I MATERIAŁY:\n`;
    comprehensiveScope += `• Styropian grafitowy λ=0.031 W/mK\n`;
    comprehensiveScope += `• Kleje i zaprawy Ceresit/Weber\n`;
    comprehensiveScope += `• Siatka zbrojąca z włókna szklanego\n`;
    comprehensiveScope += `• Tynk akrylowy lub silikonowy\n`;
    comprehensiveScope += `• Profile startowe i narożne\n\n`;

    comprehensiveScope += `📝 DOKUMENTACJA:\n`;
    comprehensiveScope += `• Projekt techniczny izolacji\n`;
    comprehensiveScope += `• Świadectwo charakterystyki energetycznej\n`;
    comprehensiveScope += `• Instruktaż obsługi systemów\n`;
    comprehensiveScope += `• Protokoły odbioru technicznego\n`;
    comprehensiveScope += `• Gwarancje na materiały i wykonawstwo\n\n`;

    comprehensiveScope += `💰 WARUNKI:\n`;
    comprehensiveScope += `• Cena zawiera wszystkie materiały i robociznę\n`;
    comprehensiveScope += `• Płatność: 30% zaliczka, 70% po odbiorze\n`;
    comprehensiveScope += `• Czas realizacji: 3-4 tygodnie\n`;
    comprehensiveScope += `• Gwarancja: 5 lat na wykonawstwo\n`;
    comprehensiveScope += `• Ubezpieczenie OC: 1 000 000 zł\n`;
    comprehensiveScope += `• Sprzątanie terenu po robotach\n`;
    
    setValue("scope", comprehensiveScope);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/contractor/request/${requestId}`)}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do zlecenia
        </Button>
        <Lead
          title="Utwórz Ofertę"
          description="Przygotuj profesjonalną ofertę na zlecenie termomodernizacyjne"
        />
      </div>

      {/* Alert jeśli brak profilu */}
      {!hasProfile && (
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">
                  Ostrzeżenie: Brak profilu
                </div>
                <div className="text-sm text-orange-800">
                  Zleceniodawcy sprawdzają profile przed wyborem wykonawcy.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-orange-700 ml-1"
                    onClick={() => navigate('/contractor/profile')}
                  >
                    Uzupełnij profil →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formularz oferty */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Szczegóły oferty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Cena */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Wycena projektu</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        Cena brutto (PLN) *
                      </div>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="1000"
                      step="100"
                      placeholder="25000"
                      {...register("price", {
                        required: "Cena jest wymagana",
                        min: {
                          value: 1000,
                          message: "Minimalna cena to 1000 zł"
                        }
                      })}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">
                        {errors.price.message as string}
                      </p>
                    )}
                    
                    {/* Sugerowane ceny */}
                    <div className="text-xs text-muted-foreground">
                      <div>Sugerowane ceny na podstawie zakresu prac:</div>
                      <div className="flex gap-4 mt-1">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => setValue("price", priceRange.min)}
                        >
                          Min: {priceRange.min.toLocaleString()} zł
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 hover:underline font-medium"
                          onClick={() => setValue("price", priceRange.suggested)}
                        >
                          Opt: {priceRange.suggested.toLocaleString()} zł
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => setValue("price", priceRange.max)}
                        >
                          Max: {priceRange.max.toLocaleString()} zł
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zakres prac */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Szczegółowy zakres prac</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillSuggestedContent}
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Wypełnij szablonem
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scope">
                      Pełny opis zakresu prac, materiałów i warunków *
                    </Label>
                    <Textarea
                      id="scope"
                      placeholder="Szczegółowy opis prac do wykonania..."
                      rows={20}
                      {...register("scope", {
                        required: "Zakres prac jest wymagany",
                        minLength: {
                          value: 100,
                          message: "Opis musi mieć co najmniej 100 znaków"
                        }
                      })}
                    />
                    {errors.scope && (
                      <p className="text-sm text-red-500">
                        {errors.scope.message as string}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Użyj przycisku "Wypełnij szablonem" aby wygenerować profesjonalny opis, 
                      który możesz następnie dostosować do specyfiki zlecenia.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/contractor/request/${requestId}`)}
                  >
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Składanie oferty..." : "Złóż ofertę"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel informacyjny */}
        <div className="lg:col-span-1 space-y-4">
          {/* Szczegóły zlecenia */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Szczegóły zlecenia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="font-medium">{request.city}, {request.street_address}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {request.postal_code}
                  </div>
                </div>

                {request.heat_source && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {heatSourceLabels[request.heat_source] || request.heat_source}
                    </span>
                  </div>
                )}

                {/* Zakres prac */}
                <div className="border-t pt-3">
                  <div className="text-sm font-medium mb-2">Prace do wykonania:</div>
                  <div className="space-y-1 text-sm">
                    {request.windows_count > 0 && (
                      <div>• Wymiana okien: {request.windows_count} szt.</div>
                    )}
                    {request.doors_count > 0 && (
                      <div>• Wymiana drzwi: {request.doors_count} szt.</div>
                    )}
                    {request.wall_insulation_m2 > 0 && (
                      <div>• Izolacja ścian: {request.wall_insulation_m2} m²</div>
                    )}
                    {request.attic_insulation_m2 > 0 && (
                      <div>• Izolacja strychu: {request.attic_insulation_m2} m²</div>
                    )}
                  </div>
                </div>

                {request.audit_file_url && (
                  <div className="border-t pt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
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

          {/* Podgląd oferty */}
          {watchPrice > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podgląd oferty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cena</span>
                    <span className="font-medium text-lg">
                      {watchPrice.toLocaleString()} zł
                    </span>
                  </div>

                  {/* Kalkulacja na podstawie powierzchni */}
                  {(request.wall_insulation_m2 || request.attic_insulation_m2) && (
                    <div className="border-t pt-2 space-y-1 text-xs">
                      {request.wall_insulation_m2 && (
                        <div className="flex justify-between">
                          <span>Izolacja ścian ({request.wall_insulation_m2}m²):</span>
                          <span>{Math.round(watchPrice * 0.4 / request.wall_insulation_m2)} zł/m²</span>
                        </div>
                      )}
                      {request.attic_insulation_m2 && (
                        <div className="flex justify-between">
                          <span>Izolacja strychu ({request.attic_insulation_m2}m²):</span>
                          <span>{Math.round(watchPrice * 0.3 / request.attic_insulation_m2)} zł/m²</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wskazówki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wskazówki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>• Użyj przycisku "Wypełnij szablonem" jako podstawy</div>
                <div>• Dostosuj ceny do lokalnego rynku</div>
                <div>• Uwzględnij specyfikę budynku</div>
                <div>• Bądź konkretny w opisie zakresu prac</div>
                <div>• Podkreśl swoje kwalifikacje i doświadczenie</div>
                <div>• Zaproponuj elastyczne terminy płatności</div>
                <div>• Uwzględnij gwarancje na materiały i prace</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};