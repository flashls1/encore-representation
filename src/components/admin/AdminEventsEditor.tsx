import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUpcomingEvents, useUpsertEvent, useDeleteEvent, type UpcomingEvent } from '@/hooks/useUpcomingEvents';
import { useUIEffect } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import MediaPicker from './MediaPicker';
import { CalendarDays, Plus, Trash2, Save, Loader2, Image as ImageIcon, Edit, Eye, EyeOff, Settings } from 'lucide-react';

const EMPTY_EVENT: Partial<UpcomingEvent> = {
    title: '',
    description: '',
    image_url: '',
    event_date: null,
    event_time: '',
    location: '',
    link_url: '',
    sort_order: 0,
    visible: true,
};

const AdminEventsEditor = () => {
    const { data: events, isLoading } = useUpcomingEvents();
    const upsert = useUpsertEvent();
    const deleteEvent = useDeleteEvent();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { config: eventsCarouselConfig } = useUIEffect('events-carousel');

    const [editing, setEditing] = useState<Partial<UpcomingEvent> | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    const handleSave = async () => {
        if (!editing?.title?.trim()) {
            toast({ title: 'Title required', description: 'Please enter an event title.', variant: 'destructive' });
            return;
        }
        try {
            await upsert.mutateAsync(editing);
            toast({ title: 'Saved', description: 'Event saved successfully.' });
            setEditing(null);
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this event?')) return;
        try {
            await deleteEvent.mutateAsync(id);
            toast({ title: 'Deleted', description: 'Event removed.' });
        } catch (err: any) {
            toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // Editing form
    if (editing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground">
                        {editing.id ? 'Edit Event' : 'New Event'}
                    </h3>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={upsert.isPending}>
                            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Event
                        </Button>
                    </div>
                </div>

                <Card className="bg-card/50 border-primary/30">
                    <CardContent className="space-y-4 pt-6">
                        <div>
                            <Label>Event Title *</Label>
                            <Input
                                value={editing.title || ''}
                                onChange={e => setEditing(p => ({ ...p, title: e.target.value }))}
                                placeholder="Event name"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={editing.description || ''}
                                onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                                rows={3}
                                placeholder="Brief description..."
                            />
                        </div>

                        {/* 1:1 Image */}
                        <div>
                            <Label>Event Image (1:1)</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <Button variant="outline" size="sm" onClick={() => setShowMediaPicker(true)}>
                                    <ImageIcon className="h-4 w-4 mr-1" /> Choose from Library
                                </Button>
                                {editing.image_url && (
                                    <Button variant="ghost" size="sm" onClick={() => setEditing(p => ({ ...p, image_url: '' }))}>
                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                )}
                            </div>
                            {editing.image_url && (
                                <div className="mt-2 w-40 h-40 rounded-lg overflow-hidden border border-border">
                                    <img src={editing.image_url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Event Date</Label>
                                <Input
                                    type="date"
                                    value={editing.event_date || ''}
                                    onChange={e => setEditing(p => ({ ...p, event_date: e.target.value || null }))}
                                />
                            </div>
                            <div>
                                <Label>Event Time</Label>
                                <Input
                                    value={editing.event_time || ''}
                                    onChange={e => setEditing(p => ({ ...p, event_time: e.target.value }))}
                                    placeholder="7:00 PM"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={editing.location || ''}
                                    onChange={e => setEditing(p => ({ ...p, location: e.target.value }))}
                                    placeholder="Venue name or address"
                                />
                            </div>
                            <div>
                                <Label>Link URL</Label>
                                <Input
                                    value={editing.link_url || ''}
                                    onChange={e => setEditing(p => ({ ...p, link_url: e.target.value }))}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label>Sort Order</Label>
                                <Input
                                    type="number"
                                    value={editing.sort_order || 0}
                                    onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <Switch
                                    checked={editing.visible ?? true}
                                    onCheckedChange={v => setEditing(p => ({ ...p, visible: v }))}
                                    id="event-visible"
                                />
                                <Label htmlFor="event-visible">Visible on site</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <MediaPicker
                    open={showMediaPicker}
                    onClose={() => setShowMediaPicker(false)}
                    onSelect={(url) => {
                        setEditing(p => ({ ...p, image_url: url }));
                        setShowMediaPicker(false);
                    }}
                    accept="image"
                />
            </div>
        );
    }

    // Event list
    const saveCarouselSpeed = async (key: string, value: number) => {
        const newProps = { ...eventsCarouselConfig, [key]: value };
        try {
            await (supabase as any).from('ui_effect_overrides').upsert(
                { effect_id: 'events-carousel', props: newProps },
                { onConflict: 'effect_id' }
            );
            queryClient.invalidateQueries({ queryKey: ['ui-effect-overrides'] });
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Carousel Speed Settings */}
            <Card className="bg-card/50 border-primary/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Settings className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                        Homepage Events Carousel Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs">🖥️ Desktop Scroll Speed</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <input
                                    type="range"
                                    min={0.2}
                                    max={10}
                                    step={0.1}
                                    value={eventsCarouselConfig.desktopSpeed ?? 1.0}
                                    onChange={(e) => saveCarouselSpeed('desktopSpeed', parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs font-mono w-8" style={{ color: 'var(--text-muted)' }}>
                                    {(eventsCarouselConfig.desktopSpeed ?? 1.0).toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">📱 Mobile Scroll Speed</Label>
                            <div className="flex items-center gap-3 mt-1">
                                <input
                                    type="range"
                                    min={0.2}
                                    max={10}
                                    step={0.1}
                                    value={eventsCarouselConfig.mobileSpeed ?? 0.6}
                                    onChange={(e) => saveCarouselSpeed('mobileSpeed', parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs font-mono w-8" style={{ color: 'var(--text-muted)' }}>
                                    {(eventsCarouselConfig.mobileSpeed ?? 0.6).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Header + Add Event */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Upcoming Events</h3>
                    <p className="text-sm text-muted-foreground">Manage events that appear on the Events page.</p>
                </div>
                <Button onClick={() => setEditing({ ...EMPTY_EVENT })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Event
                </Button>
            </div>

            {(!events || events.length === 0) && (
                <div className="text-center py-16">
                    <CalendarDays className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No events yet. Add your first event above.</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events?.map(event => (
                    <Card key={event.id} className="bg-card/50 border-primary/30 overflow-hidden">
                        {/* 1:1 Preview */}
                        <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                            {event.image_url ? (
                                <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                                    <CalendarDays className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}
                            {/* Visibility badge */}
                            <div className="absolute top-2 right-2">
                                {event.visible ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white">
                                        <Eye className="h-3 w-3" /> Live
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-600 text-white">
                                        <EyeOff className="h-3 w-3" /> Hidden
                                    </span>
                                )}
                            </div>
                        </div>
                        <CardContent className="p-3 space-y-2">
                            <h4 className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                {event.title}
                            </h4>
                            {event.event_date && (
                                <p className="text-xs text-muted-foreground">
                                    {new Date(event.event_date + 'T00:00:00').toLocaleDateString()}
                                    {event.event_time && ` · ${event.event_time}`}
                                </p>
                            )}
                            <div className="flex gap-2 pt-1">
                                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setEditing(event)}>
                                    <Edit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 text-xs" onClick={() => handleDelete(event.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminEventsEditor;
