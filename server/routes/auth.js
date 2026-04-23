const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const AppleStrategy = require("passport-apple");
const User = require("../models/User");

const router = express.Router();

function buildToken(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

function buildOAuthCompletionPage(user) {
  const payload = JSON.stringify({ token: buildToken(user), user: user.toSafeObject() });
  const escapedPayload = JSON.stringify(payload);

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Connexion en cours...</title>
  </head>
  <body>
    <p>Connexion en cours...</p>
    <script>
      (function () {
        const payload = ${escapedPayload};
        sessionStorage.setItem("estimChatAuth", payload);
        localStorage.removeItem("estimChatAuth");
        window.location.replace("/inbox.html");
      })();
    </script>
  </body>
</html>`;
}

function getAvatarSeed(username) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=FFD700&color=0f0f0f`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function registerOAuthStrategies() {
  const googleReady =
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL;

  if (googleReady) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("Google n'a retourne aucun email."));
            }

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                username: profile.displayName || email.split("@")[0],
                email,
                avatar: profile.photos?.[0]?.value || getAvatarSeed(profile.displayName || email),
                provider: "google"
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  const appleReady =
    process.env.APPLE_CLIENT_ID &&
    process.env.APPLE_TEAM_ID &&
    process.env.APPLE_KEY_ID &&
    process.env.APPLE_PRIVATE_KEY &&
    process.env.APPLE_CALLBACK_URL;

  if (appleReady) {
    passport.use(
      new AppleStrategy(
        {
          clientID: process.env.APPLE_CLIENT_ID,
          teamID: process.env.APPLE_TEAM_ID,
          keyID: process.env.APPLE_KEY_ID,
          privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          callbackURL: process.env.APPLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, idToken, profile, done) => {
          try {
            const email = profile?.email;
            const username = profile?.name?.firstName
              ? `${profile.name.firstName} ${profile.name.lastName || ""}`.trim()
              : email?.split("@")[0] || "Apple User";

            if (!email) {
              return done(new Error("Apple n'a retourne aucun email."));
            }

            let user = await User.findOne({ email });
            if (!user) {
              user = await User.create({
                username,
                email,
                avatar: getAvatarSeed(username),
                provider: "apple"
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
}

registerOAuthStrategies();

passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

router.get("/status", (req, res) => {
  res.json({
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_CALLBACK_URL
    ),
    apple: Boolean(
      process.env.APPLE_CLIENT_ID &&
        process.env.APPLE_TEAM_ID &&
        process.env.APPLE_KEY_ID &&
        process.env.APPLE_PRIVATE_KEY &&
        process.env.APPLE_CALLBACK_URL
    )
  });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Adresse email invalide." });
    }

    if (username.trim().length < 2 || username.trim().length > 30) {
      return res.status(400).json({ message: "Le nom utilisateur doit contenir entre 2 et 30 caracteres." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caracteres." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Cet email est deja utilise." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar: getAvatarSeed(username),
      provider: "local"
    });

    const token = buildToken(user);
    return res.status(201).json({ token, user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur pendant l'inscription." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Identifiants invalides." });
    }

    const token = buildToken(user);
    return res.json({ token, user: user.toSafeObject() });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur pendant la connexion." });
  }
});

router.get("/google", (req, res, next) => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_CALLBACK_URL
  ) {
    return res
      .status(503)
      .send("OAuth Google non configure. Ajoutez les variables dans .env.");
  }

  return passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login.html?oauth=failed" }),
  (req, res) => {
    res.type("html").send(buildOAuthCompletionPage(req.user));
  }
);

router.get("/apple", (req, res, next) => {
  if (
    !process.env.APPLE_CLIENT_ID ||
    !process.env.APPLE_TEAM_ID ||
    !process.env.APPLE_KEY_ID ||
    !process.env.APPLE_PRIVATE_KEY ||
    !process.env.APPLE_CALLBACK_URL
  ) {
    return res
      .status(503)
      .send("OAuth Apple non configure. Ajoutez les variables dans .env.");
  }

  return passport.authenticate("apple", { session: false })(req, res, next);
});

router.post(
  "/apple/callback",
  passport.authenticate("apple", { session: false, failureRedirect: "/login.html?oauth=failed" }),
  (req, res) => {
    res.type("html").send(buildOAuthCompletionPage(req.user));
  }
);

module.exports = { router, passport };
