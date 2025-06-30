import { useTable, useNavigation, useDelete } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Edit, Trash2, Plus, DollarSign } from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";

export const MarketingStrategyList = () => {
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable();
  const { create, edit, show } = useNavigation();
  const { mutate: deleteStrategy } = useDelete();

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  return (
    <>
      <FlexBox>
        <Lead
          title={`Marketing Strategies`}
          description={`Manage your marketing strategies`}
        />

        <Button onClick={() => create("marketing_strategies")}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Strategy
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Search strategies..."
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
      </FlexBox>

      <GridBox>
        {data?.data?.map((strategy: any) => (
          <Card key={strategy.id}>
            <CardHeader>
              <FlexBox>
                <Badge variant="secondary" className="mb-2">
                  {strategy.industry_override || "General"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  #{strategy.id.slice(0, 8)}
                </span>
              </FlexBox>
              <Lead
                title={strategy.title}
                description={`${strategy.target_audience?.substring(
                  0,
                  200
                )}...`}
                variant="card"
              />
            </CardHeader>

            <CardContent>
              <FlexBox>
                <span className="text-sm font-medium flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Budget Recommendation
                </span>
                <Badge variant="outline">
                  ${strategy.budget_recommendation?.toLocaleString()}
                </Badge>
              </FlexBox>
              <div className="text-sm text-muted-foreground">
                {strategy.notes?.substring(0, 80)}...
              </div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(strategy.created_at).toLocaleDateString()}
              </div>
            </CardContent>

            <CardFooter>
              <FlexBox>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => show("marketing_strategies", strategy.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => edit("marketing_strategies", strategy.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </FlexBox>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (
                    confirm("Are you sure you want to delete this strategy?")
                  ) {
                    deleteStrategy({
                      resource: "marketing_strategies",
                      id: strategy.id,
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
      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="strategies"
      />
    </>
  );
};
