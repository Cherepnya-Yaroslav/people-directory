import type { HTMLAttributes } from "react";

// Adapted from Unlumen UI's Shimmer Skeleton for this app's ordinary CSS.
export function ShimmerSkeleton({
  className = "",
  rounded = "md",
  animate = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  animate?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      {...props}
      className={`shimmer-skeleton shimmer-rounded-${rounded} ${className}`}
    >
      {animate && <span className="shimmer-sweep" />}
    </div>
  );
}

export function EmployeeSkeleton({ view }: { view: "grid" | "list" }) {
  return (
    <div
      className={`employee-grid skeleton-grid ${view === "list" ? "list-view" : ""}`}
      role="status"
      aria-label="Загрузка сотрудников"
      aria-busy="true"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          className="employee-card skeleton-card"
          key={index}
          aria-hidden="true"
        >
          <div className="card-top">
            <ShimmerSkeleton className="skeleton-avatar" rounded="full" />
            <ShimmerSkeleton className="skeleton-badge" rounded="full" />
          </div>
          <div className="employee-identity">
            <ShimmerSkeleton className="skeleton-name" />
            <ShimmerSkeleton className="skeleton-full-name" />
            <ShimmerSkeleton className="skeleton-position" />
          </div>
          <div className="card-contacts">
            <ShimmerSkeleton className="skeleton-contact" />
            <ShimmerSkeleton className="skeleton-location" />
          </div>
          <div className="card-profile">
            <ShimmerSkeleton className="skeleton-profile" />
            <ShimmerSkeleton className="skeleton-arrow" rounded="full" />
          </div>
        </div>
      ))}
    </div>
  );
}
