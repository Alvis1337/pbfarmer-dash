import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMinerData } from "../utils/utils";

interface MinerContextType {
    data: any[];
    loading: boolean;
    error: string | null;
}

const MinerContext = createContext<MinerContextType | undefined>(undefined);

export const MinerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
                const minerData = await fetchMinerData(miners);

                setData(minerData);
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