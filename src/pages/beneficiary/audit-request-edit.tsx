// src/pages/beneficiary/audit-request-edit.tsx
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useUpdate, useOne } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Home, MapPin, Phone, ClipboardCheck, Building, Calendar, Square, Loader2 } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Identity } from "../../operatorTypes";
import { useEffect } from "react";

export const AuditRequestEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { list } = useNavigation();
  const navigate = useNavigate(); 
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Fetch existing audit request
  const { data: auditRequestData, isLoading: isLoadingData, error } = useOne({
    resource: "audit_requests",
    id: id || "",
    queryOptions: {
      enabled: !!id,
    },
  });

  const auditRequest = auditRequestData?.data;

  // Use the update mutation
  const { mutate: updateAuditRequest, isLoading: isSubmitting } = useUpdate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: auditRequest,
  });

  // Reset form when data loads
  useEffect(() => {
    if (auditRequest) {
      reset(auditRequest);
    }
  }, [auditRequest, reset]);

  const handleFormSubmit = (data: any) => {
    if (!userId || !id) {
      console.error("User not authenticated or missing ID");
      return;
    }

    // Check if request can be edited (only pending requests)
    if (auditRequest?.status !== 'pending') {
      alert("Można edytować tylko zlecenia o statusie 'oczekujące'");
      return;
    }
    
    const formData = {
      ...data,
      beneficiary_id: userId,
      // Keep the existing status
      status: auditRequest.status,
    };

    updateAuditRequest(
      {
        resource: "audit_requests",
        id: id,
        values: formData,
      },
      {
        onSuccess: () => {
          list("audit_requests");
        },
        onError: (error) => {
          console.error("Error updating audit request:", error);
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
  if (error || !auditRequest) {
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
  if (auditRequest.status !== 'pending') {
    return (
      <div className="p-6 mx-auto">
        <Alert>
          <AlertDescription>
            To zlecenie nie może być edytowane. Można edytować tylko zlecenia o statusie "oczekujące".
            Aktualny status: {auditRequest.status}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => list("audit_requests")}
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
  onClick={() => navigate("/beneficiary")}
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  Powrót
</Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edytuj Zlecenie Audytora
        </h1>
        <p className="text-muted-foreground">Edytuj zlecenie dla audytora energetycznego</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Dane zlecenia audytora
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
                  <Label htmlFor="city">Miejscowość *</Label>
                  <Input
                    id="city"
                    placeholder="Warszawa"
                    {...register("city", {
                      required: "Miejscowość jest wymagana",
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

            {/* Dodatkowe informacje dla audytora */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">
                Informacje o budynku (opcjonalne)
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="building_type">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Typ budynku
                    </div>
                  </Label>
                  <Select 
                    defaultValue={auditRequest.building_type}
                    onValueChange={(value) => setValue("building_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz typ budynku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dom_jednorodzinny">Dom jednorodzinny</SelectItem>
                      <SelectItem value="dom_wielorodzinny">Dom wielorodzinny</SelectItem>
                      <SelectItem value="mieszkanie_blok">Mieszkanie w bloku</SelectItem>
                      <SelectItem value="mieszkanie_kamienica">Mieszkanie w kamienicy</SelectItem>
                      <SelectItem value="szeregowiec">Szeregowiec</SelectItem>
                      <SelectItem value="blizniak">Bliźniak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building_year">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Rok budowy
                    </div>
                  </Label>
                  <Input
                    id="building_year"
                    type="number"
                    min="1800"
                    max="2025"
                    placeholder="np. 1995"
                    {...register("building_year", {
                      valueAsNumber: true,
                      min: {
                        value: 1800,
                        message: "Rok budowy nie może być wcześniejszy niż 1800"
                      },
                      max: {
                        value: 2025,
                        message: "Rok budowy nie może być późniejszy niż 2025"
                      }
                    })}
                  />
                  {errors.building_year && (
                    <p className="text-sm text-red-500">
                      {errors.building_year.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="living_area">
                    <div className="flex items-center gap-2">
                      <Square className="w-4 h-4" />
                      Powierzchnia mieszkalna (m²)
                    </div>
                  </Label>
                  <Input
                    id="living_area"
                    type="number"
                    min="0"
                    max="2000"
                    placeholder="np. 120"
                    {...register("living_area", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Powierzchnia nie może być ujemna"
                      },
                      max: {
                        value: 2000,
                        message: "Powierzchnia nie może przekraczać 2000 m²"
                      }
                    })}
                  />
                  {errors.living_area && (
                    <p className="text-sm text-red-500">
                      {errors.living_area.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heated_area">Powierzchnia ogrzewana (m²)</Label>
                  <Input
                    id="heated_area"
                    type="number"
                    min="0"
                    max="2000"
                    placeholder="np. 100"
                    {...register("heated_area", {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "Powierzchnia nie może być ujemna"
                      }
                    })}
                  />
                  {errors.heated_area && (
                    <p className="text-sm text-red-500">
                      {errors.heated_area.message as string}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="heating_system">Obecny system ogrzewania</Label>
                  <Select 
                    defaultValue={auditRequest.heating_system}
                    onValueChange={(value) => setValue("heating_system", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz system ogrzewania" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piec_wegiel">Piec na węgiel</SelectItem>
                      <SelectItem value="piec_drewno">Piec na drewno</SelectItem>
                      <SelectItem value="piec_gaz">Piec gazowy</SelectItem>
                      <SelectItem value="kotlownia_gazowa">Kotłownia gazowa</SelectItem>
                      <SelectItem value="centralne">Centralne ogrzewanie</SelectItem>
                      <SelectItem value="elektryczne">Ogrzewanie elektryczne</SelectItem>
                      <SelectItem value="pompa_ciepla">Pompa ciepła</SelectItem>
                      <SelectItem value="inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insulation_status">Stan izolacji budynku</Label>
                  <Select 
                    defaultValue={auditRequest.insulation_status}
                    onValueChange={(value) => setValue("insulation_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Oceń stan izolacji" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brak">Brak izolacji</SelectItem>
                      <SelectItem value="czesciowa">Częściowa izolacja</SelectItem>
                      <SelectItem value="dobra">Dobra izolacja</SelectItem>
                      <SelectItem value="bardzo_dobra">Bardzo dobra izolacja</SelectItem>
                      <SelectItem value="nie_wiem">Nie wiem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Uwagi */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Dodatkowe informacje</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="audit_purpose">Cel audytu</Label>
                  <Select 
                    defaultValue={auditRequest.audit_purpose}
                    onValueChange={(value) => setValue("audit_purpose", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz cel audytu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dotacja_termomodernizacja">Dotacja na termomodernizację</SelectItem>
                      <SelectItem value="ocena_energetyczna">Ocena energetyczna budynku</SelectItem>
                      <SelectItem value="planowanie_remontu">Planowanie remontu</SelectItem>
                      <SelectItem value="inne">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferred_date">Preferowany termin audytu</Label>
                  <Input
                    id="preferred_date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register("preferred_date")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Uwagi dla audytora</Label>
                  <Textarea
                    id="notes"
                    placeholder="Dodatkowe informacje, które mogą być przydatne dla audytora..."
                    rows={4}
                    {...register("notes")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_preferences">Preferowany sposób kontaktu</Label>
                  <Select 
                    defaultValue={auditRequest.contact_preferences}
                    onValueChange={(value) => setValue("contact_preferences", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz sposób kontaktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telefon">Telefon</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="dowolny">Dowolny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Informacje o statusie */}
            <div className="border-t pt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <ClipboardCheck className="w-4 h-4" />
                  <span className="font-medium">Status zlecenia: {auditRequest.status}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Ostatnia modyfikacja: {new Date(auditRequest.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => list("audit_requests")}
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