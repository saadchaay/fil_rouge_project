import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logo from "../../assets/images/logo-cyan.png";
import axios from "axios";
import React from "react";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import useAuth from "../../hooks/useAuth";

function Register() {
  const { setAuth } = useAuth();
  const [open, setOpen] = React.useState(false);
  const loginRef = useRef();
  const [login, setLogin] = useState("");
  const [pwd, setPwd] = useState("");
  const [errLogin, setErrLogin] = useState("");
  const [errPwd, setErrPwd] = useState("");
  const [errAll, setErrAll] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/super-dashboard";

  useEffect(() => {
    loginRef.current.focus();
  }, []);

  useEffect(() => {
    setErrLogin("");
    setErrPwd("");
    setErrAll("");
  }, [login, pwd]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = {
        login: login,
        password: pwd,
      };
      const res = await axios.post(
        "http://localhost/fil_rouge_project/app/server/auth/SuperAdminController/login",
        JSON.stringify(data),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(JSON.stringify(res?.data));
      if (res.status === 201) {
        setPwd("");
        setLogin("");
        console.log("ok");
        setAuth({ login, pwd, is_super: true });
        localStorage.setItem("auth", JSON.stringify(res?.data));
        localStorage.setItem("is_super", JSON.stringify(res.data.is_super));
        localStorage.setItem("time", new Date().getTime());
        navigate(from, { replace: true });
      } else {
        if (res.data.errors) {
          setErrLogin(res.data.errors.login);
          setErrPwd(res.data.errors.password);
          setErrAll(res.data.errors.login_password);
          if (res.data.errors.status) {
            setOpen(true);
          }
        }
        // console.log(open);
      }
    } catch (err) {
      if (err.res?.status === 404) {
        setErrAll("Username or password is incorrect");
      }
    }
  };
  
  console.log();

  return (      
    <>
    <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className="flex items-center justify-center"
        open={open}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <div className="w-full max-w-lg p-5 px-10 relative mx-auto my-auto rounded-xl shadow-lg bg-white">
            <div>
              <div className="flex justify-center items-center">
                <img src={logo} alt="logo" width={180} height={40} />
              </div>
              <div className="flex flex-col justify-center items-center mt-5">
                <h1 className="text-2xl font-bold text-center text-red-500">
                  Failed !
                </h1>
                <p className="mt-3 ">Your Account is not active yet.</p>
                <button className="mt-6 md:mb-0 bg-violet-600 border border-violet-600 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-full hover:shadow-lg hover:bg-violet-700">
                  <Link to="/">Back home</Link>
                </button>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
      <div className="flex flex-col items-center h-screen justify-center bg-white">
        
        <img src={logo} alt="logo" className="mb-10" width={200} height={100} />                              
        <div className="flex w-auto md:w-1/2 justify-center items-center bg-white mt-20 md:mt-0 shadow-xl rounded-xl px-5 py-10">
          
          <form
            className="flex flex-col justify-center items-center bg-white w-80 md:w-full"
            onSubmit={handleLogin}
          >
              <h1 className="font-bold text-gray-800 text-2xl mb-10">Admin Panel</h1>
            <div className="text-red-500 mb-3 text-md">
              {errAll ? errAll : null}
            </div>
            <div className="flex items-center border-2 py-3 px-3 rounded-sm mb-2 w-full md:w-3/4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              <input
                ref={loginRef}
                className="pl-2 outline-none border-none w-full"
                type="text"
                id="email"
                autoComplete="off"
                onChange={(e) => setLogin(e.target.value)}
                value={login}
                placeholder="Username"
              />
            </div>
            <div className="text-red-500 mb-3 text-sm">
              {errLogin ? errLogin : null}
            </div>

            <div className="flex items-center border-2 py-3 px-3 mb-2 rounded-sm w-full md:w-3/4">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                sd
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                className="pl-2 outline-none border-none w-full"
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                placeholder="Password"
              />
            </div>
            <div className="text-red-500 mb-3 text-sm">
              {errPwd ? errPwd : null}
            </div>

            <button
              type="submit"
              className="block w-full bg-sky-800 mt-4 py-2 rounded-sm text-white font-semibold w-2/3 md:w-1/4 hover:bg-sky-700"
            >
              Login
            </button>
            
          </form>
        </div>
      </div>
      </>
  );
}

export default Register;
