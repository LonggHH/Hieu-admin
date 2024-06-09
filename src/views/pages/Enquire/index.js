import { cilArrowTop } from "@coreui/icons"
import CIcon from "@coreui/icons-react"
import {
    CAlert, CButton, CCol, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle,
    CForm,
    CFormInput,
    CFormSelect,
    CListGroup, CListGroupItem, CModal, CModalBody, CModalHeader, CModalTitle, CPagination, CPaginationItem, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CToast, CToastBody, CToastHeader, CToaster, CTooltip, CWidgetStatsA
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

const customTooltipStyle = {
    '--cui-tooltip-bg': 'var(--cui-primary)',
}

const Enquire = () => {

    const [enquire, setEnquire] = useState({});
    const [timeLine, setTimeLine] = useState([]);
    const [cardHolder, setCardHolder] = useState({});
    const [products, setProducts] = useState([])

    const [productForLinkCard, setProductForLinkCard] = useState([])

    const [alert, setAlert] = useState(defaultAlert);
    const [toast, addToast] = useState(0);
    const toaster = useRef();

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)
    const [formControlPLFC, setFormControlPLFC] = useState(defaultForm)

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

                const { inspections, validations } = result.data.data;
                const cartTime = [].concat(inspections, validations);

                let newCartTime = []
                for (let i = 0; i < cartTime.length; i++) {
                    if (cartTime[i].type == "VALIDATION") {
                        const { stopEnd, stopStart, ...data } = cartTime[i]
                        newCartTime.push({ stopStart, ...data })
                        newCartTime.push({ stopEnd, ...data })
                    } else {
                        newCartTime.push(cartTime[i])
                    }
                }
                newCartTime.sort((a, b) => new Date(b.transactionTimeStart) - new Date(a.transactionTimeStart));
                newCartTime = newCartTime.filter(el => el.transactionTimeEnd == el.transactionTimeStart)
                console.log(newCartTime);
                setEnquire(result.data.data);
                setTimeLine(newCartTime);
                setTotalPage(Math.ceil(newCartTime.length / pageSize));
            }
        } catch (error) {
            // console.log("error get enruire: ", error);
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const getProductUsedByCard = async () => {
        try {
            const result = await instanceAxios.get(`${process.env.URL_BACKEND}/api/v1/product/allProductUsedBy/${JSON.parse(localStorage.getItem('serial_number'))}`)
            // console.log(result);
            if (result.data.status === 200) {
                setProducts(result.data.data)
            }
        } catch (error) {
            console.log("error get enruire: ", error);
            handleShowAlert({ open: true, message: `Error get product used by card`, color: "danger" })
        }
    }

    const getProductForLinkCard = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/product`)
            if (result.data.status === 200) {
                const data = result.data.data
                setProductForLinkCard(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const getCardHolder = async () => {
        try {
            const result = await instanceAxios.get(`${process.env.URL_BACKEND}/api/v1/card/findUsedBy/${JSON.parse(localStorage.getItem('serial_number'))}`)
            // console.log(result);
            if (result.data.status === 200) {
                setCardHolder(result.data.data)
            }
        } catch (error) {
            console.log("error get enruire: ", error);
            handleShowAlert({ open: true, message: `Error get card holder`, color: "danger" })
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

    const handleCloseModal = () => {
        setFormControl(defaultForm)
        setFormControlPLFC(defaultForm)
    }

    const handleOpenModalRecharge = () => {
        setFormControl(pre => ({ ...pre, open: true }))
    }

    const submitModalRecharge = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        values.serialNumber = enquire.card.serialNumber;
        values.description = "Recharge from sale";
        values.transactionDate = moment().utc().add(7, 'hours').format('YYYY-MM-DDTHH:mm:ss[Z]');

        try {
            const result = await instanceAxios.post(`${process.env.URL_BACKEND}/api/v1/users/recharge`, JSON.stringify(values))
            // console.log(result);
            if (result.status === 200) {
                handleCloseModal()
                getEnquire()
            }
        } catch (error) {
            // console.log("Erorr Enquire Recharge ==>> :: ", error);
            handleShowAlert({ open: true, message: "Error Recharge", color: "danger" })
        }
    }

    const submitPLFC = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        values.productId = +values.productId

        values.serialNumber = enquire.card.serialNumber;
        values.transactionDate = moment().format('YYYY-MM-DDTHH:mm');

        try {
            const result = await instanceAxios.post(`${process.env.URL_BACKEND}/api/v1/users/productRegister`, JSON.stringify(values))
            if (result.data.status === 403) {
                handleCloseModal()
                handleShowAlert({ open: true, message: `${result.data.data}`, color: "danger" })
            }
            else if (result.data.status === 200) {
                handleCloseModal()
                getProductUsedByCard()
                handleShowAlert({ open: true, message: `Success`, color: "success" })
            }
        } catch (error) {
            // console.log("Erorr Enquire Recharge ==>> :: ", error);
            handleShowAlert({ open: true, message: "Error Recharge", color: "danger" })
        }
    }

    useEffect(() => {
        getEnquire()
        getCardHolder()
        getProductUsedByCard()
        getProductForLinkCard()
    }, [])

    // console.log(enquire);

    return (
        <>
            <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CModal
                scrollable
                visible={formControl.open}
                onClose={handleCloseModal}
                aria-labelledby="ScrollingLongContentExampleLabel2"
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Recharge</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={submitModalRecharge}>
                    <CForm className="row g-3">
                        {/* <CCol xs={12}>
                            <CFormInput id="modeName" name="modeName" label="Name" placeholder="Bus"
                                defaultValue={formControl.data?.modeName} />
                        </CCol> */}

                        <CFormInput
                            type="text"
                            id="amount"
                            name="amount"
                            label={`Input money`}
                            placeholder="$1000"
                            text=""
                            aria-describedby="exampleFormControlInputHelpInline"
                        // onChange={(e) => setTextSearchUser(e.target.value)}
                        />


                        <CCol xs={12}>
                            <CButton color="primary" type="submit">Recharge</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <CModal
                scrollable
                visible={formControlPLFC?.open}
                onClose={() => setFormControlPLFC(defaultAlert)}
                aria-labelledby="ScrollingLongContentExampleLabel2"
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Product</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={submitPLFC}>
                    <CForm className="row g-3">

                        <CFormSelect
                            aria-label="Default select example"
                            label='Product'
                            name='productId'
                            options={productForLinkCard.map((item) => {
                                return { label: item?.productName, value: item?.id }
                            })}
                        />

                        <CCol xs={12}>
                            <CButton color="primary" type="submit" className="custom-button">Add</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <CRow>
                <CCol sm={3}>
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
                            <CListGroupItem as="button">
                                Status: <span>{enquire?.card?.blocked ? "Blocked" : "Active"}</span>
                            </CListGroupItem>
                            <CListGroupItem as="button" >
                                Transit Operator: <span>{enquire?.card?.transitOperator?.operatorName}</span>
                            </CListGroupItem>
                            <CListGroupItem as="button" style={{ display: "flex", justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: "bold" }} >Balance: <span>${enquire?.card?.balance}</span></span>
                                <CButton color={"primary"} className="custom-button" onClick={() => handleOpenModalRecharge()}>Recharge</CButton>
                            </CListGroupItem>
                        </CListGroup>
                    </div>

                    {
                        cardHolder?.id &&
                        <div>
                            <h5 style={{ color: "grey", margin: "16px 0 8px 0" }}>Card holder</h5>
                            <CListGroup>
                                <CListGroupItem as="button" active>
                                    Name: {cardHolder?.firstname + " " + cardHolder.lastname}
                                </CListGroupItem>
                                <CListGroupItem as="button">Email: {cardHolder?.email}</CListGroupItem>
                                <CListGroupItem as="button">Date of Birth: {cardHolder?.dob ?? "17/07/2001"}</CListGroupItem>
                                <CListGroupItem as="button" >
                                    Status: <span>{cardHolder?.enabled ? "Active" : "Inactive"}</span>
                                </CListGroupItem>
                            </CListGroup>
                        </div>
                    }

                    {
                        products.length > 0 ?
                            <div>
                                <h5 style={{ color: "grey", margin: "16px 0 8px 0" }}>Products</h5>
                                {products.map((product) => {
                                    const expiredAt = new Date(product.expiredAt);
                                    const formattedExpiredDate = `${expiredAt.getDate().toString().padStart(2, '0')}/${(expiredAt.getMonth() + 1).toString().padStart(2, '0')}/${expiredAt.getFullYear()} ${expiredAt.getHours().toString().padStart(2, '0')}:${expiredAt.getMinutes().toString().padStart(2, '0')}`;
                                    const formattedStartedDate = `${(expiredAt.getDate() - product.validIn).toString().padStart(2, '0')}/${(expiredAt.getMonth() + 1).toString().padStart(2, '0')}/${expiredAt.getFullYear()} ${expiredAt.getHours().toString().padStart(2, '0')}:${expiredAt.getMinutes().toString().padStart(2, '0')}`;

                                    return (
                                        <CListGroup key={product.id}>
                                            <CListGroupItem as="button" active disabled>Name: {product.productName}</CListGroupItem>
                                            <CListGroupItem>Transit Operator: {product.transitOperator.operatorName}</CListGroupItem>
                                            <CListGroupItem>Transport Mode: {product.transportMode.modeName}</CListGroupItem>
                                            <CListGroupItem>Started At: {formattedStartedDate}</CListGroupItem>
                                            <CListGroupItem>Expired At: {formattedExpiredDate}</CListGroupItem>
                                        </CListGroup>
                                    );
                                })}
                            </div>
                            :
                            <CButton type="button" className="custom-button" style={{ margin: "12px 0" }} onClick={() => setFormControlPLFC({ open: true, title: "Product", data: null })} >Add product</CButton>
                    }


                </CCol>

                <CCol sm={9}>
                    <h4 style={{ color: "grey" }}>Travel Validity</h4>
                    <div>
                        <div>
                            <CTable hover>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell scope="col">Date</CTableHeaderCell>
                                        {/* <CTableHeaderCell scope="col">Referrence</CTableHeaderCell> */}
                                        <CTableHeaderCell scope="col">Description</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Validation</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Inspection Result</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Inspection Decision</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Line</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Transport Mode</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Transit Operator</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Location</CTableHeaderCell>
                                        <CTableHeaderCell scope="col">Fee</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {
                                        timeLine
                                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                            .map((item, i) => (
                                                <CTableRow>
                                                    <CTableHeaderCell>
                                                        {
                                                            item.type == "INSPECTION" ?
                                                                moment(item.transactionTimeStart).format('HH:mm:ss DD/MM/YYYY')
                                                                : item?.stopStart ? moment(item.transactionTimeStart).format('HH:mm:ss DD/MM/YYYY')
                                                                    : moment(item.transactionTimeEnd).format('HH:mm:ss DD/MM/YYYY')
                                                        }
                                                    </CTableHeaderCell>
                                                    {/* <CTableDataCell>{item.id}</CTableDataCell> */}
                                                    <CTableDataCell>{item.type === "INSPECTION" ? "Inspection" : "Tap"}</CTableDataCell>
                                                    <CTableDataCell>{item.type !== "INSPECTION" ? item.result : ""}</CTableDataCell>
                                                    <CTableDataCell></CTableDataCell>

                                                    <CTableDataCell>{item.type === "INSPECTION" ? item.result : ""}</CTableDataCell>
                                                    <CTableDataCell>{item.line.lineName}</CTableDataCell>
                                                    <CTableDataCell>{item.transportMode.modeName}</CTableDataCell>
                                                    <CTableDataCell>{item.transit.operatorName}</CTableDataCell>
                                                    <CTableDataCell>
                                                        {
                                                            item?.stopStart ? item?.stopStart?.stopName
                                                                : item?.stopEnd?.stopName
                                                        }
                                                    </CTableDataCell>
                                                    <CTableDataCell>${item.fee}</CTableDataCell>
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
            </CRow >
        </>
    )
}

export default Enquire