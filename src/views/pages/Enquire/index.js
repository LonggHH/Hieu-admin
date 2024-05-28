import { cilArrowTop } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {
    CAlert, CButton, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle,
    CListGroup, CListGroupItem, CPagination, CPaginationItem, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CToast, CToastBody, CToastHeader, CToaster, CWidgetStatsA
} from "@coreui/react"
import { CChartLine } from "@coreui/react-chartjs"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import * as icon from '@coreui/icons';
import moment from "moment";
import instanceAxios from "../../../configs/axiosConfig";

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const Enquire = () => {

    const [enquire, setEnquire] = useState({});
    const [timeLine, setTimeLine] = useState([]);

    const [alert, setAlert] = useState(defaultAlert);
    const [toast, addToast] = useState(0);
    const toaster = useRef();

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const handleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
    };

    const exampleToast = (title, message, color) => {

        return (
            <CToast>
                <CToastHeader closeButton>
                    <svg
                        className="rounded me-2"
                        width="20"
                        height="20"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="xMidYMid slice"
                        focusable="false"
                        role="img"
                    >
                        <rect width="100%" height="100%" fill={color}></rect>
                    </svg>
                    <div className="fw-bold me-auto">Request {title}</div>
                    <small>2 second ago</small>
                </CToastHeader>
                <CToastBody>{message}</CToastBody>
            </CToast>
        )
    };

    const blockCard = async () => {
        const isBlock = enquire.card.blocked;
        try {
            const result = await instanceAxios.post(`/api/v1/card/${isBlock ? "unBlock" : "block"}`,
                JSON.stringify({ serialNumber: enquire.card.serialNumber })
            );
            if (result.data.status === 200) {
                addToast(exampleToast(`${isBlock ? "unBlock" : "block"}`, `${isBlock ? "unBlock" : "block"} success`, "#007aff"))
            }
            getEnquire()
        } catch (error) {
            addToast(exampleToast(`${isBlock ? "unBlock" : "block"}`, `${isBlock ? "unBlock" : "block"} error`, "#e55353"))
        }
    }

    const getEnquire = async () => {
        try {
            const result = await instanceAxios.post(`${process.env.URL_BACKEND}/api/v1/validation/enquire`,
                JSON.stringify({
                    serialNumber: JSON.parse(localStorage.getItem('serial_number'))
                }), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (result.data.status === 200) {
                // console.log(result.data.data);

                const { inspections, validations } = result.data.data;
                const cartTime = [].concat(inspections, validations);
                cartTime.sort((a, b) => b.transactionTime - a.transactionTime);
                console.log(cartTime);
                setEnquire(result.data.data);
                setTimeLine(cartTime);
                setTotalPage(Math.ceil(cartTime.length / pageSize));
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error enquire`, color: "danger" })
        }
    }

    const handleNavigationPage = (status) => {
        switch (status) {
            case NAVIGATEPAGE.PREVIOUS:
                setCurrentPage(pre => pre - 1)
                break
            case NAVIGATEPAGE.NEXT:
                setCurrentPage(pre => pre + 1)
                break
        }
    }

    useEffect(() => {
        getEnquire()
    }, [])

    return (
        <>
            <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CRow>
                <CCol sm={4}>
                    <div>
                        <h4 style={{ color: "grey", display: "flex", justifyContent: "space-between" }}>
                            <span>Card Detail</span>
                            <CButton
                                color={`${enquire?.card?.blocked ? "primary" : "dark"}`}
                                onClick={blockCard}
                            >
                                {enquire?.card?.blocked === true ? "Active" : "Block"}
                            </CButton>
                        </h4>
                        <CListGroup>
                            <CListGroupItem as="button" active>
                                Serial Number: {enquire?.card?.serialNumber}
                            </CListGroupItem>
                            <CListGroupItem as="button">Issue Date: {moment(enquire?.card?.issueDate).format('DD/MM/YYYY')}</CListGroupItem>
                            <CListGroupItem as="button">Expiry Date: {moment(enquire?.card?.expiryDate).format('DD/MM/YYYY')}</CListGroupItem>
                            <CListGroupItem as="button">Type: {"Mifare Desfire " + enquire?.card?.cardType}</CListGroupItem>
                            <CListGroupItem as="button" disabled>
                                Status: <span>{enquire?.card?.blocked ? "Blocked" : "Active"}</span>
                            </CListGroupItem>
                            <CListGroupItem as="button" disabled>
                                Transit Operator: <span>{enquire?.card?.transitOperator?.operatorName}</span>
                            </CListGroupItem>
                        </CListGroup>
                    </div>

                    {
                        enquire?.card?.user &&
                        <div>
                            <h5 style={{ color: "grey" }}>User</h5>
                            <CListGroup>
                                <CListGroupItem as="button" active>
                                    Name: {enquire?.card?.user?.firstname + " " + enquire?.card?.user?.lastname}
                                </CListGroupItem>
                                <CListGroupItem as="button">Email: {enquire?.card?.user?.email}</CListGroupItem>
                                <CListGroupItem as="button">Date of Birth :{enquire?.card?.user?.dob}</CListGroupItem>
                                <CListGroupItem as="button" disabled>
                                    Status: <span>{enquire?.card?.user?.enabled ? "Active" : "Inactive"}</span>
                                </CListGroupItem>
                                <CListGroupItem as="button" disabled>
                                    Role:
                                    {enquire?.card?.user?.roles &&
                                        <span>
                                            {enquire?.card?.user?.roles.map((role, i) => (
                                                <span key={i} style={{ margin: "0 6px" }}>{role}</span>
                                            ))}
                                        </span>
                                    }
                                </CListGroupItem>
                            </CListGroup>
                            <h5 style={{ color: "grey" }}>Products</h5>
                            {enquire.products.map((product) => (
                                <CListGroup>
                                    <CListGroupItem as="button" active disabled>Name: {product.productName}</CListGroupItem>
                                    {/* <CListGroupItem>Price: {product.price}</CListGroupItem> */}
                                    <CListGroupItem>Transit Operator: {product.transitOperator.operatorName}</CListGroupItem>
                                    <CListGroupItem>Transport Mode: {product.transportMode.modeName}</CListGroupItem>
                                </CListGroup>
                            ))}
                        </div>
                    }
                </CCol>
                <CCol sm={8}>
                    <h4 style={{ color: "grey" }}>Travel Validity</h4>
                    <div>
                        <div>Choose time</div>
                        <div>
                            <CTable hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Validation</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Inspection Result</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Inspection Referrence</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Inspection Decision</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {
                                        timeLine
                                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                            .map((item, i) => (
                                                <CTableRow>
                                                    {/* {moment(enquire?.card?.issueDate).format('HH:mm:ss DD/MM/YYYY')} */}
                                                    <CTableHeaderCell>{moment(item.transactionTime).format('HH:mm:ss DD/MM/YYYY')}</CTableHeaderCell>
                                                    <CTableDataCell>{item.type === "INSPECTION" ? "Inspection" : "Tap"}</CTableDataCell>
                                                    <CTableDataCell>{item.type !== "INSPECTION" ? item.result : ""}</CTableDataCell>
                                                    <CTableDataCell></CTableDataCell>
                                                    <CTableDataCell>{item.id}</CTableDataCell>
                                                    <CTableDataCell>{item.type === "INSPECTION" ? item.result : ""}</CTableDataCell>
                                                </CTableRow>
                                            ))
                                    }
                                </CTableBody>
                            </CTable>
                        </div>

                        <div style={{ float: "right" }}>
                            <CPagination aria-label="Page navigation example">
                                <CPaginationItem aria-label="Previous" disabled={currentPage === 1}
                                    onClick={() => handleNavigationPage(NAVIGATEPAGE.PREVIOUS)}
                                >
                                    <span aria-hidden="true">&laquo;</span>
                                </CPaginationItem>
                                {Array(totalPage).fill().map((_, i) => (
                                    <CPaginationItem key={i} active={currentPage === (i + 1) ? true : false}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >{i + 1}</CPaginationItem>
                                ))}
                                <CPaginationItem aria-label="Next" disabled={currentPage === totalPage}
                                    onClick={() => handleNavigationPage(NAVIGATEPAGE.NEXT)}
                                >
                                    <span aria-hidden="true">&raquo;</span>
                                </CPaginationItem>
                            </CPagination>
                        </div>
                    </div>
                </CCol>
            </CRow>
        </>
    )
}

export default Enquire