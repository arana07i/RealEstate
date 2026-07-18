import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth/authorize';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invoice Detail',
  robots: { index: false, follow: false },
};

interface Invoice {
  id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  invoice_number: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  download_url: string | null;
  line_items?: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await requirePermission(null, 'view_billing');
    const supabase = await createClient();
    const agencyId = user.agency_id;

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .eq('agency_id', agencyId)
      .single();

    if (!invoice) {
      redirect('/admin/invoices');
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'paid': return 'bg-emerald-100 text-emerald-700';
        case 'open': return 'bg-amber-100 text-amber-700';
        case 'void': return 'bg-muted text-muted-foreground';
        case 'uncollectible': return 'bg-red-100 text-red-700';
        default: return 'bg-muted text-muted-foreground';
      }
    };

    return (
      <div>
        <div className="mb-8">
          <Link href="/admin/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft size={16} />
            Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText size={24} />
            Invoice {invoice.invoice_number}
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Invoice Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date</span>
                <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
              )}
              {invoice.paid_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Date</span>
                  <span>{new Date(invoice.paid_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-bold">${(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase()}</span>
              </div>
              {invoice.download_url && (
                <a
                  href={invoice.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </div>

{invoice.line_items && invoice.line_items.length > 0 && (
           <div className="card overflow-hidden">
             <h2 className="text-lg font-semibold text-primary p-6 pb-0">Line Items</h2>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="border-b border-border bg-muted">
                   <tr>
                     <th className="px-4 py-3 font-semibold text-primary">Description</th>
                     <th className="px-4 py-3 font-semibold text-primary">Quantity</th>
                     <th className="px-4 py-3 font-semibold text-primary">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {invoice.line_items.map((item: { description: string; amount: number; quantity: number }, index: number) => (
                     <tr key={index}>
                       <td className="px-4 py-3">{item.description}</td>
                       <td className="px-4 py-3">{item.quantity}</td>
                       <td className="px-4 py-3">${(item.amount / 100).toFixed(2)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         )}
       </div>
     );
   } catch {
     redirect('/admin/login');
   }
 }