import React from "react";
import MinerDataChart from "./hashChart";
import SystemHealth from "./SystemHealth";
import FanSpeeds from "./FanSpeeds";
import PoolsStats from "./PoolsStats";
import { Card, CardContent, CardHeader } from "@mui/material";

interface MinerSummaryCardProps {
    minerId: string;
}

const MinerSummaryCard: React.FC<MinerSummaryCardProps> = ({ minerId }) => {
    return (
        <Card>
            <CardHeader title={`${minerId.toUpperCase()} Overview`} />
            <CardContent>
                <MinerDataChart minerId={minerId} />
                <SystemHealth minerId={minerId} />
                <FanSpeeds minerId={minerId} />
                <PoolsStats minerId={minerId} />
            </CardContent>
        </Card>
    );
};

export default MinerSummaryCard;
