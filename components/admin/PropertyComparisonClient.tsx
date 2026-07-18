'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart3, X, Plus, Home } from 'lucide-react';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { PropertyComparison } from '@/lib/types';

interface PropertyComparisonClientProps {
  initialProperties?: PropertyComparison[];
}

export function PropertyComparisonClient({ initialProperties = [] }: PropertyComparisonClientProps) {
  const [properties, setProperties] = useState<PropertyComparison[]>(initialProperties);
  const [loading, setLoading] = useState(!initialProperties.length);
  const [showAddModal, setShowAddModal] = useState(false);
  const [listingId, setListingId] = useState('');

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/property-comparison');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties);
      } else {
        toast.error('Failed to load compared properties');
      }
    } catch {
      toast.error('Failed to load compared properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialProperties.length) {
      fetchProperties();
    }
  }, [initialProperties, fetchProperties]);

  const handleAddToComparison = async (id: string) => {
    const response = await fetch('/api/admin/property-comparison', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: id }),
    });

    if (response.ok) {
      toast.success('Property added to comparison');
      setShowAddModal(false);
      setListingId('');
      fetchProperties();
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to add property to comparison');
    }
  };

  const handleRemove = async (listingId: string) => {
    const response = await fetch('/api/admin/property-comparison', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId }),
    });

    if (response.ok) {
      toast.success('Property removed from comparison');
      setProperties(properties.filter(p => p.listing_id !== listingId));
    } else {
      toast.error('Failed to remove property from comparison');
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };

  if (loading) {
    return <div className="card animate-pulse p-8 h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Property Comparison</h1>
            <p className="text-muted-foreground mt-1">Compare properties side by side</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} className="mr-1" />
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No properties to compare</h3>
          <p className="text-muted-foreground mt-2">Add properties to compare their features and prices</p>
          <button
            onClick={openAddModal}
            className="btn btn-primary mt-4"
          >
            <Plus size={16} className="mr-1" />
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground w-16">
                  <span className="sr-only">Action</span>
                </th>
                {properties.map((property) => (
                  <th key={property.id} className="text-left p-4 min-w-[200px]">
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        {property.listing?.image_urls?.[0] ? (
                          <img
                            src={property.listing.image_urls[0]}
                            alt={property.listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
<p className="text-xs text-muted-foreground">
                         Added {formatDate(property.created_at)}
                       </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Price</td>
                {properties.map((property) => (
                  <td key={`price-${property.id}`} className="p-4 font-semibold text-primary">
                    {property.listing?.price ? formatPrice(property.listing.price) : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Location</td>
                {properties.map((property) => (
                  <td key={`location-${property.id}`} className="p-4 text-foreground">
                    {property.listing?.location || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Bedrooms</td>
                {properties.map((property) => (
                  <td key={`bedrooms-${property.id}`} className="p-4 text-foreground">
                    {property.listing?.bedrooms ?? 'N/A'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Bathrooms</td>
                {properties.map((property) => (
                  <td key={`bathrooms-${property.id}`} className="p-4 text-foreground">
                    {property.listing?.bathrooms ?? 'N/A'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Area</td>
                {properties.map((property) => (
                  <td key={`area-${property.id}`} className="p-4 text-foreground">
                    {property.listing?.area_sqft ? `${property.listing.area_sqft.toLocaleString()} sqft` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium text-muted-foreground">Status</td>
                {properties.map((property) => (
                  <td key={`status-${property.id}`} className="p-4">
                    <span className={cn(
                      'inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize',
                      property.listing?.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {property.listing?.status || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground">Actions</td>
                {properties.map((property) => (
                  <td key={`actions-${property.id}`} className="p-4">
                    <button
                      onClick={() => handleRemove(property.listing_id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors"
                      title="Remove from comparison"
                      aria-label="Remove from comparison"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="rounded-xl bg-card shadow-xl w-full max-w-md p-6 border border-border relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
            <h2 className="text-xl font-semibold text-foreground mb-4 pr-8">
              Add Property to Comparison
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="listingId" className="block text-sm font-medium mb-1">
                  Property ID
                </label>
                <input
                  id="listingId"
                  type="text"
                  value={listingId}
                  onChange={(e) => setListingId(e.target.value)}
                  placeholder="Enter listing ID..."
                  className="input w-full"
                />
              </div>

<p className="text-sm text-muted-foreground">
                 Enter the ID of the property you want to compare. You can find listing IDs in the Listings page.
               </p>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => listingId && handleAddToComparison(listingId)}
                  disabled={!listingId}
                  className="btn btn-primary"
                >
                  Add to Comparison
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}