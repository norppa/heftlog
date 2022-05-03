import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

import userRouter from './routers/userRouter.js'
import { authenticate } from './auth/auth.js'

const db = new Database('./db/heftlog.db')
const server = express()

server.use(cors())
server.use(express.json())

server.use('/', express.static('./client/dist'))

server.use('/api/user', userRouter)

server.get('/api', authenticate, (req, res) => {
    const result = db.prepare('SELECT * FROM data WHERE owner=?').all(req.user.id)
    res.send(result)
})

server.post('/api', authenticate, (req, res) => {
    const result = insert(req.body.date, req.body.weight, req.user.id)
    res.send()
})

server.put('/api', authenticate, (req, res) => {
    const result = db.prepare('UPDATE data SET weight=? WHERE id=? AND owner=?')
        .run(req.body.weight, req.body.id, req.user.id)
    res.send()
})

server.delete('/api', authenticate, (req, res) => {
    const result = db.prepare('DELETE FROM data WHERE id=? AND owner=?').run(req.body.id, req.user.id)
    res.send()
})

server.post('/api/import', authenticate, (req, res) => {
    const transaction = db.transaction(() => {
        db.prepare('DELETE FROM data WHERE owner=?').run(req.user.id)
        req.body.forEach(({ date, weight }) => insert(date, weight, req.user.id))
    })

    try {
        transaction()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

const insert = (date, weight, userId) => db
    .prepare('INSERT INTO data (date, weight, owner) VALUES (?,?,?)')
    .run(date, weight, userId)

server.listen(process.env.PORT, () => console.log(`Tippler server running on port ${process.env.PORT}`))