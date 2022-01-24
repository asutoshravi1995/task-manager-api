const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'task.manager.ravi@gmail.com',
        subject:"Welcome to Task Manger",
        text:`Welcome to the app, ${name}.\nLet me know how you get along with the app`,
        //html:  ..... this can be used to send a styled  mail

    })  
}

const sendGoodbyeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'task.manager.ravi@gmail.com',
        subject:"Good Bye !",
        text:`Thanks for using Task Manager, ${name}.\nPlease share the experiance and let us know how we could be more usefull`,
        //html:  ..... this can be used to send a styled  mail

    })  
}


module.exports={
    sendWelcomeEmail,
    sendGoodbyeEmail
}

