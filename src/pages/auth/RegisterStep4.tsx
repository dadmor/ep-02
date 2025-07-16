// pages/RegisterStep4.tsx - Ulepszona wersja z obsługą różnych scenariuszy
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Mail, 
  ArrowRight, 
  RefreshCw,
  Shield,
  User,
  Clock,
  AlertCircle
} from "lucide-react";
import { NarrowCol } from "@/components/layout/NarrowCol";
import { Lead } from "@/components/reader";
import { useFormSchemaStore } from "@/utility/formSchemaStore";
import { FooterBranding } from "./FooterBranding";

export const RegisterStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData, unregister } = useFormSchemaStore();
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);

  const processData = getData("registration");
  const email = processData?.email || "user@example.com";
  const role = processData?.role || "student";
  const isNewRegistration = processData?.successData?.isNewRegistration ?? true;

  // ✅ Wyczyść dane po 60 sekundach
  React.useEffect(() => {
    const timer = setTimeout(() => {
      unregister("registration", "data");
    }, 60000); // 60 sekund

    return () => clearTimeout(timer);
  }, [unregister]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      // Tutaj wywołanie API do ponownego wysłania maila
      await new Promise(resolve => setTimeout(resolve, 2000)); // Symulacja
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error("Błąd wysyłania maila:", error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToLogin = () => {
    // ✅ Wyczyść dane przy przejściu do logowania
    unregister("registration", "data");
    navigate("/login");
  };

  const getRoleIcon = (role: string) => {
    return role === "teacher" ? Shield : User;
  };

  const getRoleLabel = (role: string) => {
    return role === "teacher" ? "Nauczyciel" : "Uczeń";
  };

  return (
    <NarrowCol>
      <div className="flex items-start gap-5">
        <CheckCircle className="mt-2 bg-white rounded-full p-2 w-12 h-12 text-green-600" />
        <Lead 
          title={isNewRegistration ? "Rejestracja zakończona!" : "Email wysłany ponownie!"} 
          description="Sprawdź swoją skrzynkę mailową" 
        />
      </div>

      {/* Alert sukcesu */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
            {isNewRegistration ? "Konto zostało utworzone!" : "Konto już istnieje"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-green-700">
            {isNewRegistration ? (
              <>
                <p className="font-medium">Gratulacje! Twoje konto zostało pomyślnie utworzone.</p>
                <p className="text-sm mt-1">
                  Wysłaliśmy email z linkiem aktywacyjnym na adres <strong>{email}</strong>
                </p>
              </>
            ) : (
              <>
                <p className="font-medium">Twoje konto już istnieje w systemie.</p>
                <p className="text-sm mt-1">
                  Wysłaliśmy ponownie email z linkiem aktywacyjnym na adres <strong>{email}</strong>
                </p>
                <p className="text-sm mt-2 text-green-600">
                  Jeśli już aktywowałeś konto, możesz przejść bezpośrednio do logowania.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Podsumowanie konta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Dane konta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Adres email</p>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {React.createElement(getRoleIcon(role), {
              className: "h-5 w-5 text-gray-400",
            })}
            <div>
              <p className="text-sm font-medium">Rola w systemie</p>
              <p className="text-sm text-gray-600">{getRoleLabel(role)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instrukcje */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Mail className="mr-2 h-5 w-5 text-blue-600" />
            Co dalej?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Sprawdź swoją skrzynkę mailową</p>
                <p className="text-gray-600">
                  Email został wysłany na adres <strong>{email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Kliknij link aktywacyjny</p>
                <p className="text-gray-600">
                  {isNewRegistration 
                    ? "Aktywuj swoje konto klikając w link w emailu" 
                    : "Jeśli konto nie jest aktywne, kliknij w link w emailu"}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Zaloguj się do systemu</p>
                <p className="text-gray-600">
                  Po aktywacji możesz się zalogować używając swojego emailu i hasła
                </p>
              </div>
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Ważne:</strong> Email może dotrzeć w ciągu kilku minut. 
              Sprawdź także folder SPAM/Niechciane.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Ponowne wysłanie emaila */}
      {!isNewRegistration && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Konto już istnieje:</strong> Jeśli pamiętasz hasło i już aktywowałeś konto, 
            możesz od razu przejść do logowania.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Nie otrzymałeś emaila?
            </p>
            
            {resendSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Email został wysłany ponownie!
                </AlertDescription>
              </Alert>
            )}

            <Button 
              variant="outline" 
              onClick={handleResendEmail}
              disabled={resendLoading || resendSuccess}
              className="w-full sm:w-auto"
            >
              {resendLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {resendLoading ? "Wysyłanie..." : "Wyślij email ponownie"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Akcje */}
      <div className="mt-6 space-y-4">
        <Button 
          onClick={handleGoToLogin} 
          className="w-full"
          size="lg"
        >
          Przejdź do logowania
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <div className="text-center">
          <a 
            href="/help" 
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            Potrzebujesz pomocy? Skontaktuj się z nami
          </a>
        </div>
      </div>

      <FooterBranding className="pt-12" />
    </NarrowCol>
  );
};