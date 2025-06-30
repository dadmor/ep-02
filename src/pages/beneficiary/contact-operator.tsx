// src/pages/beneficiary/contact-operator.tsx
import { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useCreate } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator, Phone, MapPin, Users, Euro, AlertCircle } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Identity } from "../../operatorTypes";
import { useNavigate } from "react-router";

export const ContactOperator = () => {
  const { list } = useNavigation();
  const { mutate: createContact } = useCreate();
  const navigate = useNavigate();

  const { data: identity, isLoading: identityLoading } = useGetIdentity<Identity>();
  const userId = identity?.id;

  // Calculator state
  const [householdMembers, setHouseholdMembers] = useState<number>(1);
  const [householdIncome, setHouseholdIncome] = useState<number>(0);
  const [allOwnersAlive, setAllOwnersAlive] = useState<string>("tak");
  const [calculatorResult, setCalculatorResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  // Kalkulator dotacji (uproszczona logika)
  const calculateSubsidy = () => {
    // Progi dochodowe na 2024 (przykładowe wartości)
    const incomeThresholds = {
      1: 2500,  // 1 osoba
      2: 3500,  // 2 osoby
      3: 4500,  // 3 osoby
      4: 5500,  // 4 osoby
      5: 6500,  // 5 osób
    };

    const threshold = incomeThresholds[Math.min(householdMembers, 5) as keyof typeof incomeThresholds] || 7000;
    const incomePercentage = (householdIncome / threshold) * 100;
    
    let subsidyLevel = "brak";
    let subsidyPercentage = 0;
    let maxAmount = 0;

    if (incomePercentage <= 100) {
      subsidyLevel = "podstawowy";
      subsidyPercentage = 30;
      maxAmount = 69000;
    }
    if (incomePercentage <= 80) {
      subsidyLevel = "podwyższony";
      subsidyPercentage = 50;
      maxAmount = 135000;
    }
    if (incomePercentage <= 60) {
      subsidyLevel = "maksymalny";
      subsidyPercentage = 70;
      maxAmount = 188000;
    }

    // Dodatkowe warunki
    if (allOwnersAlive === "nie") {
      subsidyPercentage += 10;
      maxAmount += 20000;
    }

    setCalculatorResult({
      subsidyLevel,
      subsidyPercentage,
      maxAmount,
      incomePercentage: Math.round(incomePercentage),
      threshold,
      householdMembers,
      householdIncome,
      allOwnersAlive,
      calculatedAt: new Date().toISOString()
    });
  };

  const handleContactSubmit = (data: any) => {
    console.log("Submitting form with data:", data);
    console.log("User ID:", userId);
    console.log("Calculator result:", calculatorResult);
    
    if (!userId) {
      console.error("User not authenticated");
      alert("Błąd: Użytkownik nie jest zalogowany");
      return;
    }
    
    // Ensure all required fields are present and properly formatted
    const formData = {
      beneficiary_id: userId,
      postal_code: data.postal_code?.trim(),
      city: data.city?.trim(),
      phone_number: data.phone_number?.trim(),
      message: data.message?.trim() || null,
      contact_type: "calculator",
      status: "pending",
      // Convert calculator_result to JSON string if it exists
      calculator_result: calculatorResult ? JSON.stringify(calculatorResult) : null,
    };
    
    // Validate required fields
    if (!formData.postal_code || !formData.city || !formData.phone_number) {
      alert("Wszystkie wymagane pola muszą być wypełnione");
      return;
    }
    
    console.log("Final form data:", formData);
    
    createContact(
      {
        resource: "operator_contacts",
        values: formData,
      },
      {
        onSuccess: (data) => {
          console.log("Contact created successfully:", data);
          alert("Zgłoszenie zostało wysłane pomyślnie!");
          list("beneficiary/dashboard");
        },
        onError: (error) => {
          console.error("Error creating contact:", error);
          console.error("Error details:", {
            message: error.message,
            response: error.response,
            data: error.response?.data
          });
          
          // More specific error messages
          if (error.response?.status === 400) {
            alert("Błąd: Nieprawidłowe dane formularza. Sprawdź wszystkie pola.");
          } else if (error.response?.status === 401) {
            alert("Błąd: Nie jesteś zalogowany. Odśwież stronę i spróbuj ponownie.");
          } else if (error.response?.status === 403) {
            alert("Błąd: Brak uprawnień do wykonania tej operacji.");
          } else {
            alert(`Błąd podczas wysyłania zgłoszenia: ${error.message || 'Nieznany błąd'}`);
          }
        },
      }
    );
  };

  // Show loading state while identity is loading
  if (identityLoading) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error if no user (but not during loading)
  if (!identityLoading && !userId) {
    return (
      <div className="p-6 mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Błąd: Nie można załadować danych użytkownika. Spróbuj odświeżyć stronę.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
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
          Kontakt z Operatorem
        </h1>
        <p className="text-muted-foreground">
          Sprawdź wysokość dotacji i umów się na kontakt z operatorem programu
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kalkulator dotacji */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Kalkulator dotacji
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="household_members">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Liczba członków gospodarstwa domowego
                </div>
              </Label>
              <Input
                id="household_members"
                type="number"
                min="1"
                max="10"
                value={householdMembers}
                onChange={(e) => setHouseholdMembers(parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="household_income">
                <div className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Łączny dochód gospodarstwa domowego (zł/miesiąc)
                </div>
              </Label>
              <Input
                id="household_income"
                type="number"
                min="0"
                value={householdIncome}
                onChange={(e) => setHouseholdIncome(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-3">
              <Label>Czy wszyscy współwłaściciele żyją?</Label>
              <RadioGroup
                value={allOwnersAlive}
                onValueChange={setAllOwnersAlive}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tak" id="alive_yes" />
                  <Label htmlFor="alive_yes">Tak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nie" id="alive_no" />
                  <Label htmlFor="alive_no">Nie</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={calculateSubsidy} 
              className="w-full"
              disabled={!householdIncome}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Oblicz wysokość dotacji
            </Button>

            {calculatorResult && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      Poziom dotacji: <span className="text-green-600">{calculatorResult.subsidyLevel}</span>
                    </div>
                    <div>
                      Wysokość dofinansowania: <strong>{calculatorResult.subsidyPercentage}%</strong>
                    </div>
                    <div>
                      Maksymalna kwota: <strong>{calculatorResult.maxAmount.toLocaleString()} zł</strong>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Twój dochód to {calculatorResult.incomePercentage}% progu dochodowego
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Formularz kontaktu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Zgłoszenie kontaktu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(handleContactSubmit)} className="space-y-4">
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
                    minLength: {
                      value: 2,
                      message: "Miejscowość musi mieć co najmniej 2 znaki"
                    }
                  })}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">
                    {errors.city.message as string}
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
                    required: "Numer telefonu jest wymagany",
                    pattern: {
                      value: /^[+]?[\d\s()-]{9,15}$/,
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

              <div className="space-y-2">
                <Label htmlFor="message">Wiadomość (opcjonalna)</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[80px] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-input bg-background rounded-md"
                  placeholder="Dodatkowe informacje lub pytania..."
                  {...register("message")}
                />
              </div>

              {calculatorResult && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-sm">
                    <div className="font-medium text-green-800">Obliczona dotacja:</div>
                    <div className="text-green-700">
                      {calculatorResult.subsidyPercentage}% do {calculatorResult.maxAmount.toLocaleString()} zł
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("Cancel button clicked");
                    try {
                      list("beneficiary/dashboard");
                    } catch (error) {
                      console.error("Navigation error:", error);
                      window.history.back();
                    }
                  }}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Wysyłanie..." : "Wyślij zgłoszenie"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};