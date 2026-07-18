'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ImageManager } from './ImageManager';
import { sanitizeText } from '@/lib/utils';

interface ListingFormProps {
  mode?: 'create' | 'edit';
  initialData?: Partial<FormData> & { id?: string; image_urls?: string[] };
}

type FormData = {
  title: string;
  description: string;
  price: string;
  location: string;
  bedrooms: string;
  bathrooms: string;
  area_sqft: string;
  status: 'active' | 'sold';
  featured: boolean;
  draft: boolean;
};

export function ListingForm({ mode = 'create', initialData }: ListingFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price != null ? String(initialData.price) : '',
    location: initialData?.location ?? '',
    bedrooms: initialData?.bedrooms != null ? String(initialData.bedrooms) : '',
    bathrooms: initialData?.bathrooms != null ? String(initialData.bathrooms) : '',
    area_sqft: initialData?.area_sqft != null ? String(initialData.area_sqft) : '',
    status: (initialData?.status as 'active' | 'sold') ?? 'active',
    featured: initialData?.featured ?? false,
    draft: initialData?.draft ?? false,
  });
  const [images, setImages] = useState<string[]>(initialData?.image_urls ?? []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    setError(null);
    const supabase = createClient();

    const uploadPromises = Array.from(files).map(async (file) => {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const path = `properties/${timestamp}-${randomSuffix}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('property-images').upload(path, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data } = supabase.storage.from('property-images').getPublicUrl(path);
      return data?.publicUrl;
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls.filter((url): url is string => !!url)]);
    } catch (err) {
      setError((err as Error).message);
    }
    setUploading(false);
  };

  const validateForm = (): string | null => {
    if (formData.title.trim().length === 0) return 'Title is required';
    if (formData.title.length > 200) return 'Title must be 200 characters or less';
    if (formData.description.trim().length === 0) return 'Description is required';
    if (formData.location.trim().length === 0) return 'Location is required';

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) return 'Price must be a positive number';

    const bedNum = formData.bedrooms ? Number(formData.bedrooms) : null;
    const bathNum = formData.bathrooms ? Number(formData.bathrooms) : null;
    const areaNum = formData.area_sqft ? Number(formData.area_sqft) : null;

    if (bedNum != null && (isNaN(bedNum) || bedNum < 0)) return 'Bedrooms must be a positive number or empty';
    if (bathNum != null && (isNaN(bathNum) || bathNum < 0)) return 'Bathrooms must be a positive number or empty';
    if (areaNum != null && (isNaN(areaNum) || areaNum < 0)) return 'Area must be a positive number or empty';

    if (images.length === 0) return 'At least one property image is required';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to submit');
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      title: sanitizeText(formData.title),
      description: sanitizeText(formData.description),
      price: Number(formData.price),
      location: sanitizeText(formData.location),
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
      area_sqft: formData.area_sqft ? Number(formData.area_sqft) : null,
      status: formData.status,
      featured: formData.featured,
      draft: formData.draft,
      image_urls: images,
      updated_by: user.id,
    };

    if (!initialData?.id) {
      payload.created_by = user.id;
    }

    const { error } = initialData?.id
      ? await supabase.from('listings').update(payload).eq('id', initialData.id)
      : await supabase.from('listings').insert(payload);

    if (error) {
      setError(error.message);
    } else {
      router.push('/admin/listings');
      router.refresh();
    }
    setSubmitting(false);
  };

  const isEdit = mode === 'edit' || !!initialData?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium">Price (₹)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="1"
            step="100000"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="bedrooms" className="block text-sm font-medium">Bedrooms</label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            min="0"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="bathrooms" className="block text-sm font-medium">Bathrooms</label>
          <input
            type="number"
            id="bathrooms"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            min="0"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="area_sqft" className="block text-sm font-medium">Area (sq ft)</label>
          <input
            type="number"
            id="area_sqft"
            name="area_sqft"
            value={formData.area_sqft}
            onChange={handleChange}
            min="0"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="input"
          >
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="draft"
              checked={formData.draft}
              onChange={handleChange}
              className="h-4 w-4"
            />
            Draft
          </label>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Property Images</h3>
        <ImageManager images={images} onChange={setImages} />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={(e) => e.target.files && uploadImages(e.target.files)}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="btn btn-primary disabled:opacity-50"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Listing' : 'Create Listing'}
        </button>
      </div>
    </form>
  );
}