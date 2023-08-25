import axios from "axios";
import { UserContextProvider } from "./components/UserContext";
import Routes from "./components/Routes";

function App() {
  axios.defaults.baseURL = 'https://master--transcendent-cupcake-4a1867.netlify.app';
  axios.defaults.withCredentials = true;
  return (
    //if login not
    <UserContextProvider>  
      <Routes />
    </UserContextProvider>
  )
}

export default App