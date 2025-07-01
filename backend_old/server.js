import app from './src/app.js';
import sequelize from './src/db/sequelize.js';
import { PORT, HOST, ENV } from '../config.js';

const emojiMap = {
  dev: '🛠️',
  prod: '🚀',
};

// Função para iniciar o servidor
async function startServer() {
  try {
    // Sincroniza o modelo com a base de dados
    // Isto irá criar a tabela 'Users' se ela não existir
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    app.listen(PORT, () => {
      const serverUrl = `http://${HOST}:${PORT}`;
      console.log('----------------------------------------------------------------------------');
      console.log(`${emojiMap[ENV] || '✨'}  [${ENV.toUpperCase()}] Ambiente a correr\n`);
      console.log(`HOST : ${HOST}`);
      console.log(`PORT : ${PORT}`);
      console.log(`URL  : ${serverUrl}`);
      console.log('----------------------------------------------------------------------------');
    });
  } catch (err) {
    console.error('Error starting the server:', err);
  }
}

startServer();
