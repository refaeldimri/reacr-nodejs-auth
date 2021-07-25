const express = require('express')
const app = express()
const mysql = require('mysql')
const port = 3001
const cors = require('cors')
const bcrypt = require('bcrypt')
const saltRound = 10
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const jwt = require("jsonwebtoken")

app.use(
    cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
    session({
    key: "userId",
    secret: "subscibe",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    }
}))

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "omgili2772005",
  port: 3307,
  database: "refael_auth"
})

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(email + password, saltRound, (err, hash) => {
        if(err){
            console.log(err)
        }
        db.query('INSERT INTO user (email, password) VALUES (?,?)',
            [email, hash],
            (err, res) => {
                console.log(err);
            }
        )
    })
});

const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];
    if(!token){
        res.send("Yo, we need a token, please give it to us next time!")
    }else{
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            if(err){
                res.json({auth: false, message: "U failed to auth"})
            }else{
                req.userId = decoded.id
                next()
            }
        })
    }
}

app.get('/isUserAuth', verifyJWT, (req, res) => {
    res.send("Yo, u are authenticated")
})

app.get("/login", (req, res) => {
    if(req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    }else{
        res.send({loggedIn: false})
    }
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    db.query('SELECT * FROM user WHERE email = ?', email,
        (err, result) => {
        if (err){
            res.send(
                {err: err}
            )
        }
        if(result.length > 0){
            bcrypt.compare(email + password, result[0].password, (error, response) => {
                if(response){
                    const id = result[0].id
                    const token = jwt.sign({id}, "jwtSecret", {
                        expiresIn: 300,
                    })
                    req.session.user = result
                    res.json({auth: true, token: token, result: result})
                }else{
                    res.json({auth: false, message: 'wrong user name/password'})
                }
            })
        }else{
            res.json({auth: false, message: "no user exist"})
        }
        })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});

