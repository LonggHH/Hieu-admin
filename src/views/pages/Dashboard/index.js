import {
    CAlert,
    CButton
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import instanceAxios from "../../../configs/axiosConfig"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import { CChart } from "@coreui/react-chartjs"

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const getStyle = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
};

const Dashboard = () => {

    const [alert, setAlert] = useState(defaultAlert)

    const [startYear, setStartYear] = useState(2024);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    const [userAnalytics, setUserAnalytics] = useState([])
    const [productAnalytics, setProductAnalytics] = useState([])

    const handleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
    }

    const getUserAnalytics = async () => {
        try {
            const result = await instanceAxios.get(`/api/v1/analytics/user`)
            if (result.data.status === 200) {
                const data = result.data.data.filter(el => el.role == "USER")
                setUserAnalytics(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error get user analytics`, color: "danger" })
        }
    }

    const getProductAnalytics = async () => {
        try {
            const result = await instanceAxios.get(`/api/v1/analytics/product`)
            if (result.data.status === 200) {
                const data = result.data.data
                setProductAnalytics(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error get user analytics`, color: "danger" })
        }
    }

    useEffect(() => {
        getUserAnalytics()
        getProductAnalytics()
    }, [])

    function createYearRange(startYear, endYear) {
        const years = [];
        for (let year = startYear; year <= endYear; year++) {
            years.push(year);
        }
        return years;
    }
    const years = createYearRange(startYear, currentYear);


    function statisticsByMonth(year, data, fieldName) {
        const stats = Array(12).fill(0);

        data.forEach((item) => {
            // Lấy năm và tháng từ chuỗi ngày tạo
            const date = new Date(item[fieldName]); // Sử dụng tên trường từ tham số
            const itemYear = date.getFullYear();
            const itemMonth = date.getMonth();

            if (itemYear === year) {
                stats[itemMonth]++;
            }
        });

        const result = {};
        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        stats.forEach((count, index) => {
            result[monthNames[index]] = count;
        });

        return result;
    }
    const dataChartUser = statisticsByMonth(2024, userAnalytics, "createAt");
    const dataChartProduct = statisticsByMonth(2024, productAnalytics, "buyAt");


    return (
        <>
            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <div>
                <span>Years: </span>
                {years.map(el => (
                    <CButton color="primary" key={el} onClick={() => setCurrentYear(el)}>{el}</CButton>
                ))}
            </div>

            <CChart
                type="bar"
                data={{
                    labels: Object.keys(dataChartUser),
                    datasets: [
                        {
                            label: 'User',
                            backgroundColor: '#f87979',
                            data: Object.values(dataChartUser),
                        },
                    ],
                }}
                labels="months"
                options={{
                    plugins: {
                        legend: {
                            labels: {
                                color: getStyle('--cui-body-color'),
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: getStyle('--cui-border-color-translucent'),
                            },
                            ticks: {
                                color: getStyle('--cui-body-color'),
                            },
                        },
                        y: {
                            grid: {
                                color: getStyle('--cui-border-color-translucent'),
                            },
                            ticks: {
                                color: getStyle('--cui-body-color'),
                            },
                        },
                    },
                }}
            />

            <CChart
                type="bar"
                data={{
                    labels: Object.keys(dataChartProduct),
                    datasets: [
                        {
                            label: 'Product',
                            backgroundColor: '#f87979',
                            data: Object.values(dataChartProduct),
                        },
                    ],
                }}
                labels="months"
                options={{
                    plugins: {
                        legend: {
                            labels: {
                                color: getStyle('--cui-body-color'),
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: getStyle('--cui-border-color-translucent'),
                            },
                            ticks: {
                                color: getStyle('--cui-body-color'),
                            },
                        },
                        y: {
                            grid: {
                                color: getStyle('--cui-border-color-translucent'),
                            },
                            ticks: {
                                color: getStyle('--cui-body-color'),
                            },
                        },
                    },
                }}
            />
        </>
    )
}

export default Dashboard