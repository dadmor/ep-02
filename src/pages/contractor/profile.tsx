import { useForm } from "@refinedev/react-hook-form";
import { useList, useCreate, useUpdate } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button, Input, Label } from "@/components/ui";
import { Lead } from "@/components/reader";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  User,
  Phone,
  Mail,
  Globe,
  Award,
  FileText,
  Save,
  MapPin,
  Calendar,
  Briefcase,
  Hammer
} from "lucide-react";
import { useState, useEffect } from "react";
import { Identity } from "../../operatorTypes";

export const ContractorProfile = () => {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  

  const { mutate: createProfile } = useCreate();
  const { mutate: updateProfile } = useUpdate();

  // Pobranie istniejącego profilu
  const { data: profile, refetch } = useList({
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

  const existingProfile = profile?.data?.[0];

  // Initialize specializations when profile data is loaded
  useEffect(() => {
    if (existingProfile?.specializations) {
      setSelectedSpecializations(existingProfile.specializations);
    }
  }, [existingProfile]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: existingProfile ? {
      company_name: existingProfile.company_name,
      nip: existingProfile.nip,
      company_address: existingProfile.company_address,
      phone_number: existingProfile.phone_number,
      email: existingProfile.email,
      website_url: existingProfile.website_url,
      licenses: existingProfile.licenses,
      certifications: existingProfile.certifications,
      experience_years: existingProfile.experience_years,
      description: existingProfile.description,
      specializations: existingProfile.specializations || [], // Add this line
    } : {
      specializations: [], // Add this line for new profiles
    },
  });

  const specializationOptions = [
    { value: "izolacje", label: "Izolacje termiczne" },
    { value: "okna_drzwi", label: "Okna i drzwi" },
    { value: "ogrzewanie", label: "Systemy ogrzewania" },
    { value: "wentylacja", label: "Wentylacja i klimatyzacja" },
    { value: "fotowoltaika", label: "Fotowoltaika" },
    { value: "pompy_ciepla", label: "Pompy ciepła" },
    { value: "rekuperacja", label: "Rekuperacja" },
    { value: "smart_home", label: "Inteligentne budynki" },
    { value: "dachy_elewacje", label: "Dachy i elewacje" },
    { value: "instalacje_elektryczne", label: "Instalacje elektryczne" },
    { value: "instalacje_wodno_kan", label: "Instalacje wodno-kanalizacyjne" },
    { value: "biomasa", label: "Kotły na biomasę" },
  ];

  const handleSpecializationToggle = (spec: string) => {
    const newSpecs = selectedSpecializations.includes(spec)
      ? selectedSpecializations.filter(s => s !== spec)
      : [...selectedSpecializations, spec];
    setSelectedSpecializations(newSpecs);
    setValue("specializations", newSpecs);
  };

  const handleFormSubmit = (data: any) => {
    if (!userId) {
      console.error("User not authenticated");
      return;
    }

    const formData = {
      ...data,
      contractor_id: userId,
      specializations: selectedSpecializations,
    };

    if (existingProfile) {
      updateProfile({
        resource: "contractor_profiles",
        id: existingProfile.id,
        values: formData,
      }, {
        onSuccess: () => {
          refetch();
        }
      });
    } else {
      createProfile({
        resource: "contractor_profiles",
        values: formData,
      }, {
        onSuccess: () => {
          refetch();
        }
      });
    }
  };

  // Show loading state if user identity is not loaded yet
  if (!userId) {
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
        title="Profil Wykonawcy"
        description="Zarządzaj swoimi danymi firmowymi i specjalizacjami zawodowymi"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formularz profilu */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                {existingProfile ? 'Edytuj profil' : 'Utwórz profil wykonawcy'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Dane firmowe */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Dane firmowe
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nazwa firmy / Imię i nazwisko *
                        </div>
                      </Label>
                      <Input
                        id="company_name"
                        placeholder="EkoMont Sp. z o.o. lub Jan Kowalski"
                        {...register("company_name", {
                          required: "To pole jest wymagane",
                        })}
                      />
                      {errors.company_name && (
                        <p className="text-sm text-red-500">
                          {errors.company_name.message as string}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nip">NIP *</Label>
                      <Input
                        id="nip"
                        placeholder="1234567890"
                        {...register("nip", {
                          required: "NIP jest wymagany dla wykonawców",
                        })}
                      />
                      {errors.nip && (
                        <p className="text-sm text-red-500">
                          {errors.nip.message as string}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_address">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Adres firmy *
                      </div>
                    </Label>
                    <Input
                      id="company_address"
                      placeholder="ul. Rzemieślnicza 123, 00-001 Warszawa"
                      {...register("company_address", {
                        required: "Adres firmy jest wymagany",
                      })}
                    />
                    {errors.company_address && (
                      <p className="text-sm text-red-500">
                        {errors.company_address.message as string}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefon
                        </div>
                      </Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        placeholder="+48 123 456 789"
                        {...register("phone_number")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="kontakt@firma.pl"
                        {...register("email")}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website_url">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Strona internetowa (opcjonalne)
                      </div>
                    </Label>
                    <Input
                      id="website_url"
                      placeholder="https://www.mojastrona.pl"
                      {...register("website_url")}
                    />
                  </div>
                </div>

                {/* Kwalifikacje zawodowe */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5" />
                    Kwalifikacje zawodowe
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenses">Licencje i uprawnienia</Label>
                      <Textarea
                        id="licenses"
                        placeholder="Uprawnienia budowlane bez ograniczeń, licencja instalatora OZE..."
                        rows={3}
                        {...register("licenses")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certyfikaty</Label>
                      <Textarea
                        id="certifications"
                        placeholder="Certyfikat instalatora pomp ciepła, certyfikat fotowoltaiki..."
                        rows={3}
                        {...register("certifications")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_years">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Lata doświadczenia
                        </div>
                      </Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="10"
                        {...register("experience_years", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Specjalizacje
                        </div>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {specializationOptions.map((spec) => (
                          <Badge
                            key={spec.value}
                            variant={selectedSpecializations.includes(spec.value) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-blue-100"
                            onClick={() => handleSpecializationToggle(spec.value)}
                          >
                            {spec.label}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kliknij na specjalizacje, aby je wybrać
                      </p>
                      {/* Hidden input to register specializations field */}
                      <input
                        type="hidden"
                        {...register("specializations")}
                        value={JSON.stringify(selectedSpecializations)}
                      />
                    </div>
                  </div>
                </div>

                {/* Opis */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5" />
                    Opis zawodowy
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">O mnie / firmie</Label>
                    <Textarea
                      id="description"
                      placeholder="Doświadczony wykonawca instalacji OZE z 10-letnim stażem. Specjalizujemy się w..."
                      rows={6}
                      {...register("description")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Opisz swoje doświadczenie, realizowane projekty i to, co wyróżnia Cię na rynku
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Zapisywanie..." : "Zapisz profil"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Podgląd profilu */}
        <div className="lg:col-span-1">
          {existingProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Podgląd profilu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="font-medium text-lg">{existingProfile.company_name}</div>
                    {existingProfile.nip && (
                      <div className="text-sm text-muted-foreground">
                        NIP: {existingProfile.nip}
                      </div>
                    )}
                    {existingProfile.company_address && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {existingProfile.company_address}
                      </div>
                    )}
                  </div>

                  {existingProfile.experience_years && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{existingProfile.experience_years} lat doświadczenia</span>
                    </div>
                  )}

                  {existingProfile.specializations && existingProfile.specializations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Specjalizacje:</div>
                      <div className="flex flex-wrap gap-1">
                        {existingProfile.specializations.map((spec: string) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {specializationOptions.find(s => s.value === spec)?.label || spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      Utworzone: {new Date(existingProfile.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Aktualizacja: {new Date(existingProfile.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {existingProfile.is_active && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-green-800 font-medium text-sm">
                        ✓ Profil aktywny
                      </div>
                      <div className="text-green-700 text-xs">
                        Możesz składać oferty na zlecenia
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wskazówki */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Wskazówki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>• Uzupełnij wszystkie wymagane dane</div>
                <div>• Dokładnie opisz swoje kwalifikacje</div>
                <div>• Wybierz odpowiednie specjalizacje</div>
                <div>• Napisz atrakcyjny opis zawodowy</div>
                <div>• Uzupełnij portfolio realizacjami</div>
                <div>• Dodaj zdjęcia przed/po</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};