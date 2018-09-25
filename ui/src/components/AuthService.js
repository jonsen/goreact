import jwt from 'jsonwebtoken';

export default class AuthService {
    constructor(domain) {
        this.domain = domain || ''
        this.fetch = this.fetch.bind(this)
        this.login = this.login.bind(this)
        this.getProfile = this.getProfile.bind(this)
    }

    login(username, password) {
        // Get a token
        return this.fetch(`${this.domain}/api/login`, 'POST', JSON.stringify({body:{
                username,
                password
            }})
        ).then(res => {
            console.log("login res:",res);
            this.setToken(res.Body)
            return Promise.resolve(res);
        })
    }

    loggedIn() {
        // Checks if there is a saved token and it's still valid
        const token = this.getToken()
        return !!token && !this.isTokenExpired(token) // handwaiving here
    }

    isTokenExpired(token) {
        try {
            var decoded = jwt.decode(token, {complete: true, json: true});
            if (decoded.exp < Date.now() / 1000) {
                return true;
            }
            else
                return false;
        }
        catch (err) {
            console.log("isTokenExpired error", err);
            return false;
        }
    }

    setToken(idToken) {
        // Saves user token to localStorage
        localStorage.setItem('id_token', idToken)
    }

    getToken() {
        // Retrieves the user token from localStorage
        if ( localStorage.getItem('id_token') == "undefined" ) {
            localStorage.removeItem('id_token');
        }
        return localStorage.getItem('id_token')
    }

    logout() {
        // Clear user token and profile data from localStorage
        localStorage.removeItem('id_token');
    }

    getProfile() {
        return jwt.decode(this.getToken(), {complete: true, json: true});//decode(this.getToken());
    }


    fetch(url, method, body) {
        // performs api calls sending the required authentication headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'method': method,
            'body': body
        }
        console.log(headers)
        
        if (this.loggedIn()) {
            headers['Authorization'] = 'Bearer ' + this.getToken()
        }

        return fetch(url, headers)
            .then(this._checkStatus)
            .then(response => response.json())
    }

    _checkStatus(response) {
        // raises an error in case response status is not a success
        if (response.status >= 200 && response.status < 300) {
            return response
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    }
}
