'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Bookmark, Plus, Edit2, Trash2, Bell, BellOff, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { SavedSearch } from '@/lib/types';

interface SavedSearchesClientProps {
  initialSearches?: SavedSearch[];
}

interface SavedSearchFormData {
  name: string;
  filters: {
    location: string;
    minPrice: string;
    maxPrice: string;
    status: string;
  };
  alert_enabled: boolean;
  alert_frequency: 'instant' | 'daily' | 'weekly' | '';
}

export function SavedSearchesClient({ initialSearches = [] }: SavedSearchesClientProps) {
  const [searches, setSearches] = useState<SavedSearch[]>(initialSearches);
  const [loading, setLoading] = useState(!initialSearches.length);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);
  const [formData, setFormData] = useState<SavedSearchFormData>({
    name: '',
    filters: {
      location: '',
      minPrice: '',
      maxPrice: '',
      status: '',
    },
    alert_enabled: false,
    alert_frequency: '',
  });

  const fetchSearches = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/saved-searches');
      if (response.ok) {
        const data = await response.json();
        setSearches(data.searches);
      } else {
        toast.error('Failed to load saved searches');
      }
    } catch {
      toast.error('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSearches.length) {
      fetchSearches();
    }
  }, [initialSearches, fetchSearches]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const response = await fetch('/api/admin/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        filters: {
          location: formData.filters.location || undefined,
          minPrice: formData.filters.minPrice ? Number(formData.filters.minPrice) : undefined,
          maxPrice: formData.filters.maxPrice ? Number(formData.filters.maxPrice) : undefined,
          status: formData.filters.status || undefined,
        },
        alert_enabled: formData.alert_enabled,
        alert_frequency: formData.alert_frequency || undefined,
      }),
    });

    if (response.ok) {
      toast.success('Saved search created');
      setShowCreateModal(false);
      setFormData({
        name: '',
        filters: { location: '', minPrice: '', maxPrice: '', status: '' },
        alert_enabled: false,
        alert_frequency: '',
      });
      fetchSearches();
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to create saved search');
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!editingSearch) return;

    const response = await fetch('/api/admin/saved-searches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingSearch.id,
        name: formData.name,
        filters: {
          location: formData.filters.location || undefined,
          minPrice: formData.filters.minPrice ? Number(formData.filters.minPrice) : undefined,
          maxPrice: formData.filters.maxPrice ? Number(formData.filters.maxPrice) : undefined,
          status: formData.filters.status || undefined,
        },
        alert_enabled: formData.alert_enabled,
        alert_frequency: formData.alert_frequency || undefined,
      }),
    });

    if (response.ok) {
      toast.success('Saved search updated');
      setEditingSearch(null);
      fetchSearches();
    } else {
      const { error } = await response.json();
      toast.error(error || 'Failed to update saved search');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;

    const response = await fetch('/api/admin/saved-searches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      toast.success('Saved search deleted');
      setSearches(searches.filter(s => s.id !== id));
    } else {
      toast.error('Failed to delete saved search');
    }
  };

  const openEditModal = (search: SavedSearch) => {
    setEditingSearch(search);
    setFormData({
      name: search.name,
      filters: {
        location: search.filters?.location || '',
        minPrice: search.filters?.minPrice ? String(search.filters.minPrice) : '',
        maxPrice: search.filters?.maxPrice ? String(search.filters.maxPrice) : '',
        status: search.filters?.status || '',
      },
      alert_enabled: search.alert_enabled,
      alert_frequency: search.alert_frequency || '',
    });
  };

  const openCreateModal = () => {
    setEditingSearch(null);
    setFormData({
      name: '',
      filters: { location: '', minPrice: '', maxPrice: '', status: '' },
      alert_enabled: false,
      alert_frequency: '',
    });
    setShowCreateModal(true);
  };

  if (loading) {
    return <div className="card animate-pulse p-8 h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Saved Searches</h1>
            <p className="text-muted-foreground mt-1">Manage your property search alerts</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} className="mr-1" />
          New Search
        </button>
      </div>

      {searches.length === 0 ? (
        <div className="card p-12 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No saved searches yet</h3>
          <p className="text-muted-foreground mt-2">Create a saved search to get alerts on matching properties</p>
          <button
            onClick={openCreateModal}
            className="btn btn-primary mt-4"
          >
            <Plus size={16} className="mr-1" />
            Create Saved Search
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searches.map((search) => (
            <div key={search.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">{search.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(search)}
                    className="p-1 rounded hover:bg-muted dark:hover:bg-muted"
                  >
                    <Edit2 size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(search.id)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {search.filters?.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-primary">{search.filters.location}</span>
                  </div>
                )}
                {search.filters?.minPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Price</span>
                    <span className="font-medium text-primary">
                      ₹{Number(search.filters.minPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                {search.filters?.maxPrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Price</span>
                    <span className="font-medium text-primary">
                      ₹{Number(search.filters.maxPrice).toLocaleString()}
                    </span>
                  </div>
                )}
                {search.filters?.status && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium text-primary capitalize">{search.filters.status}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                {search.alert_enabled ? (
                  <Bell size={14} className="text-accent" />
                ) : (
                  <BellOff size={14} className="text-muted-foreground" />
                )}
<span className="text-xs text-muted-foreground">
                   {search.alert_enabled 
                     ? `Alerts: ${search.alert_frequency || 'daily'}` 
                     : 'No alerts'}
                 </span>
               </div>

               <p className="text-xs text-muted-foreground mt-2">
                 Created {formatDate(search.created_at)}
               </p>
            </div>
          ))}
        </div>
      )}

      {(showCreateModal || editingSearch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-muted/90 p-4">
          <div className="rounded-xl bg-card dark:bg-muted shadow-xl w-full max-w-lg p-6 border border-border dark:border-border">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setEditingSearch(null);
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {editingSearch ? 'Edit Saved Search' : 'Create Saved Search'}
            </h2>
            <form onSubmit={editingSearch ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Search Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Downtown Apartments"
                  className="input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.filters.location || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: { ...formData.filters, location: e.target.value }
                    })}
                    placeholder="e.g., Downtown"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.filters.status || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: { ...formData.filters, status: e.target.value }
                    })}
                    className="input w-full"
                  >
                    <option value="">Any</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="minPrice" className="block text-sm font-medium mb-1">
                    Min Price (₹)
                  </label>
                  <input
                    id="minPrice"
                    type="number"
                    min="0"
                    step="100000"
                    value={formData.filters.minPrice || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: { ...formData.filters, minPrice: e.target.value }
                    })}
                    placeholder="50,00,000"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">
                    Max Price (₹)
                  </label>
                  <input
                    id="maxPrice"
                    type="number"
                    min="0"
                    step="100000"
                    value={formData.filters.maxPrice || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      filters: { ...formData.filters, maxPrice: e.target.value }
                    })}
                    placeholder="5,00,00,000"
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.alert_enabled}
                    onChange={(e) => setFormData({ ...formData, alert_enabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Enable Alerts</span>
                </label>
                {formData.alert_enabled && (
                  <select
                    value={formData.alert_frequency}
                    onChange={(e) => setFormData({ ...formData, alert_frequency: e.target.value as 'instant' | 'daily' | 'weekly' })}
                    className="input w-full"
                  >
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="instant">Instant Alerts</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSearch(null);
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSearch ? 'Update Search' : 'Save Search'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}