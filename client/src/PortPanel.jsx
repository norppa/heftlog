import { useState, useContext } from 'react'

import { Context } from './Store'


const PortPanel = () => {

    const [state, dispatch] = useContext(Context)

    const [show, setShow] = useState(false)
    const [portValue, setPortValue] = useState('')
    const [error, setError] = useState('')

    if (!show) return (
        <div className='panel closed' onClick={() => setShow(true)}>
            <label>Import/Export</label>
        </div>
    )

    const onChange = (event) => {
        setError('')
        setPortValue(event.target.value)
    }

    const onImportClick = () => {
        console.log('onImportClick')
        const modal = {
            heading: 'Confirm import',
            text: `Are you sure you want to import current data. This will override all existing data. This action can not be undone.`,
            confirmText: 'Import',
            cancelText: 'Cancel',
            onCancel: () => dispatch({type: 'SET_MODAL'}),
            onConfirm: () => {
                try {
                    const data = JSON.parse(portValue).map(entry => ({ weight: Number(entry.weight), date: new Date(entry.date) }))
                    dispatch({ type: 'SET_DATA', payload: data })
                } catch (error) {
                    setError(error.toString())
                }
                dispatch({type: 'SET_MODAL'})
            },
        }
        
        dispatch({type: 'SET_MODAL', payload: modal})
    }

    const onExportClick = () => {
        setPortValue(JSON.stringify(state.data))
    }

    return (
        <div className='panel'>
            <label onClick={() => setShow(false)}>Import/Export</label>
            <textarea value={portValue} onChange={onChange}></textarea>
            {error && <div className='error'>{error}</div>}
            <div className='buttonRow'>
                <button onClick={onImportClick}>Import</button>
                <button onClick={onExportClick}>Export</button>
            </div>

        </div>
    )
}

export default PortPanel