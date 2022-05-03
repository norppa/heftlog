import express from 'express'
import crypto from 'crypto'
import Database from 'better-sqlite3'

import { generateToken, authenticate } from '../auth/auth.js'

const router = express.Router()
const db = new Database('./db/heftlog.db')

const iterations = 10000
const keylen = 64
const digest = 'sha512'

router.use(express.json())

router.post('/register', (req, res) => {
    console.log('/register', req.body)
    const { username, password } = req.body
    if (!username) return res.status(400).send('MISSING_USERNAME')
    if (!password) return res.status(400).send('MISSING_PASSWORD')
    if (password.length < 1) return res.status(400).send('SHORT_PASSWORD')

    const existingUser = db.prepare('SELECT id FROM users WHERE username=?').get(username)
    if (existingUser) return res.status(400).send('TAKEN_USERNAME')

    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString('hex')

    const result = db.prepare('INSERT INTO users (username, salt, hash) VALUES (?,?,?)')
        .run(username, salt, hash)
    const id = result.lastInsertRowid
    if (result.changes !== 1) return res.status(500).send('DATABASE_ERROR')
    const token = generateToken({ id })
    res.send({ username, token })
})

router.post('/login', (req, res) => {
    console.log('/login', req.body)
    const { username, password } = req.body
    if (!username) return res.status(400).send('MISSING_USERNAME')
    if (!password) return res.status(400).send('MISSING_PASSWORD')

    const user = db.prepare('SELECT * FROM users WHERE username=?').get(username)
    if (!user) return res.status(401).send('INVALID_USERNAME_OR_PASSWORD')

    const passwordMatchesHash = crypto.pbkdf2Sync(password, user.salt, iterations, keylen, digest).toString('hex') === user.hash
    if (!passwordMatchesHash) return res.status(401).send('INVALID_USERNAME_OR_PASSWORD')


    const token = generateToken({ id: user.id })
    res.send({ username, token })
})

router.delete('/', authenticate, (req, res) => {
    const result = db.prepare('DELETE FROM users WHERE id=?').run(req.user.id)
    if (result.changes !== 1) return res.status(500).send('Database error')
    res.send()
})

export default router