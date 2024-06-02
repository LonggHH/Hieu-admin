import React, { useEffect, useRef } from 'react'

import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

function roundToNearestThousand(num) {
    return Math.round(num / 1000) * 1000;
}

const MainChart = (props) => {

    const { data, total } = props

    const chartRef = useRef(null)

    useEffect(() => {
        document.documentElement.addEventListener('ColorSchemeChange', () => {
            if (chartRef.current) {
                setTimeout(() => {
                    chartRef.current.options.scales.x.grid.borderColor = getStyle(
                        '--cui-border-color-translucent',
                    )
                    chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
                    chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
                    chartRef.current.options.scales.y.grid.borderColor = getStyle(
                        '--cui-border-color-translucent',
                    )
                    chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
                    chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
                    chartRef.current.update()
                })
            }
        })
    }, [chartRef])

    // const random = () => Math.round(Math.random() * 100)

    const upper = roundToNearestThousand(total)

    return (
        <>
            <CChartLine
                // ref={chartRef}
                style={{ marginTop: '40px' }}
                data={{
                    labels: Object.keys(data),
                    datasets: [
                        {
                            label: 'My First dataset',
                            backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
                            borderColor: getStyle('--cui-info'),
                            pointHoverBackgroundColor: getStyle('--cui-info'),
                            borderWidth: 2,
                            data: Object.values(data),
                            // fill: true,
                        },
                    ],
                }}
                options={{
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                color: getStyle('--cui-border-color-translucent'),
                                drawOnChartArea: false,
                            },
                            ticks: {
                                color: getStyle('--cui-body-color'),
                            },
                        },
                        y: {
                            beginAtZero: true,
                            border: {
                                color: getStyle('--cui-border-color-translucent'),
                            },
                            grid: {
                                color: getStyle('--cui-border-color-translucent'),
                            },
                            max: 10000,
                            ticks: {
                                color: getStyle('--cui-body-color'),
                                maxTicksLimit: 5,
                                stepSize: Math.ceil(10000 / 5),
                            },
                        },
                    },
                    elements: {
                        line: {
                            tension: 0.4,
                        },
                        point: {
                            radius: 0,
                            hitRadius: 10,
                            hoverRadius: 4,
                            hoverBorderWidth: 3,
                        },
                    },
                }}
            />
        </>
    )
}

export default MainChart
