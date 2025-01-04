export type Dino = { name: string; description: string };
export type Deno = { name: string; description: string };
export interface MeowcoinData {
    modeStats: ModeStats;
    stats: Stats;
    payments: Payment[];
    workers: Worker[];
    workersTotal: number;
    workersOnline: number;
    workersOffline: number;
    blockRate: BlockRate;
    matureBlocks: Block[];
    immatureBlocks: Block[];
    matureCount: number;
    immatureCount: number;
    recalculateState: boolean;
    recalculatePosition: boolean;
    performance: Performance;
}

export interface ModeStats {
    pplns: {
        default: {
            currentHashrate: number;
            hashrate: number;
            dayHashrate: number;
        };
    };
}

export interface Stats {
    balance: number;
    immature_balance: number;
    paid: number;
    todayPaid: number;
    income: Income;
    effort: Effort[];
    minerProfitGraph: MinerProfitGraph[];
}

export interface Income {
    income_Hour: number;
    income_HalfDay: number;
    income_Day: number;
    income_Week: number;
    income_Month: number;
}

export interface Effort {
    mode: string;
    rate: number;
}

export interface MinerProfitGraph {
    address: string;
    amount: number;
    participation: number;
    created: string;
}

export interface Payment {    amount: number;
    timestamp: number;
    tx: string;
}

export interface Worker {
    worker: string;
    lastBeat: number;
    mode: string;
    offline: boolean;
    hr: number;
    hr2: number;
    hr3: number;
    algo: string;
    participation: number;
}

export interface BlockRate {
    pplns: BlockRateDetail[];
    solo: BlockRateDetail[];
}

export interface BlockRateDetail {
    created: string;
    total_count: number;
    normal_count: number;
    orhpan_count: number;
    uncle_count: number;
    effort: number;
}

export interface Block {
    height: number;
    hash: string;
    timestamp: number;
    effort: number;
    uncle: boolean;
    confirmationprogress: number;
    miner: string;
    mode: string;
    algo: string;
    orphan: boolean;
    reward: number;
}

export interface Performance {
    pplns: PerformanceDetail[];
    solo: PerformanceDetail[];
}

export interface PerformanceDetail {
    algo: string;
    created: string;
    hashrate: number;
}