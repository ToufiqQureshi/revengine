// Availability Page - Calendar View (Shell)
import { ChevronLeft, ChevronRight, Edit2, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data
const mockRoomTypes = [
  { id: '1', name: 'Deluxe Suite', totalInventory: 20 },
  { id: '2', name: 'Executive Room', totalInventory: 40 },
  { id: '3', name: 'Standard Room', totalInventory: 60 },
];

const generateDates = (startDate: Date, days: number) => {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const generateMockAvailability = (roomTypeId: string, totalInventory: number, dates: Date[]) => {
  return dates.map((date) => {
    const booked = Math.floor(Math.random() * totalInventory * 0.8);
    const isBlocked = Math.random() < 0.05;
    return {
      date: date.toISOString().split('T')[0],
      totalRooms: totalInventory,
      bookedRooms: isBlocked ? totalInventory : booked,
      availableRooms: isBlocked ? 0 : totalInventory - booked,
      isBlocked,
    };
  });
};

export function AvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dates = generateDates(currentMonth, 14);

  const getAvailabilityColor = (available: number, total: number, isBlocked: boolean) => {
    if (isBlocked) return 'bg-muted text-muted-foreground';
    const ratio = available / total;
    if (ratio === 0) return 'bg-destructive/10 text-destructive';
    if (ratio < 0.3) return 'bg-warning/10 text-warning';
    return 'bg-success/10 text-success';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 14 : -14));
    setCurrentMonth(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground">
            Manage room inventory and block dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Bulk Edit
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[200px] text-center font-medium">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Room Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Room Types</SelectItem>
            {mockRoomTypes.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-success/20"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-warning/20"></div>
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-destructive/20"></div>
          <span>Sold Out</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted"></div>
          <span>Blocked</span>
        </div>
      </div>

      {/* Availability Grid */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <div className="min-w-[900px]">
            {/* Header Row - Dates */}
            <div className="grid grid-cols-[180px_repeat(14,1fr)] border-b bg-muted/30">
              <div className="p-3 font-medium">Room Type</div>
              {dates.map((date) => (
                <div
                  key={date.toISOString()}
                  className="p-2 text-center text-xs border-l"
                >
                  <div className="font-medium">{formatDate(date)}</div>
                </div>
              ))}
            </div>

            {/* Room Type Rows */}
            {mockRoomTypes.map((room) => {
              const availability = generateMockAvailability(room.id, room.totalInventory, dates);
              return (
                <div
                  key={room.id}
                  className="grid grid-cols-[180px_repeat(14,1fr)] border-b last:border-0"
                >
                  <div className="p-3 flex items-center">
                    <span className="font-medium text-sm">{room.name}</span>
                  </div>
                  {availability.map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 border-l flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${getAvailabilityColor(day.availableRooms, day.totalRooms, day.isBlocked)}`}
                    >
                      {day.isBlocked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <>
                          <span className="text-sm font-semibold">{day.availableRooms}</span>
                          <span className="text-[10px] text-muted-foreground">
                            /{day.totalRooms}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Select date range and room type to update</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline" className="gap-2">
            <Lock className="h-4 w-4" />
            Block Dates
          </Button>
          <Button variant="outline" className="gap-2">
            <Unlock className="h-4 w-4" />
            Unblock Dates
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit2 className="h-4 w-4" />
            Set Inventory
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default AvailabilityPage;
