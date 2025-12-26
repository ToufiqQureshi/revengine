// Bookings Page - Booking Management (Shell)
import { Plus, Search, Filter, Eye, Edit, X, MoreHorizontal } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data
const mockBookings = [
  {
    id: 'BK-2024-001',
    guest: { name: 'Rajesh Kumar', email: 'rajesh@email.com' },
    room: 'Deluxe Suite',
    checkIn: '2024-01-15',
    checkOut: '2024-01-18',
    status: 'confirmed',
    total: 25500,
    source: 'direct',
  },
  {
    id: 'BK-2024-002',
    guest: { name: 'Priya Sharma', email: 'priya@email.com' },
    room: 'Executive Room',
    checkIn: '2024-01-16',
    checkOut: '2024-01-19',
    status: 'pending',
    total: 16500,
    source: 'booking_engine',
  },
  {
    id: 'BK-2024-003',
    guest: { name: 'Amit Patel', email: 'amit@email.com' },
    room: 'Standard Room',
    checkIn: '2024-01-17',
    checkOut: '2024-01-20',
    status: 'checked_in',
    total: 10500,
    source: 'manual',
  },
  {
    id: 'BK-2024-004',
    guest: { name: 'Sunita Gupta', email: 'sunita@email.com' },
    room: 'Deluxe Suite',
    checkIn: '2024-01-10',
    checkOut: '2024-01-12',
    status: 'checked_out',
    total: 17000,
    source: 'direct',
  },
  {
    id: 'BK-2024-005',
    guest: { name: 'Vikram Singh', email: 'vikram@email.com' },
    room: 'Executive Room',
    checkIn: '2024-01-20',
    checkOut: '2024-01-22',
    status: 'cancelled',
    total: 11000,
    source: 'booking_engine',
  },
];

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  checked_in: { label: 'Checked In', variant: 'secondary' },
  checked_out: { label: 'Checked Out', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export function BookingsPage() {
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
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            View and manage all reservations
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by guest name or booking ID..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">Checked In</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.guest.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{booking.room}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={statusConfig[booking.status]?.variant || 'default'}
                      className={booking.status === 'confirmed' ? 'bg-success hover:bg-success/80' : ''}
                    >
                      {statusConfig[booking.status]?.label || booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(booking.total)}
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Booking
                        </DropdownMenuItem>
                        {booking.status !== 'cancelled' && (
                          <DropdownMenuItem className="text-destructive">
                            <X className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
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

export default BookingsPage;
