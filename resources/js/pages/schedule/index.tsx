import { Head } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { ScheduleScreen } from '@/pages/rhapsody/schedule-screen';

export default function SchedulePage() {
    return (
        <>
            <Head title="RHAPSODY | Schedule" />
            <RhapsodyLayout>
                <ScheduleScreen onViewChange={() => {}} />
            </RhapsodyLayout>
        </>
    );
}
