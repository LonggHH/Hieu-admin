import {
    CAlert, CButton, CCol, CForm, CFormInput, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import instanceAxios from "../../../configs/axiosConfig"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import { Switch } from "antd"

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const TransitOperator = () => {

    const [alert, setAlert] = useState(defaultAlert)
    const [transitOperator, setTransitOperator] = useState([])
    const [transportMode, setTransportMode] = useState([])

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)
    const [operatorLinkMode, setOperatorLinkMode] = useState([])

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
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/transit_operator`,)
            if (result.data.status === 200) {
                const data = result.data.data
                setTransitOperator(data)
                setTotalPage(Math.ceil(data.length / pageSize))
                setCurrentPage(1)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error get `, color: "danger" })
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

        console.log(values);

        // const token = JSON.parse(localStorage.getItem('account_admin'));
        try {

            const result = await instanceAxios.post(`/api/v1/location/transit_operator`, JSON.stringify(values))
            // console.log(result);
            if (result.data.status === 201) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getTransitOperators()
            }
        } catch (error) {
            console.log("transit operator: ", error);
            // handleCloseModal()
            // handleShowAlert({ open: true, message: "Error post transit operator", color: "danger" })
        }
    }

    const getTransportModes = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/transport_mode`)
            if (result.data.status === 200) {
                const data = result.data.data
                // console.log(data);
                setTransportMode(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const handleClickLinkMode = async (modeId, operatorId) => {
        const data = {
            transportModeId: modeId,
            transitOperatorId: operatorId
        }
        try {
            const result = await instanceAxios.post(`/api/v1/location/operator_transport`, JSON.stringify(data))
            if (result.data.status === 200) {
                setFormControl(defaultForm)
                getTransitOperators()
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleClickEdit = async (operator) => {
        try {

            const result = await instanceAxios.get(`/api/v1/location/operator_transport/${operator.id}`)
            console.log(result.data.data);
            if (result.data.status === 200) {
                setOperatorLinkMode(result.data.data)
                setFormControl({ open: true, title: "Update", data: operator })
            }
        } catch (error) {
            console.log("transit operator: ", error);
        }
    }

    useEffect(() => {
        getTransitOperators()
        getTransportModes()
    }, [])

    console.log(transitOperator);

    return (
        <>

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CModal
                scrollable
                visible={formControl.open}
                onClose={handleCloseModal}
                backdrop="static"
                aria-labelledby="ScrollingLongContentExampleLabel2"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Transit Operator</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmit}>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormInput id="operatorName" name="operatorName" label="Name" placeholder="Ha Noi"
                                defaultValue={formControl.data?.operatorName} />
                        </CCol>

                        <CCol xs={12}>
                            {formControl.title === "Update" && transportMode.map((mode) => {
                                const check = operatorLinkMode.some(el => el.transitOperatorId == formControl.data.id && el.transportModeId == mode.id)
                                return (
                                    <div key={mode.id} className="d-flex">
                                        <CFormInput type="text" id="staticEmail" defaultValue={mode.modeName} readOnly plainText />
                                        {
                                            check ?
                                                <Switch
                                                    checked={check}
                                                    checkedChildren=""
                                                    unCheckedChildren=""
                                                    onChange={() => {
                                                        handleClickLinkMode(mode.id, formControl.data.id)
                                                    }}
                                                />
                                                :
                                                <Switch
                                                    checked={check}
                                                    checkedChildren=""
                                                    unCheckedChildren=""
                                                    onChange={() => {
                                                        handleClickLinkMode(mode.id, formControl.data.id)
                                                    }}
                                                />
                                        }
                                    </div>
                                )
                            })}
                        </CCol>

                        <CCol xs={12}>
                            <CButton className="custom-button" color="primary" type="submit">Submit</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <div style={{ marginBottom: 12 }}>
                <CButton color="primary" className="custom-button" onClick={() => setFormControl({ open: true, title: 'Add', data: null })}>Add</CButton>
            </div>

            <CTable hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Operator name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {transitOperator
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((item, i) => (
                            <CTableRow key={i}>
                                <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                <CTableDataCell>{item.operatorName}</CTableDataCell>
                                <CTableDataCell>
                                    <CIcon icon={icon.cilBrush} size='xl' style={{ cursor: "pointer", color: "#1b9e3e" }}
                                        onClick={() => handleClickEdit(item)}
                                    />
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

export default TransitOperator