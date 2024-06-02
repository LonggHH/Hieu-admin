import {
    CAlert, CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
    CTooltip
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import { useNavigate } from "react-router-dom";
import moment from "moment";
import instanceAxios from "../../../configs/axiosConfig";

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }


function getIssueAndExpiryDate() {
    const now = moment();
    const expiryDate = moment(now).add(3, 'years');

    const issueDateFormatted = now.format('YYYY-MM-DDTHH:mm:ss[Z]');
    const expiryDateFormatted = expiryDate.format('YYYY-MM-DDTHH:mm:ss[Z]');

    return {
        issueDate: issueDateFormatted,
        expiryDate: expiryDateFormatted
    };
}


const customTooltipStyle = {
    '--cui-tooltip-bg': 'var(--cui-primary)',
}

const Account = () => {

    const navigate = useNavigate()

    const [alert, setAlert] = useState(defaultAlert)

    const [users, setUsers] = useState([])
    const [textSearchUser, setTextSearchUser] = useState("")
    const [account, setAccount] = useState([])
    const [transitOperator, setTransitOperator] = useState([])

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)
    const [fclUser, setFclkUser] = useState({ ...defaultForm, title: "Link" })

    const handleCloseModal = () => {
        setFormControl(defaultForm)
    }

    const handleCloseModalLinkUser = () => {
        setFclkUser(defaultForm)
    }

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
            // const result = await instanceAxios.get(`/api/v1/card`)
            const result = await instanceAxios.get(`${process.env.URL_BACKEND}/api/v1/card`)
            // console.log(result);
            const data = result.data
            setAccount(data)
            if (result.data.status === 200) {

            }
        } catch (error) {
            console.log(error);
            handleShowAlert({ open: true, message: `Error acocunt card loi`, color: "danger" })
        }
    }

    const handleClickEnquire = (data) => {
        // console.log(data);
        // setFormControl({ open: true, title: "Update", data })
        localStorage.setItem('serial_number', JSON.stringify(data.serialNumber))
        navigate("/report")
    }

    const getTransitOperators = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/location/transit_operator`)
            if (result.data.status === 200) {
                setTransitOperator(result.data.data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error tran`, color: "danger" })
        }
    }

    const getAllUser = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/users`)
            if (result.data.status === 200) {
                const data = result.data.data
                // const newData = data.filter(item => item.roles.includes("USER"))
                setUsers(data)
            }
        } catch (error) {
            // console.log("loi get all user: ", error);
            handleShowAlert({ open: true, message: `Error get user loi`, color: "danger" })
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        const time = getIssueAndExpiryDate()
        const data = { ...values, isBlocked: false, cardType: "EV1", issueDate: time.issueDate, expiryDate: time.expiryDate }
        data.transitOperator = {
            id: +values.transitOperator
        }

        // console.log(data);
        try {
            const result = await instanceAxios.post(`${process.env.URL_BACKEND}/api/v1/card`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            // console.log(result);
            if (result.data.status === 200) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getAccounts()
            }
        } catch (error) {
            // console.log(error);
            handleCloseModal()
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }
    }

    const handleOpenFCLUser = async (card) => {
        // console.log(data);
        try {
            const result = await instanceAxios.get(`${process.env.URL_BACKEND}/api/v1/card/findUsedBy/${card.serialNumber}`)
            // console.log(result);
            if (result.data.status === 200) {
                card.user = result.data.data
                // console.log(card);
                setFclkUser({ open: true, title: "Link User", data: card })
            }
        } catch (error) {
            console.log("Error get user card", error);
            // handleCloseModal()
            // handleShowAlert({ open: true, message: "Error get user card", color: "danger" })
        }
    }

    const handleLinkUser = async (userId) => {
        const data = {
            userId,
            serialNumber: fclUser.data.serialNumber
        }

        // console.log(data);

        try {
            const result = await instanceAxios.post(`${process.env.URL_BACKEND}/api/v1/users/linkAccount`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            // console.log(result);
            if (result.data.status === 200) {
                handleCloseModalLinkUser()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getAccounts()
            }
        } catch (error) {
            // console.log(error);
            handleCloseModalLinkUser()
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }

    }

    const handleUnLinkUser = async () => {

        const data = {
            userId: fclUser.data.user.id,
            serialNumber: fclUser.data.serialNumber
        }

        try {
            const result = await instanceAxios.post(`${process.env.URL_BACKEND}/api/v1/users/unlinkAccount`, JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            // console.log(result);
            if (result.data.status === 200) {
                handleCloseModalLinkUser()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getAccounts()
            }
        } catch (error) {
            // console.log(error);
            handleCloseModalLinkUser()
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }
    }

    const gotoCardHolder = () => {
        // console.log(fclUser.data.serialNumber);
        localStorage.setItem("serial_number", JSON.stringify(fclUser.data.serialNumber))
        navigate("/report")
    }

    useEffect(() => {
        getTransitOperators()
        getAccounts()
        getAllUser()
    }, [])

    // console.log(fclUser?.data?.user);
    // console.log(account);

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
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Card</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmit}>
                    <CForm className="row g-3">
                        {/* <CCol xs={12}>
                            <CFormInput id="modeName" name="modeName" label="Name" placeholder="Bus"
                                defaultValue={formControl.data?.modeName} />
                        </CCol> */}

                        <CFormSelect
                            aria-label="Default select example"
                            label='Transit Operator'
                            name='transitOperator'
                            defaultValue={formControl?.data?.transitOperator?.id}
                            options={transitOperator.map((item) => {
                                return { label: item.operatorName, value: item.id }
                            })}
                        />

                        <CCol xs={12}>
                            <CButton color="primary" type="submit">{formControl.title}</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <CModal
                scrollable
                visible={fclUser.open}
                onClose={handleCloseModalLinkUser}
                aria-labelledby="ScrollingLongContentExampleLabel2"
                backdrop="static"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Link user for {fclUser?.data?.serialNumber}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm className="row g-3">

                        {(fclUser.data?.user) &&

                            <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>

                                    <span>{`Card holder: ${(fclUser?.data?.user?.firstname || "") + " " + (fclUser?.data?.user?.lastname || "")}`}</span>

                                    <CButton color="danger"
                                        onClick={handleUnLinkUser}
                                    >Unlink</CButton>

                                </div>

                                <CButton color="primary"
                                    onClick={gotoCardHolder}
                                >Go to Card Holder</CButton>
                            </div>
                        }

                        {!(fclUser.data?.user) &&
                            <CFormInput
                                type="text"
                                id="userNameLink"
                                label={`Card holder: ${(fclUser?.data?.user?.firstname || "") + " " + (fclUser?.data?.user?.lastname || "")}`}
                                placeholder=""
                                text="Enter name user want link."
                                aria-describedby="exampleFormControlInputHelpInline"
                                onChange={(e) => setTextSearchUser(e.target.value)}
                            />
                        }


                        {!(fclUser.data?.user) &&
                            users
                                .filter((user) => (user.firstname + user.lastname).toLowerCase().includes(textSearchUser.toLowerCase()))
                                .splice(0, 6)
                                .map((user) => (
                                    <div key={user.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span>{user.firstname + " " + user.lastname}</span>
                                        <CIcon icon={icon.cilLink} size="xl" style={{ cursor: "pointer", color: "#1b9e3e" }}
                                            onClick={() => handleLinkUser(user.id)}
                                        />
                                    </div>
                                ))
                        }
                    </CForm>
                </CModalBody>
            </CModal>

            <div style={{ marginBottom: 12 }}>
                <CButton color="primary" onClick={() => setFormControl({ open: true, title: 'Add', data: null })}>Add card</CButton>
            </div>

            <CTable hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        {/* <CTableHeaderCell scope="col">Id</CTableHeaderCell> */}
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
                                    {/* <CTableDataCell>{item.id}</CTableDataCell> */}

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
                                    <CTableDataCell style={{ display: "flex", gap: 8 }}>
                                        <CTooltip
                                            content="Link account."
                                            placement="top"
                                            style={customTooltipStyle}
                                        >
                                            <CIcon icon={icon.cilLink} size="xl" style={{ cursor: "pointer", color: "#1b9e3e" }}
                                                onClick={() => handleOpenFCLUser(item)} />
                                        </CTooltip>

                                        <CIcon icon={icon.cilBrush} size='xl' style={{ cursor: "pointer", color: "#1b9e3e", }}
                                            onClick={() => handleClickEnquire(item)} />

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