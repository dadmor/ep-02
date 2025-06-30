import { useList, useNavigation, useDelete } from "@refinedev/core";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  Target,
  Globe,
  X,
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";

export const GoogleAdsCampaignList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("all");
  const [current, setCurrent] = useState(1);
  const pageSize = 10;

  // Pobierz listę wszystkich analiz (z ID i URL) dla filtra
  const { data: urlsData } = useList({
    resource: "website_analyses",
    meta: {
      select: "id, url, created_at",
    },
    pagination: { pageSize: 1000 }, // Pobierz wszystkie analizy
    sorters: [
      {
        field: "url",
        order: "asc",
      },
      {
        field: "created_at",
        order: "desc",
      },
    ],
  });

  // Pobierz strategie dla wybranej analizy (potrzebne do filtrowania)
  const { data: strategiesData } = useList({
    resource: "marketing_strategies",
    meta: {
      select: "id",
    },
    filters:
      selectedUrl && selectedUrl !== "all"
        ? [
            {
              field: "website_analysis_id",
              operator: "eq" as const,
              value: selectedUrl,
            },
          ]
        : [],
    pagination: { pageSize: 1000 },
  });

  // Reset paginacji gdy zmieniają się filtry
  useEffect(() => {
    setCurrent(1);
  }, [searchTerm, selectedUrl]);

  // Budowanie filtrów - POPRAWKA dla relacji
  const filters: any[] = [];
  if (searchTerm) {
    filters.push({
      field: "name",
      operator: "contains" as const,
      value: searchTerm,
    });
  }
  if (selectedUrl && selectedUrl !== "all" && strategiesData?.data?.length) {
    // Filtruj po strategy_id używając ID strategii związanych z wybraną analizą
    const strategyIds = strategiesData.data.map((strategy: any) => strategy.id);
    filters.push({
      field: "strategy_id",
      operator: "in" as const,
      value: strategyIds,
    });
  }

  const { data, isLoading, isError } = useList({
    resource: "google_ads_campaigns",
    pagination: {
      current,
      pageSize,
    },
    // POPRAWKA: usunięcie 'mode' - filtry są aplikowane jako tablica
    filters: filters,
    meta: {
      select:
        "*, strategy:marketing_strategies(title, website_analysis:website_analyses(url))",
    },
  });

  const { create, edit, show } = useNavigation();
  const { mutate: deleteCampaign } = useDelete();

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error loading campaigns</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "paused":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <FlexBox>
        <Lead
          title={`Google Ads Campaigns`}
          description={`Manage your Google Ads campaigns`}
        ></Lead>
        <Button onClick={() => create("google_ads_campaigns")}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Campaign
        </Button>
      </FlexBox>

      <FlexBox
        variant="start"
        className="flex-col sm:flex-row  sm:items-center"
      >
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <FlexBox variant="start">
          <Select value={selectedUrl} onValueChange={setSelectedUrl}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by website..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All websites</SelectItem>
              {urlsData?.data?.map((analysis: any) => (
                <SelectItem key={analysis.id} value={analysis.id}>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {analysis.url}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      #{analysis.id.slice(0, 8)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUrl && selectedUrl !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUrl("all")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </FlexBox>
      </FlexBox>

      {/* Active Filters */}
      {(searchTerm || (selectedUrl && selectedUrl !== "all")) && (
        <FlexBox variant="start">
          <span className="text-sm font-medium">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Name: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setSearchTerm("")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {selectedUrl && selectedUrl !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Website:{" "}
              {
                urlsData?.data?.find((analysis) => analysis.id === selectedUrl)
                  ?.url
              }
              <span className="text-xs">#{selectedUrl.slice(0, 8)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setSelectedUrl("all")}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedUrl("all");
            }}
          >
            Clear all
          </Button>
        </FlexBox>
      )}

      <GridBox variant="1-2-2">
        {data?.data?.map((campaign: any) => (
          <Card key={campaign.id}>
            <CardHeader>
              <FlexBox>
                <FlexBox>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline">{campaign.campaign_type}</Badge>
                </FlexBox>
                <span className="text-sm text-muted-foreground">
                  #{campaign.id.slice(0, 8)}
                </span>
              </FlexBox>
              <CardTitle>{campaign.name}</CardTitle>

              <CardDescription className="text-sm text-muted-foreground mt-3">
                {campaign.strategy && (
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4" />
                    Strategy: {campaign.strategy.title}
                  </div>
                )}
                {campaign.strategy?.website_analysis?.url && (
                  <div className="flex items-center gap-1 mb-1">
                    <Globe className="w-4 h-4" />
                    {campaign.strategy.website_analysis.url}
                  </div>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {campaign.budget_daily && (
                <FlexBox>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Daily Budget
                  </span>
                  <Badge variant="outline">${campaign.budget_daily}</Badge>
                </FlexBox>
              )}

              {campaign.budget_total && (
                <FlexBox>
                  <span className="text-sm font-medium">Total Budget</span>
                  <Badge variant="outline">${campaign.budget_total}</Badge>
                </FlexBox>
              )}

              {(campaign.start_date || campaign.end_date) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {campaign.start_date &&
                    new Date(campaign.start_date).toLocaleDateString()}
                  {campaign.start_date && campaign.end_date && " - "}
                  {campaign.end_date &&
                    new Date(campaign.end_date).toLocaleDateString()}
                </div>
              )}

              {campaign.target_locations &&
                campaign.target_locations.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {campaign.target_locations
                        .slice(0, 2)
                        .map((location: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {location}
                          </Badge>
                        ))}
                      {campaign.target_locations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{campaign.target_locations.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              {campaign.keywords_final &&
                campaign.keywords_final.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {campaign.keywords_final.length} keywords
                  </div>
                )}

              <div className="text-xs text-muted-foreground">
                Created: {new Date(campaign.created_at).toLocaleDateString()}
              </div>
            </CardContent>

            <CardFooter>
              <FlexBox>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => show("google_ads_campaigns", campaign.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => edit("google_ads_campaigns", campaign.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </FlexBox>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete this campaign?")
                  ) {
                    deleteCampaign({
                      resource: "google_ads_campaigns",
                      id: campaign.id,
                    });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </GridBox>

      {/* Pagination */}
      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="campaigns"
      />
    </>
  );
};
