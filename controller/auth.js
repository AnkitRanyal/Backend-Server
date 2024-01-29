const {User} = require("../model/User")
const passport = require("passport")
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");
const { sendMail,main } = require("../services/common");
const jwt = require("jsonwebtoken")


exports.createUser = async(req,resp)=>{
  const userexists = await User.findOne({email:req.body.email});
  if(userexists){
    resp.json({message:"User already Exists"})
  }else{
  try {
    const salt =  crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password,salt,310000,32,"sha256",async(err,hashedPassword)=>{
    if(err) throw err
    const user = new User({...req.body,password:hashedPassword,salt});
    const doc = await user.save()
    req.login(sanitizeUser(doc),(err)=>{
      if(err){
        resp.status(400).json(err)
      }else{
        const token = jwt.sign(sanitizeUser(doc),"keyboard cat");
        resp.cookie("jwt",token,{expires:new Date(Date.now()+3600000),httpOnly:true}).status(200).json(doc)
        //resp.status(201).json(doc)
      }

    })
    
  })
  } catch (error) {
    resp.status(400).json(error)
  }
}
}

exports.loginUser = async(req,res)=>{
  const user = req.user
  if(user.token){
    await res.cookie('jwt',user.token,{httpOnly:true}).status(200).json({ id: user.id, role: user.role,token:user.token,login:true })
  }else{
    await res.cookie('jwt',null).status(400).json({login:false })
  }
    
    
}

exports.checkAuth = async(req,resp)=>{
  const id = req.user.id
  if (id) {
    resp.json(req.user);
  } else {
    resp.sendStatus(401)
  }
    
}


exports.loginOutUser = async(req,resp)=>{
try {
    req.logout(()=>{
        resp.cookie("jwt",null,{expires:new Date(Date.now()),httpOnly:true});
        resp.status(200).send({logout:true})
    })   
} catch (error) {
    resp.status(400).send({logout:false})
}
}


exports.ForgetPassword =async (req,resp)=>{
  const  user =await User.findOne({email:req.body.email})
 try {
  if(user !== null  && user.email == req.body.email){
    const otp = Math.floor(Math.random() *10000).toString()
  user.OTP = otp
  await user.save()
  const userr = user
 const firstName = userr.name
 const email = userr.email
 const subject = "Confirm your OTP";
const html=`<p>Please Confirm your OTP ${otp} to Verify </p>`;
  main(firstName,email,otp,{subject,html})
  resp.status(200).json(otp)
 }else{
    resp.json({login:false})
 
 }
 } catch (error) {
  resp.status(400).json(error)
 }
}

exports.resendOTP = async(req,resp)=>{
  const  user =await User.findOne({email:req.body.email})
  console.log(user)
  try {
   if(user !== null  && user.email == req.body.email){
     const otp = Math.floor(Math.random() *10000).toString()
   user.OTP = otp
   await user.save()
   const userr = user
  const firstName = userr.name
  const email = userr.email
  const subject = "Confirm your OTP";
 const html=`<p>Please Confirm your OTP ${otp} to Verify </p>`;
   main(firstName,email,otp,{subject,html})
   resp.status(200).json(otp)
  }else{
     resp.json({login:false})
  
  }
  } catch (error) {
   resp.status(400).json(error)
  }
}

exports.Confirmotp =async(req,resp)=>{
  const  user =await User.findOne({email:req.body.email})
const otp = req.body.OTP
const userotp = user.OTP
if(otp == userotp){
  resp.json({verified:true})
}else{
  resp.json({Notverified:true})
}
}





exports.resetPasswordRequest = async(req,resp)=>{
   try {
    const user = await User.findOne({email:req.body.email});
   if(user !== null  && user.email == req.body.email){
   const token =  crypto.randomBytes(16).toString("hex");
   user.resetPasswordToken = token
     await user.save()
     const email = req.body.email
     const resetPageLink = `http://localhost:5000/resetpassword?token=${token}&email:${email}`;
     const subject = "Reset your password";
     const html=`<p>Click <a href='${resetPageLink}'>here</a> to Reset Password</p>`;
     if (email) {
        const response = await sendMail({ to: email, subject, html });
        resp.json(response);
      } else {
        resp.sendStatus(400);
      }
   }else{
    resp.status(401).json({message:"Invalid Credentials"})
   }
   } catch (error) {
    resp.status(400).send(error);
   }
}


exports.resetPassword = async(req,resp)=>{
  const {email} = req.body;
  const user = await User.findOne({email:email});
   try {
    if(user !== null  && user.email == req.body.email){
      const salt =  crypto.randomBytes(16);
      crypto.pbkdf2(req.body.newpassword,salt,310000,32,"sha256",async(err,hashedPassword)=>{
        if(err) throw err
        user.password =  hashedPassword
        user.salt = salt
        await user.save()
        const subject = 'password successfully reset for e-commerce';
        const html = `<p>Successfully able to Reset Password</p>`;
        if (user.email) {
          const response = await sendMail({ to: email, subject, html });
          resp.status(200).json(response);
        } else if(!user.email){
          const msg = {message :"invalid credentials"}
          resp.status(400).send(msg);
        }
      })}else{
        const msg = {message :"invalid credentials"}
        resp.json(msg);
      }
    } catch (error) {
      const msg = {message :"invalid credentials"}
     resp.status(400).json(msg)
   }
}