export interface TimeSeriesData {
    time: number;
    value: number | null;
    minerId: string;
    fans: number[];
}

export const fetchMeowcoinData = async () => {
    try {
        const response = await fetch(
            'https://api.woolypooly.com/api/mewc-1/accounts/MBrDY7eESdXJq9298R6HqFWEx2A1m4zxSr',
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Meowcoin data');
        }

        const data = await response.json();

        return {
            modeStats: data.mode_stats,
            stats: data.stats,
            payments: data.payments,
            workers: data.workers,
            workersTotal: data.workersTotal,
            workersOnline: data.workersOnline,
            workersOffline: data.workersOffline,
            blockRate: data.block_rate,
            matureBlocks: data.mature_blocks,
            immatureBlocks: data.immature_blocks,
            matureCount: data.mature_count,
            immatureCount: data.immature_count,
            recalculateState: data.recalculate_state,
            recalculatePosition: data.recalculate_position,
            performance: data.performance,
        };
    } catch (error) {
        console.error('Error fetching Meowcoin data:', error);
        return null;
    }
};
