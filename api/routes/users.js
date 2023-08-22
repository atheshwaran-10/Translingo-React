const express=require('express');
const router=express.Router();
const Student=require("../models/Student");

router.get('/seeAll',async (req,res)=>{
 const users=await Student.find();
 res.json(users)
});

module.exports=router;
