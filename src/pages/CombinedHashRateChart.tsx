import React, {useCallback, useMemo} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,} from "recharts";
import {CircularProgress, Container, Paper, Typography} from "@mui/material";
import {useMinerData} from "./MinerContext";

const CombinedHashRateChart: React.FC = () => {
    const {data, loading, error} = useMinerData();
    const miners = useMemo(() => ["littleone", "littletwo", "littlethree", "littlefour"], []);

    const getLineColor = useCallback((minerId: string) => {
        const colors: { [key: string]: string } = {
            littleone: "#8884d8",
            littletwo: "#82ca9d",
            littlethree: "#ff7300",
            littlefour: "#ff0000",
        };
        return colors[minerId] || "#000000";
    }, []);

    const totalHashRate = useMemo(() => {
        return miners.reduce((total, minerId) => {
            const minerData = data.filter((entry) => entry.minerId === minerId);
            const lastDataPoint = minerData[minerData.length - 1];
            return total + (lastDataPoint?.value ?? 0);
        }, 0);
    }, [data, miners]);


    const combinedHashRate =
        totalHashRate >= 1000
            ? `${(totalHashRate / 1000).toFixed(2)} TH/s`
            : `${totalHashRate.toFixed(2)} GH/s`;

    if (loading) return <CircularProgress/>;
    if (error) return <Typography color="error">{error}</Typography>;

    const minerLines = miners.map((minerId) => {
        const minerData = data.filter((entry) => entry.minerId === minerId);
        return (
            <Line
                key={minerId}
                type="monotone"
                dataKey="value"
                data={minerData}
                stroke={getLineColor(minerId)}
                name={minerId.toUpperCase()}
                activeDot={{r: 8}}
            />
        );
    });

    return (
        <Container>
            <Paper sx={{padding: 2, marginTop: 2}}>
                <Typography variant="h6">Combined Hash Rate: {combinedHashRate}</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]}/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        {minerLines}
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Container>
    );
};

export default CombinedHashRateChart;