import { ArrowUpRight } from 'lucide-react';
import type { Studio } from '@/features/rhapsody/types';

type StudioCardProps = {
    studio: Studio;
    featured?: boolean;
};

export function StudioCard({ studio, featured = false }: StudioCardProps) {
    return (
        <article
            className={[
                'group relative isolate overflow-hidden rounded-lg border border-[#353535] bg-[#1b1b1b]',
                featured ? 'min-h-[560px] md:min-h-[500px]' : 'min-h-[340px]',
            ].join(' ')}
        >
            <div
                className="absolute inset-0 bg-cover bg-center grayscale transition duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url("${studio.image}")` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.28)_44%,rgba(0,0,0,0.92)_100%)]" />
            <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-5 md:p-6">
                <span className="mb-4 w-fit rounded-full bg-white px-3 py-1 text-[11px] font-extrabold tracking-tight text-[#1a1c1c] uppercase">
                    {studio.tier}
                </span>
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h3 className="font-['Montserrat'] text-2xl font-extrabold text-white">
                            {studio.name}
                        </h3>
                        <p className="mt-1 text-base font-semibold text-[#c8c6c5]">
                            {studio.subtitle}
                        </p>
                        <p className="mt-3 text-sm text-[#8e9192]">
                            {studio.rate} - {studio.capacity}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label={`Lihat ${studio.name}`}
                        className="grid size-12 place-items-center rounded-md border border-white/20 bg-black/30 text-white transition group-hover:border-white"
                    >
                        <ArrowUpRight className="size-7" />
                    </button>
                </div>
            </div>
        </article>
    );
}
