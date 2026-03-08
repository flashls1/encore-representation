import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import MediaPicker from '@/components/admin/MediaPicker';
import { useHomeContent } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Home, Image, Video, ExternalLink, Save, Loader2, X, Timer, ImagePlus, Eye, ArrowDown } from 'lucide-react';

/** Check if a URL points to a video file by extension */
const isVideoUrl = (url: string): boolean => {
  const ext = url.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '');
};

const AdminHomeContent = () => {
  const { data: homeContent, isLoading } = useHomeContent();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [form, setForm] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image_url: '',
    hero_video_url: '',
    countdown_enabled: true,
    cta_primary_text: '',
    cta_primary_url: '',
    cta_secondary_text: '',
    cta_secondary_url: '',
    featured_content_title: '',
    featured_content_description: '',
    hero_text_visible: true,
    cta_offset_top: '0',
  });

  useEffect(() => {
    if (homeContent) {
      setForm({
        hero_title: homeContent.hero_title || '',
        hero_subtitle: homeContent.hero_subtitle || '',
        hero_image_url: homeContent.hero_image_url || '',
        hero_video_url: homeContent.hero_video_url || '',
        countdown_enabled: homeContent.countdown_enabled ?? true,
        cta_primary_text: homeContent.cta_primary_text || '',
        cta_primary_url: homeContent.cta_primary_url || '',
        cta_secondary_text: homeContent.cta_secondary_text || '',
        cta_secondary_url: homeContent.cta_secondary_url || '',
        featured_content_title: homeContent.featured_content_title || '',
        featured_content_description: homeContent.featured_content_description || '',
        hero_text_visible: homeContent.hero_text_visible ?? true,
        cta_offset_top: homeContent.cta_offset_top || '0',
      });
    }
  }, [homeContent]);

  const set = (field: string, value: string | boolean) => setForm(p => ({ ...p, [field]: value }));

  /** When user picks a file from the library, auto-detect type and store in the right field */
  const handleHeroMediaSelect = (url: string) => {
    if (isVideoUrl(url)) {
      set('hero_video_url', url);
      set('hero_image_url', ''); // clear image — video takes priority
    } else {
      set('hero_image_url', url);
      set('hero_video_url', ''); // clear video — image takes priority
    }
  };

  /** Whichever field is set is the "active" hero media */
  const activeHeroUrl = form.hero_video_url || form.hero_image_url;
  const activeHeroIsVideo = !!form.hero_video_url && isVideoUrl(form.hero_video_url);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...(homeContent?.id && { id: homeContent.id }),
        ...form,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('home_content').upsert(payload).select().maybeSingle();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['home-content'] });
      toast({ title: 'Saved', description: 'Home page content updated successfully.' });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Home Page Content</h2>
          <p className="text-muted-foreground">Manage hero section, CTAs, and featured content.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" /> Hero Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hero text visibility toggle */}
          <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/30">
            <Switch
              checked={form.hero_text_visible}
              onCheckedChange={v => set('hero_text_visible', v)}
              id="hero-text-toggle"
            />
            <div>
              <Label htmlFor="hero-text-toggle" className="flex items-center gap-2 cursor-pointer">
                <Eye className="h-4 w-4" /> Show Hero Text Overlay
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Disable if your hero video/image already contains text.
              </p>
            </div>
          </div>

          <div>
            <Label>Hero Title</Label>
            <Input value={form.hero_title} onChange={e => set('hero_title', e.target.value)} placeholder="Your Event Name" />
          </div>

          <div>
            <Label>Hero Subtitle</Label>
            <Textarea value={form.hero_subtitle} onChange={e => set('hero_subtitle', e.target.value)} rows={2} placeholder="Your tagline here" />
          </div>

          {/* CTA vertical offset */}
          <div className="p-3 rounded-lg border border-border bg-muted/30">
            <Label className="flex items-center gap-2 mb-2">
              <ArrowDown className="h-4 w-4" /> CTA Button Vertical Offset: {form.cta_offset_top}px
            </Label>
            <Slider
              value={[parseInt(form.cta_offset_top) || 0]}
              onValueChange={([v]) => set('cta_offset_top', String(v))}
              min={0}
              max={200}
              step={10}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Push the CTA buttons down to avoid covering video/image text. 0 = default position.
            </p>
          </div>

          {/* Hero Background — unified image/video picker */}
          <div>
            <Label>Hero Background</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Choose an image or video from your Media Library. Videos auto-play muted in the background.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setShowMediaPicker(true)} className="gap-2">
                <ImagePlus className="h-4 w-4" /> Choose from Media Library
              </Button>
              {activeHeroUrl && (
                <Button variant="ghost" size="sm" onClick={() => { set('hero_image_url', ''); set('hero_video_url', ''); }}>
                  <X className="h-4 w-4 mr-1" /> Remove
                </Button>
              )}
            </div>

            {/* Preview */}
            {activeHeroUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border max-w-md">
                {activeHeroIsVideo ? (
                  <video
                    src={activeHeroUrl}
                    className="w-full max-h-48 object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img src={activeHeroUrl} alt="Hero preview" className="w-full max-h-48 object-cover" />
                )}
                <div className="px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-2" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  {activeHeroIsVideo ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                  {activeHeroIsVideo ? 'Video' : 'Image'} · {activeHeroUrl.split('/').pop()}
                </div>
              </div>
            )}

            <MediaPicker
              open={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onSelect={handleHeroMediaSelect}
              accept="all"
            />
          </div>
        </CardContent>
      </Card>

      {/* Countdown */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" /> Countdown Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Switch checked={form.countdown_enabled} onCheckedChange={v => set('countdown_enabled', v)} id="countdown-toggle" />
            <Label htmlFor="countdown-toggle">Show countdown timer on homepage</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            The countdown target time is configured in Site Settings → Event Dates → Countdown Target.
          </p>
        </CardContent>
      </Card>

      {/* CTAs */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" /> Call to Action Buttons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Primary CTA Text</Label>
              <Input value={form.cta_primary_text} onChange={e => set('cta_primary_text', e.target.value)} placeholder="Get Tickets" />
            </div>
            <div>
              <Label>Primary CTA URL</Label>
              <Input value={form.cta_primary_url} onChange={e => set('cta_primary_url', e.target.value)} placeholder="https://tickets.example.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Secondary CTA Text</Label>
              <Input value={form.cta_secondary_text} onChange={e => set('cta_secondary_text', e.target.value)} placeholder="Learn More" />
            </div>
            <div>
              <Label>Secondary CTA URL</Label>
              <Input value={form.cta_secondary_url} onChange={e => set('cta_secondary_url', e.target.value)} placeholder="/schedule" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Content */}
      <Card className="bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle>Featured Content Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Section Title</Label>
            <Input value={form.featured_content_title} onChange={e => set('featured_content_title', e.target.value)} />
          </div>
          <div>
            <Label>Section Description</Label>
            <Textarea value={form.featured_content_description} onChange={e => set('featured_content_description', e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Home Content
        </Button>
      </div>
    </div>
  );
};

export default AdminHomeContent;