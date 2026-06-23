export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon?: any }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col justify-between border border-border/80 bg-card shadow-sm">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-3xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        {hint && <p className="text-3xs text-zinc-400 dark:text-zinc-500 mt-1 font-medium">{hint}</p>}
      </div>
    </div>
  );
}
