import { CalendarDays, ChevronDown, Clock3 } from 'lucide-react';

const bookingFields = [
    {
        label: 'Tanggal',
        value: 'Sabtu, 22 Juni 2026',
        icon: CalendarDays,
    },
    {
        label: 'Waktu',
        value: '11:00 - 13:00',
        icon: Clock3,
    },
];

export function BookingFields() {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {bookingFields.map((field) => (
                <label key={field.label} className="grid gap-2">
                    <span className="text-xs font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                        {field.label}
                    </span>
                    <span className="flex items-center gap-3 rounded-md border border-[#353535] bg-[#1b1b1b] px-4 py-4 text-white">
                        <field.icon className="size-5 text-[#c4c7c8]" />
                        {field.value}
                        <ChevronDown className="ml-auto size-5 text-[#8e9192]" />
                    </span>
                </label>
            ))}
        </div>
    );
}
