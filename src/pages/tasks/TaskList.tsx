
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  budget: string;
  category: string;
  requiredSkills: string[];
  status: "open" | "applied" | "completed";
  postedDate: string;
  deadline?: string;
}

const TaskList = () => {
  const { t } = useTranslation("common");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Mock data for demonstration
  useEffect(() => {
    const mockTasks: Task[] = [
      {
        id: "task1",
        title: "Build a Landing Page for E-commerce Store",
        description: "Create a responsive landing page for a new product launch. Must be mobile friendly and include product showcase, features section, and call-to-action.",
        budget: "$100-$200",
        category: "Web Development",
        requiredSkills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
        status: "open",
        postedDate: "2023-10-15",
        deadline: "2023-10-30",
      },
      {
        id: "task2",
        title: "Fix Authentication Bug in React Application",
        description: "Debug and fix issues with user authentication flow in a React application. The login page doesn't redirect properly after successful authentication.",
        budget: "$50-$100",
        category: "Debugging",
        requiredSkills: ["React", "Authentication", "Debugging"],
        status: "applied",
        postedDate: "2023-10-18",
      },
      {
        id: "task3",
        title: "Create Logo for Tech Startup",
        description: "Design a modern, professional logo for a tech startup in the AI space. Should convey innovation and trust.",
        budget: "$200-$500",
        category: "Design",
        requiredSkills: ["Graphic Design", "Logo Design", "Branding"],
        status: "open",
        postedDate: "2023-10-10",
        deadline: "2023-11-05",
      },
      {
        id: "task4",
        title: "Implement API Integration for Payment Gateway",
        description: "Integrate Stripe payment gateway into an existing e-commerce application. Must handle credit card payments and subscription management.",
        budget: "$150-$300",
        category: "Backend",
        requiredSkills: ["API Integration", "Payment Gateway", "Backend Development"],
        status: "open",
        postedDate: "2023-10-20",
      },
      {
        id: "task5",
        title: "Create Mobile App UI Design",
        description: "Design UI for a fitness tracking mobile application. Need screens for user dashboard, workout tracking, and profile.",
        budget: "$300-$600",
        category: "UI/UX Design",
        requiredSkills: ["UI Design", "Mobile Design", "Figma"],
        status: "open",
        postedDate: "2023-10-17",
        deadline: "2023-11-10",
      },
      {
        id: "task6",
        title: "Set Up CI/CD Pipeline",
        description: "Set up a CI/CD pipeline for a Node.js application using GitHub Actions or similar tool. Must include testing, building, and deployment stages.",
        budget: "$100-$200",
        category: "DevOps",
        requiredSkills: ["CI/CD", "DevOps", "GitHub Actions"],
        status: "completed",
        postedDate: "2023-10-05",
      },
    ];
    
    setTasks(mockTasks);
  }, []);
  
  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = 
      categoryFilter === "all" || task.category === categoryFilter;
    
    // Apply budget filter
    const matchesBudget = 
      budgetFilter === "all" || 
      (budgetFilter === "low" && task.budget.includes("$50-$100")) ||
      (budgetFilter === "medium" && (task.budget.includes("$100-$200") || task.budget.includes("$150-$300"))) ||
      (budgetFilter === "high" && (task.budget.includes("$200-$500") || task.budget.includes("$300-$600")));
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesBudget && matchesStatus;
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "applied":
        return "bg-amber-100 text-amber-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-khadma-darkPurple">
            {t("tasks.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            Find and apply for tasks that match your skills.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Debugging">Debugging</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              <SelectItem value="Backend">Backend</SelectItem>
              <SelectItem value="DevOps">DevOps</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={budgetFilter}
            onValueChange={(value) => setBudgetFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              <SelectItem value="low">$50-$100</SelectItem>
              <SelectItem value="medium">$100-$300</SelectItem>
              <SelectItem value="high">$300+</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <div className="flex flex-wrap justify-between items-center mt-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-primary">{task.category}</span>
                    <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {task.budget}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{task.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {task.requiredSkills.map((skill, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <div>Posted: {task.postedDate}</div>
                  {task.deadline && <div>Deadline: {task.deadline}</div>}
                </div>

                <Link to={`/tasks/${task.id}`}>
                  <Button
                    variant={
                      task.status === "applied" || task.status === "completed"
                        ? "outline"
                        : "default"
                    }
                    className={`w-full ${
                      task.status === "applied"
                        ? "border-amber-500 text-amber-600 hover:bg-amber-50"
                        : task.status === "completed"
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : "bg-khadma-purple hover:bg-khadma-purple/90"
                    }`}
                    disabled={task.status === "completed"}
                  >
                    {task.status === "applied"
                      ? t("tasks.submit")
                      : task.status === "completed"
                      ? t("tasks.applied")
                      : t("tasks.apply")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No tasks found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
