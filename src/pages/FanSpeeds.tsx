import React from "react";
import { Typography, Alert } from "@mui/material";
import { useMinerData } from "./MinerContext";

interface FanSpeedsProps {
    minerId: string;
}

const FanSpeeds: React.FC<FanSpeedsProps> = ({ minerId }) => {
    const { data, loading, error } = useMinerData();

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const fans = data.find((entry) => entry.minerId === minerId)?.fans || [];

    if (!fans.length) {
        return <Typography>No fans detected</Typography>;
    }

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