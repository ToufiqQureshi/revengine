// Rooms Page - Room Types Management (Shell)
import { Plus, Search, Grid, List, MoreHorizontal, Bed, Users, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockRoomTypes = [
  {
    id: '1',
    name: 'Deluxe Suite',
    description: 'Spacious suite with city view and premium amenities',
    baseOccupancy: 2,
    maxOccupancy: 4,
    basePrice: 8500,
    totalInventory: 20,
    isActive: true,
    photo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
  },
  {
    id: '2',
    name: 'Executive Room',
    description: 'Modern room with work desk and high-speed WiFi',
    baseOccupancy: 2,
    maxOccupancy: 3,
    basePrice: 5500,
    totalInventory: 40,
    isActive: true,
    photo: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
  },
  {
    id: '3',
    name: 'Standard Room',
    description: 'Comfortable room with essential amenities',
    baseOccupancy: 2,
    maxOccupancy: 2,
    basePrice: 3500,
    totalInventory: 60,
    isActive: true,
    photo: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400',
  },
];

export function RoomsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Room Types</h1>
          <p className="text-muted-foreground">
            Manage your room categories and inventory
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Room Type
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search room types..." className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Room Types Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockRoomTypes.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={room.photo}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
                {room.isActive ? (
                  <Badge className="absolute right-2 top-2 bg-success">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="absolute right-2 top-2">
                    Inactive
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                </div>
                <CardDescription className="line-clamp-2">{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {room.baseOccupancy}-{room.maxOccupancy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {room.totalInventory}
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(room.basePrice)}/night</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockRoomTypes.map((room) => (
                <div key={room.id} className="flex items-center gap-4 p-4">
                  <img
                    src={room.photo}
                    alt={room.name}
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{room.name}</h3>
                      {room.isActive ? (
                        <Badge className="bg-success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{room.description}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {room.baseOccupancy}-{room.maxOccupancy}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Bed className="h-4 w-4" />
                      {room.totalInventory}
                    </span>
                    <span className="font-semibold w-28 text-right">
                      {formatCurrency(room.basePrice)}/night
                    </span>
                  </div>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RoomsPage;
