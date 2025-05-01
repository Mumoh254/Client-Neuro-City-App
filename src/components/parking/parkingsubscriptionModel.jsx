


import React, { useEffect, useState } from 'react'

import { getUserNameFromToken } from '../handler/tokenDecoder'




export default function ParkingSubscriptionModel() {
    
// decde  token 
const [username , setUserName]  =  useState("")

useEffect(()=>{

const   userData  =  getUserNameFromToken()
if(userData) {
    setUserName(userData.Name)
}

},[])

  return (
    <div>
      <h1>
        Subscription  model
      </h1>
    </div>
  )
}
