"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { AuthForm } from "@/components/auth/auth-form"
import { HabitTracker } from "@/components/habit-tracker"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const [showAuthForm, setShowAuthForm] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthForm(true)
    } else {
      setShowAuthForm(false)
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (showAuthForm) {
    return <AuthForm onAuthSuccess={() => setShowAuthForm(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with logout */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">Habit Tracker</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <HabitTracker />
    </div>
  )
}
