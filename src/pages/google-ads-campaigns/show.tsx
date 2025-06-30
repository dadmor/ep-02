import { useOne, useDelete } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  DollarSign,
  MapPin,
  Target,
  Activity,
  Tag,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { Lead } from "@/components/reader";
import { FlexBox, GridBox } from "@/components/shared";

export const GoogleAdsCampaignShow = () => {
  const { id } = useParams();
  const { list, edit } = useNavigation();
  const { mutate: deleteCampaign } = useDelete();

  const {
    data: campaignData,
    isLoading,
    isError,
  } = useOne({
    resource: "google_ads_campaigns",
    id: id as string,
  });

  const { data: strategyData } = useOne({
    resource: "marketing_strategies",
    id: campaignData?.data?.strategy_id,
    queryOptions: {
      enabled: !!campaignData?.data?.strategy_id,
    },
  });

  if (isLoading) return <div className="p-6">Loading campaign...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error loading campaign</div>;

  const campaign = campaignData?.data;
  const strategy = strategyData?.data;

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

  const getCampaignTypeColor = (type: string) => {
    switch (type) {
      case "search":
        return "default";
      case "display":
        return "secondary";
      case "video":
        return "destructive";
      case "shopping":
        return "outline";
      case "app":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleDelete = () => {
    if (!campaign?.id) return; // zabezpieczenie

    if (
      confirm(
        "Are you sure you want to delete this campaign? This action cannot be undone."
      )
    ) {
      deleteCampaign({
        resource: "google_ads_campaigns",
        id: campaign.id,
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => list("google_ads_campaigns")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Campaigns
      </Button>

      <FlexBox>
        <Lead
          title={campaign?.name}
          description={`Campaign ID: ${campaign?.id}`}
        ></Lead>

        <FlexBox>
          <Button
            variant="outline"
            onClick={() => {
              if (campaign?.id) {
                edit("google_ads_campaigns", campaign.id);
              }
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </FlexBox>
      </FlexBox>

      <GridBox>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={getStatusColor(campaign?.status)}
              className="text-sm"
            >
              {campaign?.status?.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Type</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={getCampaignTypeColor(campaign?.campaign_type)}
              className="text-sm"
            >
              {campaign?.campaign_type?.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign?.budget_daily ? `$${campaign.budget_daily}` : "Not set"}
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <GridBox variant="1-2-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-medium">Daily Budget:</span>
              <span>
                {campaign?.budget_daily
                  ? `$${campaign.budget_daily}`
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Budget:</span>
              <span>
                {campaign?.budget_total
                  ? `$${campaign.budget_total}`
                  : "Not set"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Budget Utilization:</span>
              <span className="text-muted-foreground">
                {campaign?.budget_daily && campaign?.budget_total
                  ? `${Math.round(
                      ((campaign.budget_daily * 30) / campaign.budget_total) *
                        100
                    )}% monthly`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span className="font-medium">Start Date:</span>
              <span>
                {campaign?.start_date
                  ? new Date(campaign.start_date).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">End Date:</span>
              <span>
                {campaign?.end_date
                  ? new Date(campaign.end_date).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-medium">Duration:</span>
              <span className="text-muted-foreground">
                {campaign?.start_date && campaign?.end_date
                  ? `${Math.ceil(
                      (new Date(campaign.end_date).getTime() -
                        new Date(campaign.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )} days`
                  : "Ongoing"}
              </span>
            </div>
          </CardContent>
        </Card>
      </GridBox>

      {strategy && (
        <Card>
          <CardHeader>
            <CardTitle>Marketing Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Lead
                variant="md"
                title="Strategy Title:"
                description={strategy.title}
              />

              <div>
                <span className="font-medium">Target Audience:</span>
                <p className="text-muted-foreground">
                  {strategy.target_audience}
                </p>
              </div>
              <div>
                <span className="font-medium">Recommended Budget:</span>
                <p className="text-muted-foreground">
                  ${strategy.budget_recommendation}
                </p>
              </div>
              <div>
                <span className="font-medium">Industry:</span>
                <p className="text-muted-foreground">
                  {strategy.industry_override || "Default"}
                </p>
              </div>
            </div>
            {strategy.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="text-muted-foreground mt-1">{strategy.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <GridBox variant="1-2-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Target Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign?.target_locations &&
            campaign.target_locations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {campaign.target_locations.map(
                  (location: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {location}
                    </Badge>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No target locations specified
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaign?.keywords_final && campaign.keywords_final.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {campaign.keywords_final.length} keywords
                </div>
                <div className="flex flex-wrap gap-2">
                  {campaign.keywords_final.map(
                    (keyword: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {keyword}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No keywords specified</p>
            )}
          </CardContent>
        </Card>
      </GridBox>

      {campaign?.ad_groups && (
        <Card>
          <CardHeader>
            <CardTitle>Ad Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.ad_groups ? (
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(campaign.ad_groups, null, 2)}
              </pre>
            ) : (
              <p className="text-muted-foreground">No ad groups configured</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Created:</span>
            <span className="text-muted-foreground">
              {campaign?.created_at
                ? new Date(campaign.created_at).toLocaleString()
                : "Unknown"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium">Last Updated:</span>
            <span className="text-muted-foreground">
              {campaign?.updated_at
                ? new Date(campaign.updated_at).toLocaleString()
                : "Unknown"}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
