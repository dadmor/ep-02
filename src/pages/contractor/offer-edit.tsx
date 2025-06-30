// ========================================
// src/pages/contractor/offer-edit.tsx
// ========================================

import { useForm, SubmitHandler } from 'react-hook-form';
import { useOne, useUpdate } from "@refinedev/core";
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
  FileText,
  Building,
  MapPin,
  AlertCircle,
  Calculator
} from "lucide-react";
import { useEffect } from "react";
import { Identity } from "../../operatorTypes";

// Define the form data type
interface ContractorOfferFormData {
  price: number;
  scope: string;
}

export const ContractorOfferEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  const { mutate: updateOffer } = useUpdate();

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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContractorOfferFormData>();

  const offer = offerData?.data;
  const request = requestData?.data;
  const watchPrice = watch("price");

  // Initialize form with existing data
  useEffect(() => {
    if (offer) {
      reset({
        price: offer.price,
        scope: offer.scope || "",
      });
    }
  }, [offer, reset]);

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
        <p className="text-muted-foreground mb-4">Nie masz uprawnień do edycji tej oferty.</p>
        <Button onClick={() => navigate('/contractor/my-offers')}>
          Powrót do moich ofert
        </Button>
      </div>
    );
  }

  // Check if offer can be edited
  if (offer.status !== 'pending') {
    return (
      <div className="p-6 mx-auto text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <h2 className="text-xl font-semibold mb-2">Nie można edytować</h2>
        <p className="text-muted-foreground mb-4">
          Możesz edytować tylko oferty o statusie "oczekująca".
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => navigate(`/contractor/offer/${offer.id}`)}>
            Zobacz ofertę
          </Button>
          <Button variant="outline" onClick={() => navigate('/contractor/my-offers')}>
            Moje oferty
          </Button>
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
    if (!request) return null;
    
    let basePrice = 10000; // Base price
    
    if (request.windows_count) {
      basePrice += request.windows_count * 1500;
    }
    if (request.doors_count) {
      basePrice += request.doors_count * 2000;
    }
    if (request.wall_insulation_m2) {
      basePrice += request.wall_insulation_m2 * 120;
    }
    if (request.attic_insulation_m2) {
      basePrice += request.attic_insulation_m2 * 80;
    }
    
    return {
      min: Math.round(basePrice * 0.8),
      suggested: Math.round(basePrice),
      max: Math.round(basePrice * 1.3),
    };
  };

  const priceRange = getSuggestedPrice();

  const fillSuggestedContent = () => {
    if (!request) return;
    
    let comprehensiveScope = `🏗️ KOMPLEKSOWA TERMOMODERNIZACJA - AKTUALIZACJA OFERTY\n\n`;
    
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

    comprehensiveScope += `💰 WARUNKI - AKTUALIZACJA:\n`;
    comprehensiveScope += `• Cena zawiera wszystkie materiały i robociznę\n`;
    comprehensiveScope += `• Płatność: 30% zaliczka, 70% po odbiorze\n`;
    comprehensiveScope += `• Czas realizacji: 3-4 tygodnie\n`;
    comprehensiveScope += `• Gwarancja: 5 lat na wykonawstwo\n`;
    comprehensiveScope += `• Ubezpieczenie OC: 1 000 000 zł\n`;
    comprehensiveScope += `• Sprzątanie terenu po robotach\n`;
    
    setValue("scope", comprehensiveScope);
  };

  const handleFormSubmit: SubmitHandler<ContractorOfferFormData> = (data) => {
    if (!userId || !id) {
      console.error("Missing required data");
      return;
    }

    const formData = {
      price: data.price,
      scope: data.scope,
    };

    updateOffer({
      resource: "contractor_offers",
      id: id,
      values: formData,
    }, {
      onSuccess: () => {
        navigate(`/contractor/offer/${id}`);
      },
      onError: (error) => {
        console.error("Error updating offer:", error);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/contractor/offer/${id}`)}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do oferty
        </Button>
        <Lead
          title="Edytuj Ofertę"
          description="Aktualizuj szczegóły swojej oferty wykonawczej"
        />
      </div>

      {/* Informacja o edycji */}
      <Card className="border-blue-200 bg-blue-50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">
                Edytujesz istniejącą ofertę
              </div>
              <div className="text-sm text-blue-800">
                Możesz aktualizować cenę i zakres prac. Zmiany będą widoczne dla zleceniodawcy.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formularz edycji */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Aktualizuj ofertę
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
                    {priceRange && (
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
                    )}
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
                      Zaktualizuj szablon
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
                      Użyj przycisku "Zaktualizuj szablon" aby odświeżyć opis, 
                      zachowując przy tym swoje modyfikacje.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/contractor/offer/${id}`)}
                  >
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Panel informacyjny */}
        <div className="lg:col-span-1 space-y-4">
          {/* Szczegóły zlecenia */}
          {request && (
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
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {heatSourceLabels[request.heat_source] || request.heat_source}
                      </span>
                    </div>
                  )}

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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Podgląd zmian */}
          {(watchPrice > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podgląd zmian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nowa cena</span>
                    <div className="text-right">
                      <div className="font-medium text-lg">
                        {watchPrice.toLocaleString()} zł
                      </div>
                      {offer.price !== watchPrice && (
                        <div className="text-xs text-muted-foreground">
                          Było: {offer.price.toLocaleString()} zł
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kalkulacja na podstawie powierzchni */}
                  {request && (request.wall_insulation_m2 || request.attic_insulation_m2) && (
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

          {/* Wskazówki do edycji */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wskazówki do edycji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>• Unikaj drastycznych zmian ceny w górę</div>
                <div>• Uzasadnij zmiany w opisie zakresu prac</div>
                <div>• Dodaj więcej szczegółów jeśli to konieczne</div>
                <div>• Pamiętaj że zleceniodawca zobaczy zmiany</div>
                <div>• Zaktualizuj warunki płatności jeśli potrzeba</div>
                <div>• Sprawdź czy wszystkie prace są uwzględnione</div>
              </div>
            </CardContent>
          </Card>

          {/* Historia oferty */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historia oferty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Oryginalna cena:</span>
                  <span>{offer.price.toLocaleString()} zł</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Złożona:</span>
                  <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                </div>
                {offer.updated_at !== offer.created_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ostatnia edycja:</span>
                    <span>{new Date(offer.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="text-xs text-muted-foreground">
                    Status: {offer.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};