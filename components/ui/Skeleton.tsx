interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton-shimmer ${className}`.trim()} aria-hidden="true" />
}

Skeleton.displayName = 'Skeleton'
