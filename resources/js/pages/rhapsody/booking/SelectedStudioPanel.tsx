import { studioImages } from '@/lib/rhapsody-data';

export function SelectedStudioPanel() {
    return (
        <article className="relative min-h-[340px] overflow-hidden rounded-lg border border-border bg-card">
            <img
                src={studioImages.console}
                alt="Studio recording console"
                className="absolute inset-0 h-full w-full object-cover brightness-75 contrast-125 grayscale"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.88))]" />
            <div className="relative flex min-h-[340px] flex-col justify-end p-5 md:p-7">
                <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-extrabold text-primary-foreground uppercase">
                    Selected Studio
                </span>
                <h3 className="font-['Montserrat'] text-3xl font-bold text-white">
                    Studio Alpha - Pro
                </h3>
                <p className="mt-2 max-w-xl text-muted-foreground">
                    Ruang recording premium dengan acoustic panel, grand piano,
                    dan console siap produksi.
                </p>
            </div>
        </article>
    );
}
