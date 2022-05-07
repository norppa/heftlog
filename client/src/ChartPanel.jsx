import { useState, useContext } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, } from 'recharts'

import { Context } from './Store'

const toPlotData = (data) => {
    if (data.length === 0) return data
    const ordered = [...data].sort((a, b) => a.date.valueOf() - b.date.valueOf())
    const plotData = []
    let date = ordered[0].date

    console.log('filling in the missing dates')
    // Fill in missing dates
    ordered.forEach(point => {
        const c = compare(date, point.date)
        while (c < 1) {
            if (c === 0) {
                // this date contains actual user-submitted data
                plotData.push({ ...point, label: point.date.getDate() + '.' + (point.date.getMonth() + 1) + '.' })
            } else {
                // this date has only calculated average
                plotData.push({ date })
            }
        }
    })
    console.log('plotData', plotData)

    const n = 5 // the number of steps counted in average

    const calculatedDailyWeights = Array(n - 1).fill(Number(plotData[0].weight))
    for (let i = 0; i < plotData.length; i++) {
        if (plotData[i].weight) {
            calculatedDailyWeights.push(plotData[i].weight)
            continue
        }

        const prevWeight = plotData[i - 1].weight
        let nextWeight, gapLength = 1
        while (!nextWeight) nextWeight = plotData[i + gapLength++].weight
        const step = (nextWeight - prevWeight) / gapLength

        for (let j = 1; j < gapLength; j++) {
            calculatedDailyWeights.push(prevWeight + step * j)
            i++
        }
        i--
    }

    return plotData.map((entry, i) => {
        return { ...entry, average: lastNAverage(calculatedDailyWeights, i, n) }
    })
}

const lastNAverage = (arr, start, n) => {
    const average = arr.slice(start, start + n).reduce((acc, cur) => acc + cur, 0) / n
    return Math.round(average * 10) / 10
}

const compare = (date1, date2) => {
    const str1 = date1.getFullYear() 
    if (date1.getFullYear() < date2.getFullYear()) return -1
    if (date1.getFullYear() > date2.getFullYear()) return 1
    if (date1.getMonth() < date2.getMonth()) return -1
    if (date1.getMonth() > date2.getMonth()) return 1
    if (date1.getDate() < date2.getDate()) return -1
    if (date1.getDate() > date2.getDate()) return 1
    return 0
}


const ChartPanel = () => {

    const [state, dispatch] = useContext(Context)
    const [show, setShow] = useState(true)

    if (!show) return (
        <div className='panel closed' onClick={() => setShow(true)}>
            <label>Chart</label>
        </div>
    )

    return (
        <div className='panel'>
            <label onClick={() => setShow(false)}>Chart</label>

            <LineChart className='chart' data={toPlotData(state.data)} width={940} height={300}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line dataKey="weight"
                    connectNulls
                    type="monotone"
                    stroke="#8884d8"
                    fill="#8884d8"
                />
                <Line dataKey="average"
                    connectNulls
                />
            </LineChart>
        </div>
    )
}

export default ChartPanel