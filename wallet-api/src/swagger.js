import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Token & Wallet',
      version: '1.0.0',
      description: 'Documentação da API para Token e Wallet',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        url: 'http://localhost:3000/api/vote',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Aqui vais indicar onde estão os teus endpoints para documentar
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;