type MetricCardProps = {
    label: string;
    value: string;
    detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
    return (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#171717] p-4">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                {label}
            </p>
            <p className="mt-3 font-['Montserrat'] text-2xl font-extrabold text-white">
                {value}
            </p>
            {detail && (
                <p className="mt-1 text-sm font-semibold text-[#c4c7c8]">
                    {detail}
                </p>
            )}
        </div>
    );
}
