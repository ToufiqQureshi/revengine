// Dashboard Home Page - Key metrics and overview
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  CalendarX,
  CreditCard,
  Users,
  Bed,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for dashboard stats
const mockStats = {
  todayArrivals: 12,
  todayDepartures: 8,
  currentOccupancy: 78,
  todayRevenue: 245000,
  pendingBookings: 5,
  totalRooms: 120,
  occupancyChange: 5.2,
  revenueChange: 12.5,
};

const mockRecentBookings = [
  { id: 'BK001', guest: 'Rajesh Kumar', room: 'Deluxe Suite', checkIn: '2024-01-15', status: 'confirmed' },
  { id: 'BK002', guest: 'Priya Sharma', room: 'Standard Room', checkIn: '2024-01-15', status: 'pending' },
  { id: 'BK003', guest: 'Amit Patel', room: 'Executive Room', checkIn: '2024-01-16', status: 'confirmed' },
  { id: 'BK004', guest: 'Sunita Gupta', room: 'Deluxe Suite', checkIn: '2024-01-16', status: 'confirmed' },
];

export function DashboardPage() {
  const { hotel, user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: hotel?.settings.currency || 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening at {hotel?.name}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Arrivals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Arrivals</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.todayArrivals}</div>
            <p className="text-xs text-muted-foreground">
              guests checking in today
            </p>
          </CardContent>
        </Card>

        {/* Today's Departures */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Departures</CardTitle>
            <CalendarX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.todayDepartures}</div>
            <p className="text-xs text-muted-foreground">
              guests checking out today
            </p>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.currentOccupancy}%</div>
            <div className="flex items-center text-xs">
              {mockStats.occupancyChange > 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-success" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
              )}
              <span className={mockStats.occupancyChange > 0 ? 'text-success' : 'text-destructive'}>
                {Math.abs(mockStats.occupancyChange)}%
              </span>
              <span className="ml-1 text-muted-foreground">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockStats.todayRevenue)}</div>
            <div className="flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-success" />
              <span className="text-success">{mockStats.revenueChange}%</span>
              <span className="ml-1 text-muted-foreground">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{mockStats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              require confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              rooms across all types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(4500)}</div>
            <p className="text-xs text-muted-foreground">
              per occupied room
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>Latest booking activity at your property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{booking.guest}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.room} • Check-in: {booking.checkIn}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-sm text-muted-foreground">{booking.id}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
