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
  value: number;
}

const MinerDataChart: React.FC<{ minerId: string }> = ({ minerId }) => {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${Deno.env.get("BACKEND_API")}/api/${minerId}/timeseries`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        const formattedData: TimeSeriesData[] = result.series.map((item: number[], index: number) => ({
          time: index,
          value: item[0],
        }));

        setData(formattedData);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message || "Failed to fetch data");
        setLoading(false);
      }
    })();
  }, [minerId]);

  useEffect(() => {
    console.log(data)
  }, [data]);

  const lastHashrate = data.length > 0 ? data[data.length - 1].value : "N/A";

  return (
      <Container>
        <Paper sx={{ padding: 2, marginTop: 2 }}>
          <Typography variant="h6">{minerId.toUpperCase()} Current: {lastHashrate} </Typography>

          {loading && <CircularProgress />}

          {error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
          )}
        </Paper>
      </Container>
  );
};

export default MinerDataChart;
