export interface TimeSeriesData {
    time: number;
    value: number | null;
    minerId: string;
}

export const fetchHashRate = async (minerId: string) => {
    const response = await fetch(
        `http://localhost:5000/api/${minerId}/timeseries`,
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
        console.log(err);
    }
};