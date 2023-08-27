import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";
import News from "./News.jsx"

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displaym, setDisplay] = useState('hidden');
  const [mail,setMail]=useState(' ');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
  async function handleSubmit(ev)
  {
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login';
    const {data} = await axios.post(url, {username,password});
    setLoggedInUsername(username);
    setId(data.id);
  }
  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-15 h-15 text-blue-500 mx-24 mb-5">
        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
        <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
      </svg>
      <h1 className="text-blue-500 font-bold text-3xl  mx-5 my-5  absolute left-0 top-0 ">Translingo</h1>
      <div className="flex space-x-5  mx-5 my-5  absolute right-0 top-0 ">
      <a className="text-blue-500 font text-l cursor-pointer">Docs</a>
      <a className="text-blue-500 font text-l cursor-pointer">Help</a>
      <a className="text-blue-500 font text-l cursor-pointer ">Support</a>
      </div>
        <input value={username}
               onChange={ev => setUsername(ev.target.value)}
               type="text" placeholder="username"
               className="block w-full rounded-sm p-2 mb-2 border" />
        <input value={password}
               onChange={ev => setPassword(ev.target.value)}
               type="password"
               placeholder="password"
               className="block w-full rounded-sm p-2 mb-2 border" />

        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button className="ml-1 underline text-blue-600" onClick={() =>{ setIsLoginOrRegister('login');setDisplay('hidden')}}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === 'login'&& (
            <div>
              Dont have an account?
              <button className="ml-1 underline text-blue-600" onClick={() =>{ setIsLoginOrRegister('register');setDisplay('block')}}>
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}