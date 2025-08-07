import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// 認証が必要なルートのヘルパー関数
async function requireAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', user: null };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) {
    return { error: 'Unauthorized', user: null };
  }
  
  return { error: null, user };
}

// ユーザー登録
app.post('/make-server-aaa005ee/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// 取引データを取得
app.get('/make-server-aaa005ee/transactions', async (c) => {
  try {
    const { error, user } = await requireAuth(c.req.raw);
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const transactions = await kv.getByPrefix(`transactions:${user.id}:`);
    
    return c.json({ transactions: transactions || [] });
  } catch (error) {
    console.log('Get transactions error:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// 取引を追加
app.post('/make-server-aaa005ee/transactions', async (c) => {
  try {
    const { error, user } = await requireAuth(c.req.raw);
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const transaction = await c.req.json();
    
    if (!transaction.type || !transaction.amount || !transaction.category || !transaction.date) {
      return c.json({ error: 'Missing required transaction fields' }, 400);
    }

    const id = Date.now().toString();
    const transactionWithId = {
      ...transaction,
      id,
      userId: user.id
    };

    await kv.set(`transactions:${user.id}:${id}`, transactionWithId);
    
    return c.json({ transaction: transactionWithId });
  } catch (error) {
    console.log('Add transaction error:', error);
    return c.json({ error: 'Failed to add transaction' }, 500);
  }
});

// 取引を削除
app.delete('/make-server-aaa005ee/transactions/:id', async (c) => {
  try {
    const { error, user } = await requireAuth(c.req.raw);
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const transactionId = c.req.param('id');
    
    await kv.del(`transactions:${user.id}:${transactionId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete transaction error:', error);
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// 予算データを取得
app.get('/make-server-aaa005ee/budgets', async (c) => {
  try {
    const { error, user } = await requireAuth(c.req.raw);
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const budgets = await kv.getByPrefix(`budgets:${user.id}:`);
    
    return c.json({ budgets: budgets || [] });
  } catch (error) {
    console.log('Get budgets error:', error);
    return c.json({ error: 'Failed to fetch budgets' }, 500);
  }
});

// 予算を設定/更新
app.post('/make-server-aaa005ee/budgets', async (c) => {
  try {
    const { error, user } = await requireAuth(c.req.raw);
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const { category, amount, month } = await c.req.json();
    
    if (!category || !amount || !month) {
      return c.json({ error: 'Category, amount, and month are required' }, 400);
    }

    if (amount <= 0) {
      return c.json({ error: 'Amount must be greater than 0' }, 400);
    }

    // 既存の予算があるかチェック
    const existingKey = `budgets:${user.id}:${month}:${category}`;
    const existingBudget = await kv.get(existingKey);

    const now = new Date().toISOString();
    const budgetData = {
      id: existingBudget?.id || Date.now().toString(),
      userId: user.id,
      category,
      amount,
      month,
      createdAt: existingBudget?.createdAt || now,
      updatedAt: now
    };

    await kv.set(existingKey, budgetData);
    
    return c.json({ budget: budgetData });
  } catch (error) {
    console.log('Set budget error:', error);
    return c.json({ error: 'Failed to set budget' }, 500);
  }
});

// 予算を削除
app.delete('/make-server-aaa005ee/budgets/:month/:category', async (c) => {
  try {
    const { error, user } = await requireAuth(c.req.raw);
    if (error || !user) {
      return c.json({ error: error || 'Unauthorized' }, 401);
    }

    const month = c.req.param('month');
    const category = c.req.param('category');
    
    await kv.del(`budgets:${user.id}:${month}:${category}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Delete budget error:', error);
    return c.json({ error: 'Failed to delete budget' }, 500);
  }
});

// ヘルスチェック
app.get('/make-server-aaa005ee/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch)