const validator=require('validator')
const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        trim:true,
        validate(value){
            if(value<0){
                throw new Error("Age can't be Negative")
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error(" Invalid Email ")
            }
        }

    },
    password:{
        type:String,
        trim:true,
        required:true,
        validate(value){
            if(value.length<6){
                throw new Error("Weak Password ! Kindly Provide more tha  6 letters")
            }
            else if (value.toLocaleLowerCase().includes("password")){
                throw new Error("Password Cant contain word 'password' ")
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer
    }
},
{
    timestamps:true
}
)

module.exports=userSchema