import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAboutContent, type ContentSection } from '@/hooks/useUpcomingEvents';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import MediaPicker from './MediaPicker';
import { Save, Loader2, Plus, Trash2, Type, Image as ImageIcon, Film, GripVertical } from 'lucide-react';

const AdminAboutEditor = () => {
    const { data: aboutContent, isLoading } = useAboutContent();
    const qc = useQueryClient();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null); // section id or 'hero'

    const [form, setForm] = useState({
        page_title: 'About Encore Representation',
        page_description: '',
        hero_image_url: '',
        sections: [] as ContentSection[],
    });

    useEffect(() => {
        if (aboutContent) {
            setForm({
                page_title: aboutContent.page_title || '',
                page_description: aboutContent.page_description || '',
                hero_image_url: aboutContent.hero_image_url || '',
                sections: Array.isArray(aboutContent.sections) ? aboutContent.sections : [],
            });
        }
    }, [aboutContent]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...(aboutContent?.id && { id: aboutContent.id }),
                ...form,
                updated_at: new Date().toISOString(),
            };
            const { error } = await (supabase as any).from('about_content').upsert(payload).select().maybeSingle();
            if (error) throw error;
            qc.invalidateQueries({ queryKey: ['about-content'] });
            toast({ title: 'Saved', description: 'About page updated.' });
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
        setSaving(false);
    };

    const addSection = (type: 'text' | 'image' | 'video') => {
        const newSection: ContentSection = {
            id: crypto.randomUUID(),
            type,
            content: '',
            media_url: '',
        };
        setForm(f => ({ ...f, sections: [...f.sections, newSection] }));
    };

    const updateSection = (id: string, field: keyof ContentSection, value: string) => {
        setForm(f => ({
            ...f,
            sections: f.sections.map(s => s.id === id ? { ...s, [field]: value } : s),
        }));
    };

    const removeSection = (id: string) => {
        setForm(f => ({ ...f, sections: f.sections.filter(s => s.id !== id) }));
    };

    const handleMediaSelect = (url: string) => {
        if (showMediaPicker === 'hero') {
            setForm(f => ({ ...f, hero_image_url: url }));
        } else if (showMediaPicker) {
            const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
            updateSection(showMediaPicker, 'media_url', url);
            // auto-detect type
            const section = form.sections.find(s => s.id === showMediaPicker);
            if (section && section.type !== 'text') {
                updateSection(showMediaPicker, 'type', isVideo ? 'video' : 'image');
            }
        }
        setShowMediaPicker(null);
    };

    if (isLoading) {
        return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">About Page</h3>
                    <p className="text-sm text-muted-foreground">Edit the About page content, images, and layout.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                </Button>
            </div>

            {/* Page meta */}
            <Card className="bg-card/50 border-primary/30">
                <CardHeader><CardTitle className="text-base">Page Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Page Title</Label>
                        <Input value={form.page_title} onChange={e => setForm(f => ({ ...f, page_title: e.target.value }))} />
                    </div>
                    <div>
                        <Label>Page Description</Label>
                        <Textarea value={form.page_description} onChange={e => setForm(f => ({ ...f, page_description: e.target.value }))} rows={3} />
                    </div>
                    <div>
                        <Label>Hero Image</Label>
                        <div className="flex items-center gap-3 mt-1">
                            <Button variant="outline" size="sm" onClick={() => setShowMediaPicker('hero')}>
                                <ImageIcon className="h-4 w-4 mr-1" /> Choose from Library
                            </Button>
                            {form.hero_image_url && (
                                <Button variant="ghost" size="sm" onClick={() => setForm(f => ({ ...f, hero_image_url: '' }))}>
                                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                            )}
                        </div>
                        {form.hero_image_url && (
                            <img src={form.hero_image_url} alt="Hero" className="mt-2 rounded-lg max-h-40 object-cover" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Content Sections */}
            <Card className="bg-card/50 border-primary/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Content Sections</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => addSection('text')}>
                                <Type className="h-4 w-4 mr-1" /> Text
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => addSection('image')}>
                                <ImageIcon className="h-4 w-4 mr-1" /> Image
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => addSection('video')}>
                                <Film className="h-4 w-4 mr-1" /> Video
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {form.sections.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No sections yet. Add text, images, or videos above.
                        </p>
                    )}
                    {form.sections.map((section, idx) => (
                        <div
                            key={section.id}
                            className="p-4 rounded-lg border border-border space-y-3"
                            style={{ backgroundColor: 'var(--bg-elevated)' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <GripVertical className="h-4 w-4" />
                                    <span className="uppercase text-xs tracking-wider">
                                        {section.type === 'text' ? '📝 Text Block' : section.type === 'image' ? '🖼️ Image Block' : '🎬 Video Block'}
                                    </span>
                                    <span className="text-xs opacity-50">#{idx + 1}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {section.type === 'text' ? (
                                <Textarea
                                    value={section.content}
                                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                                    rows={4}
                                    placeholder="Enter your text content..."
                                />
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setShowMediaPicker(section.id)}>
                                            <ImageIcon className="h-4 w-4 mr-1" /> Choose from Library
                                        </Button>
                                        {section.media_url && (
                                            <Button variant="ghost" size="sm" onClick={() => updateSection(section.id, 'media_url', '')}>
                                                <Trash2 className="h-4 w-4 mr-1" /> Remove
                                            </Button>
                                        )}
                                    </div>
                                    {section.media_url && (
                                        section.type === 'video' ? (
                                            <video src={section.media_url} className="rounded-lg max-h-40 w-full object-cover" muted loop playsInline autoPlay />
                                        ) : (
                                            <img src={section.media_url} alt="" className="rounded-lg max-h-40 object-cover" />
                                        )
                                    )}
                                    <Input
                                        value={section.content}
                                        onChange={e => updateSection(section.id, 'content', e.target.value)}
                                        placeholder="Caption (optional)"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <MediaPicker
                open={!!showMediaPicker}
                onClose={() => setShowMediaPicker(null)}
                onSelect={handleMediaSelect}
                accept="all"
            />
        </div>
    );
};

export default AdminAboutEditor;
