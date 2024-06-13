import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CProgress,
    CRow
} from "@coreui/react"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import instanceAxios from "../../../configs/axiosConfig"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import { CChart, CChartLine } from "@coreui/react-chartjs"
import {
    cibCcAmex,
    cibCcApplePay,
    cibCcMastercard,
    cibCcPaypal,
    cibCcStripe,
    cibCcVisa,
    cibGoogle,
    cibFacebook,
    cibLinkedin,
    cifBr,
    cifEs,
    cifFr,
    cifIn,
    cifPl,
    cifUs,
    cibTwitter,
    cilCloudDownload,
    cilPeople,
    cilUser,
    cilUserFemale,
} from '@coreui/icons'

import MainChart from "../../dashboard/MainChart"

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const getStyle = (variable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(variable);
};

function roundToNearestThousand(num) {
    return Math.round(num / 1000) * 1000;
}

const Dashboard = () => {

    const [alert, setAlert] = useState(defaultAlert)

    const [startYear, setStartYear] = useState(2024);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    const [userAnalytics, setUserAnalytics] = useState([])
    const [productAnalytics, setProductAnalytics] = useState([])
    const [incomeAnalytics, setIncomeAnalytics] = useState([])
    const [validationAnalytics, setValidationAnalytics] = useState([])

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

    const getIncomeAnalytics = async () => {
        try {
            const result = await instanceAxios.get(`/api/v1/analytics/income`)
            if (result.data.status === 200) {
                const data = result.data.data
                setIncomeAnalytics(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error get income analytics`, color: "danger" })
        }
    }

    const getValidationAnalytics = async () => {
        try {
            const result = await instanceAxios.get(`/api/v1/analytics/validation`)
            if (result.data.status === 200) {
                const data = result.data.data
                setValidationAnalytics(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error get validation analytics`, color: "danger" })
        }
    }

    useEffect(() => {
        getUserAnalytics()
        getProductAnalytics()
        getIncomeAnalytics()
        getValidationAnalytics()
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

    function totalAmountByMonth(year, data, fieldName) {
        const stats = Array(12).fill(0);

        data.forEach((item) => {
            // Lấy năm và tháng từ chuỗi ngày tạo
            const date = new Date(item[fieldName]); // Sử dụng tên trường từ tham số
            const itemYear = date.getFullYear();
            const itemMonth = date.getMonth();

            if (itemYear === year) {
                stats[itemMonth] += item.amount; // Cộng dồn amount cho tháng tương ứng
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

        stats.forEach((totalAmount, index) => {
            result[monthNames[index]] = totalAmount;
        });

        return result;
    }
    const dataChartUser = statisticsByMonth(currentYear, userAnalytics, "createAt");
    const dataChartProduct = statisticsByMonth(currentYear, productAnalytics, "buyAt");

    const dataChartInCome = totalAmountByMonth(currentYear, incomeAnalytics, "transactionDate");

    let totalAmount = incomeAnalytics.reduce((total, item) => total += item.amount, 0)



    // const amountUpper = roundToNearestThousand(totalAmount);
    const amountUpper = totalAmount;

    const cartLength = JSON.parse(localStorage.getItem("cartLength"))


    return (
        <>
            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CRow>
                <CCol xs>
                    <CCard className="mb-4">
                        <CCardHeader>Statistical</CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xs={12} md={6} xl={6}>
                                    <CRow>
                                        <CCol xs={6}>
                                            <div className="border-start border-start-4 border-start-info py-1 px-3">
                                                <div className="text-body-secondary text-truncate small">Cards</div>
                                                <div className="fs-5 fw-semibold">{cartLength}</div>
                                            </div>
                                        </CCol>
                                        <CCol xs={6}>
                                            <div className="border-start border-start-4 border-start-danger py-1 px-3 mb-3">
                                                <div className="text-body-secondary text-truncate small">
                                                    Users
                                                </div>
                                                <div className="fs-5 fw-semibold">{userAnalytics.length}</div>
                                            </div>
                                        </CCol>
                                    </CRow>
                                </CCol>
                                <CCol xs={12} md={6} xl={6}>
                                    <CRow>
                                        <CCol xs={6}>
                                            <div className="border-start border-start-4 border-start-warning py-1 px-3 mb-3">
                                                <div className="text-body-secondary text-truncate small">Products</div>
                                                <div className="fs-5 fw-semibold">{productAnalytics.length}</div>
                                            </div>
                                        </CCol>
                                        <CCol xs={6}>
                                            <div className="border-start border-start-4 border-start-success py-1 px-3 mb-3">
                                                <div className="text-body-secondary text-truncate small">Income</div>
                                                <div className="fs-5 fw-semibold">${totalAmount}</div>
                                            </div>
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <div>
                <span>Years: </span>
                {years.map(el => (
                    <CButton color="primary" key={el} onClick={() => setCurrentYear(el)}>{el}</CButton>
                ))}
            </div>

            <CChart
                type="bar"
                data={{
                    labels: Object.keys(dataChartProduct),
                    datasets: [
                        {
                            label: "User",
                            // backgroundColor: "rgba(220, 220, 220, 0.2)",
                            backgroundColor: "#e55353",
                            borderColor: "rgba(220, 220, 220, 1)",
                            pointBackgroundColor: "rgba(242, 148, 31, 0.8)",
                            pointBorderColor: "#fff",
                            data: Object.values(dataChartUser)
                        },
                        {
                            label: "Product",
                            // backgroundColor: "rgba(151, 187, 205, 0.2)",
                            backgroundColor: "#f9b115",
                            borderColor: "rgba(151, 187, 205, 1)",
                            pointBackgroundColor: "rgba(151, 187, 205, 1)",
                            pointBorderColor: "#fff",
                            data: Object.values(dataChartProduct)
                        },
                    ],
                }}
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

            <CCard className="mb-4" style={{ margin: 24 }}>
                <CCardBody>

                    <CChartLine
                        style={{ height: 300, marginTop: '40px' }}
                        data={{
                            labels: Object.keys(dataChartInCome),
                            datasets: [
                                {
                                    label: 'Income',
                                    backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
                                    borderColor: getStyle('--cui-info'),
                                    pointHoverBackgroundColor: getStyle('--cui-info'),
                                    borderWidth: 2,
                                    data: Object.values(dataChartInCome),
                                    fill: true,
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
                                    max: amountUpper,
                                    ticks: {
                                        color: getStyle('--cui-body-color'),
                                        maxTicksLimit: 5,
                                        stepSize: Math.ceil(amountUpper / 5),
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
                </CCardBody>
            </CCard>



        </>
    )
}

export default Dashboard