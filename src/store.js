import { legacy_createStore as createStore } from 'redux'

const initialState = {
    sidebarShow: true,
    theme: 'light',
    auth: null
}

const changeState = (state = initialState, { type, ...rest }) => {
    switch (type) {
        case 'set':
            return { ...state, ...rest }
        case 'set_auth':
            return { ...state, ...rest }
        default:
            return state
    }
}

const store = createStore(changeState)
export default store
