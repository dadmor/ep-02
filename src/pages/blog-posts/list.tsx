import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus } from "lucide-react";

export const BlogPostList = () => {
  const { tableQueryResult, current, setCurrent, pageSize, setPageSize, filters, setFilters } = useTable();
  const { create, edit, show } = useNavigation();
  const { mutate: deletePost } = useDelete();

  const { data, isLoading, isError } = tableQueryResult;

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6 text-red-500">Error loading posts</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button onClick={() => create("blog_posts")}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Post
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search posts..." 
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "title",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.data?.map((post: any) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="mb-2">
                  {post.category?.title || "Uncategorized"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  #{post.id}
                </span>
            </div>
              <CardTitle className="text-lg font-semibold leading-tight">
                {post.title}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-2">
                {post.content?.substring(0, 100)}...
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Badge variant={post.status === "published" ? "default" : "outline"}>
                  {post.status}
                </Badge>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log("Show clicked for post:", post.id);
                    show("blog_posts", post.id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log("Edit clicked for post:", post.id);
                    edit("blog_posts", post.id);
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this post?")) {
                    deletePost({
                      resource: "blog_posts",
                      id: post.id,
                    });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((current - 1) * pageSize) + 1} to {Math.min(current * pageSize, data?.total || 0)} of {data?.total || 0} posts
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrent(current - 1)}
            disabled={current === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrent(current + 1)}
            disabled={current * pageSize >= (data?.total || 0)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};