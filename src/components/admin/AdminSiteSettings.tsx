import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useSiteSettings } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Settings, Globe, Mail, Save, Loader2 } from 'lucide-react';
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
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
    theme: 'cyber-night',
  });

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        facebook_url: settings.facebook_url || '',
        twitter_url: settings.twitter_url || '',
        instagram_url: settings.instagram_url || '',
        tiktok_url: settings.tiktok_url || '',
        youtube_url: (settings as any).youtube_url || '',
        theme: settings.theme || 'cyber-night',
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
          </div>
          <div>
            <Label>Site Description</Label>
            <Textarea value={form.site_description} onChange={e => set('site_description', e.target.value)} rows={3} />
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
          <p className="text-xs text-muted-foreground mb-4">
            Add your social media URLs. Icons will automatically appear in the site footer when a URL is set.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="flex items-center gap-3 mb-2">
                <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0" style={{ borderRadius: 5, border: '1.5px solid #D4AF37' }}>
                  <img src="/social-icons/instagram.jpg" alt="Instagram" className="block" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                </span> Instagram
              </Label>
              <Input value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <Label className="flex items-center gap-3 mb-2">
                <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0" style={{ borderRadius: 5, border: '1.5px solid #D4AF37' }}>
                  <img src="/social-icons/facebook.jpg" alt="Facebook" className="block" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                </span> Facebook
              </Label>
              <Input value={form.facebook_url} onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
            <div>
              <Label className="flex items-center gap-3 mb-2">
                <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0" style={{ borderRadius: 5, border: '1.5px solid #D4AF37' }}>
                  <img src="/social-icons/x.jpg" alt="X" className="block" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                </span> X (Twitter)
              </Label>
              <Input value={form.twitter_url} onChange={e => set('twitter_url', e.target.value)} placeholder="https://x.com/..." />
            </div>
            <div>
              <Label className="flex items-center gap-3 mb-2">
                <span className="inline-block w-6 h-6 overflow-hidden flex-shrink-0" style={{ borderRadius: 5, border: '1.5px solid #D4AF37' }}>
                  <img src="/social-icons/youtube.jpg" alt="YouTube" className="block" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
                </span> YouTube
              </Label>
              <Input value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/@..." />
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