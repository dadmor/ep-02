import { useShow, useNavigation, useDelete } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, User, Calendar, Shield } from "lucide-react";

export const ProfileShow = () => {
  const { id } = useParams();
  const { list, edit } = useNavigation();
  const { mutate: deleteProfile } = useDelete();

  const { queryResult } = useShow({
    resource: "profiles",
    id: id as string,
  });

  const { data: profile, isLoading, isError } = queryResult;

  if (isLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (isError) {
    return <div className="p-6 text-destructive">Error loading profile</div>;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'user': return 'default';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'moderator': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      deleteProfile({
        resource: "profiles",
        id: id as string,
      }, {
        onSuccess: () => {
          list("profiles");
        },
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => list("profiles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profiles
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Details</h1>
            <p className="text-muted-foreground">
              View profile information
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => edit("profiles", id as string)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Profile Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile Information</span>
              </CardTitle>
              <Badge variant={getRoleColor(profile?.data?.role)} className="flex items-center space-x-1">
                {getRoleIcon(profile?.data?.role)}
                <span>{profile?.data?.role}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Profile ID</h3>
              <p className="text-lg font-mono">{profile?.data?.id}</p>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
              <div className="flex items-center space-x-2 mt-1">
                {getRoleIcon(profile?.data?.role)}
                <span className="text-lg capitalize">{profile?.data?.role}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Short ID</h3>
              <p className="text-lg font-mono">
  #{profile?.data?.id != null ? String(profile.data.id).slice(0, 8) : "unknown"}
</p>
            </div>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.data?.role === 'admin' && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Full system access</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>User management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System configuration</span>
                </div>
              </>
            )}
            
            {profile?.data?.role === 'moderator' && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Content moderation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>User support</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Limited admin access</span>
                </div>
              </>
            )}
            
            {profile?.data?.role === 'user' && (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Basic access</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Profile management</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>No admin rights</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => edit("profiles", id as string)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};