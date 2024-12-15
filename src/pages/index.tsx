import React, {useEffect, useState} from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import CombinedHashRateChart from "./CombinedHashRateChart.tsx";
import SystemHealth from "./SystemHealth.tsx";

interface TimeSeriesData {
  time: number;
  value: number | null;
  minerId: string;
}

const Index: React.FC = () => {
  const [data, setData] = useState<TimeSeriesData[]>([]);

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
        console.log(err)
      }
    };

    fetchData();
  }, []);

  const miners = ["littleone", "littletwo", "littlethree", "littlefour"];

  const totalHashRate = miners.reduce((total, minerId) => {
    const minerData = data.filter((entry) => entry.minerId === minerId);
    const lastDataPoint = minerData[minerData.length - 1];
    return total + (lastDataPoint?.value ?? 0);
  }, 0);


  const formattedHashRate = totalHashRate >= 1000 ? `${(totalHashRate / 1000).toFixed(2)} TH/s` : `${totalHashRate.toFixed(2)} GH/s`;


  return (
      <Container sx={{ padding: 3, backgroundColor: "#121212", color: "#ffffff" }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} sx={{
            display: {xs: 'none', md: 'grid'}
          }}>
            <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Combined Miner Hash Rates
              </Typography>
              <CombinedHashRateChart />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid item xs={12} md={4} sx={{
              display: {xs: 'grid', md: 'none'}
            }}>
              <Paper sx={{ padding: 3, backgroundColor: "#1E1E1E", marginBottom: 2, borderRadius: 2 }} key={'combined'}>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  Combined
                </Typography>
                <Typography variant="h6">{formattedHashRate}</Typography>
              </Paper>
            </Grid>
            {miners.map((minerId) => (
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
