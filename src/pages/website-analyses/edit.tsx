import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Real Estate",
  "Food & Beverage",
  "Travel",
  "Fashion",
  "Automotive",
];

export const WebsiteAnalysisEdit = () => {
  const { list, show } = useNavigation();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const {
    refineCore: { onFinish, queryResult },
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const data = queryResult?.data;
  const isLoading = queryResult?.isLoading;
  const record = data?.data;

  useEffect(() => {
    if (record) {
      reset({
        url: record.url,
        description: record.description,
        industry: record.industry,
        keywords: record.keywords || [],
      });
      setKeywords(record.keywords || []);
    }
  }, [record, reset]);

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      setValue("keywords", newKeywords);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter((k) => k !== keywordToRemove);
    setKeywords(newKeywords);
    setValue("keywords", newKeywords);
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Analysis not found</p>
          <Button className="mt-4" onClick={() => list("website_analyses")}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => show("website_analyses", record.id!)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            ID: #{String(record.id).slice(0, 8)}
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Edit Website Analysis
        </h1>
        <p className="text-muted-foreground">
          Update the website analysis information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="url">Website URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  {...register("url", {
                    required: "URL is required",
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Please enter a valid URL",
                    },
                  })}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">
                    {errors.url.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={watch("industry")}
                  onValueChange={(value) => setValue("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-red-500">
                    {errors.industry.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the website's purpose, target audience, and main features..."
                rows={4}
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 20,
                    message: "Description must be at least 20 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Keywords *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a keyword..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={handleKeywordKeyPress}
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-red-500">
                  At least one keyword is required
                </p>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {record.created_at
                    ? new Date(record.created_at).toLocaleDateString()
                    : "-"}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {record.updated_at
                    ? new Date(record.updated_at).toLocaleDateString()
                    : "-"}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => show("website_analyses", record.id!)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || keywords.length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
