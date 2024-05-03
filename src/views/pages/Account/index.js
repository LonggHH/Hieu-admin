import {
    CAlert, CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import { useNavigate } from "react-router-dom";

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const Account = () => {

    const navigate = useNavigate()

    const [alert, setAlert] = useState(defaultAlert)

    const [account, setAccount] = useState([])

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)

    const handleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
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

    const getAccounts = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/card`)
            const data = result.data
            setAccount(data)
            if (result.data.status === 200) {

            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error acocunt`, color: "danger" })
        }
    }

    const handleClickEnquire = (serialNumber) => {
        localStorage.setItem('serial_number', JSON.stringify(serialNumber))
        navigate("/report")
    }

    useEffect(() => {
        getAccounts()
    }, [])

    return (
        <>
            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CTable hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Id</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Serial</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Operator</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {account
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((item, i) => {
                            const dateStart = new Date(item.issueDate)
                            const dayStart = String(dateStart.getDate()).padStart(2, '0');
                            const monthStart = String(dateStart.getMonth() + 1).padStart(2, '0');
                            const yearStart = String(dateStart.getFullYear()).slice(-2);
                            const formattedDateStart = `${dayStart}:${monthStart}:${yearStart}`;

                            const dateEnd = new Date(item.expiryDate)
                            const dayEnd = String(dateEnd.getDate()).padStart(2, '0');
                            const monthEnd = String(dateEnd.getMonth() + 1).padStart(2, '0');
                            const yearEnd = String(dateEnd.getFullYear()).slice(-2);
                            const formattedDateEnd = `${dayEnd}:${monthEnd}:${yearEnd}`;
                            return (
                                <CTableRow key={i}>
                                    <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                    <CTableDataCell>{item.id}</CTableDataCell>

                                    <CTableDataCell>
                                        {item.serialNumber}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {item.cardType}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {formattedDateStart} - {formattedDateEnd}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {item.transitOperator.operatorName}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {item.blocked ? "Block" : "UnLock"}
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <CIcon icon={icon.cilBrush} size='xl' style={{ cursor: "pointer", color: "#1b9e3e" }}
                                            onClick={() => handleClickEnquire(item.serialNumber)} />
                                        <span style={{ margin: 10 }}></span>
                                        <CIcon icon={icon.cilXCircle} size='xl' style={{ cursor: "pointer", color: "#e55353" }} />
                                    </CTableDataCell>
                                </CTableRow>
                            )
                        })}
                </CTableBody>
            </CTable>

            <div style={{ float: "right" }}>
                <CPagination aria-label="Page navigation example">
                    <CPaginationItem aria-label="Previous" disabled={currentPage === 1}
                        onClick={() => handleNavigationPage(NAVIGATEPAGE.PREVIOUS)}>
                        <span aria-hidden="true">&laquo;</span>
                    </CPaginationItem>
                    {Array(totalPage).fill().map((_, i) => (
                        <CPaginationItem key={i} active={currentPage === (i + 1) ? true : false}
                            onClick={() => setCurrentPage(i + 1)}
                        >{i + 1}</CPaginationItem>
                    ))}
                    <CPaginationItem aria-label="Next" disabled={currentPage === totalPage}
                        onClick={() => handleNavigationPage(NAVIGATEPAGE.NEXT)}>
                        <span aria-hidden="true">&raquo;</span>
                    </CPaginationItem>
                </CPagination>
            </div>
        </>
    )
}

export default Account