
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, Printer, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function BookingConfirmation() {
    const { hotelSlug } = useParams();
    const location = useLocation();

    const booking = location.state?.booking;

    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <p>No booking details found.</p>
                <Link to={`/book/${hotelSlug}`}><Button variant="link">Go Home</Button></Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 space-y-8">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-green-700">Booking Confirmed!</h1>
                <p className="text-muted-foreground text-lg">
                    Your reservation is successful. We've sent a confirmation email to {booking.guest?.email}.
                </p>
            </div>

            <Card className="overflow-hidden border-t-4 border-t-green-600 shadow-xl">
                <CardHeader className="bg-slate-50/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Booking Reference</p>
                            <CardTitle className="text-3xl font-mono">{booking.booking_number}</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.print()}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Guest Details</h3>
                            <div className="space-y-2 text-slate-600">
                                <p><span className="font-medium text-slate-900">{booking.guest?.first_name} {booking.guest?.last_name}</span></p>
                                <p>{booking.guest?.email}</p>
                                <p>{booking.guest?.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Dates</h3>
                            <div className="space-y-2 text-slate-600">
                                <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400" /> Check-in: <span className="font-medium text-slate-900 ml-2">{booking.check_in}</span></p>
                                <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400" /> Check-out: <span className="font-medium text-slate-900 ml-2">{booking.check_out}</span></p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Room Details</h3>
                        {booking.rooms.map((room: any, i: number) => (
                            <div key={i} className="flex justify-between items-center mb-2 last:mb-0">
                                <span>{room.room_type_name} ({room.rate_plan_name})</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(room.total_price)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-lg">Total Amount</span>
                        <span className="font-bold text-2xl text-primary">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(booking.total_amount)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
                <Link to={`/book/${hotelSlug}`}>
                    <Button variant="ghost"><Home className="mr-2 h-4 w-4" /> Return to Hotel Home</Button>
                </Link>
            </div>
        </div>
    );
}
