import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTalents } from "@/hooks/useData";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, GripVertical, X, Save, Upload, Bold, Italic, List, Link as LinkIcon, Palette, Image as ImageIcon, Pencil, Mic, Clapperboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Talent, TalentRole } from "@/types/database";

// ─── Text Color Presets ──────────────────────────────────────────────────────────
const TEXT_COLORS = [
    { label: 'White', value: '#ffffff' },
    { label: 'Gold', value: '#D4AF37' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Light Gray', value: '#cccccc' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Purple', value: '#a855f7' },
];

// ─── Rich Text Editor ────────────────────────────────────────────────────────────
const RichTextEditor = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (html: string) => void;
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [showColors, setShowColors] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, []);

    const exec = (command: string, val?: string) => {
        document.execCommand(command, false, val);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const applyColor = (color: string) => {
        exec('foreColor', color);
        setShowColors(false);
    };

    return (
        <div
            className="rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--input-border)' }}
        >
            {/* Toolbar */}
            <div
                className="flex items-center gap-1 px-2 py-1.5 border-b"
                style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--input-border)',
                }}
            >
                <button type="button" onClick={() => exec('bold')} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--text-primary)' }} title="Bold">
                    <Bold className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => exec('italic')} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--text-primary)' }} title="Italic">
                    <Italic className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--text-primary)' }} title="Bullet List">
                    <List className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) exec('createLink', url); }} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--text-primary)' }} title="Insert Link">
                    <LinkIcon className="h-4 w-4" />
                </button>

                {/* Divider */}
                <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border)' }} />

                {/* Color picker */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowColors(!showColors)}
                        className="p-1.5 rounded hover:opacity-80 flex items-center gap-1"
                        style={{ color: 'var(--text-primary)' }}
                        title="Text Color"
                    >
                        <Palette className="h-4 w-4" />
                    </button>
                    {showColors && (
                        <div
                            className="absolute top-full left-0 mt-1 rounded-lg p-2 shadow-xl z-50 min-w-[140px]"
                            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        >
                            <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5 px-1" style={{ color: '#888' }}>Text Color</p>
                            <div className="grid grid-cols-4 gap-1">
                                {TEXT_COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => applyColor(c.value)}
                                        className="w-7 h-7 rounded-md border transition-transform hover:scale-110"
                                        style={{ backgroundColor: c.value, borderColor: '#444' }}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                            <div className="mt-2 pt-2" style={{ borderTop: '1px solid #333' }}>
                                <label className="flex items-center gap-2 cursor-pointer px-1">
                                    <span className="text-[10px] uppercase tracking-wider" style={{ color: '#888' }}>Custom:</span>
                                    <input
                                        type="color"
                                        defaultValue="#ffffff"
                                        className="w-6 h-6 rounded cursor-pointer border-0"
                                        onChange={(e) => applyColor(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editable area — white text on dark background */}
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[250px] p-4 outline-none prose prose-lg max-w-none"
                style={{ backgroundColor: '#111', color: '#ffffff', fontSize: '0.95rem', lineHeight: '1.7' }}
                onInput={() => { if (editorRef.current) onChange(editorRef.current.innerHTML); }}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
                    document.execCommand('insertHTML', false, text);
                    if (editorRef.current) onChange(editorRef.current.innerHTML);
                }}
            />
        </div>
    );
};

