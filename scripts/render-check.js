const path = require('path');
const ejs = require('ejs');

const views = path.join(__dirname, '..', 'views');
const usuarioJogador = { id: 2, nome: 'Jogador Teste', username: 'jogador', tipo: 'JOGADOR' };
const usuarioAdmin = { id: 1, nome: 'Administrador', username: 'admin', tipo: 'ADMIN' };
const resposta = {
  id_resposta: 1,
  nome: 'Jogador Teste',
  username: 'jogador',
  recuperacao: 8,
  horas_sono: 7,
  qualidade_sono: 6,
  nivel_estresse: 2,
  nivel_fadiga: 3,
  nivel_hidratacao: 7,
  dor_localizada: null,
  grau_dor: null,
  data_resposta: new Date(),
};

const casos = [
  ['login.ejs', { title: 'Entrar', usuario: null, error: null, username: '' }],
  ['jogador.ejs', {
    title: 'Jogador', usuario: usuarioJogador, respostas: [resposta],
    sucesso: true, error: null, valores: {},
  }],
  ['admin.ejs', {
    title: 'Admin', usuario: usuarioAdmin, respostas: [resposta], jogador: '',
    resumo: { total_respostas: 1, total_jogadores: 1, media_recuperacao: '8.0', media_fadiga: '3.0' },
  }],
  ['error.ejs', { title: 'Erro', usuario: null, message: 'Teste' }],
];

(async () => {
  for (const [arquivo, dados] of casos) {
    const html = await ejs.renderFile(path.join(views, arquivo), dados);
    if (!html.includes('<!doctype html>')) {
      throw new Error(`A view ${arquivo} não gerou HTML completo.`);
    }
  }

  console.log('Views EJS renderizadas com sucesso.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
