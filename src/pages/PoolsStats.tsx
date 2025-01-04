import React, { useEffect, useState } from "react";
import { Typography, Alert, CircularProgress, List, ListItem, ListItemText } from "@mui/material";


interface PoolsStatsProps {
    minerId: string;
}

const PoolsStats: React.FC<PoolsStatsProps> = ({ minerId }) => {
    const [pools, setPools] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(`http://localhost:5000/miners/${minerId}/pools`);
                if (!response.ok) {
                    throw new Error("Failed to fetch pool stats");
                }

                const result = await response.json();
                setPools(result);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || "Failed to fetch data");
                setLoading(false);
            }
        })();
    }, [minerId]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!pools.length) return <Typography>No pools connected</Typography>;

    return (
        <div>
            <Typography variant="h6">Pool Stats:</Typography>
            <List>
                {pools.map((pool, index) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`Pool ${index + 1}: ${pool.addr}`}
                            secondary={`Accepted: ${pool.accepted}, Rejected: ${pool.rejected}`}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default PoolsStats;
