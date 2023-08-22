const express=require('express')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const login=require('./routes/login')
const register=require('./routes/register')
const users=require('./routes/users')

dotenv.config();

mongoose.connect(process.env.MONGO_URL);
const app=express();
const port=3000;

app.use('/', register);
app.use('/', login);
app.use('/',users);

app.listen(port,()=>{
  console.log(`Server Started on ${port}`);
})
