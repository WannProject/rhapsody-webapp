type SummaryCardProps = {
    items: string[][];
};

export function SummaryCard({ items }: SummaryCardProps) {
    return (
        <div className="rounded-lg border border-[#353535] bg-[#1b1b1b]">
            {items.map(([label, value], index) => (
                <div
                    key={label}
                    className={[
                        'flex items-center justify-between gap-4 px-5 py-4',
                        index > 0 ? 'border-t border-[#2a2a2a]' : '',
                    ].join(' ')}
                >
                    <span className="text-sm font-semibold text-[#8e9192]">
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
