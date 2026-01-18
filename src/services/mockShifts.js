export const mockShifts = [
    {
        id: 'mock-1',
        userId: 'user-1',
        dayNumber: 5,
        date: new Date().toISOString(), // Current month, day 5
        type: 'בוקר',
        entry: '07:00',
        exit: '16:00',
        hours: 9,
        salary: 405
    },
    {
        id: 'mock-2',
        userId: 'user-1',
        dayNumber: 8,
        date: new Date().toISOString(),
        type: 'ערב',
        entry: '15:00',
        exit: '23:00',
        hours: 8,
        salary: 360
    }
];
