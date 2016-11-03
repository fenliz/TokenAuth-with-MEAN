var _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var app = express();
app.use(passport.initialize());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var users = [
    {
        id: 1,
        name: 'test',
        password: 'test',
    },
    {
        id: 2,
        name: 'test2',
        password: 'test2'
    }
];

app.post("/login", function(req, res) {
    var user = users[_.findIndex(users, { name: req.body.name })];
    if(user && user.password === req.body.password) {
        var payload = { id: user.id };
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.status(200).json({ message: "Success", token: token });
    } else {
        res.status(401).json({ message: "Login failed" });
    }
});

var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = "secretOrKey";

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log("payload received", jwt_payload);

    var user = users[_.findIndex(users, { id: jwt_payload.id })];
    if(user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);

app.get("/secret", passport.authenticate("jwt", { session: false }), function(req, res) {
    res.json("You can not see this without a token.");
});

app.get("/", function(req, res) {
    res.json({message: "Express is working!"});
});

app.listen(3000, function() {
    console.log("Express is running!");
});