const RolesManager = ({
    roles,
    onAdd,
    onEdit,
    onRemove,
    talentId,
}: {
    roles: TalentRole[];
    onAdd: (roleName: string, characterName: string, imageUrl: string | null, showColor: string | null, bgImageUrl: string | null, roleType: string) => void;
    onEdit: (roleId: string, roleName: string, characterName: string, imageUrl: string | null, showColor: string | null, bgImageUrl: string | null, roleType: string) => void;
    onRemove: (roleId: string) => void;
    talentId?: string;
}) => {
    const [showPopup, setShowPopup] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [newChar, setNewChar] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newImage, setNewImage] = useState<string | null>(null);
    const [newShowColor, setNewShowColor] = useState<string | null>(null);
    const [newBgImage, setNewBgImage] = useState<string | null>(null);
    const [newRoleType, setNewRoleType] = useState<string>('voice');
    const [uploading, setUploading] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const { toast } = useToast();

    const openForAdd = () => {
        setEditingRoleId(null);
        setNewChar('');
        setNewRole('');
        setNewImage(null);
        setNewShowColor(null);
        setNewBgImage(null);
        setNewRoleType('voice');
        setShowPopup(true);
    };

    const openForEdit = (role: TalentRole) => {
        setEditingRoleId(role.id);
        setNewChar(role.character_name);
        setNewRole(role.role_name || '');
        setNewImage(role.image_url || null);
        setNewShowColor(role.show_color || null);
        setNewBgImage(role.bg_image_url || null);
        setNewRoleType(role.role_type || 'voice');
        setShowPopup(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `role-${Date.now()}.${ext}`;
            const { data, error } = await supabase.storage
                .from('talent-media')
                .upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('talent-media').getPublicUrl(data.path);
            setNewImage(urlData.publicUrl);
        } catch (err: any) {
            toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingBg(true);
        try {
            const ext = file.name.split('.').pop();
            const fileName = `role-bg-${Date.now()}.${ext}`;
            const { data, error } = await supabase.storage
                .from('talent-media')
                .upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('talent-media').getPublicUrl(data.path);
            setNewBgImage(urlData.publicUrl);
        } catch (err: any) {
            toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
        } finally {
            setUploadingBg(false);
        }
    };

    const handleSave = () => {
        if (!newChar.trim()) return;
        if (editingRoleId) {
            onEdit(editingRoleId, newRole.trim(), newChar.trim(), newImage, newShowColor, newBgImage, newRoleType);
        } else {
            onAdd(newRole.trim(), newChar.trim(), newImage, newShowColor, newBgImage, newRoleType);
        }
        setNewChar('');
        setNewRole('');
        setNewImage(null);
        setNewShowColor(null);
        setNewBgImage(null);
        setNewRoleType('voice');
        setEditingRoleId(null);
        setShowPopup(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    🎭 Characters / Voice Roles
                </label>
                <button
                    type="button"
                    onClick={openForAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Role
                </button>
            </div>

            {/* Existing roles list */}
            {roles.length > 0 ? (
                <div className="space-y-1.5">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                            style={{ backgroundColor: 'var(--badge-bg)', border: '1px solid var(--badge-border)' }}
                        >
                            {role.image_url ? (
                                <img
                                    src={role.image_url}
                                    alt={role.character_name}
                                    className="w-8 h-8 rounded object-cover flex-shrink-0"
                                    style={{ border: '1px solid rgba(212,175,55,0.3)' }}
                                />
                            ) : role.role_type === 'on_screen' ? (
                                <Clapperboard className="h-4 w-4 flex-shrink-0" style={{ color: '#D4AF37' }} />
                            ) : (
                                <Mic className="h-4 w-4 flex-shrink-0" style={{ color: '#D4AF37' }} />
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="font-bold" style={{ color: 'var(--badge-text)' }}>
                                    {role.character_name}
                                </span>
                                {role.role_name && (
                                    <span className="ml-1.5" style={{ color: role.show_color || 'var(--text-muted)' }}>
                                        — {role.role_name}
                                    </span>
                                )}
                            </div>
                            <button type="button" onClick={() => openForEdit(role)} className="p-1 rounded hover:opacity-80 flex-shrink-0" style={{ color: 'var(--accent)' }} title="Edit role">
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => onRemove(role.id)} className="p-1 rounded hover:opacity-80 flex-shrink-0" style={{ color: 'var(--error)' }} title="Delete role">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No roles added yet.</p>
            )}

            {/* ─── Add Role Popup ───────────────────────────────────────── */}
            {showPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setShowPopup(false)}>
                    <div
                        className="w-full max-w-md mx-4 rounded-xl p-6 shadow-2xl"
                        style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold" style={{ color: '#fff' }}>{editingRoleId ? 'Edit Role' : 'Add New Role'}</h3>
                            <button type="button" onClick={() => setShowPopup(false)} className="p-1 rounded hover:opacity-80" style={{ color: '#888' }}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Role Type Selector */}
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#999' }}>
                                    Role Type
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNewRoleType('voice')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
                                        style={{
                                            backgroundColor: newRoleType === 'voice' ? 'rgba(212,175,55,0.15)' : '#111',
                                            border: newRoleType === 'voice' ? '2px solid #D4AF37' : '1px solid #333',
                                            color: newRoleType === 'voice' ? '#D4AF37' : '#888',
                                        }}
                                    >
                                        <Mic className="h-4 w-4" />
                                        Voice
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewRoleType('on_screen')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
                                        style={{
                                            backgroundColor: newRoleType === 'on_screen' ? 'rgba(212,175,55,0.15)' : '#111',
                                            border: newRoleType === 'on_screen' ? '2px solid #D4AF37' : '1px solid #333',
                                            color: newRoleType === 'on_screen' ? '#D4AF37' : '#888',
                                        }}
                                    >
                                        <Clapperboard className="h-4 w-4" />
                                        On Screen
                                    </button>
                                </div>
                            </div>

                            {/* Character name */}
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#999' }}>
                                    Character Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Goku, Naruto, Spike..."
                                    value={newChar}
                                    onChange={(e) => setNewChar(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                    style={{ backgroundColor: '#111', border: '1px solid #333', color: '#fff' }}
                                    autoFocus
                                />
                            </div>

                            {/* Show / Series + Color */}
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#999' }}>
                                    Show / Series
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="e.g. Dragon Ball Z, Cowboy Bebop..."
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                        className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ backgroundColor: '#111', border: '1px solid #333', color: newShowColor || '#fff' }}
                                    />
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                            className="h-full px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium"
                                            style={{ border: '1px solid #333', backgroundColor: '#111', color: newShowColor || '#888' }}
                                            title="Show name color"
                                        >
                                            <Palette className="h-3.5 w-3.5" />
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: newShowColor || '#888', border: '1px solid #555' }} />
                                        </button>
                                        {showColorPicker && (
                                            <div className="absolute top-full right-0 mt-1 rounded-lg p-2 shadow-xl z-50 min-w-[140px]" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
                                                <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5 px-1" style={{ color: '#888' }}>Show Color</p>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {TEXT_COLORS.map(c => (
                                                        <button key={c.value} type="button" onClick={() => { setNewShowColor(c.value); setShowColorPicker(false); }} className="w-7 h-7 rounded-md border transition-transform hover:scale-110" style={{ backgroundColor: c.value, borderColor: '#444' }} title={c.label} />
                                                    ))}
                                                </div>
                                                <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px solid #333' }}>
                                                    <label className="flex items-center gap-2 cursor-pointer px-1">
                                                        <span className="text-[10px] uppercase tracking-wider" style={{ color: '#888' }}>Custom:</span>
                                                        <input type="color" defaultValue="#D4AF37" className="w-6 h-6 rounded cursor-pointer border-0" onChange={(e) => { setNewShowColor(e.target.value); setShowColorPicker(false); }} />
                                                    </label>
                                                    {newShowColor && (
                                                        <button type="button" onClick={() => { setNewShowColor(null); setShowColorPicker(false); }} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#888', border: '1px solid #444' }}>Reset</button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Character Image (optional) */}
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#999' }}>
                                    Character Image <span style={{ color: '#666' }}>(optional)</span>
                                </label>
                                {newImage ? (
                                    <div className="flex items-center gap-3">
                                        <img src={newImage} alt="Preview" className="w-14 h-14 rounded-lg object-cover" style={{ border: '1.5px solid rgba(212,175,55,0.3)' }} />
                                        <button type="button" onClick={() => setNewImage(null)} className="text-xs font-medium px-2 py-1 rounded" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Remove</button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 w-full py-3 rounded-lg cursor-pointer text-xs font-medium transition-colors" style={{ border: '1px dashed #444', color: '#888' }}>
                                        {uploading ? <span>Uploading...</span> : <><ImageIcon className="h-4 w-4" />Upload character image</>}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                )}
                            </div>

                            {/* Background Image (optional) */}
                            <div>
                                <label className="text-xs uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#999' }}>
                                    Card Background Image <span style={{ color: '#666' }}>(optional)</span>
                                </label>
                                <p className="text-[10px] mb-2" style={{ color: '#666' }}>
                                    Recommended: 600×200px (3:1 ratio). Image will be fitted to fill the role card.
                                </p>
                                {newBgImage ? (
                                    <div className="flex items-center gap-3">
                                        <img src={newBgImage} alt="BG Preview" className="w-24 h-8 rounded object-cover" style={{ border: '1px solid rgba(212,175,55,0.3)' }} />
                                        <button type="button" onClick={() => setNewBgImage(null)} className="text-xs font-medium px-2 py-1 rounded" style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>Remove</button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 w-full py-3 rounded-lg cursor-pointer text-xs font-medium transition-colors" style={{ border: '1px dashed #444', color: '#888' }}>
                                        {uploadingBg ? <span>Uploading...</span> : <><ImageIcon className="h-4 w-4" />Upload background image</>}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} disabled={uploadingBg} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={!newChar.trim()}
                                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-40"
                                style={{ backgroundColor: '#D4AF37', color: '#0A0A0A' }}
                            >
                                {editingRoleId ? <><Save className="h-4 w-4" />Save Changes</> : <><Plus className="h-4 w-4" />Add Role</>}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPopup(false)}
                                className="px-4 py-2.5 rounded-lg text-sm font-medium"
                                style={{ border: '1px solid #333', color: '#888' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Slug helper ────────────────────────────────────────────────────────────────
const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Main AdminTalents Component ────────────────────────────────────────────────
const AdminTalents = () => {
    const { data: talents, isLoading } = useTalents();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state — uses single "name" field matching DB schema
    const [talentName, setTalentName] = useState('');
    const [bio, setBio] = useState('');
    const [headshotUrl, setHeadshotUrl] = useState('');
    const [featured, setFeatured] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);
    const [roles, setRoles] = useState<TalentRole[]>([]);
    const [saving, setSaving] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const resetForm = () => {
        setTalentName('');
        setBio('');
        setHeadshotUrl('');
        setFeatured(false);
        setSortOrder(talents?.length || 0);
        setRoles([]);
        setEditingTalent(null);
        setIsCreating(false);
    };

    const startCreate = () => {
        resetForm();
        setSortOrder(talents?.length || 0);
        setIsCreating(true);
    };

    const startEdit = (talent: Talent) => {
        setEditingTalent(talent);
        setIsCreating(false);
        setTalentName(talent.name);
        setBio(talent.bio || '');
        setHeadshotUrl(talent.headshot_url || '');
        setFeatured(talent.featured);
        setSortOrder(talent.sort_order);
        setRoles(talent.talent_roles || []);
    };

    const handleSave = async () => {
        if (!talentName.trim()) {
            toast({ title: 'Name is required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            const slug = slugify(talentName.trim());

            if (editingTalent) {
                // Update talent
                const { error } = await supabase
                    .from('talents')
                    .update({
                        name: talentName.trim(),
                        slug,
                        bio: bio || null,
                        headshot_url: headshotUrl || null,
                        featured,
                        sort_order: sortOrder,
                    })
                    .eq('id', editingTalent.id);

                if (error) throw error;

                // Sync roles: delete all, re-insert
                await supabase.from('talent_roles').delete().eq('talent_id', editingTalent.id);
                if (roles.length > 0) {
                    const { error: rolesError } = await supabase
                        .from('talent_roles')
                        .insert(
                            roles.map((r) => ({
                                talent_id: editingTalent.id,
                                character_name: r.character_name,
                                role_name: r.role_name || '',
                                image_url: r.image_url || null,
                                show_color: r.show_color || null,
                                bg_image_url: r.bg_image_url || null,
                                role_type: r.role_type || 'voice',
                            }))
                        );
                    if (rolesError) throw rolesError;
                }

                toast({ title: `${talentName} updated` });
            } else {
                // Create talent
                const { data, error } = await supabase
                    .from('talents')
                    .insert({
                        name: talentName.trim(),
                        slug,
                        bio: bio || null,
                        headshot_url: headshotUrl || null,
                        featured,
                        sort_order: sortOrder,
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Insert roles
                if (roles.length > 0 && data) {
                    const { error: rolesError } = await supabase
                        .from('talent_roles')
                        .insert(
                            roles.map((r) => ({
                                talent_id: data.id,
                                character_name: r.character_name,
                                role_name: r.role_name || '',
                                image_url: r.image_url || null,
                                show_color: r.show_color || null,
                                bg_image_url: r.bg_image_url || null,
                                role_type: r.role_type || 'voice',
                            }))
                        );
                    if (rolesError) throw rolesError;
                }

                toast({ title: `${talentName} added` });
            }

            queryClient.invalidateQueries({ queryKey: ['talents'] });
            resetForm();
        } catch (err: any) {
            toast({ title: 'Error saving talent', description: err.message, variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (talent: Talent) => {
        setPendingDeleteId(null);

        try {
            // Delete child rows first (FK constraint requires this order)
            const { error: rolesErr } = await supabase.from('talent_roles').delete().eq('talent_id', talent.id);
            if (rolesErr) throw new Error(`Failed to delete roles: ${rolesErr.message}`);

            const { error: imagesErr } = await supabase.from('talent_images').delete().eq('talent_id', talent.id);
            if (imagesErr) throw new Error(`Failed to delete images: ${imagesErr.message}`);

            // Delete the talent record itself
            const { error } = await supabase.from('talents').delete().eq('id', talent.id);
            if (error) throw error;

            // Clean up storage file if headshot exists
            if (talent.headshot_url) {
                try {
                    const url = new URL(talent.headshot_url);
                    const pathParts = url.pathname.split('/object/public/talent-media/');
                    if (pathParts.length > 1) {
                        await supabase.storage.from('talent-media').remove([pathParts[1]]);
                    }
                } catch { /* best-effort storage cleanup */ }
            }

            toast({ title: `${talent.name} deleted` });
            queryClient.invalidateQueries({ queryKey: ['talents'] });
            queryClient.invalidateQueries({ queryKey: ['media-library'] });

            if (editingTalent?.id === talent.id) resetForm();
        } catch (err: any) {
            toast({ title: 'Error deleting talent', description: err.message, variant: 'destructive' });
        }
    };

    const handleHeadshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
            .from('talent-media')
            .upload(fileName, file, { upsert: true });

        if (error) {
            toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
            return;
        }

        const { data: urlData } = supabase.storage.from('talent-media').getPublicUrl(data.path);
        const publicUrl = urlData.publicUrl;
        setHeadshotUrl(publicUrl);

        // Also insert into media_library as a backup copy
        try {
            let width: number | null = null;
            let height: number | null = null;
            if (file.type.startsWith('image/')) {
                try {
                    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
                        img.onerror = reject;
                        img.src = URL.createObjectURL(file);
                    });
                    width = dims.width;
                    height = dims.height;
                } catch { /* ignore dimension errors */ }
            }

            await supabase.from('media_library').insert({
                file_name: file.name,
                file_url: publicUrl,
                file_size: file.size,
                file_type: file.type,
                width,
                height,
            });

            queryClient.invalidateQueries({ queryKey: ['media-library'] });
        } catch { /* best-effort media library backup */ }

        toast({ title: 'Headshot uploaded & saved to Media Library' });
    };

    const addRole = (roleName: string, characterName: string, imageUrl: string | null, showColor: string | null, bgImageUrl: string | null, roleType: string) => {
        setRoles(prev => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                talent_id: editingTalent?.id || '',
                role_name: roleName,
                character_name: characterName,
                image_url: imageUrl,
                show_color: showColor,
                bg_image_url: bgImageUrl,
                role_type: roleType,
            },
        ]);
    };

    const removeRole = (roleId: string) => {
        setRoles(prev => prev.filter(r => r.id !== roleId));
    };

    const editRole = (roleId: string, roleName: string, characterName: string, imageUrl: string | null, showColor: string | null, bgImageUrl: string | null, roleType: string) => {
        setRoles(prev => prev.map(r => r.id === roleId ? {
            ...r,
            role_name: roleName,
            character_name: characterName,
            image_url: imageUrl,
            show_color: showColor,
            bg_image_url: bgImageUrl,
            role_type: roleType,
        } : r));
    };

    const isEditing = isCreating || !!editingTalent;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-orbitron text-xl font-bold tracking-wider" style={{ color: 'var(--accent)' }}>
                    Talent Management
                </h2>
                {!isEditing && (
                    <button
                        onClick={startCreate}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Talent
                    </button>
                )}
            </div>

            {/* Edit / Create Form */}
            {isEditing && (
                <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {editingTalent ? `Editing: ${editingTalent.name}` : 'Add New Talent'}
                        </h3>
                        <button onClick={resetForm} className="p-1.5 rounded hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Name */}
                    <div className="mb-4">
                        <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={talentName}
                            onChange={(e) => setTalentName(e.target.value)}
                            className="theme-input w-full"
                            placeholder="Full name (e.g. John Smith)"
                        />
                    </div>

                    {/* Headshot */}
                    <div className="mb-4">
                        <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                            Headshot (1:1 square recommended)
                        </label>
                        <div className="flex items-center gap-4">
                            {headshotUrl && (
                                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                                    <img src={headshotUrl} alt="Headshot" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={headshotUrl}
                                    onChange={(e) => setHeadshotUrl(e.target.value)}
                                    className="theme-input w-full text-sm mb-2"
                                    placeholder="Image URL or upload below"
                                />
                                <label
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                    style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    Upload Image
                                    <input type="file" accept="image/*" className="hidden" onChange={handleHeadshotUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Sort Order:</label>
                            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className="theme-input w-20 text-sm text-center" />
                        </div>
                    </div>

                    {/* Roles Manager */}
                    <div className="mb-4">
                        <RolesManager roles={roles} onAdd={addRole} onEdit={editRole} onRemove={removeRole} />
                    </div>

                    {/* Bio (Rich Text) */}
                    <div className="mb-6">
                        <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>Bio</label>
                        <RichTextEditor value={bio} onChange={setBio} />
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : (editingTalent ? 'Update Talent' : 'Add Talent')}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Talent List */}
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--skeleton)' }} />
                    ))}
                </div>
            ) : talents && talents.length > 0 ? (
                <div className="space-y-2">
                    {talents.map((talent) => (
                        <div
                            key={talent.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                            style={{
                                backgroundColor: editingTalent?.id === talent.id ? 'var(--badge-bg)' : 'var(--bg-card)',
                                border: `1px solid ${editingTalent?.id === talent.id ? 'var(--accent)' : 'var(--border)'}`,
                            }}
                            onClick={() => startEdit(talent)}
                        >
                            {/* Headshot thumbnail */}
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--border)' }}>
                                {talent.headshot_url ? (
                                    <img src={talent.headshot_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)' }}>
                                        {talent.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                    {talent.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                    {talent.talent_roles?.map(r => r.character_name).join(', ') || 'No roles yet'}
                                </p>
                            </div>


                            {/* Delete — inline confirmation */}
                            {pendingDeleteId === talent.id ? (
                                <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-xs font-medium" style={{ color: 'var(--error)' }}>Delete?</span>
                                    <button
                                        onClick={() => handleDelete(talent)}
                                        className="px-2 py-1 rounded text-xs font-bold transition-colors"
                                        style={{ backgroundColor: 'var(--error)', color: '#fff' }}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setPendingDeleteId(null)}
                                        className="px-2 py-1 rounded text-xs font-medium transition-colors"
                                        style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(talent.id); }}
                                    className="p-1.5 rounded hover:opacity-80 flex-shrink-0"
                                    style={{ color: 'var(--error)' }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p style={{ color: 'var(--text-muted)' }}>
                        No talent added yet. Click "Add Talent" to get started.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminTalents;
