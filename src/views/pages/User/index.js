import {
    CAlert, CButton, CCol, CForm, CFormInput, CFormSelect, CModal, CModalBody,
    CModalHeader, CModalTitle, CPagination, CPaginationItem, CTable,
    CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow,
    CToast,
    CToastBody,
    CToastHeader,
    CToaster
} from "@coreui/react"
import { useEffect, useRef, useState } from "react"
import CIcon from "@coreui/icons-react"
import * as icon from '@coreui/icons';
import instanceAxios from "../../../configs/axiosConfig";

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const REGEXEMAIl = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const User = () => {

    const [toast, addToast] = useState(0);
    const toaster = useRef();

    const [alert, setAlert] = useState(defaultAlert)
    const [users, setUsers] = useState([])

    const [totalPage, setTotalPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [formControl, setFormControl] = useState(defaultForm)
    const [roles, setRoles] = useState([])


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

    const handleCloseModal = () => {
        setFormControl({ ...defaultForm })
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

    const handleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
    }

    const getUsers = async () => {
        try {
            const result = await instanceAxios.get(`/api/v1/users`)
            if (result.data.status === 200) {
                const data = result.data.data
                // console.log("==>> :: ", data);
                setUsers(data)
                setTotalPage(Math.ceil(data.length / pageSize))
                setCurrentPage(1)
            }
        } catch (error) {
            console.log(error);
            handleShowAlert({ open: true, message: `Error`, color: "danger" })
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        const { firstname, lastname, email, password, cfpassword } = values;

        if (!REGEXEMAIl.test(email)) {
            addToast(exampleToast("Register", `Email invalite`, "#e55353"))
            return
        }
        if (password.length < 6) {
            addToast(exampleToast("Register", `Password invalite`, "#e55353"))
            return
        }
        if (password != cfpassword) {
            addToast(exampleToast("Register", `Confirm password`, "#e55353"))
            return
        }

        console.log({
            firstname, lastname, email, password, roles
        });

        try {
            const result = await instanceAxios.post(`/api/v1/auth/register`,
                JSON.stringify({
                    firstname, lastname, email, password, roles
                }))
            // console.log(result);
            if (result.status === 200) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getUsers()
            }
        } catch (error) {
            console.log(error);
            handleShowAlert({ open: true, message: "Error", color: "danger" })
        }
    }

    const handleChangeRoles = (value) => {
        console.log(value);

        const fakeRoles = [...roles];

        const index = roles.indexOf(value);

        if (index === -1) {
            fakeRoles.push(value)
            setRoles(fakeRoles)
        } else {
            fakeRoles.splice(index, 1)
            setRoles(fakeRoles)
        }
    }

    useEffect(() => {
        getUsers()
    }, [])

    return (
        <>

            <CToaster className="p-3" placement="top-end" push={toast} ref={toaster} />

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <CModal
                scrollable
                backdrop="static"
                visible={formControl.open}
                onClose={() => handleCloseModal}
                aria-labelledby="ScrollingLongContentExampleLabel2"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">User</CModalTitle>
                </CModalHeader>
                <CModalBody
                    onSubmit={onSubmit}
                >
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormInput id="firstname" name="firstname" label="First Name" placeholder="firstname"
                                defaultValue={formControl.data?.operatorName} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput id="lastname" name="lastname" label="Last Name" placeholder="lastname"
                                defaultValue={formControl.data?.operatorName} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput id="email" name="email" label="Email" placeholder="email"
                                defaultValue={formControl.data?.operatorName} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput id="password" name="password" label="Password" placeholder="password" type="password"
                                defaultValue={formControl.data?.operatorName} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormInput id="cfpassword" name="cfpassword" label="Confirm Password" placeholder="confirm password" type="password"
                                defaultValue={formControl.data?.operatorName} />
                        </CCol>
                        <CCol xs={12}>
                            <CFormSelect size="lg" multiple aria-label="Multiple select example" label="Roles">
                                <option onClick={() => handleChangeRoles("MAINTAINER")} value="MAINTAINER">MAINTAINER</option>
                                <option onClick={() => handleChangeRoles("SALE_DRIVER")} value="SALE_DRIVER">SALE DRIVER</option>
                                <option onClick={() => handleChangeRoles("INSPECTOR")} value="INSPECTOR">INSPECTOR</option>
                                <option onClick={() => handleChangeRoles("ADMIN")} value="ADMIN">ADMIN</option>
                            </CFormSelect>
                        </CCol>

                        <CCol xs={12}>
                            <CButton color="primary" type="submit">Create</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <div style={{ marginBottom: 12, display: "flex", justifyContent: "end" }}>
                <CButton color="primary" onClick={() => setFormControl({ open: true, title: 'Add', data: null })}>Create</CButton>
            </div>

            <CTable hover>
                <CTableHead>
                    <CTableRow>
                        <CTableHeaderCell scope="col">#</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Date of Birth</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Role</CTableHeaderCell>
                        <CTableHeaderCell scope="col">User Name</CTableHeaderCell>
                        <CTableHeaderCell scope="col">Action</CTableHeaderCell>
                    </CTableRow>
                </CTableHead>
                <CTableBody>
                    {users
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((item, i) => (
                            <CTableRow key={i}>
                                <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                                <CTableDataCell>{item.firstname + " " + item.lastname}</CTableDataCell>
                                <CTableDataCell>{item.email}</CTableDataCell>
                                <CTableDataCell>{item.dob}</CTableDataCell>
                                <CTableDataCell>
                                    <span style={{ display: "flex", gap: 8 }}>
                                        {item.role}
                                    </span>
                                </CTableDataCell>
                                <CTableDataCell>{item.username}</CTableDataCell>

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

export default User