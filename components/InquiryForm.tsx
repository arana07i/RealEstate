'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface InquiryFormProps {
  propertyId: string;
  agencyId: string;
}

export function InquiryForm({ propertyId, agencyId }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, property_id: propertyId, agency_id: agencyId }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Inquiry submitted successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(result.error || 'Failed to submit inquiry');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div>
        <label htmlFor="name" className="label">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="input rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
        />
      </div>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="input rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
        />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="input rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
        />
      </div>
      <div>
        <label htmlFor="message" className="label">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={3}
          className="input rounded-xl focus-visible:ring-2 focus-visible:ring-accent/50"
        />
      </div>
<button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {submitting ? 'Submitting...' : 'Submit Inquiry'}
        </button>
    </form>
  );
}