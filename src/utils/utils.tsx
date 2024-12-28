export interface TimeSeriesData {
    time: number;
    value: number | null;
    minerId: string;
}

export const fetchHashRate = async (minerId: string) => {
    const response = await fetch(
        `${Deno.env.get("BACKEND_API")}/api/${minerId}/timeseries`,
    );
    if (!response.ok) {
        throw new Error(`Failed to fetch data for ${minerId}`);
    }
    const result = await response.json();

    return result.series.map((item: number[], index: number) => ({
        time: index,
        value: item[0],
        minerId,
    }));
};

export const fetchWarthogData = async () => {
    try {
        const response = await fetch(
            `https://warthog.herominers.com/api/stats_address?address=6f1576fe6950534d367b3fe4acc39990da1ad066d7a08ac4&recentBlocksAmount=20&longpoll=false`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Warthog data');
        }

        const data = await response.json();
        return {
            currentHashRate: data.currentHashrate || 0,
            unconfirmedBalance: data.unpaid || 0,
            pendingBalance: data.pending || 0,
            totalPaid: data.paid || 0,
            currentPayoutEstimate: data.estimate || 0,
        };
    } catch (error) {
        console.error('Error fetching Warthog data:', error);
        return null;
    }
};

export const fetchMinerData = async (minerList) => {
    try {
        const allHashRates = await Promise.all(minerList.map(fetchHashRate));

        const maxTime = 30;

        const normalizedData: TimeSeriesData[] = [];

        for (let i = 0; i < maxTime; i++) {
            minerList.forEach((minerId) => {
                const minerData = allHashRates.find((data) =>
                    data[0]?.minerId === minerId
                );
                const dataPoint = minerData
                    ? minerData.find((point) => point.time === i)
                    : null;

                normalizedData.push({
                    time: i,
                    value: dataPoint ? dataPoint.value : null,
                    minerId,
                });
            });
        }

        return normalizedData
    } catch (err) {
        console.log('fuck', err);
    }
};