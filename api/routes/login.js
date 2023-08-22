const express=require('express');
const router=express.Router();
const Student=require("../models/Student");

router.use(express.urlencoded({extended:true}))

router.post('/login',(req,res)=>{
  const {username,password}=req.body;
  Student.findOne({username:username}).then((data)=>{
    if(!data)
      res.send("Username not found")
    else if(data.password === password)
      res.send("Welcome");
    else
      res.send("Invalid Password")
  })
  
});

module.exports = router;
