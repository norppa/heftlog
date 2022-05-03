import React, { useContext, useEffect, useState } from 'react'
import Calendar from 'react-calendar'

import { FaUserAstronaut } from 'react-icons/fa'
import { RiLogoutCircleRLine } from 'react-icons/ri'
import { AiFillDelete, AiOutlineSend } from 'react-icons/ai'
import { CgCalendar } from 'react-icons/cg'

import Modal from './Modal'
import Access from './Access'
import ChartPanel from './ChartPanel'
import StatsPanel from './StatsPanel'
import PortPanel from './PortPanel'
import { Context } from './Store'
import { initialize, logout, expunge, addEntry, setEntry, delEntry } from './actions'

import logo from './img/logo.png'

import 'react-calendar/dist/Calendar.css'
import './HeftLog.css'

const isNumber = (n) => !Number.isNaN(Number(n.replace(',', '.')))

const HeftLog = () => {

    const [state, dispatch] = useContext(Context)

    const [calendar, _setCalendar] = useState(today())
    const [showCalendar, setShowCalendar] = useState(false)
    const [weight, setWeight] = useState('')

    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        initialize(dispatch)
    }, [])

    const reset = () => {
        setMenuOpen(false)
        setWeight('')
        setCalendar(new Date())
        setShowCalendar(false)
        dispatch({ type: 'SET_MODAL' })
    }

    const onUserLogoutClick = () => {
        const modal = {
            heading: 'Confirm logout',
            text: `Are you sure you want to log out user ${state.user.username}?`,
            confirmText: 'Logout',
            onCancel: () => dispatch({ type: 'SET_MODAL' }),
            onConfirm: () => {
                logout(dispatch)
                reset()
            },
        }
        dispatch({ type: 'SET_MODAL', payload: modal })
        setMenuOpen(false)
    }

    const onUserDeleteClick = () => {
        const modal = {
            heading: 'Confirm deletion',
            text: `Are you sure you want to permanently delete user ${state.user.username} and all associated data? This action can not be undone.`,
            confirmText: 'Delete User',
            cancelText: 'Cancel',
            onCancel: () => dispatch({ type: 'SET_MODAL' }),
            onConfirm: () => {
                expunge(state.user, state.storage === 'local', dispatch)
                reset()
            },
        }
        dispatch({ type: 'SET_MODAL', payload: modal })
        setMenuOpen(false)
    }

    const setCalendar = (value) => {
        setShowCalendar(false)
        _setCalendar(value)
    }

    const onWeightChange = (event) => {
        if (isNumber(event.target.value)) setWeight(event.target.value)
    }

    const onWeightKeyDown = (event) => {
        if (event.key === 'Enter') submit()
    }

    const submit = () => {
        const existingEntry = state.data.find(entry => areEqual(entry.date, calendar))
        if (!existingEntry) {
            addEntry({ date: calendar, weight: Number(weight) }, state, dispatch)
        } else {
            const modal = weight
                ? {
                    heading: 'Confirm replace',
                    text: `You already have an entry on ${formatDate(calendar)} (${existingEntry.weight} kg). Are you sure you want to replace it with a new value (${weight} kg)?`,
                    confirmText: 'Overwrite',
                    onCancel: () => dispatch({ type: 'SET_MODAL' }),
                    onConfirm: () => {
                        setEntry({ date: calendar, weight: Number(weight) }, state, dispatch)
                        dispatch({ type: 'SET_MODAL' })
                    }
                }
                : {
                    heading: 'Confirm deletion',
                    text: `Are you sure you want to remove the entry from ${formatDate(calendar)} (${existingEntry.weight} kg)?`,
                    confirmText: `Remove`,
                    onCancel: () => dispatch({ type: 'SET_MODAL' }),
                    onConfirm: () => {
                        delEntry(existingEntry, state, dispatch)
                        dispatch({ type: 'SET_MODAL' })
                    }
                }
            dispatch({ type: 'SET_MODAL', payload: modal })
        }

    }

    if (!state.user) return <Access />

    return (
        <div className='HeftLog'>
            <header>
                <div className='left'>
                    <img id='logo' src={logo} />
                    <h1>HeftLog</h1>
                </div>

                <div className='right'>
                    {menuOpen && <div className='headerBtn' onClick={onUserDeleteClick}><AiFillDelete /></div>}
                    {menuOpen && <div className='headerBtn' onClick={onUserLogoutClick}><RiLogoutCircleRLine /></div>}
                    <div className={menuOpen ? 'headerBtn selected' : 'headerBtn'}
                        onClick={() => setMenuOpen(!menuOpen)}>
                        <FaUserAstronaut />
                    </div>
                </div>

            </header>

            <div className='inputRow'>
                <input type='text' value={weight} onChange={onWeightChange} onKeyDown={onWeightKeyDown} autoFocus />
                {showCalendar
                    ? <Calendar value={calendar} onChange={setCalendar} />

                    : <div className='dateView' onClick={() => setShowCalendar(true)}>
                        {formatDate(calendar)}
                        <CgCalendar />
                    </div>
                }
                <button className='sendBtn' onClick={submit}><AiOutlineSend /></button>


            </div>

            <ChartPanel />
            <StatsPanel />
            <PortPanel />

            <Modal />
        </div >

    )
}

const today = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

const formatDate = (date) => date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear()

const areEqual = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate()
}


export default HeftLog