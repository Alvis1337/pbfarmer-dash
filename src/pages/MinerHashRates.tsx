import React, { useEffect, useState } from "react";
import {
    Container,
    Grid,
    Paper,
    Typography,
} from "@mui/material";

interface MinerHashRate {
    minerId: string;
    hashRate: number | null;
}

const MinerHashRates: React.FC = () => {
    const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
    const [minerHashRates, setMinerHashRates] = useState<MinerHashRate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMinerHashRate = async (minerId: string) => {
        const response = await fetch(`${Deno.env.get("BACKEND_API")}/api/${minerId}/timeseries`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${minerId}`);
        }
        const result = await response.json();

        const lastDataPoint = result.series[result.series.length - 1][0];

        return {
            minerId,
            hashRate: lastDataPoint ?? null,
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hashRates = await Promise.all(
                    miners.map((minerId) => fetchMinerHashRate(minerId))
                );
                setMinerHashRates(hashRates);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || "Failed to fetch data");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Typography variant="h6">Loading...</Typography>;
    if (error) return <Typography variant="h6" color="error">{error}</Typography>;

    return (
        <Container sx={{ padding: 3, backgroundColor: "#121212", color: "#ffffff" }}>
            <Grid container spacing={3}>
                {minerHashRates.map(({ minerId, hashRate }) => (
                    <Grid item xs={12} md={6} key={minerId}>
                        <Paper sx={{ padding: 2, backgroundColor: "#1E1E1E" }}>
                            <Typography variant="h6" fontWeight="bold">
                                {minerId.toUpperCase()}
                            </Typography>
                            <Typography variant="body1">
                                Hashrate: {hashRate !== null ? `${hashRate} Gh/s` : "No data available"}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default MinerHashRates;
