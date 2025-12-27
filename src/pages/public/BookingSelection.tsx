
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, User, Wifi, Coffee, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/client';
import { RoomType } from '@/types/api';

// Extended interface from Public API response
interface PublicRoomSearch extends RoomType {
    price_per_night: number;
    total_price: number;
    available_rooms: number;
    rate_plan_name: string;
}

export default function BookingSelection() {
    const { hotelSlug } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState<PublicRoomSearch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Extract params
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');
    const guests = searchParams.get('guests');

    useEffect(() => {
        const fetchRooms = async () => {
            if (!hotelSlug || !checkIn || !checkOut) return;

            try {
                setIsLoading(true);
                const query = new URLSearchParams({
                    check_in: checkIn,
                    check_out: checkOut,
                    guests: guests || '1'
                }).toString();

                const data = await apiClient.get<PublicRoomSearch[]>(`/public/hotels/${hotelSlug}/rooms?${query}`);
                setRooms(data);
            } catch (error) {
                console.error('Failed to fetch rooms:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRooms();
    }, [hotelSlug, checkIn, checkOut, guests]);

    const handleBook = (room: PublicRoomSearch) => {
        // Proceed to checkout with selected room
        // We can pass state via navigate or params. State is cleaner.
        navigate(`/book/${hotelSlug}/checkout`, {
            state: {
                room,
                checkIn,
                checkOut,
                guests
            }
        });
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
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Finding the best rates...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Select your Room</h2>
                <p className="text-muted-foreground">
                    staying from {checkIn} to {checkOut} • {guests} Guests
                </p>
            </div>

            <div className="grid gap-6">
                {rooms.length === 0 ? (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <p className="text-lg text-muted-foreground">No rooms available for these dates.</p>
                            <Button variant="link" onClick={() => navigate(-1)}>Try different dates</Button>
                        </CardContent>
                    </Card>
                ) : (
                    rooms.map((room) => (
                        <Card key={room.id} className="overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
                            {/* Simplified Image placeholder if no photos */}
                            <div className="w-full md:w-1/3 bg-slate-200 min-h-[200px] flex items-center justify-center">
                                {room.photos && room.photos.length > 0 ? (
                                    <img src={room.photos[0].url} alt={room.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-400">No Image</span>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold">{room.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                                    </div>
                                    {room.available_rooms < 3 && (
                                        <Badge variant="destructive">Only {room.available_rooms} left!</Badge>
                                    )}
                                </div>

                                <div className="flex gap-4 my-4">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <User className="h-4 w-4 mr-1" /> Max {room.max_occupancy}
                                    </div>
                                    {room.amenities.slice(0, 3).map((am: any, i) => (
                                        <div key={i} className="flex items-center text-sm text-slate-600">
                                            <Wifi className="h-4 w-4 mr-1" /> {am.name || 'Amenity'}
                                        </div>
                                    ))}
                                    <div className="flex items-center text-sm text-slate-600">
                                        <Maximize className="h-4 w-4 mr-1" /> Spacious
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between border-t pt-4">
                                    <div>
                                        <span className="text-xs text-muted-foreground block">{room.rate_plan_name}</span>
                                        <span className="text-2xl font-bold text-primary">{formatCurrency(room.price_per_night)}</span>
                                        <span className="text-sm text-muted-foreground"> / night</span>
                                    </div>
                                    <Button size="lg" onClick={() => handleBook(room)}>
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
