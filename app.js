const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const { connectToDatabase } = require('./src/database/index');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDocument = require('./swagger.json');
const create_sol_address = require('./src/routes/solRoutes')
const create_btc_address = require('./src/routes/btcRoutes')
const create_doge_address = require('./src/routes/dogeRoutes')
const create_diana_address = require('./src/routes/dianaRoutes')
const sol_generate_wallet = require('./src/routes/sol_generate_wallet')
const create_diana_finbo = require('./src/routes/diana_finbo')

// Middleware CORS com configuração específica
connectToDatabase();

app.use(cors())
app.use(cors({
  origin: ['*', 'https://dianaglobal.com.br', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

  // Middleware para JSON e arquivos estáticos

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sol_wallet.html'));
});

app.get('/sol_address', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sol_address.html'));
});

app.use('/api', sol_generate_wallet);
app.use('/api', create_btc_address);
app.use('/api', create_sol_address);
app.use('/api', create_doge_address);
app.use('/api', create_diana_address);
app.use('/api', create_diana_finbo);

// Configuração do Swagger
const options = {
  definition: swaggerDocument,
  apis: ['./src/routes/*.js'], // Caminho para os arquivos com anotações Swagger
};
const swaggerSpec = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

module.exports = app;