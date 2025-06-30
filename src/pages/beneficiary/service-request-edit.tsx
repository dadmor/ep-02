// src/pages/beneficiary/service-request-edit.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useUpdate, useOne } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Home, MapPin, Phone, Wrench, Thermometer, Square, FileText, Upload, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Identity } from "../../operatorTypes";
import { useEffect } from "react";

export const ServiceRequestEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { list } = useNavigation();
  const navigate = useNavigate(); 
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Fetch existing service request
  const { data: serviceRequestData, isLoading: isLoadingData, error } = useOne({
    resource: "service_requests",
    id: id || "",
    queryOptions: {
      enabled: !!id,
    },
  });

  const serviceRequest = serviceRequestData?.data;

  // Use the update mutation
  const { mutate: updateServiceRequest, isLoading: isSubmitting } = useUpdate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: serviceRequest,
  });

  // Reset form when data loads
  useEffect(() => {
    if (serviceRequest) {
      reset(serviceRequest);
    }
  }, [serviceRequest, reset]);

  const handleFormSubmit = (data: any) => {
    if (!userId || !id) {
      console.error("User not authenticated or missing ID");
      return;
    }

    // Check if request can be edited (only pending requests)
    if (serviceRequest?.status !== 'pending') {
      alert("Można edytować tylko zlecenia o statusie 'oczekujące'");
      return;
    }
    
    const formData = {
      ...data,
      beneficiary_id: userId,
      // Keep the existing status
      status: serviceRequest.status,
    };

    updateServiceRequest(
      {
        resource: "service_requests",
        id: id,
        values: formData,
      },
      {
        onSuccess: () => {
          list("service_requests");
        },
        onError: (error) => {
          console.error("Error updating service request:", error);
          alert("Błąd podczas aktualizacji zlecenia");
        }
      }
    );
  };

  // Show loading state
  if (isLoadingData || !userId) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" />
          Ładowanie danych zlecenia...
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !serviceRequest) {
    return (
      <div className="p-6 mx-auto">
        <Alert>
          <AlertDescription>
            Błąd podczas ładowania zlecenia. Sprawdź czy zlecenie istnieje i masz do niego dostęp.
          </AlertDescription>
        </Alert>
        <Button
  variant="outline"
  size="sm"
  onClick={() => navigate("/beneficiary")}
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Powrót
</Button>
      </div>
    );
  }

  // Check if request can be edited
  if (serviceRequest.status !== 'pending') {
    return (
      <div className="p-6 mx-auto">
        <Alert>
          <AlertDescription>
            To zlecenie nie może być edytowane. Można edytować tylko zlecenia o statusie "oczekujące".
            Aktualny status: {serviceRequest.status}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => list("service_requests")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do listy
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => list("service_requests")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edytuj Zlecenie Wykonawcy
        </h1>
        <p className="text-muted-foreground">
          Edytuj zlecenie dla wykonawców termomodernizacji
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Dane zlecenia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Dane adresowe */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Adres nieruchomości</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Kod pocztowy *
                    </div>
                  </Label>
                  <Input
                    id="postal_code"
                    placeholder="00-000"
                    {...register("postal_code", {
                      required: "Kod pocztowy jest wymagany",
                      pattern: {
                        value: /^\d{2}-\d{3}$/,
                        message: "Kod pocztowy musi być w formacie XX-XXX"
                      }
                    })}
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-red-500">
                      {errors.postal_code.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Miasto *</Label>
                  <Input
                    id="city"
                    placeholder="Warszawa"
                    {...register("city", {
                      required: "Miasto jest wymagane",
                    })}
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">
                      {errors.city.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_address">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Ulica i numer domu *
                  </div>
                </Label>
                <Input
                  id="street_address"
                  placeholder="ul. Przykładowa 123"
                  {...register("street_address", {
                    required: "Adres jest wymagany",
                  })}
                />
                {errors.street_address && (
                  <p className="text-sm text-red-500">
                    {errors.street_address.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Numer telefonu *
                  </div>
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="+48 123 456 789"
                  {...register("phone_number", {
                    required: "Telefon jest wymagany",
                    pattern: {
                      value: /^(\+48\s?)?(\d{3}\s?\d{3}\s?\d{3}|\d{2}\s?\d{3}\s?\d{2}\s?\d{2})$/,
                      message: "Nieprawidłowy format numeru telefonu"
                    }
                  })}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">
                    {errors.phone_number.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Zakres prac */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Zakres prac</h3>
              
              {/* Źródło ciepła */}
              <div className="space-y-4">
                <h4 className="font-medium text-base">Źródło ciepła</h4>
                <div className="space-y-2">
                  <Label htmlFor="heat_source">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      Typ źródła ciepła
                    </div>
                  </Label>
                  <Select 
                    defaultValue={serviceRequest.heat_source}
                    onValueChange={(value) => setValue("heat_source", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz źródło ciepła" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pompa_ciepla">Pompa ciepła</SelectItem>
                      <SelectItem value="piec_pellet">Piec na pellet</SelectItem>
                      <SelectItem value="piec_zgazowujacy">Piec zgazowujący drewno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Termomodernizacja */}
              <div className="space-y-4 mt-6">
                <h4 className="font-medium text-base">Termomodernizacja</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="windows_count">
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Okna (ilość)
                      </div>
                    </Label>
                    <Input
                      id="windows_count"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("windows_count", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Liczba okien nie może być ujemna"
                        }
                      })}
                    />
                    {errors.windows_count && (
                      <p className="text-sm text-red-500">
                        {errors.windows_count.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doors_count">
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Drzwi (ilość)
                      </div>
                    </Label>
                    <Input
                      id="doors_count"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("doors_count", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Liczba drzwi nie może być ujemna"
                        }
                      })}
                    />
                    {errors.doors_count && (
                      <p className="text-sm text-red-500">
                        {errors.doors_count.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wall_insulation_m2">
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Docieplenie ścian (m²)
                      </div>
                    </Label>
                    <Input
                      id="wall_insulation_m2"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("wall_insulation_m2", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Powierzchnia nie może być ujemna"
                        }
                      })}
                    />
                    {errors.wall_insulation_m2 && (
                      <p className="text-sm text-red-500">
                        {errors.wall_insulation_m2.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attic_insulation_m2">
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" />
                        Docieplenie poddasza (m²)
                      </div>
                    </Label>
                    <Input
                      id="attic_insulation_m2"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("attic_insulation_m2", {
                        valueAsNumber: true,
                        min: {
                          value: 0,
                          message: "Powierzchnia nie może być ujemna"
                        }
                      })}
                    />
                    {errors.attic_insulation_m2 && (
                      <p className="text-sm text-red-500">
                        {errors.attic_insulation_m2.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Audyt efektywności */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Audyt efektywności energetycznej
                </div>
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="audit_file_url">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    URL pliku audytu (opcjonalne)
                  </div>
                </Label>
                <Input
                  id="audit_file_url"
                  placeholder="https://example.com/audit.pdf"
                  {...register("audit_file_url", {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "URL musi zaczynać się od http:// lub https://"
                    }
                  })}
                />
                {errors.audit_file_url && (
                  <p className="text-sm text-red-500">
                    {errors.audit_file_url.message as string}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Podaj link do pliku z audytem efektywności energetycznej
                </p>
              </div>
            </div>

            {/* Informacje o statusie */}
            <div className="border-t pt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Status zlecenia: {serviceRequest.status}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Ostatnia modyfikacja: {new Date(serviceRequest.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => list("service_requests")}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};