import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient } from '@/api/client';
import { RoomType } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

const roomSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    base_price: z.coerce.number().min(0, 'Price must be positive'),
    total_inventory: z.coerce.number().min(0, 'Inventory must be positive'),
    base_occupancy: z.coerce.number().min(1, 'At least 1 person'),
    max_occupancy: z.coerce.number().min(1, 'At least 1 person'),
    max_children: z.coerce.number().min(0, 'Cannot be negative'),
    extra_bed_allowed: z.boolean().default(false),
});

interface RoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialData?: RoomType | null;
}

export function RoomDialog({ open, onOpenChange, onSuccess, initialData }: RoomDialogProps) {
    const { toast } = useToast();
    const isEditing = !!initialData;

    const form = useForm<z.infer<typeof roomSchema>>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            name: '',
            description: '',
            base_price: 0,
            total_inventory: 1,
            base_occupancy: 2,
            max_occupancy: 2,
            max_children: 0,
            extra_bed_allowed: false,
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    description: initialData.description || '',
                    base_price: initialData.base_price,
                    total_inventory: initialData.total_inventory,
                    base_occupancy: initialData.base_occupancy,
                    max_occupancy: initialData.max_occupancy,
                    max_children: initialData.max_children || 0,
                    extra_bed_allowed: initialData.extra_bed_allowed || false,
                });
            } else {
                form.reset({
                    name: '',
                    description: '',
                    base_price: 0,
                    total_inventory: 1,
                    base_occupancy: 2,
                    max_occupancy: 2,
                    max_children: 0,
                    extra_bed_allowed: false,
                });
            }
        }
    }, [open, initialData, form]);

    const onSubmit = async (values: z.infer<typeof roomSchema>) => {
        try {
            if (isEditing && initialData) {
                await apiClient.patch(`/rooms/${initialData.id}`, values);
                toast({ title: 'Room Updated', description: 'Room details have been saved.' });
            } else {
                await apiClient.post('/rooms', values);
                toast({ title: 'Room Created', description: 'New room type has been added.' });
            }
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save room details.',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Room Type' : 'Add Room Type'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Modify existing room details.' : 'Create a new room category for your hotel.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Deluxe Suite" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Room amenities and details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="base_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Price (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="total_inventory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Rooms</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="base_occupancy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Occ.</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_occupancy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Occ.</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_children"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Child</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="extra_bed_allowed"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Extra Bed Allowed
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Save Changes' : 'Create Room'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
