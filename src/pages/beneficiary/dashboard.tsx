// src/pages/beneficiary/dashboard.tsx
import { useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Wrench, 
  ClipboardCheck,
  TrendingUp,
  Eye,
  Phone,
  Calculator
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const BeneficiaryDashboard = () => {
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Pobranie zleceń wykonawców
  const { data: serviceRequests } = useList({
    resource: "service_requests",
    filters: userId ? [
      {
        field: "beneficiary_id",
        operator: "eq",
        value: userId,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId, // Only run query when we have userId
    },
  });

  // Pobranie zleceń audytorów
  const { data: auditRequests } = useList({
    resource: "audit_requests",
    filters: userId ? [
      {
        field: "beneficiary_id", 
        operator: "eq",
        value: userId,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId, // Only run query when we have userId
    },
  });

  // Pobranie kontaktów z operatorem
  const { data: operatorContacts } = useList({
    resource: "operator_contacts",
    filters: userId ? [
      {
        field: "beneficiary_id",
        operator: "eq",
        value: userId,
      },
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  const serviceReqs = serviceRequests?.data || [];
  const auditReqs = auditRequests?.data || [];
  const contacts = operatorContacts?.data || [];
  const allRequests = [...serviceReqs, ...auditReqs];

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    verified: allRequests.filter(r => r.status === 'verified').length,
    completed: allRequests.filter(r => r.status === 'completed').length,
  };

  const recentRequests = allRequests
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Check for calculator result with better validation
  const hasCalculatorResult = contacts.some(c => {
    if (!c.calculator_result) return false;
    
    try {
      const result = typeof c.calculator_result === 'string' 
        ? JSON.parse(c.calculator_result)
        : c.calculator_result;
      
      return result && result.subsidyLevel && result.subsidyPercentage && result.maxAmount;
    } catch {
      return false;
    }
  });

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
        title="Panel Beneficjenta"
        description="Zarządzaj swoimi zleceniami termomodernizacyjnymi i skorzystaj z kalkulatora dotacji"
      />

      {/* Alert dla nowych użytkowników */}
      {!hasCalculatorResult && allRequests.length === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Calculator className="w-8 h-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Sprawdź wysokość swojej dotacji!
                </h3>
                <p className="text-blue-800 mb-3">
                  Zanim złożysz zlecenie, skorzystaj z kalkulatora dotacji i umów się na konsultację z operatorem programu.
                </p>
                <Button 
                  onClick={() => navigate('/beneficiary/contact-operator')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Kalkulator dotacji
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statystyki */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Łącznie zleceń</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Oczekujące</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.verified}</div>
                <div className="text-sm text-muted-foreground">Zweryfikowane</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Ukończone</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <GridBox>
        {/* Szybkie akcje */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => navigate('/beneficiary/contact-operator')}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Kalkulator dotacji
              </Button>
              <Button 
                className="w-full" 
                onClick={() => navigate('/beneficiary/service-request/create')}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Zlecenie wykonawcy
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/beneficiary/audit-request/create')}
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Zlecenie audytora
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/beneficiary/my-requests')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Wszystkie zlecenia
              </Button>
            </CardContent>
          </Card>

        
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Kontakt z operatorem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Potrzebujesz pomocy z programem? Umów się na rozmowę z operatorem.
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/beneficiary/contact-operator')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Umów rozmowę
              </Button>
              {contacts.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Ostatni kontakt: {new Date(contacts[0].created_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proces termomodernizacji</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>1. Sprawdź wysokość dotacji</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>2. Zamów audyt energetyczny</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>3. Wybierz wykonawcę</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>4. Realizuj inwestycję</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span>5. Odbierz dotację</span>
              </div>
            </div>
          </CardContent>
        </Card>


       
      </GridBox>

      {/* Dodatkowe informacje */}
      <GridBox className="grid-cols-1 md:grid-cols-2">

         {/* Ostatnie zlecenia */}
         <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <FlexBox>
                <CardTitle>Ostatnie zlecenia</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/beneficiary/my-requests')}
                >
                  Zobacz wszystkie
                </Button>
              </FlexBox>
            </CardHeader>
            <CardContent>
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request: any) => {
                    const isService = 'heat_source' in request;
                    return (
                      <div key={request.id} className="border rounded-lg p-4">
                        <FlexBox className="mb-2">
                          <div>
                            <Badge variant={isService ? 'default' : 'secondary'}>
                              {isService ? 'Wykonawca' : 'Audytor'}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={
                                request.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                                request.status === 'verified' ? 'border-green-500 text-green-700' :
                                request.status === 'completed' ? 'border-blue-500 text-blue-700' :
                                'border-red-500 text-red-700'
                              }
                            >
                              {request.status === 'pending' ? 'Oczekujące' :
                               request.status === 'verified' ? 'Zweryfikowane' : 
                               request.status === 'completed' ? 'Ukończone' : 'Odrzucone'}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/beneficiary/requests/${request.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </FlexBox>
                        <div className="text-sm">
                          <div className="font-medium">{request.city}, {request.street_address}</div>
                          <div className="text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nie masz jeszcze żadnych zleceń</p>
                  <p className="text-sm">Utwórz pierwsze zlecenie, aby rozpocząć</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

          {/* Wynik kalkulatora jeśli istnieje */}
          {hasCalculatorResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Twoja dotacja
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const latestContact = contacts
                    .filter(c => c.calculator_result)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                  
                  if (!latestContact?.calculator_result) return null;
                  
                  // Parse calculator_result if it's a string, otherwise use as object
                  let result;
                  try {
                    result = typeof latestContact.calculator_result === 'string' 
                      ? JSON.parse(latestContact.calculator_result)
                      : latestContact.calculator_result;
                  } catch (error) {
                    console.error('Error parsing calculator_result:', error);
                    return (
                      <div className="text-sm text-red-500">
                        Błąd podczas odczytywania wyniku kalkulatora
                      </div>
                    );
                  }
                  
                  // Validate required fields
                  if (!result || !result.subsidyLevel || !result.subsidyPercentage || !result.maxAmount) {
                    console.warn('Invalid calculator result structure:', result);
                    return (
                      <div className="text-sm text-muted-foreground">
                        Niepełne dane kalkulatora
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Poziom: <span className="font-medium">{result.subsidyLevel}</span>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {result.subsidyPercentage}%
                      </div>
                      <div className="text-sm">
                        do {result.maxAmount?.toLocaleString('pl-PL')} zł
                      </div>
                      {result.incomePercentage && (
                        <div className="text-xs text-muted-foreground">
                          Twój dochód: {result.incomePercentage}% progu
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Obliczono: {new Date(latestContact.created_at).toLocaleDateString('pl-PL')}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => navigate('/beneficiary/contact-operator')}
                      >
                        Przelicz ponownie
                      </Button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}


    
       
      </GridBox>
    </>
  );
};