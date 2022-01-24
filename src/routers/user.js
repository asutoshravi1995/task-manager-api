const express=require('express')
const router=new express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendGoodbyeEmail}=require('../emails/account')



//get all user's profile from DB
router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user)
})

router.post('/users/login',async(req,res)=>{
    try {
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token=await user.generateAuthTokens()
        if(!user){
            res.status(404).send({error:"Login Failed , Please check username and password"})
        }
        res.send({ user, token })
    } catch (error) {
        res.status(500).send({error:error.message})
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try {
        req.user.tokens=req.user.tokens.filter((token)=>{
            return req.token !==token.token
        })
        await req.user.save()
        res.send("Logout Successful")
    } catch (error) {
        res.status(500).send({error:error.message})
    }
})

router.post('/users/logoutAll',auth,async(req,res)=>{
    try {
        req.user.tokens=[]
        await req.user.save()
        res.send("Logout from all devices Successful")
    } catch (error) {
        res.status(500).send({error:error.message})
    }
})



//Creating a user in Database
router.post('/users',async(req,res)=>{
    try {
    let user=new User(req.body)
    const token=await user.generateAuthTokens()
    
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send({error:error.message})
    }
})

//Update a user detail in database

router.patch('/users/me',auth,async(req,res)=>{
    let updates=Object.keys(req.body)
    let userKeys=['name','age','email','password'] // all fields of user that can be updated

    //checking if all the requested updates are available in users schema
    //I am doing this because if a key needs to be updated but not present in users schema than mongoose will ignore it
    //and we wont get any error, hence checking before performing any update operation
    let check=updates.every((requestKeys)=> userKeys.includes(requestKeys))
    if(!check) return res.status(404).send({error:"Invalid Updates!"})
    try {     
        updates.forEach((update)=> {
            req.user[update]=req.body[update]
        } )
        await req.user.save()                                                         
        res.send(req.user)
    } catch (error) {
        res.status(500).send({error:error.message})
    }
})

router.delete('/users/me',auth,async(req,res)=>{
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send({error:error.message})
    }
})

const upload=multer({
    //dest:'avatar', // used to store avatar locally
    limits:{
        fileSize:1000000 // its good idea to fix max size of file upload
    },
    fileFilter(req,file,cb){//for filtering type of files can be uploaded, cb- callback
        //console.log("Value "+file.originalname);
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an Image"))
        }
        cb(undefined,true)
    }
})

//Adding User Profile pic
router.post('/users/me/avatar',auth ,upload.single('avatar'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    
    req.user.avatar=buffer
    await req.user.save() 
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

//Deleting User Profile Pic
router.delete('/users/me/avatar',auth ,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save() 
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user=await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send({error:error.message})
    }
})

module.exports=router