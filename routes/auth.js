const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.tipo === 'ADMIN' ? '/admin' : '/jogador');
  }

  return res.render('login', {
    title: 'Entrar',
    error: null,
    username: '',
  });
});

router.post('/login', async (req, res, next) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const senha = String(req.body.senha || '');

  if (!username || !senha) {
    return res.status(400).render('login', {
      title: 'Entrar',
      error: 'Informe o usuário e a senha.',
      username,
    });
  }

  try {
    const result = await pool.query(
      `SELECT id_usuario, nome, username, senha, tipo_usuario
         FROM usuario
        WHERE LOWER(username) = $1 AND ativo = TRUE`,
      [username],
    );

    const usuario = result.rows[0];
    const senhaCorreta = usuario && await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).render('login', {
        title: 'Entrar',
        error: 'Usuário ou senha inválidos.',
        username,
      });
    }

    return req.session.regenerate((error) => {
      if (error) return next(error);

      req.session.user = {
        id: usuario.id_usuario,
        nome: usuario.nome,
        username: usuario.username,
        tipo: usuario.tipo_usuario,
      };

      return req.session.save((saveError) => {
        if (saveError) return next(saveError);
        return res.redirect(usuario.tipo_usuario === 'ADMIN' ? '/admin' : '/jogador');
      });
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie('club.sid');
    return res.redirect('/login');
  });
});

module.exports = router;
