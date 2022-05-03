const key = '@HeftLog'

const localstorage = {
    getCurrent: () => {
        return localStorage.getItem(key + 'CurrentUser')
    },
    setCurrent: (username) => {
        localStorage.setItem(key + 'CurrentUser', username)
    },
    delCurrent: () => {
        localStorage.removeItem(key + 'CurrentUser')
    },
    get: (username) => {
        const stringValue = localStorage.getItem(key + 'User_' + username)
        if (!stringValue) return null
        const { data } = JSON.parse(stringValue)
        return { username, data: data.map(({ weight, date }) => ({ weight, date: new Date(date) })) }
    },
    set: (user) => {
        localStorage.setItem(key + 'User_' + user.username, JSON.stringify(user))
    },
    del: (user) => {
        localStorage.removeItem(key + 'User_' + user.username)
    }
}

export default localstorage