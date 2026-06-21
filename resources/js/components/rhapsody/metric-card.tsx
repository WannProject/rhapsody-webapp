type MetricCardProps = {
    label: string;
    value: string;
    detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
    return (
        <div className="rounded-lg border border-border bg-muted p-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-3 font-['Montserrat'] text-2xl font-extrabold text-white">
                {value}
            </p>
            {detail && (
                <p className="mt-1 text-sm font-semibold text-muted-foreground">
                    {detail}
                </p>
            )}
        </div>
    );
}
