import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Eye, X, Clock, CheckCircle, XCircle, MessageSquare, Paperclip, Download, Image as ImageIcon, File as FileIcon } from "lucide-react";

interface Attachment {
    id: string;
    file_name: string;
    file_size: number;
    file_type: string | null;
    storage_path: string;
    public_url: string;
    uploaded_at: string;
}

const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BookingAttachmentList = ({ bookingId }: { bookingId: string }) => {
    const qc = useQueryClient();
    const { toast } = useToast();
    const { data: attachments } = useQuery({
        queryKey: ['attachments', 'booking', bookingId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contact_attachments')
                .select('*')
                .eq('submission_type', 'booking')
                .eq('submission_id', bookingId)
                .order('uploaded_at');
            if (error) throw error;
            return (data || []) as Attachment[];
        },
    });

    const handleDelete = async (att: Attachment) => {
        if (!confirm(`Delete ${att.file_name}?`)) return;
        await supabase.storage.from('contact-uploads').remove([att.storage_path]);
        await supabase.from('contact_attachments').delete().eq('id', att.id);
        qc.invalidateQueries({ queryKey: ['attachments', 'booking', bookingId] });
        toast({ title: 'Attachment deleted' });
    };

    if (!attachments?.length) return null;

    return (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                <Paperclip className="h-3 w-3" /> {attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}
            </p>
            <div className="flex flex-wrap gap-2">
                {attachments.map(att => (
                    <div key={att.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px]" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                        {att.file_type?.startsWith('image/')
                            ? <ImageIcon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                            : <FileIcon className="h-3 w-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        }
                        <span className="truncate max-w-[100px]" style={{ color: 'var(--text-secondary)' }}>{att.file_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{fmtSize(att.file_size)}</span>
                        <a href={att.public_url} target="_blank" rel="noopener noreferrer" className="p-0.5 rounded hover:opacity-70" title="Download">
                            <Download className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                        </a>
                        <button onClick={() => handleDelete(att)} className="p-0.5 rounded hover:opacity-70" title="Delete">
                            <Trash2 className="h-3 w-3" style={{ color: '#ef4444' }} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface BookingRequest {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string | null;
    company_organization: string | null;
    event_type: string;
    event_date: string | null;
    event_location: string | null;
    event_duration: string | null;
    estimated_audience_size: string | null;
    talent_requested: string | null;
    budget_range: string | null;
    additional_details: string | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pending', color: '#f59e0b', icon: Clock },
    reviewed: { label: 'Reviewed', color: '#3b82f6', icon: Eye },
    approved: { label: 'Approved', color: '#22c55e', icon: CheckCircle },
    declined: { label: 'Declined', color: '#ef4444', icon: XCircle },
};

const AdminBookings = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
    const [adminNotes, setAdminNotes] = useState('');

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['booking-requests'],
        queryFn: async (): Promise<BookingRequest[]> => {
            const { data, error } = await supabase
                .from('booking_requests')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        staleTime: 30 * 1000,
    });

    const updateStatus = async (id: string, status: string) => {
        try {
            const { error } = await supabase
                .from('booking_requests')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            toast({ title: `Booking ${status}` });
            queryClient.invalidateQueries({ queryKey: ['booking-requests'] });
            if (selectedBooking?.id === id) {
                setSelectedBooking(prev => prev ? { ...prev, status } : null);
            }
        } catch (err: any) {
            toast({ title: 'Error updating status', description: err.message, variant: 'destructive' });
        }
    };

    const saveNotes = async (id: string) => {
        try {
            const { error } = await supabase
                .from('booking_requests')
                .update({ admin_notes: adminNotes, updated_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
            toast({ title: 'Notes saved' });
            queryClient.invalidateQueries({ queryKey: ['booking-requests'] });
        } catch (err: any) {
            toast({ title: 'Error saving notes', description: err.message, variant: 'destructive' });
        }
    };

    const deleteBooking = async (id: string) => {
        if (!confirm('Delete this booking request? This cannot be undone.')) return;
        try {
            const { error } = await supabase.from('booking_requests').delete().eq('id', id);
            if (error) throw error;
            toast({ title: 'Booking deleted' });
            queryClient.invalidateQueries({ queryKey: ['booking-requests'] });
            if (selectedBooking?.id === id) setSelectedBooking(null);
        } catch (err: any) {
            toast({ title: 'Error deleting', description: err.message, variant: 'destructive' });
        }
    };

    const openDetail = (booking: BookingRequest) => {
        setSelectedBooking(booking);
        setAdminNotes(booking.admin_notes || '');
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-orbitron text-lg sm:text-xl font-bold tracking-wider" style={{ color: 'var(--accent)' }}>
                    Booking Requests
                </h2>
                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                    {bookings?.length || 0} total
                </span>
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div
                    className="rounded-xl p-4 sm:p-5 mb-6"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                {selectedBooking.client_name}
                            </h3>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                Submitted {formatDate(selectedBooking.created_at)}
                            </p>
                        </div>
                        <button onClick={() => setSelectedBooking(null)} className="p-1 rounded" style={{ color: 'var(--text-muted)' }}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.client_email}</span></div>
                        {selectedBooking.client_phone && <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.client_phone}</span></div>}
                        {selectedBooking.company_organization && <div><span style={{ color: 'var(--text-muted)' }}>Company:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.company_organization}</span></div>}
                        <div><span style={{ color: 'var(--text-muted)' }}>Event Type:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.event_type}</span></div>
                        {selectedBooking.event_date && <div><span style={{ color: 'var(--text-muted)' }}>Date:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.event_date}</span></div>}
                        {selectedBooking.event_location && <div><span style={{ color: 'var(--text-muted)' }}>Location:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.event_location}</span></div>}
                        {selectedBooking.event_duration && <div><span style={{ color: 'var(--text-muted)' }}>Duration:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.event_duration}</span></div>}
                        {selectedBooking.estimated_audience_size && <div><span style={{ color: 'var(--text-muted)' }}>Audience:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.estimated_audience_size}</span></div>}
                        {selectedBooking.talent_requested && <div><span style={{ color: 'var(--text-muted)' }}>Talent:</span> <span style={{ color: 'var(--accent)' }}>{selectedBooking.talent_requested}</span></div>}
                        {selectedBooking.budget_range && <div><span style={{ color: 'var(--text-muted)' }}>Budget:</span> <span style={{ color: 'var(--text-primary)' }}>{selectedBooking.budget_range}</span></div>}
                    </div>

                    {selectedBooking.additional_details && (
                        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Additional Details:</p>
                            {selectedBooking.additional_details}
                        </div>
                    )}

                    {/* Status buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                            const Icon = cfg.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => updateStatus(selectedBooking.id, key)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: selectedBooking.status === key ? cfg.color : 'transparent',
                                        color: selectedBooking.status === key ? '#fff' : cfg.color,
                                        border: `1px solid ${cfg.color}`,
                                        opacity: selectedBooking.status === key ? 1 : 0.7,
                                    }}
                                >
                                    <Icon className="h-3 w-3" />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Admin notes */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>
                                <MessageSquare className="h-3 w-3 inline mr-1" />Admin Notes
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={e => setAdminNotes(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                                style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--input-text)' }}
                                placeholder="Internal notes about this booking..."
                            />
                        </div>
                        <button
                            onClick={() => saveNotes(selectedBooking.id)}
                            className="self-end px-3 py-2 rounded-lg text-xs font-bold"
                            style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                        >
                            Save
                        </button>
                    </div>

                    {/* Attachments */}
                    <BookingAttachmentList bookingId={selectedBooking.id} />
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton)' }} />
                    ))}
                </div>
            ) : bookings && bookings.length > 0 ? (
                <div className="space-y-2">
                    {bookings.map(b => {
                        const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                        const Icon = cfg.icon;
                        return (
                            <div
                                key={b.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                                style={{
                                    backgroundColor: selectedBooking?.id === b.id ? 'var(--badge-bg)' : 'var(--bg-card)',
                                    border: `1px solid ${selectedBooking?.id === b.id ? 'var(--accent)' : 'var(--border)'}`,
                                }}
                                onClick={() => openDetail(b)}
                            >
                                {/* Status dot */}
                                <div className="flex-shrink-0">
                                    <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                        {b.client_name}
                                        {b.talent_requested && (
                                            <span className="ml-2 text-xs" style={{ color: 'var(--accent)' }}>→ {b.talent_requested}</span>
                                        )}
                                    </p>
                                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                        {b.event_type} • {formatDate(b.created_at)}
                                    </p>
                                </div>

                                {/* Status badge */}
                                <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                                    style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
                                >
                                    {cfg.label}
                                </span>

                                {/* Delete */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteBooking(b.id); }}
                                    className="p-1 rounded hover:opacity-80 flex-shrink-0"
                                    style={{ color: 'var(--error)' }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p style={{ color: 'var(--text-muted)' }}>No booking requests yet.</p>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
