import {
    CAlert, CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import moment from "moment";

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const Product = () => {

    const [alert, setAlert] = useState(defaultAlert)

    const [products, setProducts] = useState([])
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
                console.log(data);
                setTransportMode(data)
                // setTotalPage(Math.ceil(data.length / pageSize))
                // setCurrentPage(1)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const getProducts = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/product`)
            if (result.data.status === 200) {
                const data = result.data.data
                setProducts(data)
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
        data.price = +data.price
        data.validIn = moment().add(data.validIn, 'days').valueOf()
        data.transitOperator = {
            id: +values.transitOperator
        }
        data.transportMode = {
            id: +values.transportMode
        }

        // console.log(data);

        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/product`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log(result);
            if (result.status === 202) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getProducts()
            }
        } catch (error) {
            console.log("Eror create product ===>>> ::: ", error);
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }
    }

    useEffect(() => {
        getProducts()
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
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Product</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmit}>
                    <CForm className="row g-3">

                        <CCol xs={12}>
                            <CFormInput id="productName" name="productName" label="Name" placeholder=""
                                defaultValue={formControl.data?.productName} />
                        </CCol>

                        <CCol xs={12}>
                            <CFormInput id="price" name="price" label="Price" placeholder=""
                                defaultValue={formControl.data?.price} />
                        </CCol>

                        <CCol xs={12}>
                            <CFormInput id="validIn" name="validIn" label="Valid in" placeholder=""
                                defaultValue={formControl.data?.validIn} />
                        </CCol>

                        <CFormSelect
                            aria-label="Default select example"
                            label='Transit Operator'
                            name='transitOperator'
                            options={transitOperator.map((item) => {
                                return { label: item.operatorName, value: item.id }
                            })}
                        />

                        <CFormSelect
                            aria-label="Default select example"
                            label='Transit Mode'
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

            <div style={{ marginBottom: 12 }}>
                <CButton className="custom-button" color="primary" onClick={() => setFormControl({ open: true, title: 'Add', data: null })}>Add</CButton>
            </div>

            <CTable hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        {/* <CTableHeaderCell scope="col">Id</CTableHeaderCell> */}
                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Operator</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Transport</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Validity Time</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Price</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {products
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((item, i) => (
                            <CTableRow key={i}>
                                <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                {/* <CTableDataCell>{item.id}</CTableDataCell> */}
                                <CTableDataCell>{item.productName}</CTableDataCell>
                                <CTableDataCell>{item.transitOperator.transitOperator}</CTableDataCell>
                                <CTableDataCell>{item.transportMode.transportMode}</CTableDataCell>
                                <CTableDataCell>{item.validIn} day</CTableDataCell>
                                <CTableDataCell>${item.price}</CTableDataCell>
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

export default Product