// Settings Page - Real API Integration
import { useState } from 'react';
import { Building2, Users, Bell, Key, Palette, Globe, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/client';
import { Hotel } from '@/types/api';

export function SettingsPage() {
  const { hotel, user, setHotel } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: hotel?.name || '',
    star_rating: hotel?.star_rating || 3,
    description: hotel?.description || '',
    address: {
      street: hotel?.address?.street || '',
      city: hotel?.address?.city || ''
    },
    contact: {
      phone: hotel?.contact?.phone || '',
      email: hotel?.contact?.email || ''
    },
    settings: {
      check_in_time: hotel?.settings?.check_in_time || '14:00',
      check_out_time: hotel?.settings?.check_out_time || '11:00',
      currency: hotel?.settings?.currency || 'INR',
      timezone: hotel?.settings?.timezone || 'Asia/Kolkata'
    }
  });

  const handleUpdate = (section: string, field: string, value: any) => {
    setFormData(prev => {
      if (section === 'root') {
        return { ...prev, [field]: value };
      }
      if (section === 'address') {
        return { ...prev, address: { ...prev.address, [field]: value } };
      }
      if (section === 'contact') {
        return { ...prev, contact: { ...prev.contact, [field]: value } };
      }
      if (section === 'settings') {
        return { ...prev, settings: { ...prev.settings, [field]: value } };
      }
      return prev;
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedHotel = await apiClient.patch<Hotel>('/hotels/me', {
        name: formData.name,
        star_rating: Number(formData.star_rating),
        description: formData.description,
        address: formData.address,
        contact: formData.contact,
        settings: formData.settings
      });
      setHotel(updatedHotel);
      toast({
        title: 'Settings saved',
        description: 'Your hotel profile has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!hotel) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your hotel profile and preferences
        </p>
      </div>

      <Tabs defaultValue="hotel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
          <TabsTrigger value="hotel" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Hotel</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
        </TabsList>

        {/* Hotel Settings */}
        <TabsContent value="hotel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Profile</CardTitle>
              <CardDescription>
                Basic information about your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    value={formData.name}
                    onChange={(e) => handleUpdate('root', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="starRating">Star Rating</Label>
                  <Select
                    value={String(formData.star_rating)}
                    onValueChange={(val) => handleUpdate('root', 'star_rating', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleUpdate('root', 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={formData.address.street}
                    onChange={(e) => handleUpdate('address', 'street', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleUpdate('address', 'city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contact.phone}
                    onChange={(e) => handleUpdate('contact', 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleUpdate('contact', 'email', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operational Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Time</Label>
                  <Input
                    id="checkIn"
                    type="time"
                    value={formData.settings.check_in_time}
                    onChange={(e) => handleUpdate('settings', 'check_in_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Time</Label>
                  <Input
                    id="checkOut"
                    type="time"
                    value={formData.settings.check_out_time}
                    onChange={(e) => handleUpdate('settings', 'check_out_time', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.settings.currency}
                    onValueChange={(val) => handleUpdate('settings', 'currency', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.settings.timezone}
                    onValueChange={(val) => handleUpdate('settings', 'timezone', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who has access to this dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user?.name || 'Owner'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary">Owner</div>
                </div>
                <Button variant="outline" className="w-full gap-2" disabled>
                  <Users className="h-4 w-4" />
                  Invite Team Member (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { id: 'new-booking', label: 'New Booking', description: 'Get notified when a new booking is made' },
                { id: 'cancellation', label: 'Cancellations', description: 'Get notified when a booking is cancelled' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings - Read Only for now */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Engine Integration</CardTitle>
              <CardDescription>
                Connect your website to the booking engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Direct Booking Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/book/${hotel?.id}`}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/book/${hotel?.id}`);
                      toast({ title: 'Copied', description: 'Link copied to clipboard' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this link directly with guests or link it to a "Book Now" button on your site.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Website Embed Code</Label>
                <div className="relative">
                  <Textarea
                    className="font-mono text-sm h-32"
                    readOnly
                    value={`<!-- Hotelier Hub Booking Engine -->\n<iframe src="${window.location.origin}/book/${hotel?.id}" width="100%" height="700px" style="border:none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></iframe>`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      const code = `<!-- Hotelier Hub Booking Engine -->\n<iframe src="${window.location.origin}/book/${hotel?.id}" width="100%" height="700px" style="border:none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></iframe>`;
                      navigator.clipboard.writeText(code);
                      toast({ title: 'Copied', description: 'Embed code copied to clipboard' });
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copy and paste this code into your website's HTML to embed the booking engine.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>API Configuration (Developer)</Label>
                <Input value={import.meta.env.VITE_API_URL} readOnly disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings - Coming Soon */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Engine Branding</CardTitle>
              <CardDescription>
                Customize how your booking engine looks to guests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                Branding settings will be available in the next update.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
