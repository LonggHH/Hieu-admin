import {
    CAlert, CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const TransportMode = () => {

    const [alert, setAlert] = useState(defaultAlert)

    const [transitOperator, setTransitOperator] = useState([])
    const [transportMode, setTransportMode] = useState([])

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)

    const handleCloseModal = () => {
        setFormControl({ ...defaultForm })
    }

    const handleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
    }

    const getTransitOperators = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/transit_operator`)
            if (result.data.status === 200) {
                setTransitOperator(result.data.data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const getTransportModes = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/transport_mode`)
            if (result.data.status === 200) {
                const data = result.data.data
                setTransportMode(data)
                setTotalPage(Math.ceil(data.length / pageSize))
                setCurrentPage(1)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
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

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        const data = { ...values }
        data.transitOperator = {
            id: values.transitOperator
        }

        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/location/transport_mode`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (result.data.status === 201) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getTransportModes()
            }
        } catch (error) {
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }
    }

    useEffect(() => {
        getTransitOperators()
        getTransportModes()
    }, [])

    return (
        <>

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CModal
                scrollable
                visible={formControl.open}
                onClose={() => handleCloseModal}
                aria-labelledby="ScrollingLongContentExampleLabel2"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Transport Mode</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmit}>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormInput id="modeName" name="modeName" label="Name" placeholder="Bus"
                                defaultValue={formControl.data?.modeName} />
                        </CCol>

                        {/* <CFormSelect
                            aria-label="Default select example"
                            label='Transit Operator'
                            name='transitOperator'
                            options={transitOperator.map((item) => {
                                return { label: item.operatorName, value: item.id }
                            })}
                        /> */}

                        <CCol xs={12}>
                            <CButton className="custom-button" color="primary" type="submit">{formControl.title}</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <div style={{ marginBottom: 12 }}>
                <CButton className="custom-button" color="primary" onClick={() => setFormControl({ open: true, title: 'Add', data: null })}>Add</CButton>
            </div>

            <CTable hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {transportMode
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((item, i) => (
                            <CTableRow key={i}>
                                <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                <CTableDataCell>{item.modeName}</CTableDataCell>
                                <CTableDataCell>
                                    <CIcon icon={icon.cilBrush} size='xl' style={{ cursor: "pointer", color: "#1b9e3e" }} />
                                    <span style={{ margin: 10 }}></span>
                                    <CIcon icon={icon.cilXCircle} size='xl' style={{ cursor: "pointer", color: "#e55353" }} />
                                </CTableDataCell>
                            </CTableRow>
                        ))}
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

export default TransportMode