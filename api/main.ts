import {Application, Router, RouterContext} from '@oak/oak';
import {oakCors} from '@tajpouria/cors';
import "jsr:@std/dotenv/load";

const miners = {
    littleone: {
        apiKey: Deno.env.get("LITTLEONE_API_KEY"),
        apiEndpoint: 'https://192.168.3.175/',
    },
    littletwo: {
        apiKey: Deno.env.get("LITTLETWO_API_KEY"),
        apiEndpoint: 'https://192.168.3.171/',
    },
    littlethree: {
        apiKey: Deno.env.get("LITTLETHREE_API_KEY"),
        apiEndpoint: 'https://192.168.3.138/',
    },
    littlefour: {
        apiKey: Deno.env.get("LITTLEFOUR_API_KEY"),
        apiEndpoint: 'https://192.168.3.110/',
    },
};

const fetchFromMiner = async (url: string, apiKey: string) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {Authorization: `Bearer ${apiKey}`},
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
        } else {
            return await response.json();
        }

    } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        throw new Error('Failed to fetch from miner API');
    }
};

const router = new Router();

router.use(
    oakCors({
        origin: '*',
        methods: ['GET', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

const getMinerData = async (minerId: string, endpoint: string) => {
    const miner = miners[minerId];

    if (!miner) {
        throw new Error('Miner not found');
    }

    const url = `${miner.apiEndpoint}${endpoint}`;
    return fetchFromMiner(url, miner.apiKey);
};

router.get('/miners/:id', async (context: RouterContext) => {
    const {id: minerId} = context.params;
    try {
        const data = await getMinerData(minerId, 'api/overview');
        context.response.body = data;
        context.response.status = 200;
    } catch (error) {
        context.response.status = 404;
        context.response.body = {error: (error as Error).message};
    }
});

router.get('/miners/:id/pools', async (context: RouterContext) => {
    const {id: minerId} = context.params;
    try {
        const data = await getMinerData(minerId, 'api/overview');
        context.response.body = data.data?.pools ?? [];
        context.response.status = 200;
    } catch (error) {
        context.response.status = 500;
        context.response.body = {error: 'Failed to fetch pool stats'};
    }
});

router.get('/miners/:id/fans', async (context: RouterContext) => {
    const {id: minerId} = context.params;
    try {
        const data = await getMinerData(minerId, 'api/overview');
        context.response.body = data.data?.fans ?? [];
        context.response.status = 200;
    } catch (error) {
        context.response.status = 500;
        context.response.body = {error: 'Failed to fetch fan stats'};
    }
});

router.get("/api/:minerId/timeseries", async (context: RouterContext) => {
    const {minerId} = context.params;
    try {
        context.response.body = await getMinerData(minerId, 'api/timeseries?series=hashrate');
        context.response.status = 200;
    } catch (error) {
        context.response.status = 500;
        context.response.body = {message: "Internal server error"};
    }
});

// router.get("/api/:minerId/machine", async (context: RouterContext) => {
//     const {minerId} = context.params;
//     try {
//         context.response.body = await getMinerData(minerId, 'machine');
//         context.response.status = 200;
//     } catch (error) {
//         context.response.status = 500;
//         context.response.body = {message: "Internal server error"};
//     }
// });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log('Server running on ${Deno.env.get("BACKEND_API")}');
await app.listen({port: 5000});