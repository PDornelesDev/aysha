
import "dotenv/config";
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import Stripe from "stripe";
import cron from "node-cron";

const requiredEnvs = ['STRIPE_SECRET_KEY', 'STRIPE_PRICE_ID', 'STRIPE_WEBHOOK_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
  console.error("❌ ERRO CRÍTICO: Variáveis de ambiente faltando no .env:");
  missingEnvs.forEach(env => console.error(`   - ${env}`));
}

const app = express();
app.set('trust proxy', 1);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const allowedOrigins = [
  'https://app.ayshaia.com', 
  'https://ayshaia.com', 
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); 
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  credentials: true
}));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: parseInt(process.env.DB_PORT || "3306"),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// FUNÇÃO MESTRE - SEMPRE ATUALIZA O USUÁRIO
const processFinalPayment = async (session) => {
  const userId = session.metadata.userId;
  const customerId = session.customer;
  const sessionId = session.id;
  const amount = session.amount_total / 100;
  const currency = session.currency;
  const paymentMethod = session.payment_method_types?.[0] || 'card';

  console.log(`🚀 Processando pagamento final. User: ${userId} | Session: ${sessionId}`);

  return new Promise((resolve, reject) => {
    // 1. SEMPRE ATUALIZA O USUÁRIO (Garantia de que o status mudará no banco)
    db.query(
      'UPDATE users SET subscription_status = "active", stripe_customer_id = ? WHERE id = ?',
      [customerId, userId],
      (uErr, uRes) => {
        if (uErr) {
          console.error("❌ Erro ao atualizar status do usuário:", uErr);
          return reject(uErr);
        }
        console.log(`✅ Tabela users atualizada para 'active'. Linhas: ${uRes.affectedRows}`);

        // 2. VERIFICA SE JÁ EXISTE NO HISTÓRICO PARA NÃO DUPLICAR O LOG DE PAGAMENTO
        db.query('SELECT id FROM payments WHERE stripe_session_id = ?', [sessionId], (pCheckErr, pResults) => {
          if (pCheckErr) return reject(pCheckErr);
          
          if (pResults.length > 0) {
            console.log("ℹ️ Histórico de pagamento já existia, pulando INSERT.");
            return resolve({ success: true, updated: true });
          }

          // 3. SE NÃO EXISTIR, INSERE NO HISTÓRICO
          db.query(
            'INSERT INTO payments (userId, stripe_session_id, amount, currency, status, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, sessionId, amount, currency, 'succeeded', paymentMethod],
            (pErr) => {
              if (pErr) console.error("❌ Erro ao inserir histórico:", pErr);
              else console.log("📄 Novo histórico de pagamento registrado.");
              resolve({ success: true });
            }
          );
        });
      }
    );
  });
};



// ==========================================
// 🔌 GMAIL OAUTH2 FLOW (POPUP COMPATIBLE)
// ==========================================

const getRedirectUri = (req) => {
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  // IMPORTANTE: Esta URL deve ser EXATAMENTE igual à cadastrada no Google Cloud Console
  return isLocal 
    ? 'http://localhost:3001/api/auth/gmail/callback' 
    : 'https://api.ayshaia.com/api/auth/gmail/callback';
};

app.get('/api/auth/gmail/connect', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).send("UserId é obrigatório.");

  const REDIRECT_URI = getRedirectUri(req);
  
  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  googleUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email');
  googleUrl.searchParams.set('access_type', 'offline');
  googleUrl.searchParams.set('prompt', 'consent');
  googleUrl.searchParams.set('state', userId.toString());

  res.redirect(googleUrl.toString());
});

