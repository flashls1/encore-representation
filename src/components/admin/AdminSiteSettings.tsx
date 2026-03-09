import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { THEME_OPTIONS } from '@/components/ThemeProvider';
import { Separator } from '@/components/ui/separator';
import { useSiteSettings } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, Globe, Mail, Calendar, Palette, MapPin, Ticket, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const AdminSiteSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    event_start_date: '',
    event_end_date: '',
    event_start_time: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    discord_url: '',
    tiktok_url: '',
    theme: 'cyber-night',
    venue_name: '',
    venue_address: '',
    show_hours_sat: '',
    show_hours_sun: '',
    vip_early_access: '',
    ticket_url: '',
  });

  useEffect(() => {
    if (settings) {
      // Note: some fields (event_start_date, venue_name, etc.) are UI-only and 
      // not yet backed by DB columns. Cast to any to access them.
      const s = settings as any;
      setForm({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        event_start_date: s.event_start_date || '',
        event_end_date: s.event_end_date || '',
        event_start_time: s.event_start_time || '',
        facebook_url: settings.facebook_url || '',
        twitter_url: settings.twitter_url || '',
        instagram_url: settings.instagram_url || '',
        discord_url: settings.discord_url || '',
        tiktok_url: settings.tiktok_url || '',
        theme: settings.theme || 'neon-nights',
        venue_name: s.venue_name || '',
        venue_address: s.venue_address || '',
        show_hours_sat: s.show_hours_sat || '',
        show_hours_sun: s.show_hours_sun || '',
        vip_early_access: s.vip_early_access || '',
        ticket_url: s.ticket_url || '',
      });
    }
  }, [settings]);

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!form.site_name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...(settings?.id && { id: settings.id }),
        ...form,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('site_settings').upsert(payload as any).select().maybeSingle();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['site-settings'] });
      toast({ title: 'Saved', description: 'Site settings updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Site Settings</h2>
          <p className="text-sm text-muted-foreground">Global configuration for your site</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      {/* Theme Selector — hidden (keeping code intact to avoid cascading issues) */}
      <div style={{ display: 'none' }}>
        <Card className="bg-card/50 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> Theme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Site Theme</Label>
            <Select value={form.theme} onValueChange={v => set('theme', v)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border">
                {THEME_OPTIONS.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex flex-col">
                      <span>{t.label}</span>
                      <span className="text-xs text-muted-foreground">{t.description}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">Changes apply site-wide immediately after saving.</p>
          </CardContent>
        </Card>
      </div>

      {/* General Info */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Site Name *</Label>
              <Input value={form.site_name} onChange={e => set('site_name', e.target.value)} />
            </div>
            <div>
              <Label>Ticket URL</Label>
              <Input value={form.ticket_url} onChange={e => set('ticket_url', e.target.value)} placeholder="https://tickets.example.com" />
            </div>
          </div>
          <div>
            <Label>Site Description</Label>
            <Textarea value={form.site_description} onChange={e => set('site_description', e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Venue */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> Venue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Venue Name</Label>
              <Input value={form.venue_name} onChange={e => set('venue_name', e.target.value)} placeholder="Venue Name" />
            </div>
            <div>
              <Label>Venue Address</Label>
              <Input value={form.venue_address} onChange={e => set('venue_address', e.target.value)} placeholder="City, State" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Saturday Hours</Label>
              <Input value={form.show_hours_sat} onChange={e => set('show_hours_sat', e.target.value)} placeholder="10am - 8pm" />
            </div>
            <div>
              <Label>Sunday Hours</Label>
              <Input value={form.show_hours_sun} onChange={e => set('show_hours_sun', e.target.value)} placeholder="10am - 6pm" />
            </div>
            <div>
              <Label>VIP Early Access</Label>
              <Input value={form.vip_early_access} onChange={e => set('vip_early_access', e.target.value)} placeholder="9am both days" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Dates */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Event Dates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" value={form.event_start_date} onChange={e => set('event_start_date', e.target.value)} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" value={form.event_end_date} onChange={e => set('event_end_date', e.target.value)} />
            </div>
            <div>
              <Label>Countdown Target (Date/Time)</Label>
              <Input type="datetime-local" value={form.event_start_time} onChange={e => set('event_start_time', e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">The countdown timer on the homepage counts to this time.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Contact Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.contact_address} onChange={e => set('contact_address', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Facebook</Label>
              <Input value={form.facebook_url} onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label>Twitter / X</Label>
              <Input value={form.twitter_url} onChange={e => set('twitter_url', e.target.value)} placeholder="https://twitter.com/..." />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label>TikTok</Label>
              <Input value={form.tiktok_url} onChange={e => set('tiktok_url', e.target.value)} placeholder="https://tiktok.com/@..." />
            </div>
            <div>
              <Label>Discord</Label>
              <Input value={form.discord_url} onChange={e => set('discord_url', e.target.value)} placeholder="https://discord.gg/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminSiteSettings;