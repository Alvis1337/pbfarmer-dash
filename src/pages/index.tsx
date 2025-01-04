import React, {useEffect, useMemo, useState} from "react";
import {Container, Grid, Paper, Typography} from "@mui/material";
import CombinedHashRateChart from "./CombinedHashRateChart.tsx";
import SystemHealth from "./SystemHealth.tsx";
import {fetchMeowcoinData, TimeSeriesData} from "../utils/utils.tsx";
import {MeowcoinData} from "../types.ts";

const Index: React.FC = () => {
    const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
    const memoedMiners = useMemo(() => miners, [miners]);
    const [combinedHashRate, setCombinedHashRate] = useState<string | null>(null);
    const [data, setData] = useState<TimeSeriesData[]>([]);

    const fetchHashRate = async (minerId: string, ) => {
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
        const fetchKaspaData = async () => {
            await fetchMinerData(miners).then((minerData) => {
                if(minerData) {
                    return setData(minerData);
                }
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
    const [meowcoinData, setMeowcoinData] = useState(null as MeowcoinData | null);
    useEffect(() => {
        const fetchData = async () => {
            await fetchMeowcoinData().then(data => {
                if(data) {
                    setMeowcoinData(data);
                }
            });
        };
        const intervalId = setInterval(fetchData, 30000);
        fetchData(); // Initial data fetch
        return () => clearInterval(intervalId);
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
                    {memoedMeowcoinData && memoedMeowcoinData.modeStats && memoedMeowcoinData.modeStats.pplns && (
                        <Paper sx={{padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2}}>
                            <Typography variant="h5" sx={{fontWeight: "bold"}}>
                                Meowcoin
                            </Typography>
                            <Typography variant="h6">
                                Workers Online: {memoedMeowcoinData.workersOnline}
                            </Typography>
                            <Typography variant="h6">
                                Hash
                                Rate: {(memoedMeowcoinData.modeStats.pplns.default.currentHashrate / 1000000).toFixed(2)} MH/s
                            </Typography>
                            <Typography variant="h6">
                                Monthly Profit: {memoedMeowcoinData.stats.income.income_Month.toFixed(2)} MEWC
                            </Typography>
                            <Typography variant="h6">
                                Blocks Found: {memoedMeowcoinData.matureBlocks.length}
                            </Typography>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;