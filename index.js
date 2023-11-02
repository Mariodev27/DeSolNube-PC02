const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('./config/keys');
const express = require('express');
const fetch = require('node-fetch');
const session = require('express-session');

require('./models/User'); 
const User = mongoose.model('users');

const app = express();

app.use(
    session({
        secret: 'some secret',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.get('/users', async (req, res) => {
        const users = await User.find({});
        res.send(users);
});

app.delete('/api/users/:id', async (req, res) => {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).send('User not found');
    res.json({ message: 'User deleted successfully' });
});

fetch('http://localhost:5000/users')
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

require('./routes/authRoutes')(app);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback',
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            const existingUser = await User.findOne({ googleId: profile.id })

            if (existingUser) {
                return done(null, existingUser);
            }

            const user = await new User({ 
                googleId: profile.id, 
                name: profile.displayName, 
                email: profile.emails[0].value 
            }).save()
            done(null, user);
        }
    )
);

const port = 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

mongoose.connect('mongodb+srv://mario:123@cluster0.doiljmt.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));
