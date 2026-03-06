import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTalents } from "@/hooks/useData";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, GripVertical, X, Save, Upload, Bold, Italic, List, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Talent, TalentRole } from "@/types/database";

// ─── Rich Text Editor ────────────────────────────────────────────────────────────
const RichTextEditor = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (html: string) => void;
}) => {
    const editorRef = useRef<HTMLDivElement>(null);

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
            </div>

            {/* Editable area */}
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[200px] p-4 outline-none prose prose-sm max-w-none"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--input-text)' }}
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

// ─── Roles Manager ──────────────────────────────────────────────────────────────
const RolesManager = ({
    roles,
    onAdd,
    onRemove,
}: {
    roles: TalentRole[];
    onAdd: (roleName: string, characterName: string) => void;
    onRemove: (roleId: string) => void;
}) => {
    const [newRole, setNewRole] = useState('');
    const [newChar, setNewChar] = useState('');

    const handleAdd = () => {
        if (!newChar.trim()) return;
        onAdd(newRole.trim(), newChar.trim());
        setNewRole('');
        setNewChar('');
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-bold block" style={{ color: 'var(--text-primary)' }}>
                🎭 Characters / Voice Roles
            </label>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Add the character names and shows/series this talent has appeared in.
            </p>

            {/* Existing roles */}
            {roles.length > 0 && (
                <div className="space-y-1.5">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                            style={{ backgroundColor: 'var(--badge-bg)', border: '1px solid var(--badge-border)' }}
                        >
                            <span className="text-base">🎤</span>
                            <div className="flex-1 min-w-0">
                                <span className="font-bold" style={{ color: 'var(--badge-text)' }}>
                                    {role.character_name}
                                </span>
                                {role.role_name && (
                                    <span className="ml-1.5" style={{ color: 'var(--text-muted)' }}>
                                        — {role.role_name}
                                    </span>
                                )}
                            </div>
                            <button type="button" onClick={() => onRemove(role.id)} className="p-1 rounded hover:opacity-80 flex-shrink-0" style={{ color: 'var(--error)' }}>
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add new role */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <div>
                        <label className="text-[11px] uppercase tracking-wider font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                            Character Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Goku, Naruto, Spike..."
                            value={newChar}
                            onChange={(e) => setNewChar(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                            className="theme-input w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] uppercase tracking-wider font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>
                            Show / Series
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Dragon Ball Z, Naruto, Cowboy Bebop..."
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                            className="theme-input w-full text-sm"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!newChar.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-40"
                    style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Role
                </button>
            </div>
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

    const addRole = (roleName: string, characterName: string) => {
        setRoles(prev => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                talent_id: editingTalent?.id || '',
                role_name: roleName,
                character_name: characterName,
            },
        ]);
    };

    const removeRole = (roleId: string) => {
        setRoles(prev => prev.filter(r => r.id !== roleId));
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

                    {/* Featured + Sort Order */}
                    <div className="flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                            Featured
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Sort Order:</label>
                            <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className="theme-input w-20 text-sm text-center" />
                        </div>
                    </div>

                    {/* Roles Manager */}
                    <div className="mb-4">
                        <RolesManager roles={roles} onAdd={addRole} onRemove={removeRole} />
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

                            {/* Featured badge */}
                            {talent.featured && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                                    Featured
                                </span>
                            )}

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
