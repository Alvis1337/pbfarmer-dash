import React, { useEffect, useMemo, useState } from "react";
import { Container, Grid, Paper, Typography } from "@mui/material";
import CombinedHashRateChart from "./CombinedHashRateChart.tsx";
import SystemHealth from "./SystemHealth.tsx";
import { fetchMinerData, TimeSeriesData } from "../utils/utils.tsx";

const Index: React.FC = () => {
  const miners = ["littleone", "littletwo", "littlethree", "littlefour"];
  const memoedMiners = useMemo(() => miners, [miners]);
  const [combinedHashRate, setCombinedHashRate] = useState<string | null>(null);
  const [data, setData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const minerData = await fetchMinerData(miners);
      setData(minerData);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, [miners]);

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

  return (
      <Container sx={{ padding: 3, backgroundColor: "#121212", color: "#ffffff" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} sx={{ display: { xs: "none", md: "grid" } }}>
            <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Combined Miner Hash Rates
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
        </Grid>
      </Container>
  );
};

export default Index;