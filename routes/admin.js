const express = require('express');
const pool = require('../config/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireRole('ADMIN'));

router.get('/', async (req, res, next) => {
  const jogador = String(req.query.jogador || '').trim();
  const parametros = [];
  let filtro = '';

  if (jogador) {
    parametros.push(`%${jogador}%`);
    filtro = 'WHERE u.nome ILIKE $1 OR u.username ILIKE $1';
  }

  try {
    const [respostas, resumo] = await Promise.all([
      pool.query(
        `SELECT r.*, u.nome, u.username
           FROM resposta_formulario r
           JOIN usuario u ON u.id_usuario = r.id_usuario
           ${filtro}
          ORDER BY r.data_resposta DESC
          LIMIT 200`,
        parametros,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total_respostas,
                COUNT(DISTINCT id_usuario)::int AS total_jogadores,
                ROUND(AVG(recuperacao), 1) AS media_recuperacao,
                ROUND(AVG(nivel_fadiga), 1) AS media_fadiga
           FROM resposta_formulario`,
      ),
    ]);

    return res.render('admin', {
      title: 'Painel administrativo',
      respostas: respostas.rows,
      resumo: resumo.rows[0],
      jogador,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
