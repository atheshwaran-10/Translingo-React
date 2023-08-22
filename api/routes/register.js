const express=require('express');
const router=express.Router();
const Student=require("../models/Student");

router.use(express.urlencoded({extended:true}))

router.post('/register',async (req,res)=>{
  const {username,password,mail}=req.body;
  await Student.create({
    username:username,
    password:password,
    mail:mail,
  });
  res.send("User created")
});

module.exports=router;
