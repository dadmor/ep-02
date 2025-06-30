// ------ src/pages/marketing-strategies/edit.tsx ------
import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useSelect } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";

export const MarketingStrategyEdit = () => {
  const { goBack, list } = useNavigation();

  const {
    refineCore: { onFinish, queryResult },
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    saveButtonProps,
  } = useForm({
    refineCoreProps: {
      resource: "marketing_strategies",
    },
  });

  const { options: websiteOptions } = useSelect({
    resource: "website_analyses",
    optionLabel: "url",
    optionValue: "id",
  });

  const strategy = queryResult?.data?.data;

  return (
    <>
      <Button variant="outline" onClick={() => goBack()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Marketing Strategy
        </h1>
        <p className="text-muted-foreground">
          Edit strategy: {strategy?.title || "Loading..."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
            <GridBox variant="1-2-2">
              <div className="space-y-2">
                <Label htmlFor="website_analysis_id">Website Analysis *</Label>
                <Select
                  defaultValue={strategy?.website_analysis_id}
                  onValueChange={(value) =>
                    setValue("website_analysis_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select website analysis" />
                  </SelectTrigger>
                  <SelectContent>
                    {websiteOptions?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.website_analysis_id && (
                  <p className="text-sm text-red-500">
                    Website analysis is required
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter strategy title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">
                    {errors.title.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_audience">Target Audience *</Label>
                <Input
                  id="target_audience"
                  {...register("target_audience", {
                    required: "Target audience is required",
                  })}
                  placeholder="e.g., Young professionals, 25-35 years old"
                />
                {errors.target_audience && (
                  <p className="text-sm text-red-500">
                    {errors.target_audience.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_recommendation">
                  Budget Recommendation ($) *
                </Label>
                <Input
                  id="budget_recommendation"
                  type="number"
                  {...register("budget_recommendation", {
                    required: "Budget recommendation is required",
                    min: { value: 0, message: "Budget must be positive" },
                  })}
                  placeholder="10000"
                />
                {errors.budget_recommendation && (
                  <p className="text-sm text-red-500">
                    {errors.budget_recommendation.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry_override">Industry Override</Label>
                <Input
                  id="industry_override"
                  {...register("industry_override")}
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
              </div>
            </GridBox>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes *</Label>
              <Textarea
                id="notes"
                {...register("notes", { required: "Notes are required" })}
                placeholder="Describe the marketing strategy in detail..."
                rows={6}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">
                  {errors.notes.message as string}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => list("marketing_strategies")}
              >
                Cancel
              </Button>
              <Button type="submit" {...saveButtonProps}>
                <Save className="w-4 h-4 mr-2" />
                Update Strategy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
