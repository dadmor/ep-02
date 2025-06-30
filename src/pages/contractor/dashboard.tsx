// ========================================
// src/pages/contractor/dashboard.tsx
// ========================================

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
  Eye,
  Star,
  Euro,
  Calendar,
  User,
  Image,
  Hammer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const ContractorDashboard = () => {
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Pobranie dostępnych zleceń serwisowych
  const { data: availableRequests } = useList({
    resource: "service_requests",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "verified",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  // Pobranie moich ofert
  const { data: myOffers } = useList({
    resource: "contractor_offers",
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

  // Pobranie profilu
  const { data: profile } = useList({
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

  // Pobranie portfolio items
  const { data: portfolioItems } = useList({
    resource: "contractor_portfolio_items",
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

  const available = availableRequests?.data || [];
  const offers = myOffers?.data || [];
  const profileData = profile?.data?.[0];
  const portfolio = portfolioItems?.data || [];

  const stats = {
    available: available.length,
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    completed: offers.filter(o => o.status === 'completed').length,
    portfolio: portfolio.length,
  };

  const recentOffers = offers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const hasProfile = !!profileData;
  const hasPortfolio = portfolio.length > 0;

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
        title="Panel Wykonawcy"
        description="Zarządzaj swoim profilem, ofertami i realizowanymi projektami"
      />

      {/* Alert dla nowych wykonawców */}
      {!hasProfile && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <User className="w-8 h-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Witaj w panelu wykonawcy!
                </h3>
                <p className="text-blue-800 mb-3">
                  Aby rozpocząć pracę, musisz najpierw uzupełnić swój profil zawodowy z danymi firmy i specjalizacjami.
                </p>
                <Button 
                  onClick={() => navigate('/contractor/profile')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Utwórz profil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert o portfolio */}
      {hasProfile && !hasPortfolio && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Image className="w-8 h-8 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  Pokaż swoje realizacje!
                </h3>
                <p className="text-green-800 mb-3">
                  Portfolio z przykładami zrealizowanych projektów zwiększy Twoje szanse na otrzymanie zleceń.
                </p>
                <Button 
                  onClick={() => navigate('/contractor/portfolio')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Dodaj portfolio
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
                <div className="text-2xl font-bold">{stats.available}</div>
                <div className="text-sm text-muted-foreground">Dostępne zlecenia</div>
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
                <div className="text-sm text-muted-foreground">Oczekujące oferty</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.accepted}</div>
                <div className="text-sm text-muted-foreground">Zaakceptowane</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Ukończone</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Image className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.portfolio}</div>
                <div className="text-sm text-muted-foreground">Projektów w portfolio</div>
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
                className="w-full" 
                onClick={() => navigate('/contractor/available-requests')}
                disabled={!hasProfile}
              >
                <FileText className="w-4 h-4 mr-2" />
                Przeglądaj zlecenia
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/contractor/my-offers')}
              >
                <Euro className="w-4 h-4 mr-2" />
                Moje oferty
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/contractor/profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Profil firmy
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/contractor/portfolio')}
              >
                <Image className="w-4 h-4 mr-2" />
                Portfolio projektów
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/contractor/completed-projects')}
              >
                <Star className="w-4 h-4 mr-2" />
                Ukończone projekty
              </Button>
            </CardContent>
          </Card>

          {/* Status profilu */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                Status profilu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profil zawodowy</span>
                  {hasProfile ? (
                    <Badge className="bg-green-100 text-green-800">✓ Gotowy</Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500 text-orange-700">Brak</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Portfolio projektów</span>
                  {hasPortfolio ? (
                    <Badge className="bg-green-100 text-green-800">✓ {portfolio.length} proj.</Badge>
                  ) : (
                    <Badge variant="outline" className="border-orange-500 text-orange-700">Puste</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Możliwość ofert</span>
                  {hasProfile ? (
                    <Badge className="bg-green-100 text-green-800">✓ Aktywne</Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500 text-red-700">Nieaktywne</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ostatnie oferty */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <FlexBox>
                <CardTitle>Ostatnie oferty</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/contractor/my-offers')}
                >
                  Zobacz wszystkie
                </Button>
              </FlexBox>
            </CardHeader>
            <CardContent>
              {recentOffers.length > 0 ? (
                <div className="space-y-4">
                  {recentOffers.map((offer: any) => (
                    <div key={offer.id} className="border rounded-lg p-4">
                      <FlexBox className="mb-2">
                        <div>
                          <Badge 
                            variant="outline" 
                            className={
                              offer.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                              offer.status === 'accepted' ? 'border-green-500 text-green-700' :
                              offer.status === 'completed' ? 'border-blue-500 text-blue-700' :
                              'border-red-500 text-red-700'
                            }
                          >
                            {offer.status === 'pending' ? 'Oczekująca' :
                             offer.status === 'accepted' ? 'Zaakceptowana' : 
                             offer.status === 'completed' ? 'Ukończona' : 'Odrzucona'}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/contractor/offer/${offer.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </FlexBox>
                      <div className="text-sm">
                        <div className="font-medium text-lg">{offer.price?.toLocaleString()} zł</div>
                        <div className="text-muted-foreground">
                          {new Date(offer.created_at).toLocaleDateString()}
                        </div>
                        {offer.scope && (
                          <div className="text-sm mt-1 text-gray-600 line-clamp-2">
                            {offer.scope}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Euro className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nie masz jeszcze żadnych ofert</p>
                  <p className="text-sm">Złóż pierwszą ofertę na dostępne zlecenie</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </GridBox>

      {/* Dostępne zlecenia preview */}
      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="w-5 h-5" />
              Najnowsze zlecenia
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/contractor/available-requests')}
            >
              Zobacz wszystkie
            </Button>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {available.slice(0, 5).length > 0 ? (
            <div className="space-y-3">
              {available.slice(0, 5).map((request: any) => (
                <div key={request.id} className="border rounded-lg p-3">
                  <FlexBox>
                    <div>
                      <div className="font-medium">{request.city}, {request.street_address}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                        <span>{request.postal_code}</span>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/contractor/request/${request.id}`)}
                      disabled={!hasProfile}
                    >
                      Sprawdź
                    </Button>
                  </FlexBox>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Brak dostępnych zleceń</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};