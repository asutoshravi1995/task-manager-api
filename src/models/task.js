const mongoose =require('mongoose')
const taskScema=require('./taskSchema')

const Task=new mongoose.model('Task',taskScema )

module.exports=Task