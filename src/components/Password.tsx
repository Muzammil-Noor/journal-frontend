"use client"

import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookLock, Delete, Eye, EyeOff, Loader2, LockOpen } from "lucide-react"
import { loginUser } from "@/features/auth"
import { cn } from "@/lib/utils"
import bcrypt from 'bcryptjs'

const PIN_LENGTH = 6

export default function PinEntry() {
  const [pin, setPin] = useState<string>("")
  const [showPin, setShowPin] = useState<boolean>(false)
  const [displayError, setError] = useState<string>("")
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoggedin, pinError, isLoading } = useAppSelector((state) => state.auth);
  useEffect(() => {
    if (isLoggedin) {
      navigate('/');
    }
  }, [isLoggedin, navigate]);
  useEffect(() => {
    if (pinError) {
      setError(pinError)
    }
  }, [pinError]);

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
    setError("")
    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + number)
    }
  }

  const handleDelete = () => {
    setError("")
    setPin((prev) => prev.slice(0, -1))
  }

  const handleEnter = async () => {
    if (isLoading) return
    if (pin.length === PIN_LENGTH) {
      try {
        const pinHash = await bcrypt.hash(pin, 10)
        const result = await dispatch(loginUser({ pin: pinHash }));
        if (loginUser.rejected.match(result)) {
          setError(result.payload?.message || "Incorrect PIN")
        }
        setPin("")
      }
      catch {
        setError("Something went wrong. Please try again.")
      }
    } else {
      setError(`Please enter a ${PIN_LENGTH}-digit PIN`)
    }
  }

  const togglePinVisibility = () => {
    setShowPin(!showPin)
  }

  return (
    <div className="dark relative flex min-h-dvh items-center justify-center overflow-hidden bg-zinc-950 p-4">
      {/* soft top glow so the page doesn't read as a flat void */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_0%,rgba(148,148,180,0.12),transparent_60%)]"
      />

      <Card
        className="relative w-full max-w-sm gap-0 rounded-2xl border-border/60 bg-card/90 p-8 shadow-2xl shadow-black/60 backdrop-blur"
        tabIndex={0}
        aria-label="PIN entry pad"
      >
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-secondary/50 text-foreground">
            <BookLock className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-tight">Chaotic's Journal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your {PIN_LENGTH}-digit PIN to unlock</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            {Array(PIN_LENGTH)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex h-12 w-9 items-center justify-center rounded-lg border text-xl font-semibold text-foreground transition-all duration-150",
                    index < pin.length
                      ? "border-primary/50 bg-secondary/40"
                      : "border-border bg-transparent",
                    index === pin.length && "border-primary ring-2 ring-primary/20",
                  )}
                >
                  {pin[index] !== undefined ? (
                    showPin ? pin[index] : <span className="block h-2.5 w-2.5 rounded-full bg-foreground" />
                  ) : null}
                </div>
              ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={togglePinVisibility}
            aria-label={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </Button>
        </div>

        <div className="mt-3 mb-4 h-5 text-center" aria-live="polite">
          {displayError && <p className="text-sm text-red-400">{displayError}</p>}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((number) => (
            <Button
              key={number}
              variant="secondary"
              className="h-14 rounded-xl border border-transparent bg-secondary/60 text-xl font-medium hover:border-border hover:bg-secondary active:scale-95"
              onClick={() => handleNumberClick(number)}
            >
              {number}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="h-14 rounded-xl text-muted-foreground hover:bg-secondary/60 hover:text-foreground active:scale-95"
            onClick={handleDelete}
            aria-label="Delete last digit"
          >
            <Delete className="size-5" />
          </Button>
          <Button
            variant="secondary"
            className="h-14 rounded-xl border border-transparent bg-secondary/60 text-xl font-medium hover:border-border hover:bg-secondary active:scale-95"
            onClick={() => handleNumberClick(0)}
          >
            0
          </Button>
          <Button
            className={cn(
              "h-14 rounded-xl transition-all active:scale-95",
              pin.length === PIN_LENGTH
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-primary/15 text-primary/60 hover:bg-primary/25",
            )}
            onClick={handleEnter}
            disabled={isLoading}
            aria-label="Unlock journal"
          >
            {isLoading ? <Loader2 className="size-5 animate-spin" /> : <LockOpen className="size-5" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
