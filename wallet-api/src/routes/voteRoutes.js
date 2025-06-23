import express from 'express';
import { criarVotacao, votar, listarVotacoes } from '../utils/voteStorage.js';

const router = express.Router();

// Criar votação
router.post('/createvote', async (req, res) => {
  const { id } = req.body;
  if (!id ) {
    return res.status(400).json({ erro: 'ID ou opções inválidas.' });
  }

  try {
    await criarVotacao(id, []);
    res.status(201).json({ mensagem: 'Votação criada com sucesso.' });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

// Listar todas as votações
router.get('/getall', async (req, res) => {
  try {
    const votacoes = await listarVotacoes();
    res.json(votacoes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Adicionar voto a uma opção (incrementar)
router.post('/', async (req, res) => {
  const { id } = req.params;
  const { opcao } = req.body;

  if (!opcao || typeof opcao !== 'string') {
    return res.status(400).json({ erro: 'Opção inválida'});
  }

  try {
    const votacao = await votar(id, opcao);
    res.status(201).json({ mensagem: 'Voto adicionado', opcoes: Object.keys(votacao.opcoes) });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

export default router;
