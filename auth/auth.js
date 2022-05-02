import fs from 'fs'
import jsonwebtoken from 'jsonwebtoken'

export const generateToken = (payload) => {
    const PRIVATE_KEY = fs.readFileSync('./auth/keys/ecdsa-p521-private.pem', 'utf8')
    return jsonwebtoken.sign(payload, PRIVATE_KEY, { algorithm: 'PS512' })
}

export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.status(401).send('Missing Bearer Token')

    const PUBLIC_KEY = fs.readFileSync('./auth/keys/ecdsa-p521-public.pem', 'utf8')
    jsonwebtoken.verify(token, PUBLIC_KEY, { algorithm: 'PS512' }, (error, user) => {
        if (error) return res.status(403).send('Invalid token')
        req.user = user
        next()
    })
}