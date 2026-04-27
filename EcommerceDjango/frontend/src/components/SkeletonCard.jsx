export default function SkeletonCard() {
  return (
    <div className="glass-card space-y-3">
      <div className="skeleton h-44 w-full" />
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-10 w-full" />
    </div>
  );
}
