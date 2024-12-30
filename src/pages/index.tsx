import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid, Paper, Typography} from "@mui/material";
import CombinedHashRateChart from "./CombinedHashRateChart.tsx";
import SystemHealth from "./SystemHealth.tsx";
import {fetchMinerData, TimeSeriesData} from "../utils/utils.tsx";

const Index: React.FC = () => {
    // Kaspa-related state
    const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
    const memoedMiners = useMemo(() => miners, [miners]);
    const [combinedHashRate, setCombinedHashRate] = useState<string | null>(null);
    const [data, setData] = useState<TimeSeriesData[]>([]);

    // Kaspa data fetching
    useEffect(() => {
        const fetchKaspaData = async () => {
            await fetchMinerData(miners).then((minerData) => {
                setData(minerData);
            });
        };
        const intervalId = setInterval(fetchKaspaData, 30000);
        fetchKaspaData(); // Initial data fetch
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const totalHashRate = memoedMiners.reduce((total, minerId) => {
            const minerData = data.filter((entry) => entry.minerId === minerId);
            const lastDataPoint = minerData[minerData.length - 1];
            return total + (lastDataPoint?.value ?? 0);
        }, 0);

        if (totalHashRate >= 1000) {
            setCombinedHashRate(`${(totalHashRate / 1000).toFixed(2)} TH/s`);
        } else {
            setCombinedHashRate(`${totalHashRate.toFixed(2)} GH/s`);
        }
    }, [data, memoedMiners]);

    // Meowcoin fetching data
    const [meowcoinData, setMeowcoinData] = useState(null);
    useEffect(() => {
        const fetchMeowcoinData = async () => {
            const data = await fetchMeowcoinData();
            setMeowcoinData(data);
        };
        fetchMeowcoinData();
    }, []);

    const memoedMeowcoinData = useMemo(() => meowcoinData, [meowcoinData]);

    return (
        <Container sx={{padding: 3, backgroundColor: "#121212", color: "#ffffff"}}>
            <Grid container spacing={3}>

                {/* Kaspa Section */}
                <Grid item xs={12} md={8} sx={{display: {xs: "none", md: "grid"}}}>
                    <Paper sx={{padding: 3, backgroundColor: "#1E1E1E", borderRadius: 2}}>
                        <Typography variant="h5" gutterBottom sx={{fontWeight: "bold"}}>
                            Combined Miner Hash Rates (Kaspa)
                        </Typography>
                        <CombinedHashRateChart/>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Grid item xs={12} md={4} sx={{display: {xs: "grid", md: "none"}}}>
                        <Paper sx={{padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2}}
                               key={"combined"}>
                            <Typography variant="h5" sx={{fontWeight: "bold"}}>
                                Combined
                            </Typography>
                            <Typography variant="h6">{combinedHashRate}</Typography>
                        </Paper>
                    </Grid>
                    {memoedMiners.map((minerId) => (
                        <Paper sx={{padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2}}
                               key={minerId}>
                            <Typography variant="h5" sx={{fontWeight: "bold"}}>
                                {minerId.toUpperCase()}
                            </Typography>
                            <SystemHealth minerId={minerId}/>
                        </Paper>
                    ))}
                    {memoedMeowcoinData && (
                        <Paper sx={{
                            padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2
                        }}>
                            <Typography variant="h5" sx={{fontWeight: "bold"}}>
                                Meowcoin
                            </Typography>
                            <Typography variant="h6">
                                Workers Online: {memoedMeowcoinData.workersOnline}
                            </Typography>
                            <Typography variant="h6">
                                Workers Offline: {memoedMeowcoinData.workersOffline}
                            </Typography>
                            <Typography variant="h6">
                                Block Rate: {memoedMeowcoinData.blockRate}
                            </Typography>
                            <Typography variant="h6">
                                Mature Blocks: {memoedMeowcoinData.matureBlocks}
                            </Typography>
                            <Typography variant="h6">
                                Immature Blocks: {memoedMeowcoinData.immatureBlocks}
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>

        </Container>
    );
};

export default Index;
