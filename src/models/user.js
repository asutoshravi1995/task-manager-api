const mongoose =require('mongoose')
const bcrypt=require('bcryptjs') // Used for hasing the password
const jwt=require('jsonwebtoken')
const Task=require('./task')

const userSchema=require('./userSchema')

//this function is called everytime json.stringfy is called and in backend express automattically call it Ref-103
userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()// creating a new object and making changes to it and then sending
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
//Defining relationship bet user and task
userSchema.virtual('tasks', {
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.generateAuthTokens=async function(){
try {
    const user=this
    const token = jwt.sign({ _id :user._id.toString() }, process.env.JWT_KEY)
    user.tokens=user.tokens.concat({token:token})
    await user.save()
    return token
} catch (error) {
    throw error
}
}   

userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error("Unable to Login")
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Unable to Login")
    }
    return user
}


userSchema.pre('save', async function (next){
    const user=this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove', async function(next){
    const user=this
    await Task.deleteMany({owner: user._id})
    next()
})

const User=new mongoose.model('User',userSchema)

module.exports=User