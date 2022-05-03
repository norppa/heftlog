
import { useState, useContext } from 'react'

import './Access.css'
import { Context } from './Store'
import { login, register } from './actions'

const Access = () => {
    const [state, dispatch] = useContext(Context)
    const [registerMode, setRegisterMode] = useState(false)
    const [username, _setUsername] = useState('')
    const [password, _setPassword] = useState('')

    const setUsername = (event) => {
        dispatch({ type: 'CLEAR_ERROR' })
        _setUsername(event.target.value)
    }
    const setPassword = (event) => {
        dispatch({ type: 'CLEAR_ERROR' })
        _setPassword(event.target.value)
    }

    const toggleStorage = () => {
        dispatch({ type: 'CLEAR_ERROR' })
        dispatch({ type: 'TOGGLE_STORAGE' })
    }

    const toggleRegisterMode = () => {
        dispatch({ type: 'CLEAR_ERROR' })
        setRegisterMode(!registerMode)
    }

    const submitOnEnter = (event) => {
        if (event.key === 'Enter') {
            submit()
        }
    }

    const submit = async () => {
        registerMode
            ? await register(username, password, dispatch)
            : await login(username, password, state.storage === 'local', dispatch)
            console.log('login done')
    }

    return (
        <div className='Access'>
            <div className='storageSelectionContainer'>
                <button className={state.storage === 'local' ? 'storageSelection selected' : 'storageSelection'}
                    onClick={toggleStorage}>Use Local Storage</button>
                <button className={state.storage === 'cloud' ? 'storageSelection selected' : 'storageSelection'}
                    onClick={toggleStorage}>Use Cloud Storage</button>
            </div>

            {state.storage === 'local'
                ? <>
                    <h2>Select user</h2>
                    <input type='text' value={username} onChange={setUsername} onKeyDown={submitOnEnter} placeholder='Username' />
                    <div className='error'>{state.error}</div>
                    <div className='separator'></div>
                    <p>
                        When using a local storage all the data will be stored on your computer. No password is required. Take notice that
                        should your computer's local data be deleted, which happens for example if you clear your browser history, all your
                        data will be lost.
                    </p>
                </>
                : <>
                    <h2>{registerMode ? 'Register' : 'Log in'}</h2>
                    <input type='text' value={username} onChange={setUsername} placeholder='Username' />
                    <input type='text' value={password} onChange={setPassword} onKeyDown={submitOnEnter} placeholder='Password' />

                    <div className='error'>{state.error}</div>
                    <div className='separator'></div>


                    {registerMode
                        ? <span>Already have an account? <a onClick={toggleRegisterMode}>Log in</a></span>
                        : <span>Don't have an account? <a onClick={toggleRegisterMode}>Register</a></span>
                    }

                    <div className='separator'></div>
                    <p>
                        When using a cloud storage your weight data will be stored on a server. You will need to provide a unique username and
                        a password. In addition to the credentials only the weights and dates will be stored to the server, no other
                        information is collected. Some information will still be stored locally, like the settings you are using, but should
                        your browser data be lost, the collected weight data will still be stored on the server.
                    </p>
                </>}

        </div>
    )
}


export default Access