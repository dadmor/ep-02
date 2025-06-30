// ========================================
// src/pages/auditor/offer-create.tsx
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
  Clock,
  FileText,
  Building,
  MapPin,
  Calendar,
  Square,
  Thermometer,
  AlertCircle,
  CheckCircle,
  Calculator
} from "lucide-react";
import { useState } from "react";
import { Identity } from "../../operatorTypes";

// Define the form data type
interface OfferFormData {
  price: number;
  duration_days: number;
  description: string;
}

export const OfferCreate = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  const { mutate: createOffer } = useCreate();

  // Pobranie szczegółów zlecenia
  const { data: requestData, isLoading: requestLoading } = useOne({
    resource: "audit_requests",
    id: requestId!,
    queryOptions: {
      enabled: !!requestId,
    },
  });

  // Sprawdź czy już złożono ofertę
  const { data: existingOffer } = useList({
    resource: "auditor_offers",
    filters: userId && requestId ? [
      {
        field: "auditor_id",
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

  // Sprawdź portfolio
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OfferFormData>({
    defaultValues: {
      price: 0,
      duration_days: 14,
      description: "",
    },
  });

  const request = requestData?.data;
  const hasExistingOffer = existingOffer?.data && existingOffer.data.length > 0;
  const hasPortfolio = portfolio?.data && portfolio.data.length > 0;
  const watchPrice = watch("price");
  const watchDuration = watch("duration_days");

  // Redirect if offer already exists
  if (hasExistingOffer) {
    navigate(`/auditor/offer/${existingOffer.data[0].id}`);
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
    if (!request.living_area) return null;
    
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

  const handleFormSubmit: SubmitHandler<OfferFormData> = (data) => {
    if (!userId || !requestId) {
      console.error("Missing required data");
      return;
    }

    // Tylko pola, które istnieją w bazie danych
    const formData = {
      auditor_id: userId,
      request_id: requestId,
      price: data.price,
      duration_days: data.duration_days,
      description: data.description,
      status: "pending",
    };

    console.log("Sending form data:", formData); // Debug log

    createOffer({
      resource: "auditor_offers",
      values: formData,
    }, {
      onSuccess: (response) => {
        navigate(`/auditor/offer/${response.data.id}`);
      },
      onError: (error) => {
        console.error("Error creating offer:", error);
      }
    });
  };

  const fillSuggestedContent = () => {
    const buildingType = buildingTypeLabels[request.building_type] || "budynek";
    const area = request.living_area ? `${request.living_area}m²` : "";
    
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
      `• Oprogramowanie: ${request.building_type === 'budynek_komercyjny' ? 'CIBSE, EnergyPRO' : 'ArCADia, CERTO'}\n\n` +
      
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
      `• Cena obejmuje dojazd w promieniu 50km od ${request.city}\n` +
      `• Gwarancja na wykonane usługi: 12 miesięcy\n` +
      `• Możliwość płatności bezgotówkowej\n` +
      `• Ubezpieczenie OC: 500 000 zł`;
    
    setValue("description", comprehensiveDescription);
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/auditor/request/${requestId}`)}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do zlecenia
        </Button>
        <Lead
          title="Utwórz Ofertę"
          description="Przygotuj profesjonalną ofertę na zlecenie audytowe"
        />
      </div>

      {/* Alert jeśli brak portfolio */}
      {!hasPortfolio && (
        <Card className="border-orange-200 bg-orange-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-medium text-orange-900">
                  Ostrzeżenie: Brak portfolio
                </div>
                <div className="text-sm text-orange-800">
                  Zleceniodawcy często sprawdzają portfolio przed wyborem audytora.
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-orange-700 ml-1"
                    onClick={() => navigate('/auditor/portfolio')}
                  >
                    Dodaj przykłady prac →
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
                          <div>Sugerowane ceny dla {request.living_area}m²:</div>
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
                    onClick={() => navigate(`/auditor/request/${requestId}`)}
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

                {request.audit_purpose && (
                  <div className="border-t pt-3">
                    <div className="text-sm font-medium mb-1">Cel audytu:</div>
                    <div className="text-xs text-gray-600">{request.audit_purpose}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Podgląd oferty */}
          {(watchPrice > 0 || watchDuration > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podgląd oferty</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cena</span>
                    <span className="font-medium">
                      {watchPrice > 0 ? `${watchPrice.toLocaleString()} zł` : "—"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Czas realizacji</span>
                    <span className="font-medium">
                      {watchDuration > 0 ? `${watchDuration} dni` : "—"}
                    </span>
                  </div>

                  {watchPrice > 0 && request.living_area && (
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};