import { useNavigation, useOne, useResource, useShow } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, List } from "lucide-react";

export const BlogPostShow = () => {
  const { edit, list } = useNavigation();
  const { id } = useResource();
  const { queryResult } = useShow({
    meta: {
      select: "*, categories(id,title)",
    },
  });
  const { data, isLoading, isError } = queryResult;

  const record = data?.data;

  const { data: categoryData, isLoading: categoryIsLoading } = useOne({
    resource: "categories",
    id: record?.categories?.id || "",
    queryOptions: {
      enabled: !!record,
    },
  });

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
            <h1 className="text-3xl font-bold tracking-tight">Blog Post Details</h1>
            <p className="text-muted-foreground">View blog post information</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => list("blog_posts")}
          >
            <List className="w-4 h-4 mr-2" />
            All Posts
          </Button>
          <Button onClick={() => edit("blog_posts", id ?? "")}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Post
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Post Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {categoryIsLoading ? (
                        "Loading..."
                      ) : (
                        categoryData?.data?.title || "Uncategorized"
                      )}
                    </Badge>
                    <Badge variant={record?.status === "published" ? "default" : "outline"}>
                      {record?.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold leading-tight">
                    {record?.title}
                  </CardTitle>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  #{record?.id}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {record?.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h6 className="text-sm font-medium text-muted-foreground mb-1">ID</h6>
                <p className="font-mono text-sm">{record?.id}</p>
              </div>
              
              <Separator />
              
              <div>
                <h6 className="text-sm font-medium text-muted-foreground mb-1">Category</h6>
                <div className="flex items-center">
                  {categoryIsLoading ? (
                    <span className="text-sm">Loading...</span>
                  ) : (
                    <Badge variant="secondary">
                      {categoryData?.data?.title || "Uncategorized"}
                    </Badge>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h6 className="text-sm font-medium text-muted-foreground mb-1">Status</h6>
                <Badge variant={record?.status === "published" ? "default" : "outline"}>
                  {record?.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div>
                <h6 className="text-sm font-medium text-muted-foreground mb-1">Created At</h6>
                <p className="text-sm">
                  {record?.createdAt ? new Date(record.createdAt).toLocaleString(undefined, {
                    timeZone: "UTC",
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
              <CardDescription>
                Manage this blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => edit("blog_posts", id ?? "")}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => list("blog_posts")}
              >
                <List className="w-4 h-4 mr-2" />
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};