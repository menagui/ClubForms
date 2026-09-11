function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  return next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    if (req.session.user.tipo !== role) {
      return res.status(403).render('error', {
        title: 'Acesso negado',
        message: 'Você não tem permissão para acessar esta página.',
      });
    }

    return next();
  };
}

module.exports = { requireAuth, requireRole };
