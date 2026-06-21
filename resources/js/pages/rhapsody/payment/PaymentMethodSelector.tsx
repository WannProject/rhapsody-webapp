import { paymentMethods } from '@/lib/rhapsody-data';
import type { PaymentMethod } from '@/types/rhapsody';

export function PaymentMethodSelector() {
    return (
        <section className="grid gap-4">
            <h3 className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                Pilih Metode Pembayaran
            </h3>
            <div className="grid gap-3 md:grid-cols-3">
                {paymentMethods.map((method, index) => (
                    <PaymentMethodOption
                        key={method.name}
                        method={method}
                        selected={index === 0}
                    />
                ))}
            </div>
        </section>
    );
}

type PaymentMethodOptionProps = {
    method: PaymentMethod;
    selected: boolean;
};

function PaymentMethodOption({ method, selected }: PaymentMethodOptionProps) {
    const Icon = method.icon;

    return (
        <button
            type="button"
            className={[
                'min-h-[156px] rounded-md border p-4 text-left transition',
                selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-white hover:border-primary/70',
            ].join(' ')}
        >
            <Icon className="size-8" />
            <p className="mt-5 font-['Montserrat'] text-lg font-bold">
                {method.name}
            </p>
            <p
                className={[
                    'mt-2 text-sm leading-relaxed font-semibold',
                    selected ? 'text-muted-foreground/60' : 'text-muted-foreground',
                ].join(' ')}
            >
                {method.description}
            </p>
        </button>
    );
}
