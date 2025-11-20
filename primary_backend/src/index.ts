
//get
//get/workflow/:id
import express from 'express'
import { UserRouter } from './routes/user'
import { WorkFlowRouter } from './routes/workflow'
import { WebhookRouter } from './routes/Webhook'
import cors from 'cors'
import { init } from './utils/encryptCred'
import { CredRouter } from './routes/credential'
import dotenv from 'dotenv'
import NodeRouter from './routes/Nodes'
import { credLimiter, nodeExecLimiter, userLimiter, webhookLimiter, workflowLimiter } from './middleware/rateLimiter'

const app=express()
app.use(cors({origin:'*'}))
app.use(express.json())
dotenv.config()
init()
app.use('/api/v1/user',userLimiter,UserRouter)
app.use('/api/v1/workflow',workflowLimiter,WorkFlowRouter)
app.use('/api/v1/webhook',webhookLimiter,WebhookRouter)
app.use('/api/v1/credential',credLimiter,CredRouter)
app.use('/api/v1/Nodes',nodeExecLimiter,NodeRouter)

app.listen(3000,()=>console.log('server started'))