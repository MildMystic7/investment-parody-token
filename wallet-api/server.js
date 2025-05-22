import app from './src/app.js';
import { ENV, PORT, HOST } from './config.js';

const emojiMap = {
  dev: '🛠️  [DEV]',
  teste: '🧪  [TESTE]',
  prod: '🚀  [PROD]',
};



app.listen(PORT, () => {
  console.log('----------------------------------------------------------------------------');
  console.log(`${emojiMap[ENV] || '❓  [UNKNOWN]'} Ambiente a correr\n`);
  console.log(`HOST : ${HOST}`);
  console.log(`PORT : ${PORT}`);
  console.log(`URL  : http://${HOST}:${PORT}`);
  console.log('----------------------------------------------------------------------------\n');
});
