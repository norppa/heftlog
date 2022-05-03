import { useContext, useState } from 'react'
import { Context } from './Store'

const StatsPanel = () => {
    const [state, dispatch] = useContext(Context)
    
    const [show, setShow] = useState(true)

    if (!show) return (
        <div className='panel closed' onClick={() => setShow(true)}>
            <label>Statistics</label>
        </div>
    )

    return (
        <div className='panel'>
            <label onClick={() => setShow(false)}>Statistics</label>
            <table><tbody>

                {state.data.reduce((acc, cur) => {
                    const month = cur.date.toLocaleString('default', { month: 'long' })
                    const newValue = { date: cur.date.getDate() + '.' + cur.date.getMonth() + '.', weight: cur.weight }
                    const monthObj = acc[acc.length - 1]
                    if (monthObj?.month === month) {
                        monthObj.values = monthObj.values.concat(newValue)
                        return acc
                    } else {
                        return acc.concat({ month, values: [newValue] })
                    }
                }, [])
                    .map(month => {
                        return <>
                            <tr><td colSpan='31' className='tableHeader'>{month.month}</td></tr>
                            <tr>{month.values.map(value => <td>{value.date}</td>)}</tr>
                            <tr>{month.values.map(value => <td>{value.weight} kg</td>)}</tr>
                        </>
                    })
                }
            </tbody></table>
        </div>
    )
}

export default StatsPanel