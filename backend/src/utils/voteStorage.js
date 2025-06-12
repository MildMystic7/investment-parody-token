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

  // Criar cópia do objeto para alteração
  const opcoes = { ...(votacao.opcoes || {}) };

  if (!(opcao in opcoes)) {
    opcoes[opcao] = { contagem: 0 };
  }

  opcoes[opcao].contagem++;

  // Usa setDataValue para garantir detecção de mudança
  votacao.setDataValue('opcoes', opcoes);

  // Verificar se o Sequelize detecta a mudança
  if (!votacao.changed('opcoes')) {
    // Se não detectar, força update manualmente
    await Votacao.update(
      { opcoes },
      { where: { id } }
    );
  } else {
    await votacao.save();
  }

  // Opcional: reload para ter certeza da atualização
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
