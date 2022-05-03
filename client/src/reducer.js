import localstorage from "./localstorage"
import * as api from './api'

export default (state, action) => {
    switch (action.type) {
        case 'SET': {
            throw new Error('deprecated')
            return { ...state, ...action.payload }
        }
        case 'SET_USER': return { ...state, user: action.payload }
        case 'DEL_USER': return remove(state, 'user')
        case 'SET_DATA': return { ...state, data: action.payload }
        case 'DEL_DATA': return remove(state, 'data')
        case 'ADD_ENTRY': {
            const data = state.data.concat(action.payload).sort((a, b) => a.date.valueOf() - b.date.valueOf())
            return { ...state, data }
        }
        case 'SET_MODAL': {
            return action.payload ? { ...state, modal: action.payload } : remove(state, 'modal')
        }
        case 'SET_STORAGE': return { ...state, storage: action.payload }
        case 'TOGGLE_STORAGE': {
            const storage = state.storage === 'local' ? 'cloud' : 'local'
            return { ...state, storage }
        }
        case 'SET_ERROR': {
            return { ...state, error: action.payload }
        }
        case 'CLEAR_ERROR': {
            return remove(state, 'error')
        }
    }
}

const remove = (state, property) => {
    const newState = Object.assign({}, state)
    delete newState[property]
    return newState
}