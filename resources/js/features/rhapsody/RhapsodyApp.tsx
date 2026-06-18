import { useState } from 'react';
import { AppChrome } from '@/features/rhapsody/components/AppChrome';
import { AdminReportScreen } from '@/features/rhapsody/screens/AdminReportScreen';
import { BookingScreen } from '@/features/rhapsody/screens/BookingScreen';
import { HomeScreen } from '@/features/rhapsody/screens/HomeScreen';
import { PaymentScreen } from '@/features/rhapsody/screens/PaymentScreen';
import { ScheduleScreen } from '@/features/rhapsody/screens/ScheduleScreen';
import { SuccessScreen } from '@/features/rhapsody/screens/SuccessScreen';
import type { RhapsodyView } from '@/features/rhapsody/types';

export function RhapsodyApp() {
    const [activeView, setActiveView] = useState<RhapsodyView>('home');

    return (
        <AppChrome activeView={activeView} onViewChange={setActiveView}>
            {activeView === 'home' && (
                <HomeScreen onViewChange={setActiveView} />
            )}
            {activeView === 'schedule' && (
                <ScheduleScreen onViewChange={setActiveView} />
            )}
            {activeView === 'booking' && (
                <BookingScreen onViewChange={setActiveView} />
            )}
            {activeView === 'payment' && (
                <PaymentScreen onViewChange={setActiveView} />
            )}
            {activeView === 'success' && (
                <SuccessScreen onViewChange={setActiveView} />
            )}
            {activeView === 'admin' && (
                <AdminReportScreen onViewChange={setActiveView} />
            )}
        </AppChrome>
    );
}
