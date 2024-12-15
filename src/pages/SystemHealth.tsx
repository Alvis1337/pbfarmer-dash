import React, { useEffect, useState } from "react";
import { Grid, Typography, Alert, CircularProgress } from "@mui/material";

interface SystemHealthProps {
    minerId: string;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ minerId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:5000/miners/${minerId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch miner overview");
                }

                const result = await response.json();
                setData(result.data);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || "Failed to fetch data");
                setLoading(false);
            }
        })();
    }, [minerId]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return null;

    return (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <Typography>5m: {data.rtpow}h/s</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>24h: {data.avgpow}h/s</Typography>
            </Grid>
            <Grid item xs={6}>
            <Typography>
                Board Temp: {data.boards[0].chiptmp.toFixed(1)}c
            </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>CPU Clock: {data.boards[0].freq}Mhz</Typography>
            </Grid>
        </Grid>
    );
};

export default SystemHealth;
