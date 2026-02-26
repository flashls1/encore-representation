import { useState } from 'react';
import { useContactSubmissions, useContactSettings } from '@/hooks/useData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, Trash2, Settings, Save, MessageSquare, Eye, EyeOff } from 'lucide-react';

const AdminContact = () => {
  const { data: submissions, isLoading: loadingSubs } = useContactSubmissions();
  const { data: settings, isLoading: loadingSettings } = useContactSettings();
  const qc = useQueryClient();
  const [tab, setTab] = useState<'submissions' | 'settings'>('submissions');
  const [saving, setSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState<any>(null);

  // Init settings form
  if (settings && !settingsForm) {
    setSettingsForm({
      page_title: settings.page_title || 'Contact Us',
      page_description: settings.page_description || '',
      form_enabled: settings.form_enabled,
      notification_email: settings.notification_email || '',
      success_message: settings.success_message || '',
    });
  }

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    await supabase.from('contact_submissions').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['contact-submissions'] });
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;
    setSaving(true);
    try {
      if (settings?.id) {
        await supabase.from('contact_settings').update(settingsForm).eq('id', settings.id);
      } else {
        await supabase.from('contact_settings').insert(settingsForm);
      }
      qc.invalidateQueries({ queryKey: ['contact-settings'] });
      alert('Contact settings saved!');
    } catch (err: any) {
      alert(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Contact Management</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          View form submissions and configure contact page settings.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('submissions')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: tab === 'submissions' ? 'var(--accent)' : 'var(--bg-elevated)',
            color: tab === 'submissions' ? 'var(--text-on-accent)' : 'var(--text-muted)',
          }}
        >
          <MessageSquare className="h-4 w-4" />
          Submissions ({submissions?.length || 0})
        </button>
        <button
          onClick={() => setTab('settings')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: tab === 'settings' ? 'var(--accent)' : 'var(--bg-elevated)',
            color: tab === 'settings' ? 'var(--text-on-accent)' : 'var(--text-muted)',
          }}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Submissions Tab */}
      {tab === 'submissions' && (
        <>
          {loadingSubs ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-lg" />)}
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map(sub => (
                <div key={sub.id} className="theme-card p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{sub.name}</h3>
                        <a href={`mailto:${sub.email}`} className="text-xs" style={{ color: 'var(--accent)' }}>{sub.email}</a>
                      </div>
                      {sub.subject && (
                        <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                          Subject: {sub.subject}
                        </p>
                      )}
                      <p className="text-sm mt-1.5 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                        {sub.message}
                      </p>
                      <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                        {new Date(sub.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteSubmission(sub.id)} className="p-1.5 rounded hover:opacity-70 text-red-500 flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 theme-card">
              <Mail className="mx-auto h-10 w-10 mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>No contact submissions yet</p>
            </div>
          )}
        </>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div className="theme-card p-6 space-y-4">
          {loadingSettings ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : settingsForm ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Page Title</label>
                <input type="text" value={settingsForm.page_title} onChange={e => setSettingsForm({ ...settingsForm, page_title: e.target.value })} className="theme-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Page Description</label>
                <textarea value={settingsForm.page_description} onChange={e => setSettingsForm({ ...settingsForm, page_description: e.target.value })} className="theme-input w-full resize-none" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notification Email</label>
                <input type="email" value={settingsForm.notification_email} onChange={e => setSettingsForm({ ...settingsForm, notification_email: e.target.value })} className="theme-input w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Success Message</label>
                <textarea value={settingsForm.success_message} onChange={e => setSettingsForm({ ...settingsForm, success_message: e.target.value })} className="theme-input w-full resize-none" rows={2} placeholder="Message shown after successful submission" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {settingsForm.form_enabled ? <Eye className="h-4 w-4" style={{ color: '#22c55e' }} /> : <EyeOff className="h-4 w-4" />}
                  Contact form is {settingsForm.form_enabled ? 'enabled' : 'disabled'}
                </label>
                <button
                  onClick={() => setSettingsForm({ ...settingsForm, form_enabled: !settingsForm.form_enabled })}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: settingsForm.form_enabled ? '#22c55e' : 'var(--bg-elevated)',
                    color: settingsForm.form_enabled ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {settingsForm.form_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setSettingsForm({
                page_title: 'Contact Us',
                page_description: '',
                form_enabled: true,
                notification_email: '',
                success_message: 'Thank you for reaching out! We\'ll get back to you soon.',
              })}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
            >
              Create Contact Settings
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContact;