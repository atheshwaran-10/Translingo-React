import axios from "axios";
import { UserContextProvider } from "./components/UserContext";
import Routes from "./components/Routes";

function App() {
  axios.defaults.baseURL = 'http://localhost:4000';
  axios.defaults.withCredentials = true;
  return (
    //if login not
    <UserContextProvider>  
      <Routes />
    </UserContextProvider>
  )
}

export default App