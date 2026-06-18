import { AudioWaveform } from 'lucide-react';

type BrandMarkProps = {
    compact?: boolean;
};

export function BrandMark({ compact = false }: BrandMarkProps) {
    return (
        <div className="flex items-center gap-3 text-white">
            <AudioWaveform className="size-7 stroke-[2.4]" aria-hidden="true" />
            {!compact && (
                <span className="font-['Montserrat'] text-[26px] leading-none font-extrabold tracking-tight">
                    RHAPSODY
                </span>
            )}
        </div>
    );
}
