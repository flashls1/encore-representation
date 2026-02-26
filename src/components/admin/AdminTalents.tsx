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
                <button
                    type="button"
                    onClick={() => exec('bold')}
                    className="p-1.5 rounded hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => exec('italic')}
                    className="p-1.5 rounded hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => exec('insertUnorderedList')}
                    className="p-1.5 rounded hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) exec('createLink', url);
                    }}
                    className="p-1.5 rounded hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                    title="Insert Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Editable area */}
            <div
                ref={editorRef}
                contentEditable
                className="min-h-[200px] p-4 outline-none prose prose-sm max-w-none"
                style={{
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-text)',
                }}
                onInput={() => {
                    if (editorRef.current) {
                        onChange(editorRef.current.innerHTML);
                    }
                }}
                onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
                    document.execCommand('insertHTML', false, text);
                    if (editorRef.current) {
                        onChange(editorRef.current.innerHTML);
                    }
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
    onAdd: (characterName: string, showName: string) => void;
    onRemove: (roleId: string) => void;
}) => {
    const [newChar, setNewChar] = useState('');
    const [newShow, setNewShow] = useState('');

    const handleAdd = () => {
        if (!newChar.trim()) return;
        onAdd(newChar.trim(), newShow.trim());
        setNewChar('');
        setNewShow('');
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Characters / Roles
            </label>

            {roles.map((role) => (
                <div
                    key={role.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                    style={{
                        backgroundColor: 'var(--badge-bg)',
                        border: '1px solid var(--badge-border)',
                    }}
                >
                    <span className="flex-1 font-medium" style={{ color: 'var(--badge-text)' }}>
                        {role.character_name}
                        {role.show_name && (
                            <span style={{ color: 'var(--text-muted)' }}> — {role.show_name}</span>
                        )}
                    </span>
                    <button
                        type="button"
                        onClick={() => onRemove(role.id)}
                        className="p-0.5 rounded hover:opacity-80"
                        style={{ color: 'var(--error)' }}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Character name"
                    value={newChar}
                    onChange={(e) => setNewChar(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    className="theme-input flex-1 text-sm"
                />
                <input
                    type="text"
                    placeholder="Show (optional)"
                    value={newShow}
                    onChange={(e) => setNewShow(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                    className="theme-input flex-1 text-sm"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                        backgroundColor: 'var(--button-bg)',
                        color: 'var(--button-text)',
                    }}
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

// ─── Main AdminTalents Component ────────────────────────────────────────────────
const AdminTalents = () => {
    const { data: talents, isLoading } = useTalents();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');
    const [headshotUrl, setHeadshotUrl] = useState('');
    const [featured, setFeatured] = useState(false);
    const [sortOrder, setSortOrder] = useState(0);
    const [roles, setRoles] = useState<TalentRole[]>([]);
    const [saving, setSaving] = useState(false);

    const resetForm = () => {
        setFirstName('');
        setLastName('');
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
        setFirstName(talent.first_name);
        setLastName(talent.last_name);
        setBio(talent.bio || '');
        setHeadshotUrl(talent.headshot_url || '');
        setFeatured(talent.featured);
        setSortOrder(talent.sort_order);
        setRoles(talent.talent_roles || []);
    };

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            toast({ title: 'First and last name are required', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            if (editingTalent) {
                // Update talent
                const { error } = await supabase
                    .from('talents')
                    .update({
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
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
                            roles.map((r, i) => ({
                                talent_id: editingTalent.id,
                                character_name: r.character_name,
                                show_name: r.show_name || null,
                                sort_order: i,
                            }))
                        );
                    if (rolesError) throw rolesError;
                }

                toast({ title: `${firstName} ${lastName} updated` });
            } else {
                // Create talent
                const { data, error } = await supabase
                    .from('talents')
                    .insert({
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
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
                            roles.map((r, i) => ({
                                talent_id: data.id,
                                character_name: r.character_name,
                                show_name: r.show_name || null,
                                sort_order: i,
                            }))
                        );
                    if (rolesError) throw rolesError;
                }

                toast({ title: `${firstName} ${lastName} added` });
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
        if (!confirm(`Delete ${talent.first_name} ${talent.last_name}? This cannot be undone.`)) return;

        try {
            await supabase.from('talent_roles').delete().eq('talent_id', talent.id);
            await supabase.from('talent_images').delete().eq('talent_id', talent.id);
            const { error } = await supabase.from('talents').delete().eq('id', talent.id);
            if (error) throw error;

            toast({ title: `${talent.first_name} ${talent.last_name} deleted` });
            queryClient.invalidateQueries({ queryKey: ['talents'] });

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
        setHeadshotUrl(urlData.publicUrl);
        toast({ title: 'Headshot uploaded' });
    };

    const addRole = (characterName: string, showName: string) => {
        setRoles(prev => [
            ...prev,
            {
                id: `temp-${Date.now()}`,
                talent_id: editingTalent?.id || '',
                character_name: characterName,
                show_name: showName || null,
                sort_order: prev.length,
                created_at: new Date().toISOString(),
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
                <h2
                    className="font-orbitron text-xl font-bold tracking-wider"
                    style={{ color: 'var(--accent)' }}
                >
                    Talent Management
                </h2>
                {!isEditing && (
                    <button
                        onClick={startCreate}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        style={{
                            backgroundColor: 'var(--button-bg)',
                            color: 'var(--button-text)',
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Talent
                    </button>
                )}
            </div>

            {/* Edit / Create Form */}
            {isEditing && (
                <div
                    className="rounded-xl p-6 mb-6"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                            {editingTalent ? `Editing: ${editingTalent.first_name} ${editingTalent.last_name}` : 'Add New Talent'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="p-1.5 rounded hover:opacity-80"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* First Name */}
                        <div>
                            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="theme-input w-full"
                                placeholder="First name"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="theme-input w-full"
                                placeholder="Last name"
                            />
                        </div>
                    </div>

                    {/* Headshot */}
                    <div className="mb-4">
                        <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                            Headshot (1:1 square recommended)
                        </label>
                        <div className="flex items-center gap-4">
                            {headshotUrl && (
                                <div
                                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                                    style={{ border: '1px solid var(--border)' }}
                                >
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
                                    style={{
                                        border: '1px solid var(--accent)',
                                        color: 'var(--accent)',
                                    }}
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    Upload Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleHeadshotUpload}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Featured + Sort Order */}
                    <div className="flex items-center gap-6 mb-4">
                        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                            <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                                className="rounded"
                            />
                            Featured
                        </label>
                        <div className="flex items-center gap-2">
                            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>Sort Order:</label>
                            <input
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                className="theme-input w-20 text-sm text-center"
                            />
                        </div>
                    </div>

                    {/* Roles Manager */}
                    <div className="mb-4">
                        <RolesManager roles={roles} onAdd={addRole} onRemove={removeRole} />
                    </div>

                    {/* Bio (Rich Text) */}
                    <div className="mb-6">
                        <label className="text-sm font-medium mb-1 block" style={{ color: 'var(--text-primary)' }}>
                            Bio
                        </label>
                        <RichTextEditor value={bio} onChange={setBio} />
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                            style={{
                                backgroundColor: 'var(--button-bg)',
                                color: 'var(--button-text)',
                            }}
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : (editingTalent ? 'Update Talent' : 'Add Talent')}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                            }}
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
                        <div
                            key={i}
                            className="h-16 rounded-lg animate-pulse"
                            style={{ backgroundColor: 'var(--skeleton)' }}
                        />
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
                            <div
                                className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                                style={{ border: '1px solid var(--border)' }}
                            >
                                {talent.headshot_url ? (
                                    <img src={talent.headshot_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div
                                        className="w-full h-full flex items-center justify-center text-xs font-bold"
                                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent)' }}
                                    >
                                        {talent.first_name[0]}{talent.last_name[0]}
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                    {talent.first_name} {talent.last_name}
                                </p>
                                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                                    {talent.talent_roles?.map(r => r.character_name).join(', ') || 'No roles yet'}
                                </p>
                            </div>

                            {/* Featured badge */}
                            {talent.featured && (
                                <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: 'var(--badge-bg)',
                                        color: 'var(--badge-text)',
                                    }}
                                >
                                    Featured
                                </span>
                            )}

                            {/* Delete */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(talent); }}
                                className="p-1.5 rounded hover:opacity-80 flex-shrink-0"
                                style={{ color: 'var(--error)' }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
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
