import 'dotenv/config'
import express from 'express'
import router from './routers/router.js'

const server = express()

server.use('/', router)

server.listen(process.env.PORT, () => console.log(`Tippler server running on port ${process.env.PORT}`))