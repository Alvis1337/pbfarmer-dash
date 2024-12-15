import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import { fetchMinerData, TimeSeriesData } from "../utils/utils";

const CombinedHashRateChart: React.FC = () => {
  const [combinedHashRate, setCombinedHashRate] = useState<string | null>(null);
  const miners = useMemo(() => ["littleone", "littletwo", "littlethree", "littlefour"], []);
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const updateTimestamp = useCallback(() => {
    const now = new Date();
    setLastUpdated(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
    );
  }, []);

  const getLineColor = useCallback((minerId: string) => {
    const colors: { [key: string]: string } = {
      littleone: "#8884d8",
      littletwo: "#82ca9d",
      littlethree: "#ff7300",
      littlefour: "#ff0000",
    };
    return colors[minerId] || "#000000";
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const normalizedData = await fetchMinerData(miners);
      setData((prevData) => {
        if (JSON.stringify(prevData) !== JSON.stringify(normalizedData)) {
          return normalizedData;
        }
        return prevData;
      });
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }, [miners]);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 30000); // Set interval to 30 seconds
    return () => clearInterval(intervalId);
  }, [fetchData]);

  useEffect(() => {
    const totalHashRate = miners.reduce((total, minerId) => {
      const minerData = data.filter((entry) => entry.minerId === minerId);
      const lastDataPoint = minerData[minerData.length - 1];
      return total + (lastDataPoint?.value ?? 0);
    }, 0);

    if (totalHashRate >= 1000) {
      updateTimestamp();
      setCombinedHashRate(`${(totalHashRate / 1000).toFixed(2)} TH/s`);
    } else {
      updateTimestamp();
      setCombinedHashRate(`${totalHashRate.toFixed(2)} GH/s`);
    }
  }, [data, miners, updateTimestamp]);

  if (loading) return <CircularProgress />;

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

  // TODO: it does a ton of api calls to /timeseries. it needs to not

  return (
      <Container>
        <Paper sx={{ padding: 2, marginTop: 2 }}>
          <Typography variant="h6">
            Combined Miner Hashrates: {combinedHashRate} Updated:{" "}
            {lastUpdated || "Never"}
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                  dataKey="time"
                  type="number"
                  domain={["dataMin", "dataMax"]}
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