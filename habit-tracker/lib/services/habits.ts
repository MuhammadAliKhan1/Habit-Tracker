import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/types"

type Habit = Database['public']['Tables']['habits']['Row']
type HabitInsert = Database['public']['Tables']['habits']['Insert']
type HabitUpdate = Database['public']['Tables']['habits']['Update']
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']

export interface HabitWithCompletion extends Habit {
  completedToday: boolean
  lastCompleted?: string
}

export class HabitService {
  private supabase = createClient()

  async getHabits(): Promise<HabitWithCompletion[]> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data: habits, error } = await this.supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch habits: ${error.message}`)
    }

    // Get today's completions
    const today = new Date().toISOString().split('T')[0]
    const { data: completions } = await this.supabase
      .from('habit_completions')
      .select('habit_id, completed_at')
      .eq('user_id', user.id)
      .eq('date', today)

    const completionMap = new Map(
      completions?.map(c => [c.habit_id, c.completed_at]) || []
    )

    return habits.map(habit => ({
      ...habit,
      completedToday: completionMap.has(habit.id),
      lastCompleted: completionMap.get(habit.id) || undefined
    }))
  }

  async createHabit(habit: Omit<HabitInsert, 'user_id'>): Promise<Habit> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('habits')
      .insert({
        ...habit,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create habit: ${error.message}`)
    }

    return data
  }

  async updateHabit(id: string, updates: HabitUpdate): Promise<Habit> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await this.supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update habit: ${error.message}`)
    }

    return data
  }

  async deleteHabit(id: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await this.supabase
      .from('habits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Failed to delete habit: ${error.message}`)
    }
  }

  async toggleHabitCompletion(habitId: string): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if habit is completed today
    const { data: existingCompletion } = await this.supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (existingCompletion) {
      // Remove completion
      const { error } = await this.supabase
        .from('habit_completions')
        .delete()
        .eq('id', existingCompletion.id)

      if (error) {
        throw new Error(`Failed to remove completion: ${error.message}`)
      }

      // Update streak
      await this.updateHabitStreak(habitId, false)
    } else {
      // Add completion
      const { error } = await this.supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          date: today
        })

      if (error) {
        throw new Error(`Failed to add completion: ${error.message}`)
      }

      // Update streak
      await this.updateHabitStreak(habitId, true)
    }
  }

  private async updateHabitStreak(habitId: string, completed: boolean): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get current habit
    const { data: habit } = await this.supabase
      .from('habits')
      .select('streak')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single()

    if (!habit) return

    const newStreak = completed 
      ? habit.streak + 1 
      : Math.max(0, habit.streak - 1)

    await this.updateHabit(habitId, { streak: newStreak })
  }
}

export const habitService = new HabitService()
