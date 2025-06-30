import { useNavigation, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, List } from "lucide-react";

export const BlogPostEdit = () => {
  const { list } = useNavigation();

  const {
    refineCore: { onFinish, queryResult },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    refineCoreProps: {
      meta: {
        select: "*, categories(id,title)",
      },
    },
  });

  const blogPostsData = queryResult?.data?.data;
  const watchedStatus = watch("status");

  const { options: categoryOptions } = useSelect({
    resource: "categories",
    defaultValue: blogPostsData?.categories?.id,
  });

  React.useEffect(() => {
    setValue("categoryId", blogPostsData?.categories?.id);
  }, [categoryOptions, setValue, blogPostsData]);

  const isLoading = queryResult?.isLoading;
  const isError = queryResult?.isError;

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6 text-red-500">Error loading post</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => list("blog_posts")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
            <p className="text-muted-foreground">
              Editing: {blogPostsData?.title || "Untitled"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">ID: {blogPostsData?.id}</Badge>
          <Button 
            variant="outline"
            onClick={() => list("blog_posts")}
          >
            <List className="w-4 h-4 mr-2" />
            All Posts
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>
                Edit the main content of your blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title..."
                    {...register("title", {
                      required: "Title is required",
                    })}
                    className={errors?.title ? "border-red-500" : ""}
                  />
                  {errors?.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your blog post content..."
                    rows={12}
                    {...register("content", {
                      required: "Content is required",
                    })}
                    className={errors?.content ? "border-red-500" : ""}
                  />
                  {errors?.content && (
                    <p className="text-sm text-red-500">
                      {errors.content.message as string}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => list("blog_posts")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>
                Configure post metadata and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={watch("categoryId")?.toString() || ""}
                  onValueChange={(value) => setValue("categoryId", parseInt(value))}
                >
                  <SelectTrigger className={errors?.categoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions?.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors?.categoryId && (
                  <p className="text-sm text-red-500">
                    {errors.categoryId.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watchedStatus || "draft"}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger className={errors?.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Draft</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Published</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors?.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message as string}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm text-muted-foreground">Post ID</Label>
                <p className="font-mono text-sm">{blogPostsData?.id}</p>
              </div>
              <div className="border-t my-4"></div>
              <div>
                <Label className="text-sm text-muted-foreground">Current Status</Label>
                <div className="mt-1">
                  <Badge variant={watchedStatus === "published" ? "default" : watchedStatus === "rejected" ? "destructive" : "outline"}>
                    {watchedStatus || blogPostsData?.status || "draft"}
                  </Badge>
                </div>
              </div>
              <div className="border-t my-4"></div>
              <div>
                <Label className="text-sm text-muted-foreground">Created At</Label>
                <p className="text-sm">
                  {blogPostsData?.createdAt ? 
                    new Date(blogPostsData.createdAt).toLocaleDateString() : 
                    "N/A"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};