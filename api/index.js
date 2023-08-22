const express=require('express')
const app=express();
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const User=require("./models/User");
const MessageModel=require("./models/Message");
//const translate = require('google-translate-api-x');
const { translate } = require('bing-translate-api');


const cors=require('cors');
const bcrypt = require('bcryptjs');
const cookieParser=require('cookie-parser')
const ws=require('ws');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
dotenv.config();
app.use(express.static('public'))
app.use(cors({credentials: true, origin: process.env.CLIENT_URL}));
mongoose.connect(process.env.MONGO_URL);

const jwtSecret=process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);


async function getUserData(req){
  return new Promise ((resolve,reject)=>{
    const token=req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    }
    else{
      reject('No Token')
    }
  })
}

app.post('/translate', async (req, res) => {
  const text=req.body.mess;
  console.log(text)
  try {
    translate(text, null, 'en').then(data => {
      console.log(data.translation);
      res.json({ translatedText: data.translation });
    }).catch(err => {
      console.error(err);
    });
  } catch (err) {
    res.status(500).json({ error: 'Translation error' });
  }
});


app.get('/messages/:userId',async (req,res)=>{
  const {userId}=req.params;
  const userData=await getUserData(req);
  const ourId=userData.userId;

  const messages=await MessageModel.find({
    sender:{$in:[userId,ourId]},
    recipent:{$in:[userId,ourId]},
  }).sort({createdAt:1});
  res.json(messages)

});

app.get("/people",async(req,res)=>{
  const users=await User.find({},{'_id':1,username:1});
  res.json(users);
})

app.post('/register', async (req,res) => {
  const {username,password}=req.body;
  try {
    const hashedPassword=bcrypt.hashSync(password,bcryptSalt);
    const createdUser=await User.create({
      username:username,
      password:hashedPassword,
    });
    jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) =>{
      if (err) throw err;
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    });
  } catch(err) {
    if (err) throw err;
    res.status(500).json('error');
  }
});

app.post('/login', async(req,res)=>{
  const {username,password}=req.body;
  const found=await User.findOne({username});
  if(found){
    const check=bcrypt.compareSync(password,found.password);
    if(check)
    {
      jwt.sign({userId:found._id,username},jwtSecret,{},(err,token)=>{
        res.cookie('token',token,{sameSite:'none', secure:true}).status(201).json({
          id:found._id,
        });
      });
    }
  }
})

app.post('/logout',(req,res)=>{
  res.cookie('token','',{sameSite:'none', secure:true}).json('ok');
  
})

app.get('/profile', (req,res) => {
  const token=req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
});

let server=null;
if(process.env.API_PORT)
{
   server=app.listen(process.env.API_PORT);
}

module.exports=app;

const wss=new ws.WebSocketServer({server});
wss.on('connection',(connection,req)=>{

  function notifyMe(){
    [...wss.clients].forEach(client=>{
      client.send(JSON.stringify({
        online: [...wss.clients].map(c=>({userId:c.userId,username:c.username}))
      }));
    })
  }


  connection.isAlive=true;

  connection.timer=setInterval(()=>{
    connection.ping();
    connection.deathTimer=setTimeout(()=>{
      connection.isAlive=false;
      clearInterval(connection.timer)
      connection.terminate();
      notifyMe();
    },1000)
  },5000)

  connection.on('pong',()=>{
    clearTimeout(connection.deathTimer);
  })

  const cookies=req.headers.cookie;
  if(cookies)
  {
   const tokenCookieString=cookies.split(';').find(str=>str.startsWith('token='));
   if(tokenCookieString){
    const token=tokenCookieString.split('=')[1];
    if(token)
    {
      jwt.verify(token,jwtSecret,{},(err,userData)=>{
        if(err)
          throw err;
        const {userId,username}=userData;
        connection.userId=userId;
        connection.username=username;
      })
    }
   }
  }

  connection.on('message',async (message)=>{
    const messageData=JSON.parse( message.toString())
    const {recipent,text}=messageData;
    if(recipent && text)
    {
      const messageDoc=await MessageModel.create({
        sender:connection.userId,
        recipent,
        text,
      });
      [...wss.clients]
      .filter(c=>c.userId===recipent)
      .forEach(c=>c.send(JSON.stringify({
        text,
        sender:connection.userId,
        recipent,
        _id:messageDoc._id,
      })));

    }
  });

  notifyMe();
  
});

