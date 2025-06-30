// src/pages/beneficiary/request-details.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useGetIdentity, useOne, useList, useUpdate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Button } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Loader2, 
  ArrowLeft,
  Building,
  Square,
  Thermometer,
  Clock,
  Euro,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Users,
  Edit
} from "lucide-react";
import { useState } from "react";
import { Identity } from "../../operatorTypes";

interface AuditorOffer {
  id: string;
  request_id: string;
  auditor_id: string;
  price: number;
  duration_days: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'withdrawn';
  description?: string;
  created_at: string;
  updated_at: string;
}

export const RequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<Identity>();
  const userId = identity?.id;
  
  const [selectedOffer, setSelectedOffer] = useState<AuditorOffer | null>(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { mutate: updateOffer } = useUpdate();

  // Spróbuj najpierw pobrać jako zlecenie wykonawcy
  const {
    data: serviceData,
    isLoading: loadingService,
    error: errorService,
  } = useOne({
    resource: "service_requests",
    id: id || "",
    queryOptions: { enabled: !!id },
  });

  // Równolegle spróbuj jako zlecenie audytora
  const {
    data: auditData,
    isLoading: loadingAudit,
    error: errorAudit,
  } = useOne({
    resource: "audit_requests",
    id: id || "",
    queryOptions: { enabled: !!id },
  });

  // Pobranie ofert audytorów (tylko dla audit_requests)
  const { data: auditorOffers, refetch: refetchOffers } = useList({
    resource: "auditor_offers",
    filters: id ? [
      {
        field: "request_id",
        operator: "eq",
        value: id,
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
      enabled: !!id && !!auditData?.data, // Tylko gdy mamy audit request
    },
  });

  // Pobranie profili audytorów
  const { data: auditorProfiles } = useList({
    resource: "auditor_profiles",
    filters: [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!auditorOffers?.data && auditorOffers.data.length > 0,
    },
  });

  const request = serviceData?.data || auditData?.data;
  const loading = loadingService && loadingAudit;
  const isAuditRequest = !!auditData?.data;
  const offers = (auditorOffers?.data || []) as AuditorOffer[];
  const profiles = (auditorProfiles?.data || []) as any[];

  const getAuditorProfile = (auditorId: string) => {
    return (profiles as any[]).find((profile: any) => profile.auditor_id === auditorId);
  };

  const hasAcceptedOffer = () => {
    return (offers as AuditorOffer[]).some((offer: AuditorOffer) => offer.status === 'accepted');
  };

  const canManageOffers = () => {
    return isAuditRequest && request?.status === 'verified' && !hasAcceptedOffer();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Oczekujące</Badge>;
      case 'verified':
        return <Badge variant="outline" className="border-green-500 text-green-700">Zweryfikowane</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Ukończone</Badge>;
      default:
        return <Badge variant="outline" className="border-red-500 text-red-700">Odrzucone</Badge>;
    }
  };

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Nowa</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Zaakceptowana</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="border-red-500 text-red-700">Odrzucona</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Ukończona</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="border-gray-500 text-gray-700">Wycofana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const buildingTypeLabels: Record<string, string> = {
    "dom_jednorodzinny": "Dom jednorodzinny",
    "dom_wielorodzinny": "Dom wielorodzinny",
    "mieszkanie_blok": "Mieszkanie w bloku",
    "mieszkanie_kamienica": "Mieszkanie w kamienicy",
    "szeregowiec": "Szeregowiec",
    "blizniak": "Bliźniak",
  };

  const heatingSystemLabels: Record<string, string> = {
    "piec_wegiel": "Piec na węgiel",
    "piec_drewno": "Piec na drewno",
    "piec_gaz": "Piec gazowy",
    "kotlownia_gazowa": "Kotłownia gazowa",
    "centralne": "Centralne ogrzewanie",
    "elektryczne": "Ogrzewanie elektryczne",
    "pompa_ciepla": "Pompa ciepła",
    "inne": "Inne",
  };

  const handleViewOffer = (offer: AuditorOffer) => {
    setSelectedOffer(offer);
    setShowOfferDialog(true);
  };

  const handleAcceptOffer = (offer: AuditorOffer) => {
    setSelectedOffer(offer);
    setShowAcceptDialog(true);
  };

  const handleRejectOffer = (offer: AuditorOffer) => {
    setSelectedOffer(offer);
    setShowRejectDialog(true);
  };

  const confirmAcceptOffer = () => {
    if (selectedOffer) {
      // Zaakceptuj wybraną ofertę
      updateOffer({
        resource: "auditor_offers",
        id: selectedOffer.id,
        values: { status: "accepted" }
      }, {
        onSuccess: () => {
          // Odrzuć wszystkie pozostałe oferty dla tego zlecenia
          const otherOffers = (offers as AuditorOffer[]).filter(
            (offer: AuditorOffer) => offer.id !== selectedOffer.id && offer.status === 'pending'
          );
          
          otherOffers.forEach((offer: AuditorOffer) => {
            updateOffer({
              resource: "auditor_offers",
              id: offer.id,
              values: { status: "rejected" }
            });
          });

          setShowAcceptDialog(false);
          setSelectedOffer(null);
          refetchOffers();
        }
      });
    }
  };

  const confirmRejectOffer = () => {
    if (selectedOffer) {
      updateOffer({
        resource: "auditor_offers",
        id: selectedOffer.id,
        values: { status: "rejected" }
      }, {
        onSuccess: () => {
          setShowRejectDialog(false);
          setSelectedOffer(null);
          refetchOffers();
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-4 h-4" />
          Ładowanie szczegółów zlecenia...
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Zlecenie nie znalezione</h3>
            <p className="text-muted-foreground mb-4">
              Nie znaleziono zlecenia o ID: <code>{id}</code>
            </p>
            <Button onClick={() => navigate('/beneficiary/my-requests')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do listy zleceń
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const acceptedOffer = (offers as AuditorOffer[]).find((offer: AuditorOffer) => offer.status === 'accepted');

  return (
    <div className="p-6 space-y-6">
      {/* Nagłówek */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/beneficiary/my-requests')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Powrót do zleceń
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Szczegóły zlecenia</h1>
          <p className="text-muted-foreground">
            {isAuditRequest ? 'Zlecenie audytora' : 'Zlecenie wykonawcy'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Główne informacje */}
        <div className="lg:col-span-2 space-y-6">
          {/* Podstawowe dane */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informacje o zleceniu
                </CardTitle>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  {request.city}, {request.street_address}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {request.postal_code}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Utworzone: {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Szczegóły budynku dla audit request */}
              {isAuditRequest && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Charakterystyka budynku</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {request.building_type && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {buildingTypeLabels[request.building_type] || request.building_type}
                        </span>
                      </div>
                    )}
                    
                    {request.living_area && (
                      <div className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{request.living_area} m²</span>
                      </div>
                    )}
                    
                    {request.building_year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Rok budowy: {request.building_year}</span>
                      </div>
                    )}
                    
                    {request.heating_system && (
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {heatingSystemLabels[request.heating_system] || request.heating_system}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Dodatkowe informacje */}
              {(request.audit_purpose || request.notes) && (
                <div className="border-t pt-4">
                  {request.audit_purpose && (
                    <div className="mb-3">
                      <h4 className="font-medium mb-1">Cel audytu</h4>
                      <p className="text-sm text-gray-700">{request.audit_purpose}</p>
                    </div>
                  )}
                  
                  {request.notes && (
                    <div>
                      <h4 className="font-medium mb-1">Dodatkowe uwagi</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {request.notes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Oferty audytorów */}
          {isAuditRequest && offers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Oferty audytorów ({offers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(offers as AuditorOffer[]).map((offer: AuditorOffer) => {
                    const profile = getAuditorProfile(offer.auditor_id);
                    
                    return (
                      <div key={offer.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="font-medium text-lg">
                              {profile?.company_name || `Audytor ${offer.auditor_id.slice(0, 8)}`}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Euro className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{offer.price?.toLocaleString()} zł</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span>{offer.duration_days} dni</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getOfferStatusBadge(offer.status)}
                          </div>
                        </div>

                        {/* Kontakt z audytorem - tylko dla zaakceptowanych ofert */}
                        {offer.status === 'accepted' && profile && (
                          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
                            <h5 className="font-medium text-green-800 mb-2">Dane kontaktowe audytora</h5>
                            <div className="grid gap-2 text-sm">
                              {profile.phone_number && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{profile.phone_number}</span>
                                </div>
                              )}
                              {profile.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span>{profile.email}</span>
                                </div>
                              )}
                              {profile.company_address && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{profile.company_address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Opis oferty - skrócony */}
                        {offer.description && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-600 line-clamp-3">
                              {offer.description.slice(0, 200)}
                              {offer.description.length > 200 && '...'}
                            </div>
                          </div>
                        )}

                        {/* Akcje */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOffer(offer)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Szczegóły
                          </Button>
                          
                          {canManageOffers() && offer.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAcceptOffer(offer)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                Zaakceptuj
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectOffer(offer)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                Odrzuć
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Brak ofert - info */}
          {isAuditRequest && request.status === 'verified' && offers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">Oczekujemy na oferty</h3>
                <p className="text-muted-foreground">
                  Twoje zlecenie zostało zweryfikowane. Audytorzy będą mogli składać oferty.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel boczny */}
        <div className="lg:col-span-1 space-y-4">
          {/* Podsumowanie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Typ zlecenia</span>
                  <Badge variant={isAuditRequest ? 'secondary' : 'default'}>
                    {isAuditRequest ? 'Audytor' : 'Wykonawca'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(request.status)}
                </div>

                {isAuditRequest && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Oferty</span>
                    <span className="font-medium">{offers.length}</span>
                  </div>
                )}

                {acceptedOffer && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Wybrany audytor</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Data utworzenia</span>
                  <span>{new Date(request.created_at).toLocaleDateString()}</span>
                </div>

                {request.updated_at !== request.created_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ostatnia zmiana</span>
                    <span>{new Date(request.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Akcje */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {request.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/beneficiary/${isAuditRequest ? 'audit-request' : 'service-request'}/edit/${request.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj zlecenie
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/beneficiary/my-requests')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót do listy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wskazówki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wskazówki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-muted-foreground">
                {request.status === 'pending' && (
                  <div>• Zlecenie oczekuje na weryfikację przez operatora</div>
                )}
                {request.status === 'verified' && !hasAcceptedOffer() && (
                  <>
                    <div>• Audytorzy mogą składać oferty na Twoje zlecenie</div>
                    <div>• Porównaj oferty pod kątem ceny i czasu realizacji</div>
                    <div>• Sprawdź opis oferty przed podjęciem decyzji</div>
                  </>
                )}
                {acceptedOffer && (
                  <>
                    <div>• Skontaktuj się z wybranym audytorem</div>
                    <div>• Ustal szczegóły realizacji audytu</div>
                    <div>• Po zakończeniu zostaniesz poproszony o opinię</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog szczegółów oferty */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Szczegóły oferty audytora</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Firma audytora</div>
                  <div className="font-medium">
                    {getAuditorProfile(selectedOffer.auditor_id)?.company_name || 
                     `Audytor ${selectedOffer.auditor_id.slice(0, 8)}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status oferty</div>
                  <div>{getOfferStatusBadge(selectedOffer.status)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cena</div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-lg">{selectedOffer.price?.toLocaleString()} zł</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Czas realizacji</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-lg">{selectedOffer.duration_days} dni</span>
                  </div>
                </div>
              </div>
              
              {selectedOffer.description && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Szczegółowy opis oferty</div>
                  <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {selectedOffer.description}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Oferta złożona: {new Date(selectedOffer.created_at).toLocaleDateString()}
                {selectedOffer.updated_at !== selectedOffer.created_at && 
                  ` • Ostatnia aktualizacja: ${new Date(selectedOffer.updated_at).toLocaleDateString()}`}
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
                  Zamknij
                </Button>
                {canManageOffers() && selectedOffer.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowOfferDialog(false);
                        handleRejectOffer(selectedOffer);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Odrzuć
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowOfferDialog(false);
                        handleAcceptOffer(selectedOffer);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Zaakceptuj
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog akceptowania oferty */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaakceptuj ofertę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Potwierdzenie akceptacji oferty</span>
            </div>
            <p>Czy na pewno chcesz zaakceptować tę ofertę? Po akceptacji:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Wszystkie pozostałe oferty zostaną automatycznie odrzucone</li>
              <li>Audytor otrzyma powiadomienie o akceptacji</li>
              <li>Będziesz mógł skontaktować się z audytorem</li>
              <li>Ta akcja jest nieodwracalna</li>
            </ul>
            
            {selectedOffer && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium">
                  {getAuditorProfile(selectedOffer.auditor_id)?.company_name || 
                   `Audytor ${selectedOffer.auditor_id.slice(0, 8)}`}
                </div>
                <div className="text-sm">
                  Cena: <span className="font-medium">{selectedOffer.price?.toLocaleString()} zł</span>
                </div>
                <div className="text-sm">
                  Czas realizacji: {selectedOffer.duration_days} dni
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
                Anuluj
              </Button>
              <Button 
                onClick={confirmAcceptOffer}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Zaakceptuj ofertę
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog odrzucania oferty */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odrzuć ofertę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Potwierdzenie odrzucenia oferty</span>
            </div>
            <p>Czy na pewno chcesz odrzucić tę ofertę? Audytor otrzyma powiadomienie o odrzuceniu.</p>
            
            {selectedOffer && (
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <div className="font-medium">
                  {getAuditorProfile(selectedOffer.auditor_id)?.company_name || 
                   `Audytor ${selectedOffer.auditor_id.slice(0, 8)}`}
                </div>
                <div className="text-sm">
                  Cena: <span className="font-medium">{selectedOffer.price?.toLocaleString()} zł</span>
                </div>
                <div className="text-sm">
                  Czas realizacji: {selectedOffer.duration_days} dni
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Anuluj
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmRejectOffer}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Odrzuć ofertę
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};