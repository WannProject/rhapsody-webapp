import { Gauge } from 'lucide-react';

const allocationValues = [44, 58, 50, 74, 66, 82, 70, 88, 62, 78, 92, 84];

export function AllocationCurveCard() {
    return (
        <article className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5 md:p-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold tracking-[0.22em] text-[#8e9192] uppercase">
                        Allocation Curve
                    </p>
                    <h3 className="mt-2 font-['Montserrat'] text-2xl font-bold text-white">
                        Kapasitas dan Prioritas
                    </h3>
                </div>
                <Gauge className="size-8 text-white" />
            </div>

            <div className="mt-8 grid h-[320px] grid-cols-12 items-end gap-2 border-b border-l border-[#353535] px-3 pb-3">
                {allocationValues.map((value, index) => (
                    <div
                        key={`${value}-${index}`}
                        className="rounded-t-sm bg-white/90"
                        style={{ height: `${value}%` }}
                    />
                ))}
            </div>
        </article>
    );
}
