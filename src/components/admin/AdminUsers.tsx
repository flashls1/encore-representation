import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, ShieldAlert, UserPlus, Eye, EyeOff, Pencil, Trash2,
  Check, X, Loader2, Crown, KeyRound, User,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
interface AdminProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  display_password: string;
  is_super_admin: boolean;
  created_at: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const { toast } = useToast();

  // ── State ─────────────────────────────────
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit state (per-user)
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Password visibility per user
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const createFormRef = useRef<HTMLDivElement>(null);

  // ── Fetch admins ──────────────────────────
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setAdmins(data || []);
    } catch (err: any) {
      toast({ title: "Error loading admins", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ── Create admin ──────────────────────────
  const handleCreateAdmin = async () => {
    const email = newEmail.trim();
    const password = newPassword.trim();
    const firstName = newFirstName.trim();
    const lastName = newLastName.trim();

    if (!firstName || !lastName) {
      toast({ title: "First and last name are required", variant: "destructive" });
      return;
    }
    if (!email) {
      toast({ title: "Email address is required", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc("create_admin_user", {
        _email: email,
        _password: password,
        _first_name: firstName,
        _last_name: lastName,
      });

      if (error) throw error;

      toast({ title: `Admin created: ${firstName} ${lastName}` });
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPassword("");
      setShowNewPassword(false);
      setShowCreateForm(false);
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error creating admin", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // ── Start editing ─────────────────────────
  const startEditing = (admin: AdminProfile) => {
    setEditingUserId(admin.user_id);
    setEditFirstName(admin.first_name);
    setEditLastName(admin.last_name);
    setEditPassword("");
    setShowEditPassword(false);
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditPassword("");
    setShowEditPassword(false);
  };

  // ── Save profile edits ────────────────────
  const handleSaveEdit = async (userId: string) => {
    const firstName = editFirstName.trim();
    const lastName = editLastName.trim();
    const password = editPassword.trim();

    if (!firstName || !lastName) {
      toast({ title: "First and last name are required", variant: "destructive" });
      return;
    }
    if (password && password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Update profile name
      const { error: profileError } = await supabase.rpc("update_admin_profile", {
        _target_user_id: userId,
        _first_name: firstName,
        _last_name: lastName,
      });
      if (profileError) throw profileError;

      // Update password if provided
      if (password) {
        const { error: pwError } = await supabase.rpc("update_admin_password", {
          _target_user_id: userId,
          _new_password: password,
        });
        if (pwError) throw pwError;
      }

      toast({ title: "Admin updated successfully" });
      cancelEditing();
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error updating admin", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete admin ──────────────────────────
  const handleDeleteAdmin = async (userId: string) => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_admin_user", {
        _target_user_id: userId,
      });
      if (error) throw error;

      toast({ title: "Admin removed successfully" });
      setConfirmDeleteId(null);
      fetchAdmins();
    } catch (err: any) {
      toast({ title: "Error removing admin", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Toggle password visibility ────────────
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  // ── Masked password display ───────────────
  const renderPassword = (admin: AdminProfile) => {
    const isVisible = visiblePasswords.has(admin.user_id);
    return (
      <div className="flex items-center gap-2">
        <code
          className="text-xs px-2 py-0.5 rounded font-mono"
          style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
        >
          {isVisible ? admin.display_password : "••••••••"}
        </code>
        <button
          onClick={() => togglePasswordVisibility(admin.user_id)}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-muted)" }}
          title={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  };

  // ── Render ────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6" style={{ color: "#d4af37" }} />
          <h2
            className="font-orbitron text-xl font-bold tracking-wider"
            style={{ color: "#d4af37" }}
          >
            Admin Users
          </h2>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => {
              setShowCreateForm(true);
              setTimeout(() => createFormRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: "#d4af37",
              color: "#000000",
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add Admin
          </button>
        )}
      </div>

      {/* ── Create Admin Form ── */}
      {showCreateForm && (
        <div
          ref={createFormRef}
          className="rounded-xl p-5 sm:p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{
            backgroundColor: "#111111",
            border: "1px solid #d4af37",
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" style={{ color: "#d4af37" }} />
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Create New Admin
              </h3>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewFirstName("");
                setNewLastName("");
                setNewEmail("");
                setNewPassword("");
                setShowNewPassword(false);
              }}
              className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Creates a new admin account with full CMS access. They can sign in at{" "}
            <code className="px-1 py-0.5 rounded text-[10px]" style={{ backgroundColor: "var(--bg-elevated)" }}>
              /login
            </code>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {/* First Name */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                First Name
              </label>
              <input
                type="text"
                placeholder="First name"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                className="theme-input w-full"
                autoFocus
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                Last Name
              </label>
              <input
                type="text"
                placeholder="Last name"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                className="theme-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                Email (Login)
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="theme-input w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="theme-input w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewFirstName("");
                setNewLastName("");
                setNewEmail("");
                setNewPassword("");
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAdmin}
              disabled={creating}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
              style={{
                backgroundColor: "#d4af37",
                color: "#000000",
              }}
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Admin
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Admin List ── */}
      <div
        className="rounded-xl p-5 sm:p-6"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" style={{ color: "var(--text-primary)" }} />
          <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
            Current Administrators
          </h3>
          <span
            className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
            }}
          >
            {admins.length} {admins.length === 1 ? "admin" : "admins"}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg animate-pulse"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              />
            ))}
          </div>
        ) : admins.length > 0 ? (
          <div className="space-y-3">
            {admins.map((admin) => {
              const isEditing = editingUserId === admin.user_id;
              const isConfirmingDelete = confirmDeleteId === admin.user_id;

              return (
                <div
                  key={admin.user_id}
                  className="rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    border: admin.is_super_admin
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)",
                    boxShadow: admin.is_super_admin
                      ? "0 0 12px color-mix(in srgb, var(--accent) 10%, transparent)"
                      : "none",
                  }}
                >
                  {/* ─ Admin Card: View Mode ─ */}
                  {!isEditing && (
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Avatar + Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor: admin.is_super_admin
                                ? "var(--accent)"
                                : "color-mix(in srgb, var(--accent) 20%, transparent)",
                              color: admin.is_super_admin ? "#000" : "var(--accent)",
                            }}
                          >
                            {admin.first_name.charAt(0)}{admin.last_name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {admin.first_name} {admin.last_name}
                              </p>
                              {admin.is_super_admin && (
                                <span
                                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                                  style={{
                                    backgroundColor: "var(--accent)",
                                    color: "#000",
                                  }}
                                >
                                  <Crown className="h-3 w-3" />
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <p
                              className="text-xs truncate"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {admin.email}
                            </p>
                          </div>
                        </div>

                        {/* Password + Actions */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                          <div className="flex items-center gap-1">
                            <KeyRound className="h-3 w-3 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                            {renderPassword(admin)}
                          </div>

                          {/* Edit button */}
                          <button
                            onClick={() => startEditing(admin)}
                            className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                            style={{
                              color: "var(--accent)",
                              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
                            }}
                            title="Edit admin"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete button — NOT shown for super admins */}
                          {!admin.is_super_admin && (
                            <>
                              {isConfirmingDelete ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDeleteAdmin(admin.user_id)}
                                    disabled={deleting}
                                    className="p-2 rounded-lg transition-opacity"
                                    style={{
                                      backgroundColor: "color-mix(in srgb, var(--error, #ef4444) 15%, transparent)",
                                      color: "var(--error, #ef4444)",
                                    }}
                                    title="Confirm delete"
                                  >
                                    {deleting ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{ color: "var(--text-muted)" }}
                                    title="Cancel"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(admin.user_id)}
                                  className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                                  style={{
                                    color: "var(--error, #ef4444)",
                                    backgroundColor: "color-mix(in srgb, var(--error, #ef4444) 10%, transparent)",
                                  }}
                                  title="Remove admin"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─ Admin Card: Edit Mode ─ */}
                  {isEditing && (
                    <div className="p-4 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2 mb-4">
                        <Pencil className="h-4 w-4" style={{ color: "var(--accent)" }} />
                        <h4 className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                          Editing: {admin.first_name} {admin.last_name}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                            First Name
                          </label>
                          <input
                            type="text"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            className="theme-input w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            className="theme-input w-full"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
                          New Password{" "}
                          <span className="font-normal" style={{ color: "var(--text-muted)" }}>
                            (leave blank to keep current)
                          </span>
                        </label>
                        <div className="relative max-w-sm">
                          <input
                            type={showEditPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="theme-input w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditPassword(!showEditPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-70 transition-opacity"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {showEditPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(admin.user_id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 disabled:opacity-50"
                          style={{
                            backgroundColor: "#d4af37",
                            color: "#000000",
                          }}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="h-10 w-10 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No administrators found.
            </p>
          </div>
        )}
      </div>

      {/* ── Info Footer ── */}
      <div className="mt-4 px-1">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          <Shield className="h-3 w-3 inline mr-1" style={{ color: "var(--accent)" }} />
          Admins have full access to all CMS panels. Super admins cannot be removed.
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;
