// Rates Page - Rate Plans Management (Shell)
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockRatePlans = [
  {
    id: '1',
    name: 'Standard Rate',
    description: 'Flexible booking with free cancellation',
    mealPlan: 'RO',
    isRefundable: true,
    cancellationHours: 24,
    isActive: true,
  },
  {
    id: '2',
    name: 'Bed & Breakfast',
    description: 'Room rate includes breakfast',
    mealPlan: 'BB',
    isRefundable: true,
    cancellationHours: 48,
    isActive: true,
  },
  {
    id: '3',
    name: 'Non-Refundable',
    description: 'Best price with no cancellation',
    mealPlan: 'RO',
    isRefundable: false,
    cancellationHours: 0,
    isActive: true,
  },
  {
    id: '4',
    name: 'Half Board',
    description: 'Breakfast and dinner included',
    mealPlan: 'HB',
    isRefundable: true,
    cancellationHours: 72,
    isActive: false,
  },
];

const mealPlanLabels: Record<string, string> = {
  RO: 'Room Only',
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  AI: 'All Inclusive',
};

export function RatesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rate Plans</h1>
          <p className="text-muted-foreground">
            Configure your pricing strategies and rate plans
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Rate Plan
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search rate plans..." className="pl-10" />
        </div>
      </div>

      {/* Rate Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rate Plans</CardTitle>
          <CardDescription>
            Manage your rate plans and their cancellation policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Meal Plan</TableHead>
                <TableHead>Cancellation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRatePlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{mealPlanLabels[plan.mealPlan]}</Badge>
                  </TableCell>
                  <TableCell>
                    {plan.isRefundable ? (
                      <span className="text-sm">
                        Free cancellation up to {plan.cancellationHours}h before
                      </span>
                    ) : (
                      <span className="text-sm text-destructive">Non-refundable</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.isActive ? (
                      <Badge className="bg-success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default RatesPage;
