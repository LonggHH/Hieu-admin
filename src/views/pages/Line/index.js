import {
    CAlert, CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CRow, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
    CTooltip
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import { useNavigate } from "react-router-dom";
import { Switch } from "antd";

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const customTooltipStyle = {
    '--cui-tooltip-bg': 'var(--cui-primary)',
}

const Line = () => {

    const navigate = useNavigate()

    const [alert, setAlert] = useState(defaultAlert)

    const [transportMode, setTransportMode] = useState([])
    const [line, setLine] = useState([])

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)
    const [formLinkStop, setFormLinkStop] = useState(defaultForm)
    const [stops, setStops] = useState([])
    const [stopInALine, setStopInALine] = useState([])

    const handleCloseModal = () => {
        setFormControl({ ...defaultForm })
    }

    const handleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
    }

    const getTransportModes = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/transport_mode`)
            if (result.data.status === 200) {
                const data = result.data.data
                setTransportMode(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const getLines = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/line`)
            if (result.data.status === 200) {
                const data = result.data.data
                setLine(data)
                setTotalPage(Math.ceil(data.length / pageSize))
                setCurrentPage(1)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const getStops = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/stop`)
            if (result.data.status === 200) {
                const data = result.data.data
                setStops(data)

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
        data.transportMode = {
            id: values.transportMode
        }

        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/location/line`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (result.data.status === 201) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getLines()
            }
        } catch (error) {
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }
    }

    const linkToRoute = (item) => {
        localStorage.setItem("line_id_choose", JSON.stringify(item))
        navigate("/route")
    }

    const onSubmitLinkStop = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        let data = { ...values }
        data = Object.fromEntries(
            Object.entries(data).filter(([key, value]) => value != null && value !== "")
        );
        data = Object.entries(data).map(([key, value]) => ({
            lineId: formLinkStop.data.id,
            stopId: Number(key),
            order: Number(value)
        }));


        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/location/line_stops`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log(result);
            if (result.data.status === 200) {
                setFormLinkStop(defaultForm)
                setStopInALine([])
            }
        } catch (error) {
            handleShowAlert({ open: true, message: "Error onSubmitLinkStop", color: "danger" })
        }
    }

    const handleClickLinkMode = async (stop) => {

        const data = [{
            lineId: formLinkStop.data.id,
            stopId: Number(stop.id),
            order: stopInALine.length + 1
        }]


        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/location/line_stops`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (result.data.status === 200) {
                setFormLinkStop(defaultForm)
                setStopInALine([])

                // setFormLinkStop(defaultForm)
                // setStopInALine([])
            }
        } catch (error) {
            console.log("error  ", error);
            handleShowAlert({ open: true, message: "Error .", color: "danger" })
        }
    }

    const getStopInALine = async (line) => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/line_stops/${line.id}`)
            if (result.data.status === 200) {
                const data = result.data.data
                setStopInALine(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const handleChangeOrder = async (stopId, order) => {
        const data = [{
            lineId: formLinkStop.data.id,
            stopId,
            order: +order
        }]

        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/location/line_stops`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (result.data.status === 200) {
                setStopInALine([])
                setFormLinkStop(defaultForm)
            }
        } catch (error) {
            console.log("error  ", error);
            handleShowAlert({ open: true, message: "Error .", color: "danger" })
        }

    }

    useEffect(() => {
        getTransportModes()
        getLines()
        getStops()
    }, [])


    return (
        <>

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CModal
                scrollable
                visible={formControl.open}
                onClose={handleCloseModal}
                aria-labelledby="ScrollingLongContentExampleLabel2"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Line</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmit}>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormInput id="lineName" name="lineName" label="Name" placeholder="Bus"
                                defaultValue={formControl.data?.lineName} />
                        </CCol>

                        <CFormSelect
                            aria-label="Default select example"
                            label='Transit Operator'
                            name='transportMode'
                            options={transportMode.map((item) => {
                                return { label: item.modeName, value: item.id }
                            })}
                        />

                        <CCol xs={12}>
                            <CButton className="custom-button" color="primary" type="submit">{formControl.title}</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <CModal
                scrollable
                visible={formLinkStop.open}
                onClose={() => {
                    setFormLinkStop(defaultForm)
                    setStopInALine([])
                }}
                aria-labelledby="ScrollingLongContentExampleLabel2"
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Link Stop</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmitLinkStop}>
                    <CForm className="row g-3">
                        {
                            stopInALine.map((stop) => (
                                <CRow className="my-0" key={stop.stop.id}>
                                    <CFormLabel className="col-sm-10 col-form-label">{stop.stop.stopName}</CFormLabel>
                                    <CCol sm={2}>
                                        <CFormInput size="sm" type="number" defaultValue={stop?.order}
                                            onChange={(e) => handleChangeOrder(stop.stop.id, e.target.value)}
                                        />
                                    </CCol>
                                </CRow>
                            ))
                        }
                        <hr />

                        <CCol xs={12}>
                            {
                                stops.map(((stop) => {
                                    const stopFind = stopInALine.find(el => el.stop.id == stop.id)
                                    return (
                                        <div key={stop.id} className="d-flex" >
                                            <CFormLabel className="col-form-label" style={{ flexGrow: 1 }}>{stop.stopName}</CFormLabel>
                                            <Switch
                                                checked={stopFind}
                                                checkedChildren=""
                                                unCheckedChildren=""
                                                onClick={() => {
                                                    handleClickLinkMode(stop)
                                                }}
                                            />
                                        </div>
                                    )
                                }))
                            }
                        </CCol>
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
                        {/* <CTableHeaderCell scope="col">Id</CTableHeaderCell> */}
                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Transport Mode</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {line
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((item, i) => (
                            <CTableRow key={i}>
                                <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                {/* <CTableDataCell>{item.id}</CTableDataCell> */}
                                <CTableDataCell>{item.lineName}</CTableDataCell>
                                <CTableDataCell>
                                    {item.transportMode.modeName}
                                </CTableDataCell>
                                <CTableDataCell style={{ display: "flex", gap: 12 }}>

                                    <CTooltip
                                        content="Link Route"
                                        placement="top"
                                        style={customTooltipStyle}
                                    >
                                        <CIcon icon={icon.cilLink} size="xl" style={{ cursor: "pointer", color: "#1b9e3e" }}
                                            onClick={() => linkToRoute(item)} />
                                    </CTooltip>

                                    <CIcon icon={icon.cilBrush} size='xl' style={{ cursor: "pointer", color: "#1b9e3e" }}
                                        onClick={() => {
                                            getStopInALine(item)
                                            setFormLinkStop({ open: true, title: "Update", data: item })
                                        }}
                                    />

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

export default Line