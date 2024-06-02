import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'
import { Base64 } from 'js-base64';


const defaultAlert = { open: false, message: "", color: "primary" }

const Login = () => {

    const navigate = useNavigate()
    const [alert, setAlert] = useState(defaultAlert)

    const hanleShowAlert = (alert) => {
        setAlert(alert)
        setTimeout(() => {
            setAlert(defaultAlert)
        }, 2000)
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = {};
        for (let [name, value] of formData.entries()) {
            values[name] = value;
        }

        try {
            const result = await axios.post(`${process.env.URL_BACKEND}/api/v1/auth/authenticate`, JSON.stringify(values), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            console.log("Login >>> :: ", result);
            if (result.data.status === 200) {
                // const checkUser = Base64.decode(result.data.data.access_token).includes("USER");
                const checkUser = atob(result.data.data.access_token.split(".")[1]).includes("USER");
                if (checkUser) {
                    hanleShowAlert({ open: true, message: `${error.response} :: Login not oke with USER !!!`, color: "danger" })
                    return
                }
                localStorage.setItem('account_admin', JSON.stringify(result.data.data))
                hanleShowAlert({ open: true, message: "Login oke", color: "primary" })
                navigate("/configglobal");
            }
        } catch (error) {
            console.log(error);
            hanleShowAlert({ open: true, message: `${error.response} :: Login not oke !!!`, color: "danger" })
        }
    }

    return (

        <>

            <CAlert color={alert.color} dismissible visible={alert.open} onClose={() => setAlert(defaultAlert)}>
                {alert.message}
            </CAlert>

            <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
                <CContainer>
                    <CRow className="justify-content-center">
                        <CCol md={8}>
                            <CCardGroup>
                                <CCard className="p-4">
                                    <CCardBody>
                                        <CForm onSubmit={onSubmit}>
                                            <h1>Login</h1>
                                            <p className="text-body-secondary">Sign In to your account</p>
                                            <CInputGroup className="mb-3">
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput placeholder="Email" autoComplete="email" name='email' />
                                            </CInputGroup>
                                            <CInputGroup className="mb-4">
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type="password"
                                                    placeholder="Password"
                                                    autoComplete="current-password"
                                                    name='password'
                                                />
                                            </CInputGroup>
                                            <CRow>
                                                <CCol xs={6}>
                                                    <CButton color="primary" className="px-4" type='submit'>
                                                        Login
                                                    </CButton>
                                                </CCol>
                                                <CCol xs={6} className="text-right">
                                                    <CButton color="link" className="px-0">
                                                        Forgot password?
                                                    </CButton>
                                                </CCol>
                                            </CRow>
                                        </CForm>
                                    </CCardBody>
                                </CCard>
                                <CCard className="text-white bg-primary py-5 chen-oto"
                                    style={{
                                        width: '44%',

                                    }}
                                >
                                    <CCardBody className="text-center">
                                        {/* <div>
                                            <h2 style={{ opacity: 0 }}>Sign up</h2>
                                            <p style={{ opacity: 0 }}>
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                                                tempor incididunt ut labore et dolore magna aliqua.
                                            </p>
                                            <Link to="/register">
                                                <CButton color="primary" className="mt-3" active tabIndex={-1}>
                                                    Register Now!
                                                </CButton>
                                            </Link>
                                        </div> */}
                                    </CCardBody>
                                </CCard>
                            </CCardGroup>
                        </CCol>
                    </CRow>
                </CContainer>
            </div>

        </>

    )
}

export default Login
