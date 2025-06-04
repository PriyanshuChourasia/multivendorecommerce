"use client";
import { AlignLeft, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "../../configs/constants";
import Link from "next/link";
import ProfileIcon from '../../assets/svg/profile-icon';
import HeartIcon from "../../assets/svg/heart-icon";
import CartIcon from "../../assets/svg/cart-icon";



const HeaderBottom = () =>{

  const [show,setShow] = useState<boolean>(false);
  const [isSticky,setIsSticky] = useState<boolean>(false);

  // Track scroll position
  useEffect(()=>{
    const handleScroll = () =>{
      if(window.scrollY > 100){
        setIsSticky(true);
      }else{
        setIsSticky(false);
      }
    }

    window.addEventListener("scroll",handleScroll);
    return () => window.removeEventListener("scroll",handleScroll);
  },[]);

  return(
    <div className={`w-full transition-all duration-300 ${isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg":"relative"}`}>
      <div className={`w-[80%] relative m-auto flex items-center justify-between ${isSticky ? "pt-3" : "py-0"}`}>
        {/* All Dropdowns */}
        <div className={`w-[260px] ${isSticky && 'mb-2'} cursor-pointer flex items-center justify-between px-5 h-[50px] bg-[#3489ff]`}
          onClick={()=> setShow(!show)}>
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="font-medium text-white">All Departments</span>
          </div>
          <ChevronDown color="white"/>
        </div>

        {/* Dropdown Menu */}
        {
          show && (
            <div className={`absolute left-0 ${
            isSticky ? "top-[70px]" : "top-[50px]"} w-[260px] h-[400px] bg-red-500`}>

            </div>
          )
        }

        {/* Navigation Links */}
        <div className="flex items-center">
          {
            navItems.map((i:NavItemsTypes, index:number)=>(
              <Link href={i.href} key={index} className="px-5 text-lg font-medium">
                {i.title}
              </Link>
            ))
          }
        </div>

        <div>
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Link href={"/login"} className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]">
                    <ProfileIcon/>
                  </Link>
                </div>
                <Link href={"/login"}>
                  <span className="block font-medium">Hello,</span>
                  <span className="font-semibold">Sign In</span>
                </Link>
              </div>
              <div className="flex items-center gap-5">
                <Link href={'/whislist'} className="relative">
                  <HeartIcon/>
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-sm font-medium text-white">0</span>
                  </div>
                </Link>
                <Link href={'/cart'} className="relative">
                  <CartIcon/>
                  <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                    <span className="text-sm font-medium text-white">0</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


export default HeaderBottom;
