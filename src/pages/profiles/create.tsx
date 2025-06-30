import { useForm } from "@refinedev/react-hook-form";
import { useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";

export const ProfileCreate = () => {
  const { list } = useNavigation();
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
      action: "create",
      redirect: "list",
    },
  });

  const role = watch("role");

  return (
    <>
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => list("profiles")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profiles
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Profile</h1>
          <p className="text-muted-foreground">Add a new user profile</p>
        </div>
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
                placeholder="Enter unique profile ID"
                {...register("id", {
                  required: "Profile ID is required",
                })}
              />
              {errors.id && (
                <p className="text-sm text-destructive">{errors.id.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role || "user"}
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
                {isSubmitting ? "Creating..." : "Create Profile"}
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