
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { Loader2, ArrowRight, User, Mail, Phone, Calendar, BedDouble, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/api/client';
// import { Confetti } from '@/components/ui/confetti';

interface CheckoutFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
}

export default function BookingCheckout() {
    const { hotelSlug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>();

    // Get data from previous step
    const { room, checkIn, checkOut, guests } = location.state || {};

    if (!room || !checkIn || !checkOut) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-xl font-semibold">Session Expired</h2>
                <p className="text-muted-foreground">Please start your search again.</p>
                <Button onClick={() => navigate(`/book/${hotelSlug}`)}>Back to Search</Button>
            </div>
        )
    }

    const nights = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24);
    const totalPrice = room.price_per_night * nights;

    const onSubmit = async (data: CheckoutFormData) => {
        try {
            setIsSubmitting(true);

            const bookingPayload = {
                check_in: checkIn,
                check_out: checkOut,
                guest: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    // Defaulting others for now
                    nationality: 'IN',
                    id_type: 'passport',
                    id_number: 'PENDING'
                },
                rooms: [
                    {
                        room_type_id: room.id,
                        room_type_name: room.name,
                        price_per_night: room.price_per_night,
                        total_price: totalPrice,
                        guests: Number(guests) || 1,
                        rate_plan_id: room.rate_plan_id || 'standard',
                        rate_plan_name: room.rate_plan_name || 'Standard Rate'
                    }
                ],
                special_requests: data.specialRequests
            };

            const response = await apiClient.post('/public/bookings', bookingPayload);

            // Navigate to confirmation
            navigate(`/book/${hotelSlug}/confirmation`, {
                state: { booking: response }
            });

        } catch (error) {
            console.error('Booking failed:', error);
            toast({
                variant: "destructive",
                title: "Booking Failed",
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1fr,400px]">

            {/* Left: Guest Details Form */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Guest Details</h2>
                    <p className="text-muted-foreground">
                        Please fill in your details to complete the booking.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form id="booking-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        {...register('firstName', { required: 'First name is required' })}
                                    />
                                    {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        {...register('lastName', { required: 'Last name is required' })}
                                    />
                                    {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        placeholder="john@example.com"
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                                        })}
                                    />
                                </div>
                                {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="pl-9"
                                        placeholder="+91 98765 43210"
                                        {...register('phone', { required: 'Phone is required' })}
                                    />
                                </div>
                                {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requests">Special Requests (Optional)</Label>
                                <Input
                                    id="requests"
                                    placeholder="Late check-in, quiet room, etc."
                                    {...register('specialRequests')}
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Payment Placeholders */}
                <Card className="opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <span className="bg-background/80 backdrop-blur px-4 py-2 rounded-full border text-sm font-medium flex items-center">
                            <Lock className="w-3 h-3 mr-2" /> Pay at Hotel (No prepayment required)
                        </span>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 filter blur-sm">
                            <Input placeholder="Card Number" disabled />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="MM/YY" disabled />
                                <Input placeholder="CVC" disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Booking Summary */}
            <div className="space-y-6">
                <Card className="sticky top-24 border-primary/20 shadow-md">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-primary">Your Stay</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg">{room.name}</h3>
                                <p className="text-sm text-muted-foreground">1 Room, {guests} Guest{guests > 1 ? 's' : ''}</p>
                            </div>
                            {room.photos && room.photos[0] && (
                                <img src={room.photos[0].url} alt="Room" className="w-16 h-16 rounded object-cover" />
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Check-in</p>
                                <p className="font-medium">{format(new Date(checkIn), 'EEE, MMM dd')}</p>
                                <p className="text-xs text-muted-foreground">From 14:00</p>
                            </div>
                            <div className="text-right">
                                <p className="text-muted-foreground mb-1 flex items-center justify-end">Check-out <Calendar className="w-3 h-3 ml-1" /></p>
                                <p className="font-medium">{format(new Date(checkOut), 'EEE, MMM dd')}</p>
                                <p className="text-xs text-muted-foreground">Until 11:00</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>{room.name} x {nights} nights</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Taxes & Fees</span>
                                <span>Included</span>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-xl text-primary">{formatCurrency(totalPrice)}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t p-6">
                        <Button
                            className="w-full h-12 text-lg"
                            type="submit"
                            form="booking-form"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...
                                </>
                            ) : (
                                <>
                                    Complete Booking <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
