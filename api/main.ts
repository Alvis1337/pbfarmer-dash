import { Application, Context, Router } from '@oak/oak';
import { oakCors } from '@tajpouria/cors';

const miners = {
  littleone: {
    apiKey: Deno.env.get("LITTLEONE_API_KEY"),
    apiEndpoint: 'https://192.168.3.175/',
  },
  littletwo: {
    apiKey: Deno.env.get("LITTLEONE_API_KEY"),
    apiEndpoint: 'https://192.168.3.171/',
  },
  littlethree: {
    apiKey: Deno.env.get("LITTLEONE_API_KEY"),
    apiEndpoint: 'https://192.168.3.138/',
  },
  littlefour: {
    apiKey: Deno.env.get("LITTLEONE_API_KEY"),
    apiEndpoint: 'https://192.168.3.110/',
  },
};

const fetchFromMiner = async (url: string, apiKey: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
    }

    return await response.json();
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

router.get('/miners/:id', async (context: Context) => {
  const minerId = context.params.id;
  try {
    const data = await getMinerData(minerId, 'api/overview');
    context.response.body = data;
    context.response.status = 200;
  } catch (error) {
    context.response.status = 404;
    context.response.body = { error: error.message };
  }
});

router.get('/miners/:id/pools', async (context: Context) => {
  const minerId = context.params.id;
  try {
    const data = await getMinerData(minerId, 'api/overview');
    context.response.body = data.data?.pools ?? [];
    context.response.status = 200;
  } catch (error) {
    context.response.status = 500;
    context.response.body = { error: 'Failed to fetch pool stats' };
  }
});

router.get('/miners/:id/fans', async (context: Context) => {
  const minerId = context.params.id;
  try {
    const data = await getMinerData(minerId, 'api/overview');
    context.response.body = data.data?.fans ?? [];
    context.response.status = 200;
  } catch (error) {
    context.response.status = 500;
    context.response.body = { error: 'Failed to fetch fan stats' };
  }
});

router.get("/api/:minerId/timeseries", async (context: Context) => {
  const { minerId } = context.params;
  try {
    const data = await getMinerData(minerId, 'api/timeseries?series=hashrate');
    context.response.body = data;
    context.response.status = 200;
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: "Internal server error" };
  }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log('Server running on http://localhost:5000');
await app.listen({ port: 5000 });
