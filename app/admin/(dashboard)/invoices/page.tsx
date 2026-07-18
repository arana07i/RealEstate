import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { FileText, Download } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invoices',
  robots: { index: false, follow: false },
};

type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

interface Invoice {
  id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  invoice_number: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  download_url: string | null;
}

export default async function InvoicesPage() {
  try {
    const user = await requirePermission(null, 'view_billing');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    const getStatusColor = (status: InvoiceStatus) => {
      switch (status) {
        case 'paid': return 'bg-success/10 text-success';
        case 'open': return 'bg-warning/10 text-warning';
        case 'void': return 'bg-muted text-muted-foreground';
        case 'uncollectible': return 'bg-destructive/10 text-destructive';
        default: return 'bg-muted text-muted-foreground';
      }
    };

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText size={24} />
            Invoices
          </h1>
          <p className="mt-1 text-muted-foreground">View and download your billing history.</p>
        </div>

        <div className="card overflow-hidden">
          {invoices && invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-primary">Invoice #</th>
                    <th className="px-4 py-3 font-semibold text-primary">Date</th>
                    <th className="px-4 py-3 font-semibold text-primary">Due Date</th>
                    <th className="px-4 py-3 font-semibold text-primary">Amount</th>
                    <th className="px-4 py-3 font-semibold text-primary">Status</th>
                    <th className="px-4 py-3 font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-primary">{invoice.invoice_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="text-sm text-accent hover:underline"
                          >
                            View
                          </Link>
                          {invoice.download_url && (
<a
                              href={invoice.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <Download size={16} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-primary">No invoices found</h3>
              <p className="text-muted-foreground mt-1">Invoices will appear here after your first payment.</p>
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    redirect('/admin/login');
  }
}