import type { LucideIcon } from 'lucide-react';

export type RhapsodyView =
    | 'home'
    | 'schedule'
    | 'booking'
    | 'payment'
    | 'success'
    | 'admin';

export type Studio = {
    id: string;
    name: string;
    tier: string;
    subtitle: string;
    rate: string;
    image: string;
    availability: string;
    capacity: string;
};

export type ScheduleSlot = {
    time: string;
    status: 'available' | 'booked' | 'promo';
    label: string;
    price: string;
};

export type NavItem = {
    view: RhapsodyView;
    label: string;
    icon: LucideIcon;
    href: string;
    authRequired?: boolean;
    adminRequired?: boolean;
};

export type Instrument = {
    name: string;
    detail: string;
    selected?: boolean;
};

export type PaymentMethod = {
    name: string;
    description: string;
    icon: LucideIcon;
};
