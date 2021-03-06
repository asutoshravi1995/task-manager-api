const express=require('express')
const router=new express.Router()
const auth=require('../middleware/auth')
const Task=require('../models/task')


router.get('/tasks',auth,async(req,res)=>{
    const match={}
    const sort={}
    let limit,skip
    if(req.query.limit) limit=parseInt(req.query.limit)
    if(req.query.skip) skip=parseInt(req.query.skip)
    if (req.query.completed) {
        match.completed= req.query.completed==='true'
    }

    if(req.query.sortBy){
        const parts=req.query.sortBy.split(":")
        sort[parts[0]]= parts[1]==='desc' ? -1 : 1
    }

    try {
        await req.user.populate({
        
            path:'tasks',
            match,
            options:{
                limit,
                skip,
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send({error:error.message})
    }


})
//Finding a task based on task id
// router.get('/tasks/:id',auth,async(req,res)=>{
//     let _id=req.params.id
//     try {
//         const task=await Task.findOne({_id, owner:req.user._id})
//         if(!task){
//             return res.status(400).send("No tasks found")
//         }
//         res.send(task)
//     } catch (error) {
//         res.status(500).send({error:error.message})
//     }
// })

//Creating a task in Database
router.post('/tasks',auth,async(req,res)=>{
    let task=new Task({
        ...req.body,
        owner:req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send({error:error.message})
    }
    
})

router.patch('/tasks/:id',auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const taskKeys=['description','completed']
    //checking if requested updates are valid or not ..check for users for details
    const check=updates.every((update)=> taskKeys.includes(update))
    
    if(!check) return res.status(400).send({error:"Invalid Updates!"})
    try {
        const task=await Task.findOne({_id:req.params.id, owner:req.user._id})
        if(!task) return res.status(404).send()

        updates.forEach((update)=> task[update]=req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send({error:error.message})
    }   
})

router.delete('/tasks/:id',auth ,async(req,res)=>{
    const task=await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
    if(!task) return res.status(404).send({error:"Wrong User ID!"})
    res.send(task)
})

module.exports=router