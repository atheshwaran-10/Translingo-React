import { useContext, useEffect, useRef, useState } from "react"
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from './UserContext'
import {uniqBy} from 'lodash'
import axios from "axios";
import Contact from "./Contact";
export default function Chat()
{ 
  const [ws,setWs]=useState(null);
  const [OnlineUsers,setOnlineUsers]=useState({});
  const [offlineUsers,setofflineUsers]=useState({});
  const [selectedUser,setSelectedUser]=useState(null);
  const [newMessage,setNewMessage]=useState('');
  const [display,setDisplay]=useState(null);
  const [messages,setMessages]=useState([]);
  const {username,id,setUsername,setId}=useContext(UserContext)
  const [effect,setEffect]=useState(false);
  const divUnderMessage=useRef();
  const translated=useRef();

  useEffect(()=>{
    ConnectToWs();
  },[]);

  function ConnectToWs() {
    const ws = new WebSocket('wss://translingo.onrender.com');
  
    ws.addEventListener('open', () => {
      console.log('WebSocket connection is open');
    });
  
    ws.addEventListener('message', (event) => {
      handleMessage(event);
    });
  
    ws.addEventListener('close', () => {
      console.log('WebSocket connection is closed');
      setTimeout(() => {
        ConnectToWs(); 
      }, 1000);
    });
  
    setWs(ws);
  }
  function show(users){
    const set={};
    users.forEach(({userId,username}) => {
      set[userId]=username;
    });
    setOnlineUsers(set);
  }

  function handleMessage(e)
  {
    const message=JSON.parse(e.data);
    console.log({e,message})
    if('online' in message)
    {
      show(message.online)
    }
    else if('text' in message)
    {
       setMessages((prev) => [...prev, { ...message, translated: false }]);
    }
  }

  const translateMessage = async (message) => 
  {
    //console.log(message.text)
    const mess=message.text;
    if(!message.translated)
    {
      const {data}=await axios.post("translate",{mess});
      setMessages((prevMessages) =>
        prevMessages.map((prevMessage) =>
          prevMessage._id === message._id
            ? { ...prevMessage, translated: true, translatedText: data.translatedText }
            : prevMessage
        )
      );
    }
    else
    {
      setMessages((prevMessages) =>
      prevMessages.map((prevMessage) =>
        prevMessage._id === message._id
          ? { ...prevMessage, translated: false }
          : prevMessage
      )
      )
      //console.log(message)
    }
    setEffect(true);
    //console.log(effect);
  };

  function logout()
  {
    axios.post('/logout').then(()=>{
      setWs(null);
      setUsername(null);
      setId(null);
    })
  }

  function sendMessage(ev,file=null) 
  {
    if (ev) ev.preventDefault();
    //console.log(newMessage)
    const newMessageObj ={
      text: newMessage,
      sender: id,
      recipent: selectedUser,
      _id: Date.now(),
      translated: false,
      file,
    };
    ws.send(JSON.stringify(newMessageObj));
    if (file){
      axios.get('/messages/'+selectedUser).then(res => {
        setMessages(res.data);
      });
      setNewMessage('');
     
    }
    else{
      console.log(newMessage)
      setNewMessage('');
      setMessages((prev) => [...prev, newMessageObj]); 
    }
    
  
   
  }
  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null,{
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(()=>{
    const div=divUnderMessage.current;
    //console.log(effect)
    if(div && !effect)
    {
      div.scrollIntoView({behavior:'smooth',block:'end'});
    }
    else if(effect)
    {
      setEffect(false)
    }
  },[messages]);

  useEffect(()=>{
    axios.get("/people").then(res=>{
      const offlinePeopleArr=res.data
      .filter(p => p._id !== id)
      .filter(p => !Object.keys(OnlineUsers).includes(p._id));
      const offlinePeople={};
      offlinePeopleArr.forEach(p=>{
        offlinePeople[p._id]=p;
      })
      setofflineUsers(offlinePeople);
    })

  },[OnlineUsers])

  useEffect(()=>{
    if(selectedUser)
    {
      axios.get('/messages/'+selectedUser).then((res)=>{
        //console.log(res.data)
        setMessages(res.data);
      })
    }
  },[selectedUser])
 
  const onlinePeopleExcludeMe={...OnlineUsers}

  delete onlinePeopleExcludeMe[id];

  const messagesWithSet=uniqBy(messages,'_id');

  return (
    <div className="flex h-screen pb-15 mobile">
      <div className="bg-white-100 w-1/3 flex flex-col">
      <div className="flex-grow">
      <Logo/>
        {Object.keys(onlinePeopleExcludeMe).map(userId=>(
            <Contact
            key={userId}
            id={userId}
            online={true}
             username={onlinePeopleExcludeMe[userId]}
             onClick={()=> setSelectedUser(userId)}
             selected={userId === selectedUser}
             />
        ))}
        {Object.keys(offlineUsers).map(userId=>(
            <Contact
            key={userId}
            id={userId}
            online={false}
             username={offlineUsers[userId].username}
             onClick={()=> setSelectedUser(userId)}
             selected={userId === selectedUser}
             />
        ))}
      </div>
        <div className="p-2 text-center flex items-center justify-center">
        <span className="mr-2 text-sm text-gray-600 flex items-center">
          <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
        </svg>
        {username}
        </span>
        <button 
        className="text-sm py-1 px-2 border rounded-sm text-gray-500 bg-blue-100"
        onClick={logout}
        >
        logout
        </button>
        </div>
      </div>
      <div id="container" className="flex flex-col bg-blue-50 w-screen p-2">
        <div className="flex-grow">
          {!selectedUser && (
            <div className="flex flex-grow h-full items-center justify-center">
              <div className="text-gray-400">&larr; Select a Person</div>
            </div>
          )} 
          {!!selectedUser && (
            <div className='mb-4 h-full'>
              <div className='relative h-full'>
                <div  className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>
                  {messagesWithSet.map(message=>(
                    <div className={(message.sender===id ? "text-right": "text-left")}>
                        <div
                        onMouseOver={() => setDisplay(message._id)}
                        onMouseOut={()=> setDisplay(null)}
                        onClick={() => translateMessage(message)}
                        ref={translated}
                        className={"text-left inline-block cursor-pointer p-2 my-2 rounded-md text-sm "+(message.sender === id ? 'bg-blue-500 text-white' : "bg-white text-gray-500")}>
                        {message.translated ? message.translatedText : message.text}
                        {message.file && (
                        <div className="">
                          <a target="_blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL+'/uploads/'+ message.file}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
                            {message.file}
                          </a>
                        </div>
                      )}
                        </div>
                        
                    </div>
                    ))}
                    <div ref={divUnderMessage}> </div>
                </div>
              </div>
            </div>
           
            
          )}
        </div>
        {!!selectedUser && (
          <form className="flex gap-2" onSubmit={sendMessage}>
          <input  type="text" 
                  value={newMessage}
                  onChange={ev=>setNewMessage(ev.target.value)}
                  placeholder="Type your Message here"
                  className="bg-white flex-grow bordeer py-2 rounded"></input>
             <label className="bg-blue-200 py-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
              </svg>
            </label>
          <button className="bg-blue-500 p-2 text-white rounded">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        )}
       
      </div>
    </div>
  )
}