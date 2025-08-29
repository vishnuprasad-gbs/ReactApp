import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
export default function useAuth() {
    const [user,setUser]=useState(null);
    useEffect(()=>{
        const savedUser=Cookies.get('user');
        if(savedUser){
            try{
                setUser(JSON.parse(savedUser));
            }catch{
                setUser(null);
            }
        }
    },[])
  return user;
}

