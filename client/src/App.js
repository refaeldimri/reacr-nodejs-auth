import './App.css';
import {useState, useEffect} from 'react'
import Axios from 'axios'

function App() {
    const [emailReg, setEmailReg] = useState('')
    const [passwordReg, setPasswordReg] = useState('')

    const [emailLogin, setEmailLogin] = useState('')
    const [passwordLogin, setPasswordLogin] = useState('')

    const [loginStatus, setLoginStatus] = useState(false)

    Axios.defaults.withCredentials = true;

    const register = () => {
        Axios.post("http://localhost:3001/register", {
            email: emailReg,
            password: passwordReg,
        }).then((response) => {
            console.log(response);
        });
    };
    
    const login = () => {
        Axios.post("http://localhost:3001/login", {
            email: emailLogin,
            password: passwordLogin
        }).then((response) => {
            console.log(response)
            if (!response.data.auth){
                setLoginStatus(false)
            }else{
                sessionStorage.setItem("token", response.data.token)
                localStorage.setItem("token", response.data.token)
                setLoginStatus(true)
            }
        });
    }

    const userAuth = () => {
        Axios.get("http://localhost:3001/isUserAuth",
            {headers:{
                "x-access-token": localStorage.getItem("token")
            }
        }).then((response) => {
            console.log(response)
        })
    }

    useEffect(() => {
        Axios.get("http://localhost:3001/login").then((response) => {
            if(response.data.loggedIn === true){
                setLoginStatus(response.data.user[0].email)
            }
        })
    }, [])

  return (
    <div className="App">
        <div className="registration">
            <h2>register</h2>
            <input type="email" placeholder="User name"
                   onChange = {e => {setEmailReg(e.target.value)}}/><br/>
            <input type="password" placeholder="password"
                   onChange = {e => {setPasswordReg(e.target.value)}}/><br/>
            <button onClick={register}>Register</button>
        </div>
        <div className="login">
            <h2>login</h2>
            <input type="email" placeholder="User name"
                   onChange = {e => {setEmailLogin(e.target.value)}}/><br/>
            <input type="password" placeholder="password"
                   onChange = {e => {setPasswordLogin(e.target.value)}}/><br/>
            <button onClick={login}>login</button>
        </div>
        {loginStatus && (
            <button onClick={userAuth}>check iff auth</button>
        )}
    </div>
  );
}

export default App;
