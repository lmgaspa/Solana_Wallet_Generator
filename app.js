require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { connectMongoose } = require('./src/database/mongoose');
const addressesRouter = require('./src/routes/addressesRouter');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocument = require('./swagger.json');

const PORT = Number(process.env.PORT || 3000);
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const app = express();

// Segurança, compressão, logs
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.LOG_FORMAT || 'dev'));

// CORS
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));

// Rate limit
app.use('/api', rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.RATE_LIMIT_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
}));

// JSON e estáticos
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/health', (_, res) => res.json({ ok: true }));

// Páginas
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'public', 'sol_wallet.html')));
app.get('/sol_address', (_, res) => res.sendFile(path.join(__dirname, 'public', 'sol_address.html')));

// API
app.use('/api/addresses', addressesRouter);

// Swagger
const swaggerSpec = swaggerJsdoc({ definition: swaggerDocument, apis: ['./src/routes/*.js'] });
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Bootstrap
(async () => {
  try {
    await connectMongoose();
    app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));
  } catch (e) {
    console.error('❌ Failed to start server:', e);
    process.exit(1);
  }
})();

module.exports = app;
app.set('trust proxy', 1);