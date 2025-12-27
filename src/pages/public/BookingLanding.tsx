import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Users, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';
import { Hotel } from '@/types/api';
import { DateRange } from 'react-day-picker';

export default function BookingLanding() {
    const { hotelSlug } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 1),
    });
    const [guests, setGuests] = useState('2');

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                // Use the public API we just created
                // Note: frontend client might need adjustment if base URL is strict /api/v1
                // Assuming /public/hotels/{slug} is accessible via apiClient
                const data = await apiClient.get<Hotel>(`/public/hotels/${hotelSlug}`);
                setHotel(data);
            } catch (error) {
                console.error('Failed to fetch hotel', error);
            }
        };
        if (hotelSlug) fetchHotel();
    }, [hotelSlug]);

    const handleSearch = () => {
        if (!hotelSlug || !date?.from || !date?.to) return;

        const params = new URLSearchParams({
            check_in: format(date.from, 'yyyy-MM-dd'),
            check_out: format(date.to, 'yyyy-MM-dd'),
            guests: guests
        });

        navigate(`/book/${hotelSlug}/rooms?${params.toString()}`);
    };

    if (!hotel) return <div className="flex justify-center p-10">Loading...</div>;

    return (
        <div className="flex flex-col items-center gap-8">
            {/* Hero Section */}
            <div className="w-full max-w-4xl text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
                    {hotel.name}
                </h1>
                {hotel.address && (
                    <p className="flex items-center justify-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {hotel.address.city}, {hotel.address.country}
                    </p>
                )}
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    {hotel.description || 'Experience luxury and comfort at its finest. Book your stay with us today.'}
                </p>
            </div>

            {/* Search Card */}
            <Card className="w-full max-w-3xl shadow-xl">
                <CardHeader>
                    <CardTitle>Find your perfect stay</CardTitle>
                    <CardDescription>Select dates and guests to check availability</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-[1fr,200px,auto]">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Dates</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date?.from ? (
                                            date.to ? (
                                                <>
                                                    {format(date.from, "LLL dd, y")} -{" "}
                                                    {format(date.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(date.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Guests</label>
                            <Select value={guests} onValueChange={setGuests}>
                                <SelectTrigger>
                                    <Users className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Guests" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <SelectItem key={num} value={num.toString()}>
                                            {num} {num === 1 ? 'Guest' : 'Guests'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-end">
                            <Button size="lg" className="w-full md:w-auto" onClick={handleSearch}>
                                <Search className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Amenities Preview */}
            <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-8">
                {['Free Wi-Fi', 'Swimming Pool', '24/7 Support', 'Restaurant'].map((item) => (
                    <div key={item} className="p-4 bg-white rounded-lg border shadow-sm text-sm font-medium text-slate-600">
                        {item}
                    </div>
                ))}
            </div>
        </div>
    );
}
