const mongoose=require('mongoose');
const MessageScheme=new mongoose.Schema({
  sender:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  recipent:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  text:String,
  file: String,
},{timeStamps:true});

const MessageModel=mongoose.model('Message',MessageScheme);

module.exports=MessageModel;