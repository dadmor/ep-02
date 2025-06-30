// ========================================
// src/pages/auditor/completed-audits.tsx
// ========================================

import { useList } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { 
  FileText, 
  Calendar,
  MapPin,
  Star,
  Download,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const CompletedAudits = () => {
  const navigate = useNavigate();
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  // Pobranie ukończonych ofert
  const { data: completedOffers, isLoading } = useList({
    resource: "auditor_offers",
    filters: userId ? [
      {
        field: "auditor_id",
        operator: "eq",
        value: userId,
      },
      {
        field: "status",
        operator: "eq",
        value: "completed",
      },
    ] : [],
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!userId,
    },
  });

  const completed = completedOffers?.data || [];

  // Show loading state
  if (!userId || isLoading) {
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
        title="Ukończone Audyty"
        description="Historia twoich zrealizowanych audytów energetycznych"
      />

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-xl font-bold">{completed.length}</div>
                <div className="text-xs text-muted-foreground">Ukończone audyty</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-xl font-bold">
                  {completed.length > 0 ? "4.8" : "0"}
                </div>
                <div className="text-xs text-muted-foreground">Średnia ocena</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold">
                  {completed.reduce((sum, offer) => sum + (offer.price || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Łączne zarobki (zł)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista ukończonych audytów */}
      <div>
        {completed.length > 0 ? (
          <div className="space-y-4">
            {completed.map((audit: any) => (
              <Card key={audit.id}>
                <CardContent className="p-6">
                  <FlexBox className="mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ukończone
                        </Badge>
                      </div>
                      <h3 className="font-medium text-lg mb-2">
                        Audyt za {audit.price?.toLocaleString()} zł
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(audit.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {audit.duration_days} dni
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/auditor/offer/${audit.id}`)}
                      >
                        Szczegóły
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Pobierz raport
                      </Button>
                    </div>
                  </FlexBox>

                  {audit.description && (
                    <div className="text-sm bg-gray-50 p-3 rounded mb-3">
                      <span className="font-medium">Zakres audytu:</span> {audit.description}
                    </div>
                  )}

                  {/* Placeholder dla oceny klienta */}
                  <div className="border-t pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Ocena klienta:</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < 5 ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-muted-foreground">(5.0)</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      "Profesjonalny audyt, szczegółowy raport i cenne rekomendacje."
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Nie masz jeszcze ukończonych audytów
              </h3>
              <p className="text-muted-foreground mb-4">
                Gdy ukończysz pierwszy audyt, pojawi się tutaj wraz z oceną klienta
              </p>
              <Button onClick={() => navigate('/auditor/available-requests')}>
                <FileText className="w-4 h-4 mr-2" />
                Znajdź zlecenia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};