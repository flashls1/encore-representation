import { useState, useEffect } from 'react';
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
import { CalendarDays, Plus, Trash2, Save, Loader2, Image as ImageIcon, Edit, Eye, EyeOff, Settings, Link2, Link2Off, Clock } from 'lucide-react';

const EMPTY_EVENT: Partial<UpcomingEvent> = {
    title: '',
    description: '',
    image_url: '',
    event_date: null,
    event_end_date: null,
    event_time: '',
    event_end_time: '',
    event_schedule: [],
    location: '',
    link_url: '',
    link_visible: true,
    sort_order: 0,
    visible: true,
};

interface ScheduleDay {
    date: string;
    start_time: string;
    end_time: string;
}

const getDayOfWeek = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long' });
};

/** Convert 24h time string (e.g. "14:00") to 12h display (e.g. "2:00 PM") */
const formatTime12 = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h)) return time;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m ?? 0).padStart(2, '0')} ${period}`;
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

    // Carousel speed settings — MUST be declared before any early returns (Rules of Hooks)
    const [localDesktopSpeed, setLocalDesktopSpeed] = useState<number>(eventsCarouselConfig.desktopSpeed ?? 1.0);
    const [localMobileSpeed, setLocalMobileSpeed] = useState<number>(eventsCarouselConfig.mobileSpeed ?? 0.6);
    const [savingSpeed, setSavingSpeed] = useState(false);

    // Sync local state when config loads
    useEffect(() => {
        setLocalDesktopSpeed(eventsCarouselConfig.desktopSpeed ?? 1.0);
        setLocalMobileSpeed(eventsCarouselConfig.mobileSpeed ?? 0.6);
    }, [eventsCarouselConfig.desktopSpeed, eventsCarouselConfig.mobileSpeed]);

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 className="text-lg font-bold text-foreground">
                        {editing.id ? 'Edit Event' : 'New Event'}
                    </h3>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditing(null)} className="flex-1 sm:flex-none">Cancel</Button>
                        <Button onClick={handleSave} disabled={upsert.isPending} className="flex-1 sm:flex-none">
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

                        {/* Schedule — Dynamic Day Rows */}
                        <div className="rounded-lg p-4 space-y-4" style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                    <CalendarDays className="h-3.5 w-3.5" /> Event Schedule
                                </h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const schedule = [...(editing.event_schedule as ScheduleDay[] || [])];
                                        schedule.push({ date: '', start_time: '', end_time: '' });
                                        setEditing(p => ({ ...p, event_schedule: schedule }));
                                    }}
                                >
                                    <Plus className="h-3 w-3 mr-1" /> Add Day
                                </Button>
                            </div>

                            {(editing.event_schedule as ScheduleDay[] || []).length === 0 && (
                                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                                    No days added yet. Click "Add Day" to set up the event schedule.
                                </p>
                            )}

                            {(editing.event_schedule as ScheduleDay[] || []).map((day: ScheduleDay, idx: number) => (
                                <div key={idx} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                                            {day.date ? getDayOfWeek(day.date) : `Day ${idx + 1}`}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const schedule = [...(editing.event_schedule as ScheduleDay[] || [])];
                                                schedule.splice(idx, 1);
                                                setEditing(p => ({ ...p, event_schedule: schedule }));
                                            }}
                                            className="p-1 rounded hover:opacity-70"
                                            style={{ color: 'var(--error)' }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-[10px]">Date</Label>
                                            <Input
                                                type="date"
                                                value={day.date}
                                                onChange={e => {
                                                    const schedule = [...(editing.event_schedule as ScheduleDay[] || [])];
                                                    schedule[idx] = { ...schedule[idx], date: e.target.value };
                                                    setEditing(p => ({ ...p, event_schedule: schedule }));
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px]">Start Time</Label>
                                            <Input
                                                type="time"
                                                value={day.start_time}
                                                onChange={e => {
                                                    const schedule = [...(editing.event_schedule as ScheduleDay[] || [])];
                                                    schedule[idx] = { ...schedule[idx], start_time: e.target.value };
                                                    setEditing(p => ({ ...p, event_schedule: schedule }));
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px]">End Time <span className="font-normal" style={{ color: 'var(--text-muted)' }}>(opt)</span></Label>
                                            <Input
                                                type="time"
                                                value={day.end_time || ''}
                                                onChange={e => {
                                                    const schedule = [...(editing.event_schedule as ScheduleDay[] || [])];
                                                    schedule[idx] = { ...schedule[idx], end_time: e.target.value };
                                                    setEditing(p => ({ ...p, event_schedule: schedule }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={editing.link_visible ?? true}
                                        onCheckedChange={v => setEditing(p => ({ ...p, link_visible: v }))}
                                        id="event-link-visible"
                                    />
                                    <Label htmlFor="event-link-visible" className="flex items-center gap-1.5">
                                        {editing.link_visible !== false
                                            ? <><Link2 className="h-3.5 w-3.5" /> Show Link Button</>
                                            : <><Link2Off className="h-3.5 w-3.5" /> Link Button Hidden</>}
                                    </Label>
                                </div>
                                {editing.link_visible !== false && (
                                    <div>
                                        <Label>Link URL</Label>
                                        <Input
                                            value={editing.link_url || ''}
                                            onChange={e => setEditing(p => ({ ...p, link_url: e.target.value }))}
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}
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

    const saveCarouselSettings = async () => {
        setSavingSpeed(true);
        try {
            await supabase.from('ui_effect_overrides').upsert(
                { effect_id: 'events-carousel', props: { desktopSpeed: localDesktopSpeed, mobileSpeed: localMobileSpeed } },
                { onConflict: 'effect_id' }
            );
            queryClient.invalidateQueries({ queryKey: ['ui-effect-overrides'] });
            toast({ title: 'Saved', description: 'Carousel settings saved successfully.' });
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
        setSavingSpeed(false);
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
                                    value={localDesktopSpeed}
                                    onChange={(e) => setLocalDesktopSpeed(parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs font-mono w-8" style={{ color: 'var(--text-muted)' }}>
                                    {localDesktopSpeed.toFixed(1)}
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
                                    value={localMobileSpeed}
                                    onChange={(e) => setLocalMobileSpeed(parseFloat(e.target.value))}
                                    className="flex-1"
                                />
                                <span className="text-xs font-mono w-8" style={{ color: 'var(--text-muted)' }}>
                                    {localMobileSpeed.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={saveCarouselSettings} disabled={savingSpeed} size="sm">
                            {savingSpeed ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Settings
                        </Button>
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
                            {(() => {
                                const sched = (event.event_schedule as ScheduleDay[] || []);
                                if (sched.length > 0) {
                                    return (
                                        <p className="text-xs text-muted-foreground">
                                            {sched.map((d, i) => {
                                                const dayStr = d.date ? `${getDayOfWeek(d.date).slice(0, 3)} ${new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : '';
                                                const timeStr = d.start_time ? formatTime12(d.start_time) + (d.end_time ? `–${formatTime12(d.end_time)}` : '') : '';
                                                return <span key={i}>{i > 0 ? ' · ' : ''}{dayStr}{timeStr ? ` ${timeStr}` : ''}</span>;
                                            })}
                                        </p>
                                    );
                                } else if (event.event_date) {
                                    return (
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(event.event_date + 'T00:00:00').toLocaleDateString()}
                                            {event.event_time && ` · ${formatTime12(event.event_time)}`}
                                        </p>
                                    );
                                }
                                return null;
                            })()}
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
