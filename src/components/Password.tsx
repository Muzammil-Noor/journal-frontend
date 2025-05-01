"use client"

import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import {loginUser} from "@/features/auth"

export default function PinEntry() {
  const [pin, setPin] = useState<string>("")
  const [showPin, setShowPin] = useState<boolean>(false)
  const [displayError, setError] = useState<string>("")
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error, isLoggedin} = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isLoggedin) {
      navigate('/');
    }
  }, [isLoggedin, navigate]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        handleNumberClick(Number.parseInt(e.key, 10))
      }
      else if (e.key === "Enter") {
        handleEnter()
      }
      else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [pin])

  const handleNumberClick = (number: number) => {
    if (pin.length < 6) {
      setPin((prev) => prev + number)
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }

  const handleEnter = () => {
    if (pin.length === 6) {
      try{
        dispatch(loginUser({ pin }));
        setPin("")
      }
      catch(error:any){
        setError(error)
      }
    } else {
      setError("Please enter a 6-digit PIN")
    }
  }

  const togglePinVisibility = () => {
    setShowPin(!showPin)
  }

  return (
    <div className="dark flex justify-center items-center h-dvh">
      <Card className="p-6 shadow-2xl shadow-blue-400/50 border border-gray-400" tabIndex={0} aria-label="PIN entry pad">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-2">
            <div className="flex gap-2 items-center">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="w-10 h-12 border-2 text-gray-300 border-gray-600 rounded-md flex items-center justify-center text-xl font-bold"
                  >
                    {pin[index] !== undefined ? (showPin ? pin[index] : "•") : null}
                  </div>
                ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={togglePinVisibility}
              aria-label={showPin ? "Hide PIN" : "Show PIN"}
            >
              {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {error &&(
          <div className="flex justify-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {[7,8,9,4,5,6,1,2,3,0].map((number) => (
            <Button
              key={number}
              className="h-14 text-xl font-medium text-gray-400 bg-black border border-gray-500 hover:bg-transparent hover:border-blue-700 hover:text-blue-500 hover:font-black"
              onClick={() => handleNumberClick(number)}
            >
              {number}
            </Button>
          ))}
          <Button className="dark bg-transparent text-red-500 border border-rose-500 hover:bg-transparent hover:font-black h-14" onClick={handleDelete}>
            Delete
          </Button>
          <Button className="dark bg-transparent text-green-500 border border-green-500 hover:bg-transparent hover:font-black h-14" onClick={handleEnter}>
            Enter
          </Button>
        </div>
      </Card>
    </div>
  )
}
