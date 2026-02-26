import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Shield, UserPlus } from "lucide-react";

interface AdminUser {
    user_id: string;
    email: string;
    role: string;
}

const AdminUsers = () => {
    const { toast } = useToast();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [creating, setCreating] = useState(false);

    // Fetch admins
    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('user_roles')
                .select('user_id, role')
                .eq('role', 'admin');

            if (error) throw error;

            // For each admin, try to get their email from auth
            // Since we can't read auth.users from client, we just show user_id
            // The email will be visible for the current session user
            const adminList = (data || []).map((r: any) => ({
                user_id: r.user_id,
                email: r.user_id, // Will be resolved below where possible
                role: r.role,
            }));

            setAdmins(adminList);
        } catch (err: any) {
            toast({ title: 'Error loading admins', description: err.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    // Create new admin: sign up user + assign role
    const handleCreateAdmin = async () => {
        if (!newEmail.trim() || !newPassword.trim()) {
            toast({ title: 'Email and password required', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
            return;
        }

        setCreating(true);
        try {
            // Sign up the user via Supabase auth
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: newEmail.trim(),
                password: newPassword.trim(),
            });

            if (signUpError) {
                // If user already exists, try to just assign role
                if (signUpError.message.includes('already registered')) {
                    toast({
                        title: 'User already exists',
                        description: 'If the user already has an account, ask them to sign in first, then manually assign the admin role in the database.',
                        variant: 'destructive',
                    });
                    setCreating(false);
                    return;
                }
                throw signUpError;
            }

            const userId = signUpData.user?.id;
            if (!userId) throw new Error('Failed to get user ID');

            // Assign admin role
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({ user_id: userId, role: 'admin' });

            if (roleError) throw roleError;

            toast({ title: `Admin created: ${newEmail.trim()}` });
            setNewEmail('');
            setNewPassword('');
            fetchAdmins();
        } catch (err: any) {
            toast({ title: 'Error creating admin', description: err.message, variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    // Remove admin role (doesn't delete the auth user, just removes admin)
    const handleRemoveAdmin = async (userId: string) => {
        // Don't allow removing yourself
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === userId) {
            toast({ title: 'Cannot remove yourself as admin', variant: 'destructive' });
            return;
        }

        if (!confirm('Remove admin privileges from this user?')) return;

        try {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId)
                .eq('role', 'admin');

            if (error) throw error;

            toast({ title: 'Admin role removed' });
            fetchAdmins();
        } catch (err: any) {
            toast({ title: 'Error removing admin', description: err.message, variant: 'destructive' });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2
                    className="font-orbitron text-xl font-bold tracking-wider"
                    style={{ color: 'var(--accent)' }}
                >
                    Admin Users
                </h2>
            </div>

            {/* Add New Admin */}
            <div
                className="rounded-xl p-6 mb-6"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        Add New Admin
                    </h3>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Creates a new user account and assigns the admin role. They'll be able to sign in at /login and access the full CMS.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        placeholder="Email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="theme-input flex-1"
                    />
                    <input
                        type="password"
                        placeholder="Password (min 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="theme-input flex-1"
                    />
                    <button
                        onClick={handleCreateAdmin}
                        disabled={creating}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 whitespace-nowrap"
                        style={{
                            backgroundColor: 'var(--button-bg)',
                            color: 'var(--button-text)',
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        {creating ? 'Creating...' : 'Add Admin'}
                    </button>
                </div>
            </div>

            {/* Current Admins */}
            <div
                className="rounded-xl p-6"
                style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                }}
            >
                <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Current Admins
                </h3>

                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-12 rounded-lg animate-pulse"
                                style={{ backgroundColor: 'var(--skeleton)' }}
                            />
                        ))}
                    </div>
                ) : admins.length > 0 ? (
                    <div className="space-y-2">
                        {admins.map((admin) => (
                            <div
                                key={admin.user_id}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                                style={{
                                    backgroundColor: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                <Shield className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                        {admin.user_id}
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Role: {admin.role}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveAdmin(admin.user_id)}
                                    className="p-1.5 rounded hover:opacity-80 flex-shrink-0"
                                    style={{ color: 'var(--error)' }}
                                    title="Remove admin"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        No admins found.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
