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
import { init } from './utils/encryptCred'
import { CredRouter } from './routes/credential'
import dotenv from 'dotenv'
import NodeRouter from './routes/getNodes'

const app=express()
app.use(cors({origin:'*'}))
app.use(express.json())
dotenv.config()
init()
app.use('/api/v1/user',UserRouter)
app.use('/api/v1/workflow',WorkFlowRouter)
app.use('/api/v1/webhook',WebhookRouter)
app.use('/api/v1/credential',CredRouter)
app.use('/api/v1/Nodes',NodeRouter)

app.listen(3000,()=>console.log('server started'))