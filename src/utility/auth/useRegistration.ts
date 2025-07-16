// utility/auth/useRegistration.ts - POPRAWIONA WERSJA

import React from 'react';
import { useRegister } from '@refinedev/core';
import { useNavigate } from 'react-router-dom';
import { useFormSchemaStore } from '@/utility/formSchemaStore';
import { AuthError } from './authErrors';

interface RegisterVariables {
  email: string;
  password: string;
  role: string;
  operator_id?: string;
}

interface UseRegistrationResult {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  register: () => void;
  goBack: () => void;
  processData: any;
}

// Typy dla odpowiedzi z authProvider
interface RegisterSuccessResponse {
  success: true;
  user: any;
  session: any;
}

interface RegisterErrorResponse {
  success: false;
  error: AuthError;
}

type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse;

export const useRegistration = (): UseRegistrationResult => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const [hasAttempted, setHasAttempted] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = React.useState(false);

  const { 
    mutate: registerMutation, 
    isLoading, 
    error: hookError,
    data: registerData,
    isSuccess: mutationSuccess,
    isError: mutationError
  } = useRegister<RegisterVariables>();

  const processData = getData("registration");

  // ✅ Debug logging
  React.useEffect(() => {
    console.log("🔍 useRegistration - Stan:", {
      hasAttempted,
      isLoading,
      mutationSuccess,
      mutationError,
      hookError,
      registerData,
      processData
    });
  }, [hasAttempted, isLoading, mutationSuccess, mutationError, hookError, registerData, processData]);

  // ✅ Type guards
  const isErrorResponse = (data: any): data is RegisterErrorResponse => {
    return data && data.success === false && data.error;
  };

  const isSuccessResponse = (data: any): data is RegisterSuccessResponse => {
    return data && data.success === true && data.user;
  };

  // ✅ Obsługa odpowiedzi z mutacji
  React.useEffect(() => {
    if (!hasAttempted) return;

    if (mutationSuccess && registerData) {
      console.log("✅ Mutacja zakończona sukcesem, dane:", registerData);
      
      if (isSuccessResponse(registerData)) {
        console.log("✅ Rejestracja udana!");
        setLocalSuccess(true);
        setLocalError(null);
      } else if (isErrorResponse(registerData)) {
        console.error("❌ Rejestracja nieudana:", registerData.error);
        setLocalError(registerData.error.message);
        setLocalSuccess(false);
      }
    }

    if (mutationError && hookError) {
      console.error("❌ Błąd mutacji:", hookError);
      const errorMessage = hookError instanceof Error ? hookError.message : "Wystąpił błąd podczas rejestracji";
      setLocalError(errorMessage);
      setLocalSuccess(false);
    }
  }, [mutationSuccess, mutationError, registerData, hookError, hasAttempted]);

  // ✅ Przekierowanie po sukcesie
  React.useEffect(() => {
    if (localSuccess && registerData && isSuccessResponse(registerData)) {
      console.log("🚀 Przekierowuję do kroku 4...");
      
      // Sprawdź czy już nie zapisaliśmy danych
      if (!processData.registrationComplete) {
        // Zapisz dane sukcesu
        setData("registration", {
          ...processData,
          registrationComplete: true,
          registrationDate: new Date().toISOString(),
          user: registerData.user,
          session: registerData.session,
          successData: registerData
        });
      }
      
      // Przekieruj po krótkiej chwili
      const timer = setTimeout(() => {
        navigate("/register/step4");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [localSuccess, registerData, navigate]); // Usuń processData i setData z dependencies!

  // ✅ Funkcja rejestracji
  const register = React.useCallback(() => {
    console.log("🎯 Rozpoczynam rejestrację z danymi:", processData);
    
    setHasAttempted(true);
    setLocalError(null);
    setLocalSuccess(false);
    
    const registerVariables: RegisterVariables = {
      email: processData.email,
      password: processData.password,
      role: processData.role,
    };

    if (processData.operator_id) {
      registerVariables.operator_id = processData.operator_id;
    }
    
    registerMutation(registerVariables, {
      onSuccess: (data) => {
        console.log("✅ onSuccess callback, data:", data);
      },
      onError: (error) => {
        console.error("❌ onError callback, error:", error);
      }
    });
  }, [processData, registerMutation]);

  // ✅ Funkcja cofania
  const goBack = React.useCallback(() => {
    navigate("/register/step2");
  }, [navigate]);

  return {
    isLoading,
    isSuccess: localSuccess,
    error: localError,
    register,
    goBack,
    processData
  };
};