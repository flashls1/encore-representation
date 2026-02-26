import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSubmitContactForm, useContactSettings, useSiteSettings } from "@/hooks/useData";
import { Mail, Phone, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Contact = () => {
  const { data: contactSettings } = useContactSettings();
  const { data: siteSettings } = useSiteSettings();
  const submitForm = useSubmitContactForm();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitForm.mutateAsync(form);
      setSubmitted(true);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navigation />
      <div className="page-wrapper">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1
              className="font-orbitron text-3xl sm:text-4xl md:text-5xl mb-3 tracking-wider font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {contactSettings?.page_title || 'Contact Us'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-lg max-w-2xl mx-auto">
              {contactSettings?.page_description || 'Have a question or want to book talent? Get in touch with Encore Representation.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Form */}
            <div className="theme-card p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">✉️</div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
                    Message Sent!
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {contactSettings?.success_message || "Thanks for reaching out! We'll get back to you within 24-48 hours."}
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-4 text-sm font-medium"
                    style={{ color: 'var(--accent)' }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-orbitron text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Send a Message
                  </h2>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="theme-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="theme-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="theme-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="theme-input w-full resize-none"
                      placeholder="How can we help?"
                    />
                  </div>

                  {submitForm.isError && (
                    <p className="text-sm" style={{ color: 'var(--error)' }}>
                      Something went wrong. Please try again.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitForm.isPending}
                    className="w-full py-3 font-bold rounded-lg transition-all duration-200 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--button-bg)',
                      color: 'var(--button-text)',
                    }}
                  >
                    {submitForm.isPending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info Sidebar */}
            <div className="space-y-6">
              <div className="theme-card p-6">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>
                  Get in Touch
                </h3>
                <div className="space-y-4 text-sm">
                  {siteSettings?.contact_email && (
                    <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                      <Mail className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      <a href={`mailto:${siteSettings.contact_email}`}>{siteSettings.contact_email}</a>
                    </div>
                  )}
                  {siteSettings?.contact_phone && (
                    <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                      <Phone className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      <span>{siteSettings.contact_phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <span>We respond within 24-48 hours</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="theme-card p-6">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link to="/about" className="block text-sm font-medium" style={{ color: 'var(--accent)' }}>
                    → About Us
                  </Link>
                  <Link to="/book" className="block text-sm font-medium" style={{ color: 'var(--accent)' }}>
                    → Book Talent
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;