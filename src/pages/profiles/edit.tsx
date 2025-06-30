import { useForm } from "@refinedev/react-hook-form";
import { useNavigation, useShow } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Eye } from "lucide-react";

export const ProfileEdit = () => {
  const { id } = useParams();
  const { list, show } = useNavigation();
  
  const { queryResult } = useShow({
    resource: "profiles",
    id: id as string,
  });

  const { data: profile, isLoading } = queryResult;

  const {
    refineCore: { onFinish },
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    refineCoreProps: {
      resource: "profiles",
      action: "edit",
      id: id as string,
      redirect: "show",
    },
    defaultValues: {
      id: profile?.data?.id || "",
      role: profile?.data?.role || "user",
    },
  });

  const role = watch("role");

  if (isLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => list("profiles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profiles
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-muted-foreground">
  Modify profile #{String(profile?.data?.id).slice(0, 8)}
</p>

          </div>
        </div>
        <Button variant="outline" onClick={() => show("profiles", id as string)}>
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFinish)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id">Profile ID</Label>
              <Input
                id="id"
                defaultValue={profile?.data?.id}
                disabled
                className="bg-muted"
                {...register("id")}
              />
              <p className="text-sm text-muted-foreground">
                Profile ID cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role || profile?.data?.role || "user"}
                onValueChange={(value) => setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("role", {
                  required: "Role is required",
                })}
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message as string}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => list("profiles")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};