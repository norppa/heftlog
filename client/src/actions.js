import { useContext } from 'react'
import { Context } from './Store'

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : 'api'

export const initialize = async (dispatch) => {
    const user = JSON.parse(localStorage.getItem('@HeftLogCurrentUser'))

    if (user?.token) {
        const data = await getCloudData(user)
        dispatch({ type: 'SET_USER', payload: user })
        dispatch({ type: 'SET_DATA', payload: data })
        dispatch({ type: 'SET_STORAGE', payload: 'cloud' })
    }

    if (user?.id) {
        const data = getLocalData(user)
        dispatch({ type: 'SET_USER', payload: user })
        dispatch({ type: 'SET_DATA', payload: data })
        dispatch({ type: 'SET_STORAGE', payload: 'local' })
    }
}

export const login = async (username, password, isLocal, dispatch) => {
    const { user, data, error } = isLocal ? localLogin(username) : await cloudLogin(username, password)
    if (error) return dispatch({ type: 'SET_ERROR', payload: error })

    localStorage.setItem('@HeftLogCurrentUser', JSON.stringify(user))

    dispatch({ type: 'SET_USER', payload: user })
    dispatch({ type: 'SET_DATA', payload: data })
}

const localLogin = (username) => {
    let user, data
    const users = JSON.parse(localStorage.getItem('@HeftLogUsers')) ?? []
    user = users.find(u => u.username === username)
    if (user) {
        data = getLocalData(user)
    } else {
        // create user
        const largestUserId = users.reduce((acc, cur) => cur.id > acc ? cur.id : acc, 0)
        const id = Number(largestUserId) + 1
        user = { id, username }
        localStorage.setItem('@HeftLogUsers', JSON.stringify(users.concat(user)))
        data = []
        localStorage.setItem('@HeftLogUser' + id, JSON.stringify(data))
    }
    localStorage.setItem('@HeftLogCurrentUser', JSON.stringify(user))
    return { user, data }
}

const getLocalData = (user) => {
    const data = JSON.parse(localStorage.getItem('@HeftLogUser' + user.id))
        .map(entry => ({ weight: Number(entry.weight), date: new Date(entry.date) }))
    return data
}

const cloudLogin = async (username, password) => {
    const user = await getCloudUser(username, password)
    if (user.error) return user

    const data = await getCloudData(user)
    return { user, data }
}

const getCloudUser = async (username, password) => {
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
    if (response.status === 401) return { error: 'Incorrect username or password' }
    if (response.status !== 200) return { error: 'Server error. Please try again later.' }
    const user = await response.json()
    return user
}

const getCloudData = async (user) => {
    const url = baseUrl
    const request = {
        method: 'GET',
        headers: {
            'Authorization': 'Token ' + user.token
        }
    }
    const response = await fetch(url, request)
    const data = (await response.json())
        .map(entry => ({ id: entry.id, weight: Number(entry.weight), date: new Date(entry.date) }))

    return data
}

export const register = async (username, password, dispatch) => {
    const request = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ username, password })
    }
    const response = await fetch(baseUrl + '/user/register', request)
    if (response.status === 400) return dispatch({ type: 'SET_ERROR', payload: 'Username already taken' })
    if (response.status !== 200) return dispatch({ type: 'SET_ERROR', payload: 'Server error. Please try again later.' })

    const user = await response.json()
    localStorage.setItem('@HeftLogCurrentUser', JSON.stringify(user))
    dispatch({ type: 'SET_USER', payload: user })
    dispatch({ type: 'SET_DATA', payload: [] })
}

export const logout = (dispatch) => {
    localStorage.removeItem('@HeftLogCurrentUser')
    dispatch({ type: 'DEL_USER' })
    dispatch({ type: 'DEL_DATA' })
}

export const expunge = async (user, isLocal, dispatch) => {
    const success = isLocal ? localExpunge(user) : await cloudExpunge(user)
    if (!success) return console.error('expunge error')
    dispatch({ type: 'DEL_USER' })
    dispatch({ type: 'DEL_DATA' })
}

const localExpunge = (user) => {
    const users = JSON.parse(localStorage.getItem('@HeftLogUsers')) ?? []
    const newUsers = users.filter(({ id }) => id !== user.id)
    newUsers.length > 0
        ? localStorage.setItem('@HeftLogUsers', JSON.stringify(newUsers))
        : localStorage.removeItem('@HeftLogUsers')
    localStorage.removeItem('@HeftLogUser' + user.id)
    localStorage.removeItem('@HeftLogCurrentUser')
    return true
}

const cloudExpunge = async (user) => {
    const url = baseUrl + '/user'
    const request = {
        method: 'DELETE',
        headers: {
            'Authorization': 'Token ' + user.token
        }
    }
    const response = await fetch(url, request)
    return response.status === 200
}

export const setEntry = async (entry, state, dispatch) => {
    if (state.storage === 'local') {
        const data = state.data.map(x => areEqual(x.date, entry.date) ? entry : x)
        localStorage.setItem('@HeftLogUser' + state.user.id, JSON.stringify(data))
        dispatch({ type: 'SET_DATA', payload: data })
    }

    if (state.storage === 'cloud') {
        const existingEntryId = state.data.find(({ date }) => areEqual(entry.date, date))?.id
        if (!existingEntryId) throw new Error('Using setEnry but existing entry is missing')
        const newEntry = { ...entry, id: existingEntryId }
        const data = state.data.map(entry => areEqual(entry.date, newEntry.date) ? newEntry : entry)

        const request = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + state.user.token
            },
            body: JSON.stringify(newEntry)
        }

        const response = await fetch(baseUrl, request)
        if (response.status !== 200) return dispatch({ type: 'SET_ERROR', payload: 'Database error' })
        dispatch({ type: 'SET_DATA', payload: data })
    }

    
}

export const addEntry = async (entry, state, dispatch) => {
    if (state.storage === 'local') {
        const data = state.data.concat(entry)
        localStorage.setItem('@HeftLogUser' + state.user.id, JSON.stringify(data))
        dispatch({ type: 'SET_DATA', payload: data })
    }

    if (state.storage === 'cloud') {
        const url = baseUrl
        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + state.user.token
            },
            body: JSON.stringify(entry)
        }
        const response = await fetch(url, request)
        if (response.status !== 200) return dispatch({ type: 'SET_ERROR', payload: 'Database error' })
        dispatch({ type: 'ADD_ENTRY', payload: entry })
    }
}

export const delEntry = async (entry, state, dispatch) => {
    if (state.storage === 'local') {
        const data = state.data.filter(({ date }) => !areEqual(date, entry.date))
        localStorage.setItem('@HeftLogUser' + state.user.id, JSON.stringify(data))
        dispatch({ type: 'SET_DATA', payload: data })
    }

    if (state.storage === 'cloud') {
        const request = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + state.user.token
            },
            body: JSON.stringify(entry)
        }

        const response = await fetch(baseUrl, request)
        if (response.status !== 200) return dispatch({ type: 'SET_ERROR', payload: 'Database error' })
        const data = state.data.filter(({id}) => id !== entry.id)
        dispatch({ type: 'SET_DATA', payload: data })
    }
}

const areEqual = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate()
}