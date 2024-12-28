import React, {useEffect, useState} from "react";
import {Alert, Button, CircularProgress, Grid, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import "jsr:@std/dotenv/load";

interface SystemHealthProps {
    minerId: string;
}

const SystemHealth: React.FC<SystemHealthProps> = ({minerId}) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // const [machineState, setMachineState] = useState(null);

    const fetchSystemHealth = async () => {
        try {
            const response = await fetch(`${Deno.env.get("BACKEND_API")}/miners/${minerId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch miner overview");
            }

            const result = await response.json();
            setData(result.data);
            setError(null);
        } catch (err) {
            setError((err as Error).message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const fetchMachineState = async () => {
        try {
            const response = await fetch(`${Deno.env.get("BACKEND_API")}/api/${minerId}/machine`);
            if (!response.ok) {
                throw new Error("Failed to fetch machine state");
            }

            const result = await response.json();
            setMachineState(result.machine);
        } catch (err) {
            setError((err as Error).message || "Failed to fetch data");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchSystemHealth();
        // fetchMachineState()
        const intervalId = setInterval(fetchSystemHealth, 30000);

        return () => clearInterval(intervalId);
    }, [minerId]);

    if (loading) return <CircularProgress/>;
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
                    CPU Temp: {data.boards[0].chiptmp.toFixed(1)}°C
                </Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography>CPU Clock: {data.boards[0].freq}Mhz</Typography>
            </Grid>
            {/*<Grid item xs={6}>*/}
            {/*    <Typography>Uptime: {machineState.uptime}</Typography>*/}
            {/*</Grid>*/}
            {/*<Grid item xs={6}>*/}
            {/*    <Typography>Mode: {machineState.mode}</Typography>*/}
            {/*</Grid>*/}

            <Grid item xs={12}>
                <Typography align="center">
                    <Link
                        to={`https://${data.ip}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{textDecoration: 'none'}}
                    >
                        <Button variant={"contained"}>Go to Miner
                        </Button>
                    </Link>
                </Typography>
            </Grid>
        </Grid>
    );
};

export default SystemHealth;
