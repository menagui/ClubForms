const express = require('express');
const pool = require('../config/database');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const camposNumericos = {
  recuperacao: [1, 10],
  horas_sono: [1, 10],
  qualidade_sono: [1, 7],
  nivel_estresse: [1, 7],
  nivel_fadiga: [1, 7],
  nivel_hidratacao: [1, 8],
};

function validarFormulario(body) {
  const valores = {};

  for (const [campo, [minimo, maximo]] of Object.entries(camposNumericos)) {
    const valor = Number(body[campo]);
    if (!Number.isInteger(valor) || valor < minimo || valor > maximo) {
      return { erro: `Preencha todos os campos de escala entre ${minimo} e ${maximo}.` };
    }
    valores[campo] = valor;
  }

  const dorLocalizada = String(body.dor_localizada || '').trim();
  const grauDorInformado = String(body.grau_dor || '').trim();
  let grauDor = null;

  if (grauDorInformado) {
    grauDor = Number(grauDorInformado);
    if (!Number.isInteger(grauDor) || grauDor < 1 || grauDor > 10) {
      return { erro: 'O grau da dor deve estar entre 1 e 10.' };
    }
  }

  if (dorLocalizada && grauDor === null) {
    return { erro: 'Informe o grau da dor localizada.' };
  }

  return {
    valores: {
      ...valores,
      dor_localizada: dorLocalizada || null,
      grau_dor: grauDor,
    },
  };
}

router.use(requireRole('JOGADOR'));

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT recuperacao, horas_sono, qualidade_sono, nivel_estresse,
              nivel_fadiga, nivel_hidratacao, dor_localizada, grau_dor, data_resposta
         FROM resposta_formulario
        WHERE id_usuario = $1
        ORDER BY data_resposta DESC
        LIMIT 5`,
      [req.session.user.id],
    );

    return res.render('jogador', {
      title: 'Questionário do jogador',
      respostas: result.rows,
      sucesso: req.query.enviado === '1',
      error: null,
      valores: {},
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/respostas', async (req, res, next) => {
  const validacao = validarFormulario(req.body);

  if (validacao.erro) {
    try {
      const result = await pool.query(
        `SELECT recuperacao, horas_sono, qualidade_sono, nivel_estresse,
                nivel_fadiga, nivel_hidratacao, dor_localizada, grau_dor, data_resposta
           FROM resposta_formulario
          WHERE id_usuario = $1
          ORDER BY data_resposta DESC
          LIMIT 5`,
        [req.session.user.id],
      );

      return res.status(400).render('jogador', {
        title: 'Questionário do jogador',
        respostas: result.rows,
        sucesso: false,
        error: validacao.erro,
        valores: req.body,
      });
    } catch (error) {
      return next(error);
    }
  }

  const v = validacao.valores;

  try {
    await pool.query(
      `INSERT INTO resposta_formulario (
        id_usuario, recuperacao, horas_sono, qualidade_sono,
        nivel_estresse, nivel_fadiga, nivel_hidratacao,
        dor_localizada, grau_dor
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        req.session.user.id,
        v.recuperacao,
        v.horas_sono,
        v.qualidade_sono,
        v.nivel_estresse,
        v.nivel_fadiga,
        v.nivel_hidratacao,
        v.dor_localizada,
        v.grau_dor,
      ],
    );

    return res.redirect('/jogador?enviado=1');
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
