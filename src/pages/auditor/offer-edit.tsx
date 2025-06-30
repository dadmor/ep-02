// ========================================
// src/pages/auditor/offer-edit.tsx
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
  Clock,
  FileText,
  Building,
  MapPin,
  Calendar,
  Square,
  AlertCircle,
  Calculator
} from "lucide-react";
import { useEffect, useState } from "react";
import { Identity } from "../../operatorTypes";

// Define the form data type
interface OfferFormData {
  price: number;
  duration_days: number;
  description: string;
}

export const OfferEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  const { mutate: updateOffer } = useUpdate();

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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormData>();

  const offer = offerData?.data;
  const request = requestData?.data;
  const watchPrice = watch("price");
  const watchDuration = watch("duration_days");

  // Initialize form with existing data
  useEffect(() => {
    if (offer) {
      reset({
        price: offer.price,
        duration_days: offer.duration_days,
        description: offer.description || "",
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
  if (offer.auditor_id !== userId) {
    return (
      <div className="p-6 mx-auto text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-semibold mb-2">Brak dostępu</h2>
        <p className="text-muted-foreground mb-4">Nie masz uprawnień do edycji tej oferty.</p>
        <Button onClick={() => navigate('/auditor/my-offers')}>
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
          <Button onClick={() => navigate(`/auditor/offer/${offer.id}`)}>
            Zobacz ofertę
          </Button>
          <Button variant="outline" onClick={() => navigate('/auditor/my-offers')}>
            Moje oferty
          </Button>
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

  // Suggested prices based on building type and area
  const getSuggestedPrice = () => {
    if (!request?.living_area) return null;
    
    const baseRatePerM2: Record<string, number> = {
      "dom_jednorodzinny": 15,
      "dom_wielorodzinny": 12,
      "apartament": 18,
      "budynek_komercyjny": 20,
      "budynek_przemyslowy": 25,
      "budynek_uslugowy": 22,
      "budynek_zabytkowy": 30,
      "inny": 15,
    };

    const rate = baseRatePerM2[request.building_type] || 15;
    const suggested = request.living_area * rate;
    
    return {
      min: Math.round(suggested * 0.8),
      suggested: Math.round(suggested),
      max: Math.round(suggested * 1.3),
    };
  };

  const priceRange = getSuggestedPrice();

  const fillSuggestedContent = () => {
    const buildingType = buildingTypeLabels[request?.building_type] || "budynek";
    const area = request?.living_area ? `${request.living_area}m²` : "";
    
    const comprehensiveDescription = 
      `🏠 KOMPLEKSOWY AUDYT ENERGETYCZNY - ${buildingType.toUpperCase()} ${area}\n\n` +
      
      `📋 ZAKRES PRAC:\n` +
      `• Wizja lokalna i ocena stanu technicznego budynku\n` +
      `• Pomiary termowizyjne wykrywające mostki termiczne\n` +
      `• Analiza systemów grzewczych i wentylacyjnych\n` +
      `• Ocena izolacyjności przegród budowlanych\n` +
      `• Badanie szczelności budynku (test Blower Door)\n` +
      `• Analiza zużycia energii na podstawie rachunków\n` +
      `• Rekomendacje modernizacyjne z kalkulacją oszczędności\n\n` +
      
      `🔬 METODOLOGIA:\n` +
      `• Zgodność z PN-EN 16247-2 (audyty energetyczne budynków)\n` +
      `• Pomiary termowizyjne wg PN-EN 13187\n` +
      `• Metodologia pomiaru szczelności PN-EN 13829\n` +
      `• Oprogramowanie: ${request?.building_type === 'budynek_komercyjny' ? 'CIBSE, EnergyPRO' : 'ArCADia, CERTO'}\n\n` +
      
      `📄 DOKUMENTACJA:\n` +
      `• Świadectwo charakterystyki energetycznej budynku\n` +
      `• Szczegółowy raport z audytu (30-50 stron)\n` +
      `• Zdjęcia termowizyjne z opisem problemów\n` +
      `• Plan modernizacji z harmonogramem i kosztami\n` +
      `• Kalkulacja oszczędności energii i kosztów\n` +
      `• Wnioski o dofinansowanie (jeśli dotyczy)\n` +
      `• Konsultacja telefoniczna w okresie 6 miesięcy\n\n` +
      
      `💰 WARUNKI:\n` +
      `• Płatność: 50% zaliczki, 50% po dostarczeniu dokumentacji\n` +
      `• Termin realizacji: ${watchDuration} dni roboczych od podpisania umowy\n` +
      `• Cena obejmuje dojazd w promieniu 50km od ${request?.city}\n` +
      `• Gwarancja na wykonane usługi: 12 miesięcy\n` +
      `• Możliwość płatności bezgotówkowej\n` +
      `• Ubezpieczenie OC: 500 000 zł`;
    
    setValue("description", comprehensiveDescription);
  };

  const handleFormSubmit: SubmitHandler<OfferFormData> = (data) => {
    if (!userId || !id) {
      console.error("Missing required data");
      return;
    }

    const formData = {
      price: data.price,
      duration_days: data.duration_days,
      description: data.description,
    };

    updateOffer({
      resource: "auditor_offers",
      id: id,
      values: formData,
    }, {
      onSuccess: () => {
        navigate(`/auditor/offer/${id}`);
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
          onClick={() => navigate(`/auditor/offer/${id}`)}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do oferty
        </Button>
        <Lead
          title="Edytuj Ofertę"
          description="Aktualizuj szczegóły swojej oferty audytowej"
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
                Możesz aktualizować cenę, czas realizacji i opis. Zmiany będą widoczne dla zleceniodawcy.
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
                {/* Podstawowe parametry */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Podstawowe parametry</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
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
                        min="100"
                        step="50"
                        placeholder="3000"
                        {...register("price", {
                          required: "Cena jest wymagana",
                          min: {
                            value: 100,
                            message: "Minimalna cena to 100 zł"
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
                          <div>Sugerowane ceny dla {request?.living_area}m²:</div>
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

                    <div className="space-y-2">
                      <Label htmlFor="duration_days">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Czas realizacji (dni) *
                        </div>
                      </Label>
                      <Input
                        id="duration_days"
                        type="number"
                        min="1"
                        max="90"
                        placeholder="14"
                        {...register("duration_days", {
                          required: "Czas realizacji jest wymagany",
                          min: {
                            value: 1,
                            message: "Minimalny czas to 1 dzień"
                          },
                          max: {
                            value: 90,
                            message: "Maksymalny czas to 90 dni"
                          }
                        })}
                      />
                      {errors.duration_days && (
                        <p className="text-sm text-red-500">
                          {errors.duration_days.message as string}
                        </p>
                      )}
                      
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => setValue("duration_days", 7)}
                        >
                          7 dni
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => setValue("duration_days", 14)}
                        >
                          14 dni
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 hover:underline"
                          onClick={() => setValue("duration_days", 21)}
                        >
                          21 dni
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opis oferty */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Szczegółowy opis oferty</h3>
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
                    <Label htmlFor="description">
                      Pełny opis oferty z zakresem prac, metodologią i warunkami *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Kompleksowy audyt energetyczny obejmuje..."
                      rows={15}
                      {...register("description", {
                        required: "Opis oferty jest wymagany",
                        minLength: {
                          value: 100,
                          message: "Opis musi mieć co najmniej 100 znaków"
                        }
                      })}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">
                        {errors.description.message as string}
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
                    onClick={() => navigate(`/auditor/offer/${id}`)}
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

                  {request.building_type && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {buildingTypeLabels[request.building_type] || request.building_type}
                      </span>
                    </div>
                  )}

                  {request.living_area && (
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{request.living_area} m²</span>
                    </div>
                  )}

                  {request.building_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{request.building_year}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Podgląd zmian */}
          {(watchPrice > 0 || watchDuration > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podgląd zmian</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nowa cena</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {watchPrice > 0 ? `${watchPrice.toLocaleString()} zł` : "—"}
                      </div>
                      {offer.price !== watchPrice && watchPrice > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Było: {offer.price.toLocaleString()} zł
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nowy termin</span>
                    <div className="text-right">
                      <div className="font-medium">
                        {watchDuration > 0 ? `${watchDuration} dni` : "—"}
                      </div>
                      {offer.duration_days !== watchDuration && watchDuration > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Było: {offer.duration_days} dni
                        </div>
                      )}
                    </div>
                  </div>

                  {watchPrice > 0 && request?.living_area && (
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-xs text-muted-foreground">Cena za m²</span>
                      <span className="text-xs">
                        {Math.round(watchPrice / request.living_area)} zł/m²
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wskazówki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wskazówki do edycji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>• Unikaj drastycznych zmian ceny w górę</div>
                <div>• Uzasadnij zmiany w opisie oferty</div>
                <div>• Skróć termin realizacji aby być konkurencyjnym</div>
                <div>• Dodaj więcej szczegółów jeśli to konieczne</div>
                <div>• Pamiętaj że zleceniodawca zobaczy zmiany</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};