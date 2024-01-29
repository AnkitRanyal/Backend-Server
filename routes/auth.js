const passport = require("passport")
const express = require("express")
const { createUser, loginUser, checkAuth, resetPasswordRequest, resetPassword,ForgetPassword,Confirmotp, loginOutUser, resendOTP } = require("../controller/auth")
const authrouter = express.Router()


authrouter.post('/signup', createUser)
.post('/login', passport.authenticate('local'), loginUser)
.post('/check',passport.authenticate('jwt'), checkAuth)
.get('/logout', loginOutUser)
.post("/forgetpassword",ForgetPassword)
.post("/resendotp",resendOTP)
.post("/confirmotp",Confirmotp)
.post('/reset-password-request', resetPasswordRequest)
.post('/resetpassword',resetPassword)

exports.authrouter = authrouter