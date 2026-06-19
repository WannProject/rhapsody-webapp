import { paymentMethods } from '@/features/rhapsody/data/rhapsody-data';
import type { PaymentMethod } from '@/features/rhapsody/types';

export function PaymentMethodSelector() {
    return (
        <section className="grid gap-4">
            <h3 className="text-xs font-bold tracking-[0.22em] text-[#8e9192] uppercase">
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
                    ? 'border-white bg-white text-[#131313]'
                    : 'border-[#353535] bg-[#1b1b1b] text-white hover:border-white/70',
            ].join(' ')}
        >
            <Icon className="size-8" />
            <p className="mt-5 font-['Montserrat'] text-lg font-bold">
                {method.name}
            </p>
            <p
                className={[
                    'mt-2 text-sm leading-relaxed font-semibold',
                    selected ? 'text-[#454747]' : 'text-[#8e9192]',
                ].join(' ')}
            >
                {method.description}
            </p>
        </button>
    );
}
