require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const helmet = require('helmet');
const pool = require('./config/database');
const authRoutes = require('./routes/auth');
const jogadorRoutes = require('./routes/jogador');
const adminRoutes = require('./routes/admin');

const app = express();
const port = Number(process.env.PORT || 3000);

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  throw new Error('DATABASE_URL e SESSION_SECRET precisam estar definidos no arquivo .env.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  store: new pgSession({ pool, createTableIfMissing: true }),
  name: 'club.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.user || null;
  next();
});

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  return res.redirect(req.session.user.tipo === 'ADMIN' ? '/admin' : '/jogador');
});

app.use(authRoutes);
app.use('/jogador', jogadorRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página não encontrada',
    message: 'A página que você tentou acessar não existe.',
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);

  const bancoIndisponivel = ['ECONNREFUSED', '57P01', '3D000'].includes(error.code);
  return res.status(500).render('error', {
    title: bancoIndisponivel ? 'Banco indisponível' : 'Erro interno',
    message: bancoIndisponivel
      ? 'Não foi possível acessar o PostgreSQL. Confirme se o Docker está em execução.'
      : 'Ocorreu um erro inesperado. Tente novamente.',
  });
});

async function iniciar() {
  await pool.query('SELECT 1');
  app.listen(port, '127.0.0.1', () => {
    console.log(`Formulário Club disponível em http://localhost:${port}`);
  });
}

iniciar().catch((error) => {
  const erros = Array.isArray(error.errors) ? error.errors : [error];
  const bancoDesligado = erros.some((item) => item.code === 'ECONNREFUSED');

  if (bancoDesligado) {
    console.error(
      'Não foi possível conectar ao PostgreSQL em localhost:5433.\n' +
      'Abra o Docker Desktop e execute: docker compose up -d',
    );
  } else {
    const detalhes = erros
      .map((item) => item.message || String(item))
      .filter(Boolean)
      .join('\n');
    console.error('Não foi possível iniciar a aplicação:', detalhes || error);
  }
  process.exit(1);
});
