import React, { useEffect, useMemo, useState } from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";
import CombinedHashRateChart from "./CombinedHashRateChart.tsx";
import SystemHealth from "./SystemHealth.tsx";
import { fetchMinerData, fetchWarthogData, TimeSeriesData } from "../utils/utils.tsx";

const Index: React.FC = () => {
    // Kaspa-related state
    const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
    const memoedMiners = useMemo(() => miners, [miners]);
    const [combinedHashRate, setCombinedHashRate] = useState<string | null>(null);
    const [data, setData] = useState<TimeSeriesData[]>([]);

    // Warthog-related state
    const [warthogData, setWarthogData] = useState<{
        currentHashRate: number;
        unconfirmedBalance: number;
        pendingBalance: number;
        totalPaid: number;
        currentPayoutEstimate: number;
    } | null>(null);
    const [loadingWarthog, setLoadingWarthog] = useState<boolean>(true);
    const [warthogError, setWarthogError] = useState<string | null>(null);

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

    // Warthog data fetching
    useEffect(() => {
        const fetchWarthog = async () => {
            setLoadingWarthog(true);
            setWarthogError(null);
            try {
                const data = await fetchWarthogData();
                setWarthogData(data);
            } catch (error) {
                setWarthogError("Failed to load Warthog data. Please try again later.");
                console.error(error);
            } finally {
                setLoadingWarthog(false);
            }
        };

        fetchWarthog();
        const intervalId = setInterval(fetchWarthog, 30000); // Refresh every 30 seconds
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Container sx={{ padding: 3, backgroundColor: "#121212", color: "#ffffff" }}>
            <Grid container spacing={3}>

                {/* Kaspa Section */}
                <Grid item xs={12} md={8} sx={{ display: { xs: "none", md: "grid" } }}>
                    <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                            Combined Miner Hash Rates (Kaspa)
                        </Typography>
                        <CombinedHashRateChart />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Grid item xs={12} md={4} sx={{ display: { xs: "grid", md: "none" } }}>
                        <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2 }} key={"combined"}>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                Combined
                            </Typography>
                            <Typography variant="h6">{combinedHashRate}</Typography>
                        </Paper>
                    </Grid>
                    {memoedMiners.map((minerId) => (
                        <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2 }} key={minerId}>
                            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                {minerId.toUpperCase()}
                            </Typography>
                            <SystemHealth minerId={minerId} />
                        </Paper>
                    ))}
                </Grid>

                {/* Warthog Section */}
                <Grid item xs={12}>
                    <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                            Warthog Data
                        </Typography>
                        {loadingWarthog ? (
                            <Typography variant="body1">Loading Warthog data...</Typography>
                        ) : warthogError ? (
                            <Typography variant="body1" color="error">
                                {warthogError}
                            </Typography>
                        ) : warthogData ? (
                            <>
                                <Typography variant="body1">
                                    <strong>Current Hash Rate:</strong> {warthogData.currentHashRate} H/s
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Unconfirmed Balance:</strong> {(warthogData.unconfirmedBalance / 1e8).toFixed(8)} KAS
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Pending Balance:</strong> {(warthogData.pendingBalance / 1e8).toFixed(8)} KAS
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Total Paid:</strong> {(warthogData.totalPaid / 1e8).toFixed(8)} KAS
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Current Payout Estimate:</strong> {(warthogData.currentPayoutEstimate / 1e8).toFixed(8)} KAS
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="body1" color="error">
                                Failed to load Warthog data
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;