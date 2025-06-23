import Votacao from '../models/Votacao.js';

// Criar nova votação
export async function criarVotacao(id, opcoes) {
  const existente = await Votacao.findByPk(id);
  if (existente) throw new Error('ID da votação já existe.');

  const estrutura = opcoes.reduce((acc, o) => {
    acc[o] = { contagem: 0 };
    return acc;
  }, {});

  await Votacao.create({ id, opcoes: estrutura });
}

// Votar (incrementar contagem de uma opção)
export async function votar(id, opcao) {
  const votacao = await Votacao.findByPk(id);
  if (!votacao) throw new Error('Votação não encontrada.');

  const opcoes = { ...(votacao.opcoes || {}) };

  if (!opcoes[opcao]) {
    opcoes[opcao] = { contagem: 0 };
  }

  opcoes[opcao].contagem += 1;

  // Atualiza no banco
  await Votacao.update(
    { opcoes: JSON.parse(JSON.stringify(opcoes)) },
    { where: { id } }
  );

  // Recarrega para ter certeza
  await votacao.reload();

  return votacao;
}


// Listar todas as votações com opções e contagens
export async function listarVotacoes() {
  const todas = await Votacao.findAll();
  return todas.map(v => ({
    id: v.id,
    opcoes: v.opcoes || {}
  }));
}
