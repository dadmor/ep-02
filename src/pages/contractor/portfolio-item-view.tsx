// ========================================
// src/pages/contractor/portfolio-item-view.tsx
// ========================================

import { useState } from "react";
import { useOne } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button } from "@/components/ui";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Building,
  Euro,
  Image,
  Clock,
  TrendingUp,
  Hammer,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Eye
} from "lucide-react";

export const ContractorPortfolioItemView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [currentGallery, setCurrentGallery] = useState<'main' | 'before' | 'after'>('main');

  // Pobranie szczegółów projektu
  const { data: projectData, isLoading } = useOne({
    resource: "contractor_portfolio_items",
    id: id || "",
    queryOptions: {
      enabled: !!id,
    },
  });

  const project = projectData?.data;

  const projectTypes = [
    { value: "izolacja_termiczna", label: "Izolacja termiczna" },
    { value: "wymiana_okien", label: "Wymiana okien i drzwi" },
    { value: "system_ogrzewania", label: "System ogrzewania" },
    { value: "fotowoltaika", label: "Instalacja fotowoltaiczna" },
    { value: "pompa_ciepla", label: "Pompa ciepła" },
    { value: "rekuperacja", label: "System rekuperacji" },
    { value: "termomodernizacja", label: "Kompleksowa termomodernizacja" },
    { value: "smart_home", label: "System smart home" },
    { value: "dach_elewacja", label: "Dach i elewacja" },
    { value: "wentylacja", label: "Wentylacja mechaniczna" },
    { value: "kolektory_sloneczne", label: "Kolektory słoneczne" },
    { value: "biomasa", label: "Kocioł na biomasę" },
    { value: "inny", label: "Inny" },
  ];

  const buildingTypes = [
    { value: "dom_jednorodzinny", label: "Dom jednorodzinny" },
    { value: "dom_szeregowy", label: "Dom szeregowy" },
    { value: "apartament", label: "Apartament" },
    { value: "budynek_wielorodzinny", label: "Budynek wielorodzinny" },
    { value: "budynek_uslugowy", label: "Budynek usługowy" },
    { value: "budynek_przemyslowy", label: "Budynek przemysłowy" },
    { value: "inny", label: "Inny" },
  ];

  const openImageGallery = (gallery: 'main' | 'before' | 'after', index = 0) => {
    setCurrentGallery(gallery);
    setSelectedImageIndex(index);
    setShowImageDialog(true);
  };

  const getCurrentImages = () => {
    switch (currentGallery) {
      case 'before':
        return project?.before_images || [];
      case 'after':
        return project?.after_images || [];
      default:
        return [
          ...(project?.main_image_url ? [project.main_image_url] : []),
          ...(project?.additional_images || [])
        ];
    }
  };

  const nextImage = () => {
    const images = getCurrentImages();
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getCurrentImages();
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="p-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Projekt nie został znaleziony</h3>
            <Button onClick={() => navigate('/contractor/portfolio')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do portfolio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allImages = [
    ...(project.main_image_url ? [project.main_image_url] : []),
    ...(project.additional_images || [])
  ];

  return (
    <>
      {/* Nagłówek z nawigacją */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/contractor/portfolio')}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Portfolio
        </Button>
        <Lead
          title={project.title}
          description="Szczegóły projektu z portfolio"
        />
        <Button 
          onClick={() => navigate(`/contractor/portfolio/edit/${project.id}`)}
          size="sm"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edytuj
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Główna zawartość */}
        <div className="lg:col-span-2 space-y-6">
          {/* Główne zdjęcie */}
          {project.main_image_url && (
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 overflow-hidden rounded-lg cursor-pointer">
                  <img 
                    src={project.main_image_url} 
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onClick={() => openImageGallery('main', 0)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informacje podstawowe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Informacje o projekcie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Lokalizacja:</span>
                  <span>{project.location}</span>
                </div>

                {project.postal_code && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Kod pocztowy:</span>
                    <span>{project.postal_code}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Data ukończenia:</span>
                  <span>{new Date(project.completion_date).toLocaleDateString()}</span>
                </div>

                {project.duration_days && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Czas realizacji:</span>
                    <span>{project.duration_days} dni</span>
                  </div>
                )}

                {project.project_value && (
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Wartość projektu:</span>
                    <span>{project.project_value.toLocaleString()} zł</span>
                  </div>
                )}

                {project.project_type && (
                  <div className="flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Typ projektu:</span>
                    <Badge variant="outline">
                      {projectTypes.find(t => t.value === project.project_type)?.label || project.project_type}
                    </Badge>
                  </div>
                )}

                {project.building_type && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Typ budynku:</span>
                    <Badge variant="outline">
                      {buildingTypes.find(t => t.value === project.building_type)?.label || project.building_type}
                    </Badge>
                  </div>
                )}
              </div>

              {project.is_featured && (
                <div className="mt-4">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Star className="w-3 h-3 mr-1" />
                    Wyróżniony projekt
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opis projektu */}
          {project.description && (
            <Card>
              <CardHeader>
                <CardTitle>Opis projektu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {project.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zakres prac */}
          {project.scope_of_work && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="w-5 h-5" />
                  Zakres wykonanych prac
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {project.scope_of_work}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technologie */}
          {project.technologies_used && project.technologies_used.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Zastosowane technologie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.technologies_used.map((tech: string) => (
                    <Badge key={tech} variant="outline" className="bg-blue-50 border-blue-200">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Osiągnięte rezultaty */}
          {project.results_achieved && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Osiągnięte rezultaty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-green-800">
                    {project.results_achieved}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Galerie zdjęć przed/po */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Zdjęcia przed */}
            {project.before_images && project.before_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Zdjęcia przed realizacją</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 grid-cols-2">
                    {project.before_images.slice(0, 4).map((image: string, index: number) => (
                      <div 
                        key={index} 
                        className="aspect-square bg-gray-100 overflow-hidden rounded cursor-pointer"
                        onClick={() => openImageGallery('before', index)}
                      >
                        <img 
                          src={image} 
                          alt={`Przed ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                  {project.before_images.length > 4 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2" 
                      size="sm"
                      onClick={() => openImageGallery('before', 0)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Zobacz wszystkie ({project.before_images.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Zdjęcia po */}
            {project.after_images && project.after_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Zdjęcia po realizacji</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 grid-cols-2">
                    {project.after_images.slice(0, 4).map((image: string, index: number) => (
                      <div 
                        key={index} 
                        className="aspect-square bg-gray-100 overflow-hidden rounded cursor-pointer"
                        onClick={() => openImageGallery('after', index)}
                      >
                        <img 
                          src={image} 
                          alt={`Po ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                  {project.after_images.length > 4 && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-2" 
                      size="sm"
                      onClick={() => openImageGallery('after', 0)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Zobacz wszystkie ({project.after_images.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Dodatkowe zdjęcia */}
          {allImages.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Galeria projektu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {allImages.slice(1, 5).map((image: string, index: number) => (
                    <div 
                      key={index} 
                      className="aspect-video bg-gray-100 overflow-hidden rounded cursor-pointer"
                      onClick={() => openImageGallery('main', index + 1)}
                    >
                      <img 
                        src={image} 
                        alt={`Galeria ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  ))}
                </div>
                {allImages.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    size="sm"
                    onClick={() => openImageGallery('main', 1)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Zobacz wszystkie ({allImages.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Podsumowanie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Podsumowanie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dodano:</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ostatnia edycja:</span>
                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
                {project.project_value && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Wartość projektu:</span>
                    <span className="font-medium">{project.project_value.toLocaleString()} zł</span>
                  </div>
                )}
                {project.duration_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Czas realizacji:</span>
                    <span>{project.duration_days} dni</span>
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
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => navigate(`/contractor/portfolio/edit/${project.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edytuj projekt
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/contractor/portfolio')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót do portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog galerii zdjęć */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowImageDialog(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            {(() => {
              const images = getCurrentImages();
              const galleryTitles = {
                main: 'Galeria projektu',
                before: 'Zdjęcia przed realizacją',
                after: 'Zdjęcia po realizacji'
              };
              
              return images.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium">{galleryTitles[currentGallery]}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImageIndex + 1} z {images.length}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <img
                      src={images[selectedImageIndex]}
                      alt={`${galleryTitles[currentGallery]} ${selectedImageIndex + 1}`}
                      className="w-full max-h-[60vh] object-contain rounded"
                    />
                    
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <div className="flex justify-center gap-1 max-w-full overflow-x-auto">
                      {images.map((image: string, index: number) => (
                        <button
                          key={index}
                          className={`w-16 h-12 rounded overflow-hidden border-2 flex-shrink-0 ${
                            index === selectedImageIndex ? 'border-blue-500' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};