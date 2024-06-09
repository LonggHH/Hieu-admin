import {
    CAlert, CButton, CCard, CCardHeader, CCol, CForm, CFormInput, CFormSwitch,
    CListGroup, CListGroupItem, CModal, CModalBody,
    CModalHeader, CModalTitle
} from "@coreui/react"
import { useEffect, useState } from "react"
import axios from "axios"
import instanceAxios from "../../../configs/axiosConfig"
import * as icon from '@coreui/icons';

const defaultAlert = { open: false, message: "", color: "primary" }
const defaultForm = { open: false, title: 'Add', data: null }
const NAVIGATEPAGE = { NEXT: 'NEXT', PREVIOUS: 'PREVIOUS' }

const ConfigGlobal = () => {

    const [alert, setAlert] = useState(defaultAlert)
    const [configGlobal, setConfigGlobal] = useState({})

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

    const getConfigGlobal = async () => {
        try {
            const result = await axios.get(`${process.env.URL_BACKEND}/api/v1/configuration/globalConfig`,)
            if (result.data.status === 200) {
                const data = result.data.data
                setConfigGlobal(data)
            }
        } catch (error) {
            handleShowAlert({ open: true, message: `Error get `, color: "danger" })
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const values = { ...configGlobal };
        for (let [name, value] of formData.entries()) {
            values[name] = +value;
        }

        values.maxRemainingTicket = minutesToMilliseconds(values.maxRemainingTicket)
        values.antiPassBackTime = minutesToMilliseconds(values.antiPassBackTime)

        try {
            const result = await instanceAxios.post(`/api/v1/configuration/globalConfig`, JSON.stringify(values))
            console.log(result);
            if (result.data.status === 200) {
                handleCloseModal()
                handleShowAlert({ open: true, message: "Success", color: "primary" })
                getConfigGlobal()
            }
        } catch (error) {
            handleShowAlert({ open: true, message: "Error update global", color: "danger" })
        }
    }


    function millisecondsToMinutes(milliseconds) {
        const minutes = milliseconds / 60000;
        return minutes;
    }

    function minutesToMilliseconds(milliseconds) {
        const minutes = milliseconds * 60000;
        return minutes;
    }

    useEffect(() => {
        getConfigGlobal()
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
                backdrop="static"
                aria-labelledby="ScrollingLongContentExampleLabel2"
            >
                <CModalHeader>
                    <CModalTitle id="ScrollingLongContentExampleLabel2">Config Global</CModalTitle>
                </CModalHeader>
                <CModalBody onSubmit={onSubmit}>
                    <CForm className="row g-3">
                        <CCol xs={12}>
                            <CFormInput id="balanceWarningTarget" name="balanceWarningTarget" label="Balance Warning Target"
                                placeholder="$"
                                defaultValue={formControl.data?.balanceWarningTarget} />
                        </CCol>

                        <CCol xs={12}>
                            <CFormInput id="maxRemainingTicket" name="maxRemainingTicket" label="Max Remaining Ticket"
                                placeholder="minute"
                                defaultValue={millisecondsToMinutes(formControl.data?.maxRemainingTicket)} />
                        </CCol>

                        <CCol xs={12}>
                            <CFormInput id="acceptedListTargetBalance" name="acceptedListTargetBalance" label="Accepted List Target Balance"
                                placeholder="$"
                                defaultValue={formControl.data?.acceptedListTargetBalance} />
                        </CCol>

                        <CCol xs={12}>
                            <CFormInput id="antiPassBackTime" name="antiPassBackTime" label="Anti Pass Back Time"
                                placeholder="minute"
                                defaultValue={millisecondsToMinutes(formControl.data?.antiPassBackTime)} />
                        </CCol>

                        <CCol xs={12}>
                            <CFormSwitch id="samePrice" label="Checked switch checkbox input" defaultChecked={configGlobal?.samePrice}
                                onClick={() => setConfigGlobal(pre => ({ ...pre, samePrice: !pre.samePrice }))}
                            />
                        </CCol>

                        {
                            configGlobal?.samePrice &&
                            <CCol xs={12}>
                                <CFormInput id="samePriceValue" name="samePriceValue" label="Same Price Value"
                                    placeholder="$"
                                    defaultValue={formControl.data?.samePriceValue} />
                            </CCol>
                        }

                        <CCol xs={12}>
                            <CButton color="primary" type="submit">Submit</CButton>
                        </CCol>
                    </CForm>
                </CModalBody>
            </CModal>

            <div style={{ marginBottom: 12, display: 'flex', justifyContent: "center" }}>
                <CCard style={{ width: '24rem' }}>
                    <CCardHeader>Config Global</CCardHeader>
                    <CListGroup flush>
                        <CListGroupItem>Balance Warning Target: ${configGlobal?.balanceWarningTarget}</CListGroupItem>
                        <CListGroupItem>Max Remaining Ticket: {millisecondsToMinutes(configGlobal?.maxRemainingTicket)} minute</CListGroupItem>
                        <CListGroupItem>Accepted List Target Balance: ${configGlobal?.acceptedListTargetBalance}</CListGroupItem>
                        <CListGroupItem>Anti Pass Back Time: {millisecondsToMinutes(configGlobal?.antiPassBackTime)} minute</CListGroupItem>
                        {configGlobal?.samePrice && <CListGroupItem>Same Price Value: ${configGlobal?.samePriceValue}</CListGroupItem>}
                        <CListGroupItem style={{ display: "flex", justifyContent: "space-between" }}>
                            Same Price: {configGlobal?.samePrice ? "on" : "off"}
                        </CListGroupItem>
                    </CListGroup>
                </CCard>
            </div>

            <div style={{ marginBottom: 12, display: 'flex', justifyContent: "center" }}>
                <CButton className="custom-button" color="primary" onClick={() => setFormControl({ open: true, title: 'Update', data: configGlobal })}>Edit</CButton>
            </div>
        </>
    )
}

export default ConfigGlobal