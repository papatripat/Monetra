/**
 * Format angka ke mata uang Rupiah
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

/**
 * Format angka ke format singkat (1.5jt, 500rb)
 * @param {number} amount
 * @returns {string}
 */
export const formatCompact = (amount) => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}M`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}jt`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}rb`;
    return amount?.toString() || '0';
};
