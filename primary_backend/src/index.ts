//post/signup
//signin
//post/workflow
//get
//get/workflow/:id
//put/workflow/:id

//post/credentials
//delete/credential
//*webhook/handle:/id
import express from 'express'
import { UserRouter } from './routes/user'
import { WorkFlowRouter } from './routes/workflow'
import { WebhookRouter } from './routes/Webhook'
import cors from 'cors'
const app=express()
app.use(cors())
app.use(express.json())
app.use('api/v1/user',UserRouter)
app.use('/api/v1/workflow',WorkFlowRouter)
app.use('/api/v1/webhook',WebhookRouter)
app.listen(3000,()=>console.log('server started'))