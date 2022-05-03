import { useContext } from 'react'

import { Context } from './Store'
import './Modal.css'

const Modal = () => {
    const [state, dispatch] = useContext(Context)

    if (!state.modal) return null

    const { heading, text, confirmText, onConfirm, onCancel } = state.modal

    return <div className='Modal'>
        <div className='ModalContent'>
            <h3>{heading}</h3>
            <p>{text}</p>

            <div className='buttonRow'>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onConfirm}>{confirmText}</button>

            </div>
        </div>

    </div>
}

export default Modal