import React, { createContext, useContext, useEffect, useState } from "react";
import {TimeSeriesData} from "../utils/utils.tsx";

interface MinerContextType {
    data: TimeSeriesData[];
    loading: boolean;
    error: string | null;
}

const MinerContext = createContext<MinerContextType | undefined>(undefined);

export const MinerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<TimeSeriesData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHashRate = async (minerId: string) => {
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

    const fetchMinerData = async (minerList:  string[]) => {
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
                        ? minerData.find((point: TimeSeriesData) => point.time === i)
                        : null;

                    normalizedData.push({
                        time: i,
                        value: dataPoint ? dataPoint.value : null,
                        minerId,
                        fans: Array.from({ length: 4 }, () => Math.floor(Math.random() * 1000)),
                    });
                });
            }

            return normalizedData
        } catch (err) {
            console.log('fuck', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
                const minerData = await fetchMinerData(miners);
                if(minerData) {
                    setData(minerData);
                }
                setError(null);
            } catch (err) {
                setError((err as Error).message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <MinerContext.Provider value={{ data, loading, error }}>
            {children}
        </MinerContext.Provider>
    );
};

export const useMinerData = () => {
    const context = useContext(MinerContext);
    if (!context) {
        throw new Error("useMinerData must be used within MinerProvider");
    }
    return context;
};