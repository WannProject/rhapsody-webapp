type SectionHeaderProps = {
    title: string;
    eyebrow?: string;
    action?: string;
};

export function SectionHeader({ title, eyebrow, action }: SectionHeaderProps) {
    return (
        <div className="flex items-end justify-between gap-4">
            <div>
                {eyebrow && (
                    <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-[#8e9192] uppercase">
                        {eyebrow}
                    </p>
                )}
                <h2 className="font-['Montserrat'] text-[28px] leading-tight font-bold tracking-tight text-white md:text-[34px]">
                    {title}
                </h2>
            </div>
            {action && (
                <button
                    type="button"
                    className="pb-1 text-sm font-semibold tracking-[0.12em] whitespace-nowrap text-[#c4c7c8] transition hover:text-white"
                >
                    {action}
                </button>
            )}
        </div>
    );
}
