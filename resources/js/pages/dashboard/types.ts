export type UserRole = 'admin' | 'customer';

export type Studio = {
    name: string;
    opensAt: string;
    closesAt: string;
    slotDurationMinutes: number;
    hourlyRate: number;
};

export type ScheduleSlot = {
    time: string;
    endsAt: string;
    label: string;
    price: string;
    available: boolean;
    booking: {
        code: string;
        status: string;
        customerName: string;
    } | null;
};

export type PaymentMethod = {
    id: number;
    type: 'qris' | 'virtual_account' | 'bank_transfer' | 'cash';
    typeLabel: string;
    name: string;
    instructions: string | null;
    isActive: boolean;
    sortOrder: number;
};

export type Booking = {
    code: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    totalPrice: number;
    status: string;
    statusLabel: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    paymentMethodId: number | null;
    paymentMethodName: string | null;
    notes: string | null;
    adminNotes: string | null;
};

export type DashboardStats = {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    paidBookings: number;
};
