"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Flame, Target, Calendar, Trash2 } from "lucide-react"
import { habitService, type HabitWithCompletion } from "@/lib/services/habits"
import { useToast } from "@/hooks/use-toast"

export function HabitTracker() {
  const [habits, setHabits] = useState<HabitWithCompletion[]>([])
  const [newHabit, setNewHabit] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadHabits()
  }, [])

  const loadHabits = async () => {
    try {
      setLoading(true)
      const data = await habitService.getHabits()
      setHabits(data)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load habits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addHabit = async () => {
    if (!newHabit.trim()) return

    try {
      const habit = await habitService.createHabit({
        name: newHabit.trim(),
        description: null,
      })
      
      // Convert the returned habit to HabitWithCompletion format
      const habitWithCompletion: HabitWithCompletion = {
        ...habit,
        completedToday: false,
        lastCompleted: undefined
      }
      
      setHabits(prev => [habitWithCompletion, ...prev])
      setNewHabit("")
      
      toast({
        title: "Success",
        description: "Habit added successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add habit",
        variant: "destructive",
      })
    }
  }

  const deleteHabit = async (id: string) => {
    try {
      await habitService.deleteHabit(id)
      setHabits(prev => prev.filter(habit => habit.id !== id))
      
      toast({
        title: "Success",
        description: "Habit deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete habit",
        variant: "destructive",
      })
    }
  }

  const toggleHabit = async (id: string) => {
    try {
      await habitService.toggleHabitCompletion(id)
      
      // Update local state optimistically
      setHabits(prev => prev.map(habit => {
        if (habit.id === id) {
          const wasCompleted = habit.completedToday
          return {
            ...habit,
            completedToday: !wasCompleted,
            streak: !wasCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1),
            lastCompleted: !wasCompleted ? new Date().toISOString() : habit.lastCompleted,
          }
        }
        return habit
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update habit",
        variant: "destructive",
      })
    }
  }

  const completedToday = habits.filter(h => h.completedToday).length
  const totalHabits = habits.length

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Habit Tracker</h1>
            <p className="text-muted-foreground text-pretty">Build better habits, one day at a time</p>
          </div>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">Habit Tracker</h1>
          <p className="text-muted-foreground text-pretty">Build better habits, one day at a time</p>
        </div>

        {/* Progress Overview */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {completedToday}/{totalHabits}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-semibold text-primary">
                  {totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Habit */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Plus className="h-5 w-5" />
              Add New Habit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a new habit..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHabit()}
                className="flex-1 bg-input border-border focus:ring-ring"
              />
              <Button onClick={addHabit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Habit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Habits
          </h2>

          {habits.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No habits yet. Add your first habit above to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => (
                <Card
                  key={habit.id}
                  className={`bg-card border-border transition-all duration-200 ${
                    habit.completedToday ? "ring-2 ring-primary/20 bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={habit.completedToday}
                        onCheckedChange={() => toggleHabit(habit.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-medium text-card-foreground text-pretty ${
                            habit.completedToday ? "line-through opacity-75" : ""
                          }`}
                        >
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={habit.completedToday ? "default" : "secondary"}
                            className={
                              habit.completedToday
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }
                          >
                            {habit.completedToday ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-right">
                          <Flame
                            className={`h-4 w-4 ${habit.streak > 0 ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <span
                            className={`font-bold ${habit.streak > 0 ? "text-primary" : "text-muted-foreground"}`}
                          >
                            {habit.streak}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            day{habit.streak !== 1 ? "s" : ""}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHabit(habit.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
