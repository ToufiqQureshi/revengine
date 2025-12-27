// Rooms Page - Room Types Management with Real API
import { Plus, Search, Grid, List, MoreHorizontal, Bed, Users, Edit, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { RoomDialog } from '@/components/rooms/RoomDialog';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { RoomType } from '@/types/api';

export function RoomsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);

  const { toast } = useToast();

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<RoomType[]>('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load rooms. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateOpen = () => {
    setSelectedRoom(null);
    setIsDialogOpen(true);
  };

  const handleEditOpen = (room: RoomType) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room type?")) return;

    try {
      await apiClient.delete(`/rooms/${roomId}`);
      toast({
        title: 'Deleted',
        description: 'Room type deleted successfully!',
      });
      fetchRooms();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete room',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading rooms...</span>
      </div>
    );
  }

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
        <Button className="gap-2" onClick={handleCreateOpen}>
          <Plus className="h-4 w-4" />
          Add Room Type
        </Button>
      </div>

      <RoomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={fetchRooms}
        initialData={selectedRoom}
      />

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

      {/* Empty State */}
      {rooms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bed className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Room Types Yet</h3>
            <p className="text-muted-foreground text-center mt-1">
              Get started by adding your first room type.
            </p>
            <Button className="mt-4" onClick={handleCreateOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Room Types Grid */}
      {rooms.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                {room.photos && room.photos.length > 0 ? (
                  <img
                    src={room.photos[0].url}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <Bed className="h-12 w-12 text-muted-foreground" />
                )}
                {room.is_active ? (
                  <Badge className="absolute right-2 top-2 bg-green-600">Active</Badge>
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
                      <DropdownMenuItem onClick={() => handleEditOpen(room)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">{room.description || 'No description'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {room.base_occupancy}-{room.max_occupancy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {room.total_inventory}
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(room.base_price)}/night</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {rooms.length > 0 && viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    {room.photos && room.photos.length > 0 ? (
                      <img
                        src={room.photos[0].url}
                        alt={room.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Bed className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{room.name}</h3>
                      {room.is_active ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{room.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {room.base_occupancy}-{room.max_occupancy}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Bed className="h-4 w-4" />
                      {room.total_inventory}
                    </span>
                    <span className="font-semibold w-28 text-right">
                      {formatCurrency(room.base_price)}/night
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditOpen(room)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
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
