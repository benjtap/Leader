export const formatSmartDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    // Otherwise show date (e.g., 22 Jan)
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const formatDuration = (seconds) => {
    if (!seconds) return '';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min} min ${sec} sec`;
};
