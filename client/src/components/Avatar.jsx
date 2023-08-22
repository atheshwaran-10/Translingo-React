export default function Avatar({userId,username,online}){
  const colors=['bg-red-200','bg-green-200','bg-purple-200','bg-blue-200','bg-yellow-200','bg-pink-200','bg-teal-200'];

  const curr=colors[(parseInt(userId,16))%colors.length];
  return(
    <div className={"w-8 h-8 relative rounded-full flex items-center "+curr}>
    <div className=" text-center w-full opacity-70">  {username[0]}</div>
    
      <div className={"absolute w-3 h-3 bottom-0 right-0 rounded-full border border-white "+ (online ? "bg-green-400" : "bg-gray-400 ")}></div>
    
    
   
    </div>
  )
}