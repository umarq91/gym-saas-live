import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Filters & Actions */}
      <Card className="bg-card border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-32 h-10" />
        </div>
      </Card>

      {/* Table Skeleton */}
      <Card className="bg-card border-border p-6">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