app.get('/api/auth/gmail/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  if (!code || !userId) return res.status(400).send("Código ou State faltando.");

  const REDIRECT_URI = getRedirectUri(req);

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + (tokens.expires_in || 3600));

    const sql = `
      UPDATE users 
      SET gmail_accessToken = ?, 
          gmail_refreshToken = ?, 
          gmail_scope = ?, 
          gmail_lastSync = ? 
      WHERE id = ?
    `;

    db.query(sql, [tokens.access_token, tokens.refresh_token || null, tokens.scope, expirationDate, userId], (err) => {
      if (err) return res.status(500).send("Erro ao salvar tokens: " + err.message);
      
      // Retorna HTML que fecha o popup e avisa a página principal
      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'GMAIL_CONNECTED_SUCCESS' }, '*');
              window.close();
            </script>
            <p>Conectado com sucesso! Fechando janela...</p>
          </body>
        </html>
      `);
    });

  } catch (error) {
    console.error("Erro no Callback Gmail:", error);
    res.status(500).send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'GMAIL_CONNECTED_ERROR', error: '${error.message}' }, '*');
          </script>
          <p>Erro na autenticação: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// ==========================================
// ⏰ TAREFA AGENDADA (CRON)
// ==========================================
cron.schedule('0 * * * *', () => {
  const sql = `
    UPDATE users 
    SET subscription_status = "expired", 
        gmail_accessToken = NULL, 
        gmail_refreshToken = NULL,
        gmail_scope = NULL,
        gmail_lastSync = NULL
    WHERE subscription_status = "trial" 
    AND DATEDIFF(NOW(), criadoEm) >= 5
  `;
  db.query(sql, (err, result) => {
    if (err) console.error("❌ [CRON] Erro:", err);
  });
});

const checkTrialStatus = (user) => {
  if (user.subscription_status === 'active') return { status: 'active', daysLeft: 30 };
  const criadoEm = new Date(user.criadoEm);
  const hoje = new Date();
  const diffTime = hoje.getTime() - criadoEm.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const trialDuration = 5;
  const daysLeft = Math.max(0, trialDuration - diffDays);
  if (diffDays >= trialDuration && user.subscription_status === 'trial') {
    db.query(
      'UPDATE users SET subscription_status = "expired", gmail_accessToken = NULL, gmail_refreshToken = NULL, gmail_scope = NULL, gmail_lastSync = NULL WHERE id = ?',
      [user.id]
    );
    return { status: 'expired', daysLeft: 0 };
  }
  return { status: user.subscription_status, daysLeft };
};

app.post('/api/auth/register', express.json(), (req, res) => {
  const { name, email, password, document, whatsapp } = req.body;
  db.query('INSERT INTO users (nome, email, password, cpf, whatsappId, whatsappJid, criadoEm, subscription_status) VALUES (?, ?, ?, ?, ?, ?, NOW(), "trial")', 
  [name, email, password, document, whatsapp, whatsapp], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ userId: results.insertId, message: "Sucesso" });
  });
});

app.patch('/api/boletos/:id', express.json(), (req, res) => {
  const { status, pagoEm } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status é obrigatório" });
  }

  db.query(
    "UPDATE boletos SET status = ?, pagoEm = ? WHERE id = ?",
    [status, pagoEm || null, req.params.id],
    (err, results) => {
      if (err) {
        console.error("Erro MySQL:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, affectedRows: results.affectedRows });
    }
  );
});



app.post('/api/auth/google', express.json(), (req, res) => {
  const { email, name, picture } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 🔹 USUÁRIO EXISTENTE
    if (results.length > 0) {
      const user = results[0];
      const trialInfo = checkTrialStatus(user);

      return res.json({
        userId: user.id,
        name: user.nome,
        email: user.email,
        picture: user.avatarUrl,

        // ✅ CAMPOS DE PERFIL
        whatsapp: user.whatsapp || '',
        cpf: user.cpf || '',
        cnpj: user.cnpj || '',

        subscriptionStatus: trialInfo.status,
        daysLeft: trialInfo.daysLeft,
        gmailLastSync: user.gmail_lastSync
      });
    }

    // 🔹 NOVO USUÁRIO
    const insertSql = `
      INSERT INTO users 
      (nome, email, avatarUrl, criadoEm, subscription_status) 
      VALUES (?, ?, ?, NOW(), 'trial')
    `;

    db.query(insertSql, [name, email, picture], (insErr, insResults) => {
      if (insErr) {
        return res.status(500).json({ error: insErr.message });
      }

      return res.json({
        userId: insResults.insertId,
        name,
        email,
        picture,

        // 🔹 novos usuários começam vazios
        whatsapp: '',
        cpf: '',
        cnpj: '',

        subscriptionStatus: 'trial',
        daysLeft: 5,
        gmailLastSync: null
      });
    });
  });
});

app.post('/api/auth/gmail/disconnect', express.json(), (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "UserId não fornecido." });

  const sql = `
    UPDATE users 
    SET gmail_accessToken = NULL, 
        gmail_refreshToken = NULL, 
        gmail_scope = NULL, 
        gmail_lastSync = NULL 
    WHERE id = ?
  `;
  
  db.query(sql, [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: "Gmail desconectado." });
  });
});


app.post('/api/stripe/verify-session', express.json(), async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      await processFinalPayment(session);
      return res.json({ status: 'active' });
    }
    res.json({ status: session.payment_status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    await processFinalPayment(event.data.object);
  }
  res.json({ received: true });
});

app.use(express.json());

app.get('/api/payments', (req, res) => {
  const { userId } = req.query;
  db.query('SELECT * FROM payments WHERE userId = ? ORDER BY created_at DESC', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/stripe/create-checkout', async (req, res) => {
  const { userId, email } = req.body;
  try {
    let frontendUrl = process.env.APP_URL || 'https://app.ayshaia.com';
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      customer_email: email,
      return_url: `${frontendUrl}/?checkout_success=true&session_id={CHECKOUT_SESSION_ID}`,
      metadata: { userId: userId.toString() },
      client_reference_id: userId.toString()
    });
    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT id, nome, email, avatarUrl, subscription_status FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });
    const user = results[0];
    res.json({ 
      userId: user.id, 
      name: user.nome, 
      email: user.email,
      picture: user.avatarUrl,
      subscriptionStatus: user.subscription_status
    });
  });
});



app.get('/api/boletos', (req, res) => {
  const { userId } = req.query;
  db.query('SELECT * FROM boletos WHERE userId = ? ORDER BY vencimento ASC', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));
