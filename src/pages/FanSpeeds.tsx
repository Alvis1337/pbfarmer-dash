import React, { useEffect, useState } from "react";
import { Typography, Alert, CircularProgress } from "@mui/material";

interface FanSpeedsProps {
    minerId: string;
}

const FanSpeeds: React.FC<FanSpeedsProps> = ({ minerId }) => {
    const [fans, setFans] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:5000/miners/${minerId}/fans`);
                if (!response.ok) {
                    throw new Error("Failed to fetch fan stats");
                }

                const result = await response.json();
                setFans(result);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || "Failed to fetch data");
                setLoading(false);
            }
        })();
    }, [minerId]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!fans.length) return <Typography>No fans detected</Typography>;

    return (
        <div>
            <Typography variant="h6">Fan Speeds:</Typography>
            {fans.map((speed, index) => (
                <Typography key={index}>
                    Fan {index + 1}: {speed} RPM
                </Typography>
            ))}
        </div>
    );
};

export default FanSpeeds;
