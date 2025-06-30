import { useTable, useNavigation, useDelete } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus, User } from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";

export const ProfileList = () => {
  const { tableQueryResult, current, setCurrent, pageSize, setFilters } =
    useTable();
  const { create, edit, show } = useNavigation();
  const { mutate: deleteProfile } = useDelete();

  const { data, isLoading, isError } = tableQueryResult;

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Error loading profiles</div>;

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "user":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <>
      <FlexBox>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">Manage user profiles</p>
        </div>
        <Button onClick={() => create("profiles")}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Profile
        </Button>
      </FlexBox>

      <FlexBox variant="start">
        <Input
          placeholder="Search profiles..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "role",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      <GridBox>
        {data?.data?.map((profile: any) => (
          <Card key={profile.id}>
            <CardHeader>
              <FlexBox>
                <Badge variant={getRoleColor(profile.role)}>
                  {profile.role}
                </Badge>
                <User className="w-5 h-5 text-muted-foreground" />
              </FlexBox>
              <CardTitle>Profile #{profile.id.slice(0, 8)}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">ID:</span> {profile.id}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Role:</span> {profile.role}
              </div>
            </CardContent>

            <CardFooter>
              <FlexBox>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => show("profiles", profile.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => edit("profiles", profile.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </FlexBox>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete this profile?")
                  ) {
                    deleteProfile({
                      resource: "profiles",
                      id: profile.id,
                    });
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </GridBox>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {(current - 1) * pageSize + 1} to{" "}
          {Math.min(current * pageSize, data?.total || 0)} of {data?.total || 0}{" "}
          profiles
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
    </>
  );
};
