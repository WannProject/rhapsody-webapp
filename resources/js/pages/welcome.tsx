import { Head } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { HomeScreen } from '@/pages/rhapsody/home-screen';

export default function Welcome() {
    return (
        <>
            <Head title="RHAPSODY | Music Booking System" />
            <RhapsodyLayout>
                <HomeScreen onViewChange={() => {}} />
            </RhapsodyLayout>
        </>
    );
}
