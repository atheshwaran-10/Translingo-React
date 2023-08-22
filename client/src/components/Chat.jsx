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
  const divUnderMessage=useRef();
  const translated=useRef();

  useEffect(()=>{
    ConnectToWs();
  },[]);

  function ConnectToWs(){
    const ws=new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message',handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(()=>{
        ConnectToWs();
      },1000);
    })
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
    }else if('text' in message){
       setMessages((prev) => [...prev, { ...message, translated: false }]);
    }
  }
  const translateMessage = async (message) => 
  {
  console.log(message.text)
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
    console.log(message)
    
  }
  };
  function logout(){
    axios.post('/logout').then(()=>{
      setWs(null);
      setUsername(null);
      setId(null);
    })
    
  }

  function sendMessage(ev) {
    ev.preventDefault();
    if (!selectedUser || !newMessage.trim()) {
      return;
    }
  
    const newMessageObj = {
      text: newMessage,
      sender: id,
      recipent: selectedUser,
      _id: Date.now(),
      translated: false,
    };
  
    ws.send(JSON.stringify(newMessageObj)); 
  
    setNewMessage('');
    setMessages((prev) => [...prev, newMessageObj]); 
  }

  useEffect(()=>{
    const div=divUnderMessage.current;
    if(div)
    {
      div.scrollIntoView({behavior:'smooth',block:'end'});
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
        console.log(res.data)
        setMessages(res.data);
      })
    }
  },[selectedUser])
 
  const onlinePeopleExcludeMe={...OnlineUsers}

  delete onlinePeopleExcludeMe[id];

  const messagesWithSet=uniqBy(messages,'_id');


  return (
    <div className="flex h-screen">
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
      <div  className="flex flex-col bg-blue-50 w-2/3 p-2">
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
                  className="bg-white flex-grow bordeer p-2 rounded"></input>
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