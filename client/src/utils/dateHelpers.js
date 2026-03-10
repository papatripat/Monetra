/**
 * Format tanggal ke format Indonesia
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatMonthYear = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export const getCurrentMonth = () => new Date().getMonth() + 1;
export const getCurrentYear = () => new Date().getFullYear();

export const getToday = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};
