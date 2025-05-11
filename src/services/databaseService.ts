
import { supabase } from "../integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Quest types
export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  required_skills: string[];
  image_url?: string;
  created_at: string;
  is_active: boolean;
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: 'started' | 'in_progress' | 'completed';
  progress: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  quest?: Quest;
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  category: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  required_skills: string[];
  status: 'open' | 'assigned' | 'completed';
  poster_id?: string;
  posted_date: string;
  deadline?: string;
  is_active: boolean;
}

export interface TaskApplication {
  id: string;
  task_id: string;
  applicant_id: string;
  status: 'applied' | 'accepted' | 'rejected' | 'completed';
  applied_at: string | null;
  updated_at: string | null;
  task?: {
    id: string;
    title: string;
    description: string;
    budget: string;
    category: string;
    required_skills: string[];
    status: 'open' | 'assigned' | 'completed'; // Explicitly define the allowed values here
    poster_id?: string;
    posted_date: string;
    deadline?: string;
    is_active: boolean;
  };
}

// Interview types
export interface InterviewSimulation {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  feedback?: Record<string, any>;
  created_at: string;
}

// Quest functions
export async function getQuests(): Promise<Quest[]> {
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quests:', error);
    return [];
  }

  return data;
}

export async function getUserQuests(user: User): Promise<UserQuest[]> {
  const { data, error } = await supabase
    .from('user_quests')
    .select(`
      *,
      quest:quests(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user quests:', error);
    return [];
  }

  // Ensure the status matches our defined types
  return data.map(item => ({
    ...item,
    status: item.status as 'started' | 'in_progress' | 'completed'
  }));
}

export async function startQuest(user: User, questId: string): Promise<UserQuest | null> {
  // Check if user has already started this quest
  const { data: existingUserQuests } = await supabase
    .from('user_quests')
    .select('*')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .maybeSingle();

  if (existingUserQuests) {
    return {
      ...existingUserQuests,
      status: existingUserQuests.status as 'started' | 'in_progress' | 'completed'
    };
  }

  // Start new quest
  const { data, error } = await supabase
    .from('user_quests')
    .insert({
      user_id: user.id,
      quest_id: questId,
      status: 'started',
      progress: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error starting quest:', error);
    return null;
  }

  return {
    ...data,
    status: data.status as 'started' | 'in_progress' | 'completed'
  };
}

export async function updateQuestProgress(
  userQuestId: string, 
  progress: number, 
  status: 'started' | 'in_progress' | 'completed'
): Promise<UserQuest | null> {
  const updates: Partial<UserQuest> = {
    progress,
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('user_quests')
    .update(updates)
    .eq('id', userQuestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating quest progress:', error);
    return null;
  }

  return {
    ...data,
    status: data.status as 'started' | 'in_progress' | 'completed'
  };
}

// Badge functions
export async function getUserBadges(user: User): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges(*)
    `)
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return data;
}

export async function awardBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
  // Check if user already has this badge
  const { data: existingBadge } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .maybeSingle();

  if (existingBadge) {
    return existingBadge;
  }

  // Award new badge
  const { data, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    return null;
  }

  return data;
}

// Task functions
export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('posted_date', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  // Ensure the status matches our defined types
  return data.map(item => ({
    ...item,
    status: item.status as 'open' | 'assigned' | 'completed'
  }));
}

export async function getUserTaskApplications(user: User): Promise<TaskApplication[]> {
  const { data, error } = await supabase
    .from('task_applications')
    .select(`
      *,
      task:tasks(*)
    `)
    .eq('applicant_id', user.id)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching task applications:', error);
    return [];
  }

  // Transform the data to match the TaskApplication interface
  return data.map(item => ({
    ...item,
    status: item.status as 'applied' | 'accepted' | 'rejected' | 'completed',
    task: item.task ? {
      ...item.task,
      status: item.task.status as 'open' | 'assigned' | 'completed', // Explicit type casting here
      required_skills: item.task.required_skills || []
    } : undefined
  }));
}

export async function applyForTask(userId: string, taskId: string): Promise<TaskApplication | null> {
  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('task_applications')
    .select('*')
    .eq('applicant_id', userId)
    .eq('task_id', taskId)
    .maybeSingle();

  if (existingApplication) {
    return {
      ...existingApplication,
      status: existingApplication.status as 'applied' | 'accepted' | 'rejected' | 'completed'
    };
  }

  // Create application
  const { data, error } = await supabase
    .from('task_applications')
    .insert({
      applicant_id: userId,
      task_id: taskId,
      status: 'applied'
    })
    .select()
    .single();

  if (error) {
    console.error('Error applying for task:', error);
    return null;
  }

  return {
    ...data,
    status: data.status as 'applied' | 'accepted' | 'rejected' | 'completed'
  };
}

// Interview functions
export async function saveInterviewSimulation(
  userId: string,
  question: string,
  answer: string,
  feedback?: Record<string, any>
): Promise<InterviewSimulation | null> {
  const { data, error } = await supabase
    .from('interview_simulations')
    .insert({
      user_id: userId,
      question,
      answer,
      feedback
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving interview simulation:', error);
    return null;
  }

  return {
    ...data,
    feedback: data.feedback as Record<string, any> || {}
  };
}

export async function getUserInterviewSimulations(user: User): Promise<InterviewSimulation[]> {
  const { data, error } = await supabase
    .from('interview_simulations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching interview simulations:', error);
    return [];
  }

  return data.map(item => ({
    ...item,
    feedback: item.feedback as Record<string, any> || {}
  }));
}
