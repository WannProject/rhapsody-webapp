import { priorityCriteria } from '@/features/rhapsody/data/rhapsody-data';

export function AdminPriorityCard() {
    return (
        <article className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                Variabel Prioritas
            </p>
            <p className="mt-2 text-lg font-bold text-white">
                Studio Tier, User Loyalty, Duration
            </p>
            <div className="mt-5 grid gap-4">
                {priorityCriteria.map((criterion) => (
                    <div key={criterion.label}>
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                            <span className="text-[#c4c7c8]">
                                {criterion.label}
                            </span>
                            <span className="text-white">
                                {criterion.value}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#353535]">
                            <div
                                className="h-full rounded-full bg-white"
                                style={{
                                    width: `${criterion.value}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </article>
    );
}
