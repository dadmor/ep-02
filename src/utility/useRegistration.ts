// hooks/useRegistration.ts
import React from 'react';
import { useRegister } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useFormSchemaStore } from '@/utility/formSchemaStore';

interface RegisterVariables {
  email: string;
  password: string;
  role: string;
}

interface UseRegistrationResult {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  register: () => void;
  goBack: () => void;
  processData: any;
}

export const useRegistration = (): UseRegistrationResult => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const [hasAttempted, setHasAttempted] = React.useState(false);

  const { 
    mutate: registerMutation, 
    isLoading, 
    error: hookError,
    data: registerData
  } = useRegister<RegisterVariables>();

  const processData = getData("registration");

  // Funkcja parsująca błędy
  const getErrorMessage = React.useCallback((error: any): string => {
    console.log("🔍 getErrorMessage received:", error);
    
    if (!error) return "Wystąpił nieoczekiwany błąd.";

    if (typeof error === 'string') {
      return error;
    }

    // Handle authProvider response format: {success: false, error: {...}}
    if (error.success === false && error.error) {
      const authError = error.error;
      const message = authError.message || '';
      const code = authError.details?.code || authError.code || '';
      
      // Handle specific validation errors
      if (message.includes("Password cannot be longer than 72 characters")) {
        return "Hasło nie może być dłuższe niż 72 znaki.";
      }
      
      if (message.includes("Password should be")) {
        return "Hasło nie spełnia wymagań (minimum 6 znaków).";
      }
      
      if (message.includes("Invalid email")) {
        return "Nieprawidłowy format adresu email.";
      }
      
      if (message.includes("User already registered") || message.includes("already exists")) {
        return "Konto z tym adresem email już istnieje.";
      }
      
      if (code === "over_email_send_rate_limit" || message.includes("over_email_send_rate_limit")) {
        return "Za szybko! Poczekaj 2 sekundy przed ponowną próbą rejestracji.";
      }
      
      return message || "Wystąpił błąd podczas rejestracji.";
    }

    // Handle JSON error objects with code and message
    if (error.code && error.message) {
      const { code, message } = error;
      
      if (code === "validation_failed") {
        if (message.includes("Password cannot be longer than 72 characters")) {
          return "Hasło nie może być dłuższe niż 72 znaki.";
        }
        if (message.includes("Password should be")) {
          return "Hasło nie spełnia wymagań (minimum 6 znaków).";
        }
        if (message.includes("Invalid email")) {
          return "Nieprawidłowy format adresu email.";
        }
        return `Błąd walidacji: ${message}`;
      }
      
      if (code === "over_email_send_rate_limit") {
        return "Za szybko! Poczekaj 2 sekundy przed ponowną próbą rejestracji.";
      }
      
      if (code === "user_already_exists") {
        return "Konto z tym adresem email już istnieje.";
      }
      
      return message || `Błąd: ${code}`;
    }

    // Fallback handling
    const message = error.message || error.error_description || '';
    return message || "Wystąpił błąd. Spróbuj ponownie.";
  }, []);

  // Sprawdzenie czy rejestracja się udała
  const isRegistrationSuccessful = React.useMemo(() => {
    return registerData?.success === true;
  }, [registerData]);

  // Sprawdzenie błędów
  const registrationError = React.useMemo(() => {
    if (!hasAttempted) return null;
    
    if (hookError) {
      return getErrorMessage(hookError);
    }
    
    if (registerData?.success === false) {
      return getErrorMessage(registerData);
    }
    
    return null;
  }, [hookError, registerData, hasAttempted, getErrorMessage]);

  // Effect obsługujący przekierowanie po sukcesie
  React.useEffect(() => {
    if (isRegistrationSuccessful && registerData) {
      if (!processData.registrationComplete) {
        setData("registration", {
          ...processData,
          registrationComplete: true,
          registrationDate: new Date().toISOString(),
          user: registerData.user,
          session: registerData.session,
          successData: registerData
        });
      }
      
      const timer = setTimeout(() => {
        navigate("/register/step4");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isRegistrationSuccessful, registerData, navigate, processData, setData]);

  // Funkcja rejestracji
  const register = React.useCallback(() => {
    setHasAttempted(true);
    
    const registerVariables: RegisterVariables = {
      email: processData.email,
      password: processData.password,
      role: processData.role,
    };
    
    registerMutation(registerVariables, {
      onSuccess: (data) => {
        console.log("✅ SUCCESS DATA:", data);
      },
      onError: (error) => {
        console.error("❌ ERROR DATA:", error);
      }
    });
  }, [processData, registerMutation]);

  // Funkcja cofania
  const goBack = React.useCallback(() => {
    navigate("/register/step2");
  }, [navigate]);

  return {
    isLoading,
    isSuccess: isRegistrationSuccessful,
    error: registrationError,
    register,
    goBack,
    processData
  };
};