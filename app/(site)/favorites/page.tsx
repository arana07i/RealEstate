'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/EmptyState';
import { formatPrice } from '@/lib/utils';
import { Heart, Plus, Folder, MoreVertical, Trash2 } from 'lucide-react';

interface FavoriteCollection {
  id: string;
  name: string;
  description?: string;
  color: string;
  property_count: number;
}

const SAMPLE_COLLECTIONS: FavoriteCollection[] = [
  { id: '1', name: 'Dream Homes', description: 'Properties I want to buy', color: 'bg-pink-500', property_count: 5 },
  { id: '2', name: 'Investment Properties', description: 'Potential investments', color: 'bg-emerald-500', property_count: 3 },
  { id: '3', name: 'Weekend Getaways', description: 'Vacation homes', color: 'bg-blue-500', property_count: 2 },
];

export default function FavoritesPage() {
  const [collections, setCollections] = useState<FavoriteCollection[]>(SAMPLE_COLLECTIONS);
  const [newCollectionName, setNewCollectionName] = useState('');

  const createCollection = () => {
    if (newCollectionName.trim()) {
      const colors = ['bg-pink-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-purple-500'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setCollections([...collections, {
        id: Date.now().toString(),
        name: newCollectionName,
        color: randomColor,
        property_count: 0,
      }]);
      setNewCollectionName('');
    }
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Favorite Collections</h1>
        <p className="mt-4 text-lg text-muted-foreground">Organize and save your favorite properties</p>
      </div>

      <div className="mt-8">
        <div className="mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="New collection name"
            className="input flex-1"
          />
          <button
            onClick={createCollection}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Create
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl ${collection.color} flex items-center justify-center`}>
                      <Folder size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground">{collection.description}</p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{collection.property_count} properties</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCollection(collection.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Create your first collection</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}