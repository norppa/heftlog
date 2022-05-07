import { useState, useContext } from 'react'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, } from 'recharts'

import { Context } from './Store'

const toPlotData = (data) => {
    if (data.length === 0) return data
    const ordered = [...data].sort((a, b) => a.date.valueOf() - b.date.valueOf())
    const plotData = []
    let date = ordered[0].date

    // Fill in missing dates
    ordered.forEach(point => {
        let c = compare(date, point.date)
        while (c < 1) {
            if (c === 0) {
                // this date contains actual user-submitted data
                plotData.push({ ...point, label: point.date.getDate() + '.' + (point.date.getMonth() + 1) + '.' })
            } else {
                // this date has only calculated
                plotData.push({ date })
            }

            date = new Date(date)
            date.setDate(date.getDate() + 1)
            c = compare(date, point.date)
        }
    })

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

const domain = (data) => {
    console.log('domain', data)
    const { min, max } = data.reduce((acc, cur) => {
        if (cur.weight > acc.max) return { ...acc, max: cur.weight }
        if (cur.weight < acc.min) return { ...acc, min: cur.weight }
        return acc
    }, { min: data[0].weight, max: data[0].weight })

    const evenMin = Math.floor(min / 10) * 10
    const evenMax = Math.ceil(max / 10) * 10

    return [evenMin, evenMax]
}


const ChartPanel = () => {

    const [state, dispatch] = useContext(Context)
    const [show, setShow] = useState(true)

    if (!show) return (
        <div className='panel closed' onClick={() => setShow(true)}>
            <label>Chart</label>
        </div>
    )

    const [min, max] = domain(state.data)
    const tickArray = Array.from(Array(11).keys()).map(x => min + (x * (max - min) / 10))
    console.log('tickAr', tickArray)

    return (
        <div className='panel'>
            <label onClick={() => setShow(false)}>Chart</label>

            <LineChart className='chart' data={toPlotData(state.data)} width={940} height={350}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[min, max]} ticks={tickArray} />
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