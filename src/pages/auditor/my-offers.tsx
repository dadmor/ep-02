// ========================================
// src/pages/auditor/my-offers.tsx  
// ========================================

import { useState } from "react";
import { useList, useUpdate } from "@refinedev/core";
import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye,
  Calendar,
  Euro,
  MapPin,
  Edit,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Identity } from "../../operatorTypes";

export const MyOffers = () => {
  const navigate = useNavigate();
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  // Get authenticated user
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  const { mutate: updateOffer } = useUpdate();
  
  // Pobranie moich ofert
  const { data: offers, isLoading, refetch } = useList({
    resource: "auditor_offers",
    filters: userId ? [
      {
        field: "auditor_id",
        operator: "eq",
        value: userId,
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

  const allOffers = offers?.data || [];

  const stats = {
    total: allOffers.length,
    pending: allOffers.filter(o => o.status === 'pending').length,
    accepted: allOffers.filter(o => o.status === 'accepted').length,
    completed: allOffers.filter(o => o.status === 'completed').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Oczekująca</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="border-green-500 text-green-700">Zaakceptowana</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Ukończona</Badge>;
      default:
        return <Badge variant="outline" className="border-red-500 text-red-700">Odrzucona</Badge>;
    }
  };

  const canEdit = (offer: any) => {
    return offer.status === 'pending';
  };

  const canWithdraw = (offer: any) => {
    return offer.status === 'pending';
  };

  const handleWithdraw = (offer: any) => {
    setSelectedOffer(offer);
    setShowWithdrawDialog(true);
  };

  const confirmWithdraw = () => {
    if (selectedOffer) {
      updateOffer({
        resource: 'auditor_offers',
        id: selectedOffer.id,
        values: {
          status: 'withdrawn'
        }
      }, {
        onSuccess: () => {
          setShowWithdrawDialog(false);
          setSelectedOffer(null);
          refetch();
        }
      });
    }
  };

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
        title="Moje Oferty"
        description="Zarządzaj swoimi ofertami audytowymi"
      />

      {/* Statystyki */}
      <GridBox variant="1-2-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Łącznie</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-600" />
              <div>
                <div className="text-xl font-bold">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Oczekujące</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="text-xl font-bold">{stats.accepted}</div>
                <div className="text-xs text-muted-foreground">Zaakceptowane</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              <div>
                <div className="text-xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Ukończone</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {/* Lista ofert */}
      <div>
        {allOffers.length > 0 ? (
          <div className="space-y-4">
            {allOffers.map((offer: any) => (
              <Card key={offer.id}>
                <CardContent className="p-6">
                  <FlexBox className="mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(offer.status)}
                      </div>
                      <h3 className="font-medium text-lg mb-2">
                        Oferta na kwotę {offer.price?.toLocaleString()} zł
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {offer.duration_days} dni
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(offer.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {canEdit(offer) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/auditor/offer/edit/${offer.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      
                      {canWithdraw(offer) && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(offer)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/auditor/offer/${offer.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Szczegóły
                      </Button>
                    </div>
                  </FlexBox>

                  {offer.description && (
                    <div className="text-sm bg-gray-50 p-3 rounded mb-3">
                      <span className="font-medium">Opis oferty:</span> {offer.description}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Euro className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                Nie masz jeszcze żadnych ofert
              </h3>
              <p className="text-muted-foreground mb-4">
                Przejdź do dostępnych zleceń i złóż pierwszą ofertę
              </p>
              <Button onClick={() => navigate('/auditor/available-requests')}>
                <FileText className="w-4 h-4 mr-2" />
                Przeglądaj zlecenia
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog wycofania oferty */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wycofaj ofertę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Czy na pewno chcesz wycofać tę ofertę? Ta akcja jest nieodwracalna.</p>
            {selectedOffer && (
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-medium">{selectedOffer.price?.toLocaleString()} zł</div>
                <div className="text-sm text-muted-foreground">
                  {selectedOffer.duration_days} dni
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
                Anuluj
              </Button>
              <Button variant="destructive" onClick={confirmWithdraw}>
                <X className="w-4 h-4 mr-2" />
                Wycofaj
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
