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
import { Save, Loader2, Plus, Trash2, Image as ImageIcon, ArrowUp, ArrowDown, User } from 'lucide-react';

const AdminAboutEditor = () => {
    const { data: aboutContent, isLoading } = useAboutContent();
    const qc = useQueryClient();
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null);

    const [form, setForm] = useState({
        page_title: 'About Encore Representation',
        page_description: '',
        hero_image_url: '',
        sections: [] as ContentSection[],
    });

    useEffect(() => {
        if (aboutContent) {
            const loadedSections: ContentSection[] = Array.isArray(aboutContent.sections) ? aboutContent.sections : [];
            // Ensure owner-hero exists — only add one if DB data doesn't have one
            const hasOwnerHero = loadedSections.some(s => s.type === 'owner-hero');
            const sections = hasOwnerHero
                ? loadedSections
                : [
                    {
                        id: crypto.randomUUID(),
                        type: 'owner-hero' as const,
                        title: '',
                        content: '',
                        media_url: '',
                    },
                    ...loadedSections,
                ];
            setForm({
                page_title: aboutContent.page_title || '',
                page_description: aboutContent.page_description || '',
                hero_image_url: aboutContent.hero_image_url || '',
                sections,
            });
        } else if (aboutContent === null) {
            // No row in DB yet — create default form with blank owner-hero
            setForm({
                page_title: 'About Encore Representation',
                page_description: '',
                hero_image_url: '',
                sections: [
                    {
                        id: crypto.randomUUID(),
                        type: 'owner-hero' as const,
                        title: '',
                        content: '',
                        media_url: '',
                    },
                ],
            });
        }
    }, [aboutContent]);

    // Derived values for rendering
    const ownerHero = form.sections.find(s => s.type === 'owner-hero');
    const contentSections = form.sections.filter(s => s.type !== 'owner-hero');

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

    const addSection = () => {
        const newSection: ContentSection = {
            id: crypto.randomUUID(),
            type: 'image-text',
            title: '',
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

    const moveSection = (id: string, direction: 'up' | 'down') => {
        setForm(f => {
            // Only reorder content sections, keep owner-hero at index 0
            const hero = f.sections.filter(s => s.type === 'owner-hero');
            const others = f.sections.filter(s => s.type !== 'owner-hero');
            const idx = others.findIndex(s => s.id === id);
            if (idx < 0) return f;
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= others.length) return f;
            const newOthers = [...others];
            [newOthers[idx], newOthers[newIdx]] = [newOthers[newIdx], newOthers[idx]];
            return { ...f, sections: [...hero, ...newOthers] };
        });
    };

    const handleMediaSelect = (url: string) => {
        if (showMediaPicker) {
            updateSection(showMediaPicker, 'media_url', url);
        }
        setShowMediaPicker(null);
    };

    if (isLoading) {
        return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">About Page</h3>
                    <p className="text-sm text-muted-foreground">
                        Owner hero at top, then alternating photo + text sections.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#D4AF37', color: '#000' }}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                </Button>
            </div>

            {/* Page Title */}
            <Card className="bg-card/50 border-primary/30">
                <CardHeader><CardTitle className="text-base">Page Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Page Title</Label>
                        <Input value={form.page_title} onChange={e => setForm(f => ({ ...f, page_title: e.target.value }))} />
                    </div>
                </CardContent>
            </Card>

            {/* Owner Hero Section */}
            {ownerHero && (
                <Card className="bg-card/50" style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" style={{ color: '#D4AF37' }} />
                            Owner / Founder Section
                            <span className="text-xs text-muted-foreground ml-auto">Always shown first on the page</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Photo */}
                        <div>
                            <Label>Owner Photo</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <Button variant="outline" size="sm" onClick={() => setShowMediaPicker(ownerHero.id)}>
                                    <ImageIcon className="h-4 w-4 mr-1" /> Choose Photo
                                </Button>
                                {ownerHero.media_url && (
                                    <Button variant="ghost" size="sm" onClick={() => updateSection(ownerHero.id, 'media_url', '')}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                )}
                            </div>
                            {ownerHero.media_url && (
                                <img src={ownerHero.media_url} alt="Owner" className="mt-2 rounded-lg max-h-48 object-cover" />
                            )}
                        </div>
                        {/* Name */}
                        <div>
                            <Label>Owner Name</Label>
                            <Input
                                value={ownerHero.title || ''}
                                onChange={e => updateSection(ownerHero.id, 'title', e.target.value)}
                                placeholder="e.g. Tyler Johnson"
                            />
                        </div>
                        {/* Bio */}
                        <div>
                            <Label>Bio / Introduction</Label>
                            <Textarea
                                value={ownerHero.content}
                                onChange={e => updateSection(ownerHero.id, 'content', e.target.value)}
                                rows={5}
                                placeholder="Write about yourself, your vision, your agency..."
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content Sections */}
            <Card className="bg-card/50 border-primary/30">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base">Content Sections</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                Each section has a photo and text. They alternate left/right automatically.
                            </p>
                        </div>
                        <Button onClick={addSection} style={{ backgroundColor: '#D4AF37', color: '#000' }}>
                            <Plus className="h-4 w-4 mr-1" /> Add Section
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {contentSections.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No sections yet. Click "Add Section" to create photo + text blocks.
                        </p>
                    )}
                    {contentSections.map((section, idx) => (
                        <div
                            key={section.id}
                            className="p-4 rounded-lg border border-border space-y-3"
                            style={{ backgroundColor: 'rgba(17, 17, 17, 0.5)' }}
                        >
                            {/* Section header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <span className="uppercase text-xs tracking-wider">
                                        📸 Section #{idx + 1}
                                    </span>
                                    <span className="text-xs opacity-50">
                                        — photo {idx % 2 === 0 ? 'left' : 'right'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveSection(section.id, 'up')}
                                        disabled={idx === 0}
                                        className="h-7 w-7 p-0"
                                    >
                                        <ArrowUp className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveSection(section.id, 'down')}
                                        disabled={idx === contentSections.length - 1}
                                        className="h-7 w-7 p-0"
                                    >
                                        <ArrowDown className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSection(section.id)}
                                        className="text-red-500 hover:text-red-400 h-7 w-7 p-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Photo upload */}
                            <div>
                                <Label className="text-xs">Photo</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Button variant="outline" size="sm" onClick={() => setShowMediaPicker(section.id)}>
                                        <ImageIcon className="h-4 w-4 mr-1" /> Choose Photo
                                    </Button>
                                    {section.media_url && (
                                        <Button variant="ghost" size="sm" onClick={() => updateSection(section.id, 'media_url', '')}>
                                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                                        </Button>
                                    )}
                                </div>
                                {section.media_url && (
                                    <img src={section.media_url} alt="" className="mt-2 rounded-lg max-h-32 object-cover" />
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <Label className="text-xs">Section Title</Label>
                                <Input
                                    value={section.title || ''}
                                    onChange={e => updateSection(section.id, 'title', e.target.value)}
                                    placeholder="Section heading (shown in gold)"
                                    className="mt-1"
                                />
                            </div>

                            {/* Text content */}
                            <div>
                                <Label className="text-xs">Text Content</Label>
                                <Textarea
                                    value={section.content}
                                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                                    rows={4}
                                    placeholder="Write the text for this section..."
                                    className="mt-1"
                                />
                            </div>
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
