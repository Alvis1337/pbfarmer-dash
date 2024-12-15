import React, { useEffect, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    Alert,
    CircularProgress,
    Container,
    Paper,
    Typography,
} from "@mui/material";

interface TimeSeriesData {
    time: number;
    value: number | null;
    minerId: string;
}

const CombinedHashRateChart: React.FC = () => {
    const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
    const [data, setData] = useState<TimeSeriesData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getLineColor = (minerId: string) => {
        const colors: { [key: string]: string } = {
            littleone: "#8884d8",
            littletwo: "#82ca9d",
            littlethree: "#ff7300",
            littlefour: "#ff0000",
        };
        return colors[minerId] || "#000000";
    };

    const fetchHashRate = async (minerId: string) => {
        const response = await fetch(`http://localhost:5000/api/${minerId}/timeseries`);
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

    const totalHashRate = miners.reduce((total, minerId) => {
        const minerData = data.filter((entry) => entry.minerId === minerId);
        const lastDataPoint = minerData[minerData.length - 1];
        return total + (lastDataPoint?.value ?? 0);
    }, 0);

    const formattedHashRate = totalHashRate >= 1000 ? `${(totalHashRate / 1000).toFixed(2)} TH/s` : `${totalHashRate.toFixed(2)} GH/s`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const allHashRates = await Promise.all(miners.map(fetchHashRate));

                const maxTime = 30;

                const normalizedData: TimeSeriesData[] = [];

                for (let i = 0; i < maxTime; i++) {
                    miners.forEach((minerId) => {
                        const minerData = allHashRates.find((data) => data[0]?.minerId === minerId);
                        const dataPoint = minerData ? minerData.find((point) => point.time === i) : null;

                        normalizedData.push({
                            time: i,
                            value: dataPoint ? dataPoint.value : null,
                            minerId,
                        });
                    });
                }

                setData(normalizedData);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || "Failed to fetch data");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

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
                activeDot={{ r: 8 }}
            />
        );
    });

    return (
        <Container>
            <Paper sx={{ padding: 2, marginTop: 2 }}>
                <Typography variant="h6">Combined Miner Hashrates: {formattedHashRate}</Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {minerLines}
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Container>
    );
};

export default CombinedHashRateChart;
