import { ref } from 'vue';
import { useStore } from 'vuex';
import api from '../services/api';

export function useExcelReport() {
    const store = useStore();
    const isExcelModalOpen = ref(false);
    // reportDate decides which month/year to export. 
    // Defaults to current date/time when initialized, but should be updated on open.
    const reportDate = ref(new Date());

    const openExcelModal = (dateStr) => {
        // Support Date object or date string
        if (dateStr instanceof Date) {
            reportDate.value = dateStr;
        } else if (typeof dateStr === 'string' && dateStr) {
            // Try parse? Or assume it's just meant to be "now" if not Date.
            // Usually ShiftsView passes current date.
            // If passed nothing, use now.
            reportDate.value = new Date();
        } else {
            reportDate.value = new Date();
        }

        isExcelModalOpen.value = true;
    };

    const handleExcelAction = async (action) => {
        try {
            const d = reportDate.value;
            const targetMonth = d.getMonth(); // 0-11
            const targetYear = d.getFullYear();

            // 1. Get All Shifts
            const allShifts = store.getters.allShifts;

            // 2. Filter for Target Month
            const filteredShifts = allShifts.filter(s => {
                if (!s || !s.date) return false;
                const sd = new Date(s.date);
                return sd.getMonth() === targetMonth && sd.getFullYear() === targetYear;
            });

            // 3. Compute Totals (Replicating ShiftView Logic)
            let totalSalary = 0;
            let totalMinutes = 0;

            filteredShifts.forEach(s => {
                if (s.hours && s.hours !== '0:00') {
                    const [h, m] = s.hours.split(':').map(Number);
                    totalMinutes += (h || 0) * 60 + (m || 0);
                }
                totalSalary += (parseFloat(s.salary) || 0);
            });

            // Total Hours Calculation
            const totalH = Math.floor(totalMinutes / 60);
            const totalM = totalMinutes % 60;
            // Note: Replicating original logic which might just use parseFloat on HH:MM (getting HH)
            const totalHoursFloat = parseFloat(`${totalH}.${totalM}`) || 0;

            const payload = {
                month: targetMonth + 1,
                year: targetYear,
                shifts: filteredShifts.map(s => {
                    // Safety check for dayNumber
                    let dayNum = 1;
                    if (s.dayNumber) dayNum = parseInt(s.dayNumber);
                    else if (s.date) {
                        dayNum = new Date(s.date).getDate();
                    }

                    return {
                        date: new Date(targetYear, targetMonth, dayNum).toISOString(),
                        shiftType: s.type,
                        entryTime: s.entry,
                        exitTime: s.exit,
                        breakDuration: parseFloat(s.break) || 0,
                        additions: parseFloat(s.extra) || 0,
                        deductions: parseFloat(s.deduction) || 0,
                        comments: s.notes || '',
                        hours: parseFloat(s.hours) || 0,
                        wage: parseFloat(s.salary) || 0
                    };
                }),
                totals: {
                    totalHours: totalHoursFloat,
                    totalAdditions: 0,
                    totalDeductions: 0,
                    grossWage: 0,
                    netWage: totalSalary,
                    healthTax: 0,
                    nationalInsurance: 0,
                    incomeTax: 0,
                    pension: 0,
                    studyFund: 0
                },
                emailAddress: store.getters.currentUser?.email || 'user@example.com'
            };

            payload.shifts.forEach(s => {
                payload.totals.totalAdditions += s.additions;
                payload.totals.totalDeductions += s.deductions;
            });
            payload.totals.grossWage = payload.totals.netWage;

            // API Calls
            if (action === 'view') {
                const response = await api.post('reports/excel-view', payload, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Report_${payload.month}_${payload.year}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else if (action === 'email') {
                await api.post('reports/excel-email', payload);
                store.dispatch('showToast', { message: 'נשלח למייל בהצלחה', type: 'success' });
            }
            isExcelModalOpen.value = false;
        } catch (e) {
            console.error(e);
            store.dispatch('showToast', { message: 'שגיאה ביצירת דוח', type: 'error' });
        }
    };

    return {
        isExcelModalOpen,
        openExcelModal,
        handleExcelAction
    };
}
