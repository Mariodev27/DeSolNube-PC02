const passport = require('passport');

module.exports = (app) => {
    app.get(
        '/auth/google',
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })
    );

    app.get(
        '/auth/google/callback',
        passport.authenticate('google'),
        (req, res) => {
            res.redirect('/users');
        }
    );

    app.get('/login', (req, res) => {
        res.render('login');
    });

    app.get('/users', async (req, res) => {
        const users = await User.find({});
        res.render('users', { users: users });
    });
};