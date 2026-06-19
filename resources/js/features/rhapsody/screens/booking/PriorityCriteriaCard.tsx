import { SlidersHorizontal } from 'lucide-react';
import { priorityCriteria } from '@/features/rhapsody/data/rhapsody-data';

export function PriorityCriteriaCard() {
    return (
        <div className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
            <div className="mb-5 flex items-center gap-3">
                <SlidersHorizontal className="size-5 text-white" />
                <h3 className="font-['Montserrat'] text-xl font-bold text-white">
                    Sesuaikan Kriteria Prioritas
                </h3>
            </div>
            <div className="grid gap-4">
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
        </div>
    );
}
