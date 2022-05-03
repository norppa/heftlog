const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : ''

export const login = async (username, password) => {
    console.log('login', username, password)
    const url = baseUrl + '/user/login'
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }
    const response = await fetch(url, request)
    if (response.status !== 200) return { error: response }
    return await response.json()
}

export const register = async (username, password) => {

    console.log('register', username, password)
    const url = baseUrl + '/user/register'
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }
    const response = await fetch(url, request)
    if (response.status !== 200) return { error: response }
    return await response.json()
}