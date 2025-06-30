import { useNavigation, useSelect } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, List, Plus } from "lucide-react";

export const BlogPostCreate = () => {
  const { list } = useNavigation();

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({});

  const { options: categoryOptions } = useSelect({
    resource: "categories",
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Create New Blog Post</h1>
            <p className="text-muted-foreground">
              Write and publish a new blog post
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            <Plus className="w-3 h-3 mr-1" />
            New Post
          </Badge>
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
                Create the main content of your blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter an engaging title for your post..."
                    {...register("title", {
                      required: "Title is required",
                      minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters long"
                      }
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
                    placeholder="Write your blog post content here..."
                    rows={12}
                    {...register("content", {
                      required: "Content is required",
                      minLength: {
                        value: 10,
                        message: "Content must be at least 10 characters long"
                      }
                    })}
                    className={errors?.content ? "border-red-500" : ""}
                  />
                  {errors?.content && (
                    <p className="text-sm text-red-500">
                      {errors.content.message as string}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {watch("content")?.length || 0} characters
                  </p>
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
                    {isSubmitting ? "Creating..." : "Create Post"}
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
                Configure your post metadata and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select
                  id="categoryId"
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.categoryId ? "border-red-500" : ""}`}
                  {...register("categoryId", {
                    required: "Please select a category",
                  })}
                >
                  <option value="">Select a category</option>
                  {categoryOptions?.map((option) => (
                    <option 
                      key={option.value} 
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors?.categoryId && (
                  <p className="text-sm text-red-500">
                    {errors.categoryId.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors?.status ? "border-red-500" : ""}`}
                  {...register("status", {
                    required: "Please select a status",
                  })}
                  defaultValue="draft"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
                </select>
                {errors?.status && (
                  <p className="text-sm text-red-500">
                    {errors.status.message as string}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  You can change this later
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Live preview of your post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="text-sm text-muted-foreground">Title</Label>
                <p className="font-semibold text-sm">
                  {watch("title") || "Untitled Post"}
                </p>
              </div>
              <div className="border-t my-4"></div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={watch("status") === "published" ? "default" : watch("status") === "rejected" ? "destructive" : "outline"}>
                    {watch("status") || "draft"}
                  </Badge>
                </div>
              </div>
              <div className="border-t my-4"></div>
              <div>
                <Label className="text-sm text-muted-foreground">Content Preview</Label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {watch("content")?.substring(0, 100) || "No content yet..."}
                  {watch("content")?.length > 100 && "..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};