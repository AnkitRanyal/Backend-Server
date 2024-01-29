require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const server = express()
const cors = require("cors")
const path = require("path")
const cookieparser = require("cookie-parser")
const passport = require("passport")
const session = require("express-session")
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt
const sha256 = require("sha256")
const uniqid = require("uniqid")
const store = require("store")
const axios = require("axios")

// Database
main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_ATLAS_URL);
  console.log('database connected');
}

const { Order } = require("./model/Order")


server.use(session({
  secret: "keyboard",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
server.use(passport.initialize())
server.use(passport.session())
server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(express.static('build'))
server.use(cookieparser())
server.set("view engine,ejs")



const { authrouter } = require("./routes/auth")
const { brandrouter } = require("./routes/Brands")
const { userrouter } = require("./routes/user")
const { productrouter } = require("./routes/product")
const { categoryrouter } = require("./routes/Categories")
const { orderrouter } = require("./routes/order")
const { cartrouter } = require("./routes/cart")
const { searchrouter } = require("./routes/searchrouter")
const { checkoutrouter } = require("./routes/checkout")
const { User } = require("./model/User")
const { CookieExtractor, sanitizeUser, isAuth } = require("./services/common")


// Routes
server.use("/auth", authrouter)
server.use("/users", userrouter)
server.use("/products", productrouter)
server.use("/brands", brandrouter)
server.use("/categories", categoryrouter)
server.use("/orders", orderrouter)
server.use("/cart", cartrouter)
server.use("/checkout", checkoutrouter)
server.use("/search", searchrouter)


// Authentication
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, async function (
    email,
    password,
    done
  ) {
    // by default passport uses username
    console.log({ email, password });
    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        return done(null, false, { message: 'invalid credentials' }); // for safety
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: 'invalid credentials' });
          }
          const token = jwt.sign(sanitizeUser(user), "keyboard cat"
          );
          done(null, { id: user.id, role: user.role, token }); // this lines sends to serializer
        }
      );
    } catch (err) {
      done(err);
    }
  })
);


const opts = {};
opts.jwtFromRequest = CookieExtractor;
opts.secretOrKey = "keyboard cat";

passport.use("jwt", new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    const user = await User.findById(jwt_payload.id)
    if (user) {
      return done(null, sanitizeUser(user))
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error, false);

  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(function () {
    console.log('serlizer', user)
    return done(null, { id: user.id, role: user.role })
  })
})


passport.deserializeUser((user, done) => {
  console.log('deserlizer', user)
  process.nextTick(function () {
    return done(null, user)
  })
})



server.get("/payment", (req, resp) => {
  let normalpayload = {
    "merchantId": "PGTESTPAYUAT",
    "merchantTransactionId": "MT7850590068188104",
    "merchantUserId": "MUID123",
    "amount": req.query.amount * 100 || 1000,
    "redirectUrl": "http://localhost:5000/paymentreturnurl",
    "redirectMode": "POST",
    "callbackUrl": "http://localhost:5000/paymentreturnurl",
    "mobileNumber": "9999999999",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }
  let saltkey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
  let saltindex = 1;
  let bufferobj = Buffer.from(JSON.stringify(normalpayload), "utf-8")
  let base64string = bufferobj.toString("base64")
  let string = base64string + "/pg/v1/pay" + saltkey;
  let sha256val = sha256(string)
  let checksum = sha256val + "###" + saltindex;

  axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
    'request': base64string
  }, {
    'headers': {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'accept': 'application/json'
    }
  }).then(function (response) {

    if (response) {
      resp.redirect(response.data.data.instrumentResponse.redirectInfo.url)
    } else {
      resp.redirect("http://localhost:3000/paymentfailed")
    }
  })
    .catch(function (error) {
      console.error(error);
    });
})


server.all("/paymentreturnurl", (req, resp) => {
  if (req.body.code == 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {
    let url = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT/` + req.body.transactionId
    let saltkey = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
    let saltindex = 1;
    let string = "/pg/v1/status/PGTESTPAYUAT/" + req.body.transactionId + saltkey;
    let sha256val = sha256(string)
    let checksum = sha256val + "###" + saltindex;
    axios.get(url, {
      'headers': {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': req.body.transactionId,
        'accept': 'application/json'
      }
    }).then(function (res) {

      if (res.data.data.responseCode == 'SUCCESS') {
        resp.redirect("http://localhost:3000/orderplaced")

      } else {
        resp.redirect("http://localhost:3000/paymentfailed")
      }

    })
  }
})



server.listen(5000, () => {
  console.log("server started")
})