// ========================================
// src/pages/auditor/dashboard.tsx - ZAKTUALIZOWANY
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
  ClipboardCheck,
  TrendingUp,
  Eye,
  Star,
  Euro,
  Calendar,
  Users,
  User,
  Image
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const AuditorDashboard = () => {
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Pobranie dostępnych zleceń
  const { data: availableRequests } = useList({
    resource: "audit_requests",
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
    resource: "auditor_offers",
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

  // Pobranie profilu
  const { data: profile } = useList({
    resource: "auditor_profiles",
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

  // Pobranie portfolio items
  const { data: portfolioItems } = useList({
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

  const available = availableRequests?.data || [];
  const offers = myOffers?.data || [];
  const profileData = profile?.data?.[0];
  const portfolio = portfolioItems?.data || [];

  // Mapowanie ofert po request_id
  const offersByRequestId = offers.reduce((acc: Record<string, any>, offer: any) => {
    if (offer.request_id) {
      acc[offer.request_id] = offer;
    }
    return acc;
  }, {});

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
        title="Panel Audytora"
        description="Zarządzaj swoim profilem, ofertami i portfolio projektów"
      />

      {!hasProfile && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <User className="w-8 h-8 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Witaj w panelu audytora!
                </h3>
                <p className="text-blue-800 mb-3">
                  Aby rozpocząć pracę, musisz najpierw uzupełnić swój profil zawodowy z danymi firmy i kwalifikacjami.
                </p>
                <Button 
                  onClick={() => navigate('/auditor/profile')}
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

      {hasProfile && !hasPortfolio && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Image className="w-8 h-8 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">
                  Dodaj przykłady swoich prac!
                </h3>
                <p className="text-green-800 mb-3">
                  Portfolio z przykładami zrealizowanych audytów zwiększy Twoje szanse na otrzymanie zleceń.
                </p>
                <Button 
                  onClick={() => navigate('/auditor/portfolio')}
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
      </GridBox>

      <Card>
        <CardHeader>
          <FlexBox>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Najnowsze zlecenia
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/auditor/available-requests')}
            >
              Zobacz wszystkie
            </Button>
          </FlexBox>
        </CardHeader>
        <CardContent>
          {available.slice(0,5).length > 0 ? (
            <div className="space-y-3">
              {available.slice(0,5).map((request: any) => {
                const offer = offersByRequestId[request.id];
                return (
                  <div key={request.id} className="border rounded-lg p-3">
                    <FlexBox>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{request.city}, {request.street_address}</div>
                          {offer && (
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
                          )}
                        </div>
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
                        onClick={() => navigate(`/auditor/request/${request.id}`)}
                        disabled={!hasProfile}
                      >
                        Sprawdź
                      </Button>
                    </FlexBox>
                  </div>
                );
              })}
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
