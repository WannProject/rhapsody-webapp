type SummaryCardProps = {
    items: string[][];
};

export function SummaryCard({ items }: SummaryCardProps) {
    return (
        <div className="rounded-lg border border-border bg-card">
            {items.map(([label, value], index) => (
                <div
                    key={label}
                    className={[
                        'flex items-center justify-between gap-4 px-5 py-4',
                        index > 0 ? 'border-t border-border' : '',
                    ].join(' ')}
                >
                    <span className="text-sm font-semibold text-muted-foreground">
                        {label}
                    </span>
                    <span className="text-right font-semibold text-white">
                        {value}
                    </span>
                </div>
            ))}
        </div>
    );
}
