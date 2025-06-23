import app from './src/app.js';
import sequelize from './src/db/sequelize.js';  // importa a instância do Sequelize
import { ENV, PORT, HOST } from './config.js';

const emojiMap = {
  dev: '🛠️  [DEV]',
  teste: '🧪  [TESTE]',
  prod: '🚀  [PROD]',
};

async function startServer() {
  try {
    await sequelize.sync(); // garante que as tabelas existem antes de arrancar
    app.listen(PORT, () => {
      console.log('----------------------------------------------------------------------------');
      console.log(`${emojiMap[ENV] || '❓  [UNKNOWN]'} Ambiente a correr\n`);
      console.log(`HOST : ${HOST}`);
      console.log(`PORT : ${PORT}`);
      console.log(`URL  : http://${HOST}:${PORT}`);
      console.log('----------------------------------------------------------------------------\n');
    });
  } catch (error) {
    console.error('Erro ao sincronizar a base de dados ou arrancar o servidor:', error);
    process.exit(1);
  }
}

startServer();
