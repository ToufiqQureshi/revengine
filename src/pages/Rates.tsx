// Rates Page - Rate Plans Management (Real API)
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Loader2, Save } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/api/client';
import { RatePlan } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

const mealPlanLabels: Record<string, string> = {
  RO: 'Room Only',
  BB: 'Bed & Breakfast',
  HB: 'Half Board',
  FB: 'Full Board',
  AI: 'All Inclusive',
};

export function RatesPage() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_plan: 'RO',
    is_refundable: true,
    cancellation_hours: '24',
    is_active: true
  });

  const fetchRatePlans = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<RatePlan[]>('/rates/plans');
      setRatePlans(data);
    } catch (error) {
      console.error('Failed to fetch rate plans:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load rate plans.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatePlans();
  }, []);

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/rates/plans', {
        ...formData,
        cancellation_hours: Number(formData.cancellation_hours)
      });
      toast({
        title: 'Rate Plan Created',
        description: 'New rate plan has been added successfully.',
      });
      setIsDialogOpen(false);
      fetchRatePlans(); // Refresh list
      // Reset form
      setFormData({
        name: '',
        description: '',
        meal_plan: 'RO',
        is_refundable: true,
        cancellation_hours: '24',
        is_active: true
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create rate plan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate plan?')) return;
    try {
      await apiClient.delete(`/rates/plans/${id}`);
      toast({
        title: 'Rate Plan Deleted',
        description: 'Rate plan has been removed.',
      });
      setRatePlans(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete rate plan.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rate plans...</span>
      </div>
    );
  }

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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Rate Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Rate Plan</DialogTitle>
              <DialogDescription>
                Create a new rate plan for your rooms.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Standard Rate"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="mealPlan">Meal Plan</Label>
                  <Select
                    value={formData.meal_plan}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, meal_plan: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RO">Room Only</SelectItem>
                      <SelectItem value="BB">Bed & Breakfast</SelectItem>
                      <SelectItem value="HB">Half Board</SelectItem>
                      <SelectItem value="FB">Full Board</SelectItem>
                      <SelectItem value="AI">All Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Cancellation (Hours)</Label>
                  <Input
                    id="hours"
                    type="number"
                    value={formData.cancellation_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, cancellation_hours: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="refundable">Refundable?</Label>
                <Switch
                  id="refundable"
                  checked={formData.is_refundable}
                  onCheckedChange={(val) => setFormData(prev => ({ ...prev, is_refundable: val }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!formData.name || isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
          {ratePlans.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No rate plans found. Create one to get started.
            </div>
          ) : (
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
                {ratePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mealPlanLabels[plan.meal_plan] || plan.meal_plan}</Badge>
                    </TableCell>
                    <TableCell>
                      {plan.is_refundable ? (
                        <span className="text-sm">
                          Free cancellation up to {plan.cancellation_hours}h before
                        </span>
                      ) : (
                        <span className="text-sm text-destructive">Non-refundable</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
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
                          <DropdownMenuItem onClick={() => handleDelete(plan.id)} className="text-destructive">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default RatesPage;
