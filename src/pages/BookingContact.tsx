import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useTalents, useSiteSettings, useSubmitContactForm } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Calendar, MapPin, Users, DollarSign, FileText, Mail, Phone, Building, Upload, X, Paperclip, Image as ImageIcon, File as FileIcon } from "lucide-react";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

/** Upload files to storage and track in contact_attachments */
const uploadAttachments = async (
    files: File[],
    submissionType: 'contact' | 'booking',
    submissionId: string,
) => {
    const results: string[] = [];
    for (const file of files) {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${submissionType}/${submissionId}/${timestamp}_${safeName}`;

        const { error: uploadErr } = await supabase.storage
            .from('contact-uploads')
            .upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
            .from('contact-uploads')
            .getPublicUrl(path);

        await supabase.from('contact_attachments').insert({
            submission_type: submissionType,
            submission_id: submissionId,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type || null,
            storage_path: path,
            public_url: urlData.publicUrl,
        });
        results.push(urlData.publicUrl);
    }
    return results;
};

const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (type: string) => type.startsWith('image/');

// ─── File Uploader Component ────────────────────────────────────────────────────
const FileUploader = ({ files, setFiles, toast }: { files: File[]; setFiles: (f: File[]) => void; toast: any }) => {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const incoming = Array.from(newFiles);
        const valid: File[] = [];
        for (const f of incoming) {
            if (files.length + valid.length >= MAX_FILES) {
                toast({ title: `Max ${MAX_FILES} files allowed`, variant: 'destructive' });
                break;
            }
            if (f.size > MAX_FILE_SIZE) {
                toast({ title: `${f.name} exceeds 25MB limit`, variant: 'destructive' });
                continue;
            }
            valid.push(f);
        }
        if (valid.length) setFiles([...files, ...valid]);
    }, [files, setFiles, toast]);

    const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

    return (
        <div className="space-y-3">
            <label className="text-xs font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#999' }}>
                <Paperclip className="h-3 w-3" /> Attachments <span style={{ color: '#666' }}>(max 5 files, 25MB each)</span>
            </label>
            {/* Drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className="relative flex flex-col items-center justify-center gap-2 py-6 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                    border: `2px dashed ${dragOver ? '#D4AF37' : '#333'}`,
                    backgroundColor: dragOver ? 'rgba(212, 175, 55, 0.05)' : '#0a0a0a',
                }}
            >
                <Upload className="h-6 w-6" style={{ color: dragOver ? '#D4AF37' : '#555' }} />
                <p className="text-xs" style={{ color: '#888' }}>
                    {dragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                />
            </div>
            {/* File previews */}
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map((f, i) => (
                        <div
                            key={`${f.name}-${i}`}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                            style={{ backgroundColor: '#111', border: '1px solid #222' }}
                        >
                            {isImageFile(f.type)
                                ? <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                                : <FileIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                            }
                            <span className="truncate max-w-[120px]" style={{ color: '#ccc' }}>{f.name}</span>
                            <span style={{ color: '#666' }}>{formatFileSize(f.size)}</span>
                            <button type="button" onClick={e => { e.stopPropagation(); removeFile(i); }} className="ml-1 p-0.5 rounded hover:bg-red-500/20">
                                <X className="h-3 w-3" style={{ color: '#ef4444' }} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Booking Form ───────────────────────────────────────────────────────────────
const BookingForm = () => {
    const { data: talents } = useTalents();
    const { toast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const [form, setForm] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        company_organization: '',
        event_type: '',
        event_date: '',
        event_location: '',
        event_duration: '',
        estimated_audience_size: '',
        talent_requested: '',
        budget_range: '',
        additional_details: '',
    });

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.client_name || !form.client_email || !form.event_type) {
            toast({ title: 'Please fill in all required fields', variant: 'destructive' });
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase.from('booking_requests').insert({
                client_name: form.client_name,
                client_email: form.client_email,
                client_phone: form.client_phone || null,
                company_organization: form.company_organization || null,
                event_type: form.event_type,
                event_date: form.event_date || null,
                event_location: form.event_location || null,
                event_duration: form.event_duration || null,
                estimated_audience_size: form.estimated_audience_size || null,
                talent_requested: form.talent_requested || null,
                budget_range: form.budget_range || null,
                additional_details: form.additional_details || null,
            }).select('id').single();
            if (error) throw error;

            // Upload attachments
            if (files.length > 0 && data?.id) {
                await uploadAttachments(files, 'booking', data.id);
            }

            setSubmitted(true);
            setFiles([]);
            toast({ title: 'Booking request submitted!' });
        } catch (err: any) {
            toast({ title: 'Error submitting booking', description: err.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)' }}>
                    <Send className="h-7 w-7" style={{ color: '#D4AF37' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Booking Request Received</h3>
                <p className="text-sm mb-4" style={{ color: '#999' }}>
                    We'll review your request and get back to you within 24-48 hours.
                </p>
                <button
                    onClick={() => { setSubmitted(false); setFiles([]); setForm({ client_name: '', client_email: '', client_phone: '', company_organization: '', event_type: '', event_date: '', event_location: '', event_duration: '', estimated_audience_size: '', talent_requested: '', budget_range: '', additional_details: '' }); }}
                    className="text-sm font-medium px-4 py-2 rounded-lg"
                    style={{ border: '1px solid rgba(212, 175, 55, 0.3)', color: '#D4AF37' }}
                >
                    Submit Another Request
                </button>
            </motion.div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors";
    const inputStyle = { backgroundColor: '#111', border: '1px solid #222', color: '#fff' };
    const focusStyle = { borderColor: '#D4AF37' };
    const labelClass = "text-xs font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5";
    const labelStyle = { color: '#999' };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass} style={labelStyle}><Users className="h-3 w-3" />Full Name *</label>
                    <input type="text" required value={form.client_name} onChange={e => update('client_name', e.target.value)} placeholder="Your full name" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                    <label className={labelClass} style={labelStyle}><Mail className="h-3 w-3" />Email *</label>
                    <input type="email" required value={form.client_email} onChange={e => update('client_email', e.target.value)} placeholder="your@email.com" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                    <label className={labelClass} style={labelStyle}><Phone className="h-3 w-3" />Phone</label>
                    <input type="tel" value={form.client_phone} onChange={e => update('client_phone', e.target.value)} placeholder="(555) 123-4567" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                    <label className={labelClass} style={labelStyle}><Building className="h-3 w-3" />Company / Organization</label>
                    <input type="text" value={form.company_organization} onChange={e => update('company_organization', e.target.value)} placeholder="Your organization" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
            </div>

            {/* Event Details */}
            <div className="pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#D4AF37' }}>Event Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass} style={labelStyle}><FileText className="h-3 w-3" />Event Type *</label>
                        <select required value={form.event_type} onChange={e => update('event_type', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'}>
                            <option value="">Select event type</option>
                            <option value="convention">Convention / Expo</option>
                            <option value="corporate">Corporate Event</option>
                            <option value="private">Private Appearance</option>
                            <option value="signing">Autograph Signing</option>
                            <option value="instore_signing">Instore Signing</option>
                            <option value="virtual">Virtual Appearance</option>
                            <option value="charity">Charity / Fundraiser</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}><Calendar className="h-3 w-3" />Event Date</label>
                        <input type="date" value={form.event_date} onChange={e => update('event_date', e.target.value)} className={inputClass} style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}><MapPin className="h-3 w-3" />Event Location</label>
                        <input type="text" value={form.event_location} onChange={e => update('event_location', e.target.value)} placeholder="City, State or Venue" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Duration</label>
                        <select value={form.event_duration} onChange={e => update('event_duration', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'}>
                            <option value="">Select duration</option>
                            <option value="1-2hrs">1-2 Hours</option>
                            <option value="half-day">Half Day (4 Hours)</option>
                            <option value="full-day">Full Day (8 Hours)</option>
                            <option value="weekend">Weekend (2 Days)</option>
                            <option value="multi-day">Multi-Day (3+ Days)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}>Estimated Audience Size</label>
                        <select value={form.estimated_audience_size} onChange={e => update('estimated_audience_size', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'}>
                            <option value="">Select size</option>
                            <option value="under-50">Under 50</option>
                            <option value="50-200">50 - 200</option>
                            <option value="200-500">200 - 500</option>
                            <option value="500-1000">500 - 1,000</option>
                            <option value="1000-5000">1,000 - 5,000</option>
                            <option value="5000+">5,000+</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass} style={labelStyle}><DollarSign className="h-3 w-3" />Budget Range</label>
                        <select value={form.budget_range} onChange={e => update('budget_range', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'}>
                            <option value="">Select budget</option>
                            <option value="under-1k">Under $1,000</option>
                            <option value="1k-5k">$1,000 - $5,000</option>
                            <option value="5k-10k">$5,000 - $10,000</option>
                            <option value="10k-25k">$10,000 - $25,000</option>
                            <option value="25k-50k">$25,000 - $50,000</option>
                            <option value="50k+">$50,000+</option>
                            <option value="negotiable">Negotiable</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Talent Selection */}
            <div>
                <label className={labelClass} style={labelStyle}>Talent Requested</label>
                <select value={form.talent_requested} onChange={e => update('talent_requested', e.target.value)} className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'}>
                    <option value="">Select talent (optional)</option>
                    {talents?.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                    <option value="multiple">Multiple Talent / TBD</option>
                </select>
            </div>

            {/* Additional Details */}
            <div>
                <label className={labelClass} style={labelStyle}>Additional Details</label>
                <textarea value={form.additional_details} onChange={e => update('additional_details', e.target.value)} placeholder="Tell us more about your event, specific requirements, or any questions..." rows={4} className={inputClass + " resize-none"} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
            </div>

            {/* File Attachments */}
            <FileUploader files={files} setFiles={setFiles} toast={toast} />

            <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 justify-center"
                style={{ backgroundColor: '#D4AF37', color: '#0A0A0A' }}
            >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Booking Request'}
            </button>
        </form>
    );
};

// ─── Contact Form ───────────────────────────────────────────────────────────────
const ContactForm = () => {
    const { toast } = useToast();
    const submitContact = useSubmitContactForm();
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [files, setFiles] = useState<File[]>([]);

    const update = (field: string, value: string) =>
        setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast({ title: 'Please fill in all required fields', variant: 'destructive' });
            return;
        }

        try {
            const result = await submitContact.mutateAsync({
                name: form.name,
                email: form.email,
                subject: form.subject || null,
                message: form.message,
            });

            // Upload attachments
            if (files.length > 0 && result?.id) {
                await uploadAttachments(files, 'contact', result.id);
            }

            setSubmitted(true);
            setFiles([]);
            toast({ title: 'Message sent!' });
        } catch (err: any) {
            toast({ title: 'Error sending message', description: err.message, variant: 'destructive' });
        }
    };

    if (submitted) {
        return (
            <motion.div
                className="text-center py-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)' }}>
                    <Mail className="h-6 w-6" style={{ color: '#D4AF37' }} />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Message Sent</h3>
                <p className="text-sm" style={{ color: '#999' }}>We'll get back to you shortly.</p>
                <button
                    onClick={() => { setSubmitted(false); setFiles([]); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="text-sm font-medium px-4 py-2 rounded-lg mt-3"
                    style={{ border: '1px solid rgba(212, 175, 55, 0.3)', color: '#D4AF37' }}
                >
                    Send Another Message
                </button>
            </motion.div>
        );
    }

    const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors";
    const inputStyle = { backgroundColor: '#111', border: '1px solid #222', color: '#fff' };
    const focusStyle = { borderColor: '#D4AF37' };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#999' }}>Name *</label>
                    <input type="text" required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
                <div>
                    <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#999' }}>Email *</label>
                    <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
                </div>
            </div>
            <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#999' }}>Subject</label>
                <input type="text" value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="What's this about?" className={inputClass} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
            </div>
            <div>
                <label className="text-xs font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#999' }}>Message *</label>
                <textarea required value={form.message} onChange={e => update('message', e.target.value)} placeholder="Tell us how we can help..." rows={4} className={inputClass + " resize-none"} style={inputStyle} onFocus={e => Object.assign(e.target.style, focusStyle)} onBlur={e => e.target.style.borderColor = '#222'} />
            </div>

            {/* File Attachments */}
            <FileUploader files={files} setFiles={setFiles} toast={toast} />
            <button
                type="submit"
                disabled={submitContact.isPending}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 justify-center"
                style={{ backgroundColor: '#D4AF37', color: '#0A0A0A' }}
            >
                <Send className="h-4 w-4" />
                {submitContact.isPending ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────────
const BookingContact = () => {
    const { data: settings } = useSiteSettings();
    const [activeTab, setActiveTab] = useState<'booking' | 'contact'>('booking');

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#0A0A0A' }}>
            <Navigation />

            <main className="pt-24 pb-16 px-4">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider mb-3" style={{ color: '#D4AF37' }}>
                            Booking & Contact
                        </h1>
                        <div className="w-16 h-[2px] mx-auto" style={{ backgroundColor: '#D4AF37' }} />
                    </motion.div>

                    {/* Tab Switcher */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex rounded-xl overflow-hidden" style={{ border: '1px solid #222' }}>
                            <button
                                onClick={() => setActiveTab('booking')}
                                className="px-6 py-2.5 text-sm font-bold transition-all duration-300"
                                style={{
                                    backgroundColor: activeTab === 'booking' ? '#D4AF37' : 'transparent',
                                    color: activeTab === 'booking' ? '#0A0A0A' : '#888',
                                }}
                            >
                                Book Talent
                            </button>
                            <button
                                onClick={() => setActiveTab('contact')}
                                className="px-6 py-2.5 text-sm font-bold transition-all duration-300"
                                style={{
                                    backgroundColor: activeTab === 'contact' ? '#D4AF37' : 'transparent',
                                    color: activeTab === 'contact' ? '#0A0A0A' : '#888',
                                }}
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>

                    {/* Form sections */}
                    <motion.div
                        key={activeTab}
                        className="rounded-2xl p-6 sm:p-8"
                        style={{ backgroundColor: '#0e0e0e', border: '1px solid #1a1a1a' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {activeTab === 'booking' ? (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Request a Booking</h2>
                                    <p className="text-sm" style={{ color: '#888' }}>
                                        Fill out the details below and our team will respond within 24-48 hours.
                                    </p>
                                </div>
                                <BookingForm />
                            </>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h2 className="text-lg font-bold mb-1" style={{ color: '#fff' }}>Get in Touch</h2>
                                    <p className="text-sm" style={{ color: '#888' }}>
                                        Have a question or need information? Send us a message.
                                    </p>
                                </div>
                                <ContactForm />
                            </>
                        )}
                    </motion.div>

                    {/* Contact info */}
                    {settings && (
                        <motion.div
                            className="mt-8 text-center space-y-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {settings.contact_email && (
                                <p className="text-sm flex items-center justify-center gap-2" style={{ color: '#888' }}>
                                    <Mail className="h-3.5 w-3.5" style={{ color: '#D4AF37' }} />
                                    <a href={`mailto:${settings.contact_email}`} style={{ color: '#D4AF37' }}>{settings.contact_email}</a>
                                </p>
                            )}
                            {settings.contact_phone && (
                                <p className="text-sm flex items-center justify-center gap-2" style={{ color: '#888' }}>
                                    <Phone className="h-3.5 w-3.5" style={{ color: '#D4AF37' }} />
                                    <a href={`tel:${settings.contact_phone}`} style={{ color: '#D4AF37' }}>{settings.contact_phone}</a>
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingContact;
