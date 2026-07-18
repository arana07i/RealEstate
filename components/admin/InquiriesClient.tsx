'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { Inquiry, InquiryStatus } from '@/lib/types';
import { toast } from 'react-hot-toast';
import { AdminPaginationNav } from '@/components/AdminPaginationNav';

interface InquiriesClientProps {
  initialInquiries: Inquiry[];
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  currentPage: number;
}

const STATUS_COLORS: Record<InquiryStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-green-100 text-green-800',
  spam: 'bg-red-100 text-red-800',
};

export default function InquiriesClient({ initialInquiries, totalPages, totalRecords, pageSize, currentPage }: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    const previousInquiries = inquiries;
    const response = await fetch(`/api/admin/inquiries/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success('Status updated');
    } else {
      setInquiries(previousInquiries);
      toast.error('Failed to update status');
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-sm font-medium">Date</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-medium">Name</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-medium">Contact</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-medium">Property</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-medium">Message</th>
              <th scope="col" className="px-4 py-2 text-left text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="px-4 py-2 text-sm">{formatDate(inquiry.created_at)}</td>
                <td className="px-4 py-2 text-sm font-medium">{inquiry.name}</td>
                <td className="px-4 py-2 text-sm">
                  <div>{inquiry.email}</div>
                  <div className="text-muted-foreground">{inquiry.phone}</div>
                </td>
                <td className="px-4 py-2 text-sm">
                  {inquiry.property ? (
                    <div>
                      <div className="font-medium">{inquiry.property.title}</div>
                      <div className="text-muted-foreground">{inquiry.property.location}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">General</span>
                  )}
                </td>
                <td className="px-4 py-2 max-w-xs text-sm">
                  <p className="truncate">{inquiry.message}</p>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={inquiry.status}
                    onChange={(e) => updateStatus(inquiry.id, e.target.value as InquiryStatus)}
                    className={`rounded px-2 py-1 text-xs font-medium ${STATUS_COLORS[inquiry.status]}`}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPaginationNav
        page={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        pageSize={pageSize}
      />
    </>
  );
}
