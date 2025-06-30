import { useForm, useSelect, useOne } from "@refinedev/core";
import { useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const GoogleAdsCampaignEdit = () => {
  const { id } = useParams();
  const { list } = useNavigation();
  const { onFinish, formLoading } = useForm();
  const [targetLocations, setTargetLocations] = useState<string[]>([]);
  const [keywordsFinal, setKeywordsFinal] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: campaignData, isLoading } = useOne({
    resource: "google_ads_campaigns",
    id: id as string,
  });

  const { options: strategyOptions } = useSelect({
    resource: "marketing_strategies",
    optionLabel: "title",
    optionValue: "id",
  });

  useEffect(() => {
    if (campaignData?.data) {
      const campaign = campaignData.data;
      setTargetLocations(campaign.target_locations || []);
      setKeywordsFinal(campaign.keywords_final || []);
      if (campaign.start_date) {
        setStartDate(new Date(campaign.start_date));
      }
      if (campaign.end_date) {
        setEndDate(new Date(campaign.end_date));
      }
    }
  }, [campaignData]);

  const handleSubmit = (data: any) => {
    const formData = {
      ...data,
      target_locations: targetLocations,
      keywords_final: keywordsFinal,
      start_date: startDate?.toISOString().split('T')[0],
      end_date: endDate?.toISOString().split('T')[0],
      budget_daily: data.budget_daily ? parseInt(data.budget_daily) : null,
      budget_total: data.budget_total ? parseInt(data.budget_total) : null,
    };
    onFinish(formData);
  };

  const addLocation = () => {
    if (newLocation.trim() && !targetLocations.includes(newLocation.trim())) {
      setTargetLocations([...targetLocations, newLocation.trim()]);
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setTargetLocations(targetLocations.filter(l => l !== location));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywordsFinal.includes(newKeyword.trim())) {
      setKeywordsFinal([...keywordsFinal, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywordsFinal(keywordsFinal.filter(k => k !== keyword));
  };

  if (isLoading) {
    return <div className="p-6">Loading campaign...</div>;
  }

  const campaign = campaignData?.data;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
        <p className="text-muted-foreground">Update your Google Ads campaign settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="strategy_id">Marketing Strategy</Label>
                <Select name="strategy_id" defaultValue={campaign?.strategy_id} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a marketing strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    {strategyOptions?.map((strategy) => (
                      <SelectItem key={strategy.value} value={strategy.value}>
                        {strategy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input 
                  id="name"
                  name="name"
                  defaultValue={campaign?.name}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={campaign?.status || "draft"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="campaign_type">Campaign Type</Label>
                <Select name="campaign_type" defaultValue={campaign?.campaign_type || "search"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="search">Search</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="app">App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget & Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="budget_daily">Daily Budget ($)</Label>
                <Input 
                  id="budget_daily"
                  name="budget_daily"
                  type="number"
                  defaultValue={campaign?.budget_daily}
                  placeholder="Enter daily budget"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="budget_total">Total Budget ($)</Label>
                <Input 
                  id="budget_total"
                  name="budget_total"
                  type="number"
                  defaultValue={campaign?.budget_total}
                  placeholder="Enter total budget"
                  min="1"
                />
              </div>

              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Target Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Add target location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
              />
              <Button type="button" onClick={addLocation}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {targetLocations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeLocation(location)} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" onClick={addKeyword}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywordsFinal.map((keyword) => (
                <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                  {keyword}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeKeyword(keyword)} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => list("google_ads_campaigns")}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={formLoading}
          >
            {formLoading ? "Updating..." : "Update Campaign"}
          </Button>
        </div>
      </form>
    </>
  );
};
