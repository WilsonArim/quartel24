import { cn } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

function MetricCardSkeleton() {
  return (
    <div className="bg-quartel-800 border border-quartel-700 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-16 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-quartel-800">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20 ml-auto" />
    </div>
  )
}

Skeleton.MetricCard = MetricCardSkeleton
Skeleton.TableRow = TableRowSkeleton

export { Skeleton }
