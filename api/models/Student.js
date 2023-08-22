const mongoose=require('mongoose');

const StudentSchema=new mongoose.Schema({
  username: {
    type: String,
    required:true,
    unique:true
  },
  password: {
    type:String,
    required:true,
    minlength: 6,
  },
  mail:{
    type:String,
    required:true,
    validate:
    {
      validator:function(mail) 
      {
        return /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/.test(mail);
      },
      message: e=>`${e.value} is not a valid email address!`
    }

  }
});

const Student=mongoose.model('Student',StudentSchema);

module.exports=Student;
