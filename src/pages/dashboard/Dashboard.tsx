
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Star, Badge as BadgeIcon, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium text-khadma-darkBlue flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-khadma-blue">
        {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : value}
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { t } = useTranslation("common");
  const { currentUser, profile } = useAuth();
  
  const [userQuests, setUserQuests] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  // Load user data if user is logged in
  useEffect(() => {
    if (currentUser) {
      setProfileCompletion(60); // Demo value for profile completion
    }
  }, [currentUser]);

  // For demo purposes without login
  const demoQuests = [
    { 
      id: 'quest1', 
      title: 'Learn React Basics', 
      difficulty: 'Beginner', 
      required_skills: ['JavaScript', 'HTML'],
      description: 'Get started with React fundamentals'
    },
    { 
      id: 'quest2', 
      title: 'Build a Portfolio', 
      difficulty: 'Intermediate', 
      required_skills: ['React', 'CSS'],
      description: 'Create your professional portfolio website'
    },
    { 
      id: 'quest3', 
      title: 'Contribute to Open Source', 
      difficulty: 'Advanced', 
      required_skills: ['Git', 'JavaScript'],
      description: 'Make your first open source contribution'
    }
  ];

  const demoTasks = [
    {
      id: 'task1',
      task: {
        id: 'task1',
        title: 'Frontend Bug Fix',
        category: 'Development',
        budget: '$50',
        description: 'Fix a responsive design issue in the navigation menu'
      },
      status: 'applied'
    },
    {
      id: 'task2',
      task: {
        id: 'task2',
        title: 'UI Design Review',
        category: 'Design',
        budget: '$75',
        description: 'Review and provide feedback on a new user interface design'
      },
      status: 'accepted'
    }
  ];

  const userName = profile?.full_name || currentUser?.email?.split('@')[0] || "Guest";
  const recommendedQuests = demoQuests;
  const matchedTasks = demoTasks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-khadma-darkBlue">
            {t("dashboard.welcome")}, {userName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your journey so far.
          </p>
        </div>
        <Link to="/profile">
          <Button className="mt-4 md:mt-0 bg-khadma-blue hover:bg-khadma-blue/90">
            {currentUser ? "Complete Your Profile" : "Create Profile"}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t("dashboard.stats.completedQuests")}
          value={currentUser ? userQuests.length || 0 : "Demo"}
          icon={<Star className="h-5 w-5 text-khadma-blue" />}
          isLoading={false}
        />
        
        <StatCard
          title={t("dashboard.stats.matchedTasks")}
          value={currentUser ? userTasks.length || 0 : "Demo"}
          icon={<LayoutDashboard className="h-5 w-5 text-khadma-blue" />}
          isLoading={false}
        />
        
        <StatCard
          title={t("dashboard.stats.earnedBadges")}
          value={currentUser ? userBadges.length || 0 : "Demo"}
          icon={<BadgeIcon className="h-5 w-5 text-khadma-blue" />}
          isLoading={false}
        />
      </div>

      {/* Profile Completion - only show if logged in */}
      {currentUser && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-khadma-darkBlue">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <div className="flex-1">
                <Progress value={profileCompletion} className="h-2 bg-blue-100" />
              </div>
              <span className="ml-4 font-medium text-gray-700">
                {profileCompletion}%
              </span>
            </div>
            {profileCompletion < 100 && (
              <p className="text-sm text-gray-600 mt-2">
                Complete your profile to get matched with more tasks.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!currentUser && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-khadma-darkBlue">Welcome to Demo Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You're viewing the dashboard in demo mode. Create an account or log in to track your progress.
            </p>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" className="border-khadma-blue text-khadma-blue hover:bg-khadma-blue hover:text-white">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-khadma-blue hover:bg-khadma-blue/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Quests */}
      <h2 className="text-2xl font-semibold text-khadma-darkBlue mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-khadma-blue" />
        {t("dashboard.recommendations")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {recommendedQuests && recommendedQuests.length > 0 ? (
          recommendedQuests.filter(Boolean).map((quest) => quest && (
            <Card key={quest.id} className="hover:shadow-md transition-shadow border-blue-100">
              <CardHeader>
                <CardTitle className="text-khadma-darkBlue">{quest.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="blue">{quest.difficulty}</Badge>
                  {quest.required_skills?.slice(0, 2).map((skill, index) => (
                    <Badge key={index} variant="lightBlue">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{quest.description}</p>
                <Link to={`/quests/${quest.id}`}>
                  <Button
                    variant="outline"
                    className="w-full border-khadma-blue text-khadma-blue hover:bg-khadma-blue hover:text-white"
                  >
                    {t("quests.continue")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No active quests found. Visit the Quests page to start your journey!</p>
            <Link to="/quests" className="mt-4 inline-block">
              <Button className="bg-khadma-blue hover:bg-khadma-blue/90">
                Browse Quests
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Matched Tasks */}
      <h2 className="text-2xl font-semibold text-khadma-darkBlue mb-4 flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-khadma-blue" />
        Matched Tasks
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {matchedTasks && matchedTasks.length > 0 ? (
          matchedTasks.filter(ta => ta.task).map((application) => application.task && (
            <Card key={application.id} className="hover:shadow-md transition-shadow border-blue-100">
              <CardHeader>
                <CardTitle className="text-khadma-darkBlue">{application.task.title}</CardTitle>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="blue">{application.task.category}</Badge>
                  <span className="text-sm font-medium text-green-600">
                    {application.task.budget}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{application.task.description}</p>
                <Link to={`/tasks/${application.task.id}`}>
                  <Button
                    variant={application.status !== 'applied' ? "outline" : "default"}
                    className={`w-full ${
                      application.status === 'accepted'
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : application.status === 'completed'
                        ? "border-blue-500 text-blue-600 hover:bg-blue-50"
                        : "bg-khadma-blue hover:bg-khadma-blue/90"
                    }`}
                  >
                    {application.status === 'applied'
                      ? t("tasks.view")
                      : application.status === 'accepted'
                      ? t("tasks.submit")
                      : t("tasks.completed")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No task matches found yet. Complete more quests to unlock tasks!</p>
            <Link to="/tasks" className="mt-4 inline-block">
              <Button className="bg-khadma-blue hover:bg-khadma-blue/90">
                Browse Tasks
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
