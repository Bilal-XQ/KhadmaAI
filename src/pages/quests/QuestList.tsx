
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
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
import { Search, Loader2 } from "lucide-react";
import { getQuests, Quest, getUserQuests, UserQuest, startQuest } from "@/services/databaseService";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const QuestList = () => {
  const { t } = useTranslation("common");
  const { currentUser } = useAuth();
  
  const [quests, setQuests] = useState<Quest[]>([]);
  const [userQuests, setUserQuests] = useState<UserQuest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Load quests from database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all quests
        const questsData = await getQuests();
        setQuests(questsData);
        
        // Fetch user's quests
        if (currentUser) {
          const userQuestsData = await getUserQuests(currentUser);
          setUserQuests(userQuestsData);
        }
      } catch (error) {
        console.error("Error fetching quests:", error);
        toast({
          title: "Error",
          description: "Failed to load quests. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  // Check if the user has started a quest
  const getUserQuestStatus = (questId: string) => {
    const userQuest = userQuests.find(uq => uq.quest_id === questId);
    return userQuest ? userQuest.status : null;
  };
  
  // Handle starting a quest
  const handleStartQuest = async (questId: string) => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const result = await startQuest(currentUser, questId);
      
      if (result) {
        // Update local state
        setUserQuests(prev => [...prev, result]);
        
        toast({
          title: "Quest Started",
          description: "Good luck on your new quest!"
        });
      }
    } catch (error) {
      console.error("Error starting quest:", error);
      toast({
        title: "Error",
        description: "Failed to start the quest. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter quests based on user input
  const filteredQuests = quests.filter(quest => {
    // Apply search filter
    const matchesSearch = 
      quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = 
      categoryFilter === "all" || quest.category === categoryFilter;
    
    // Apply difficulty filter
    const matchesDifficulty = 
      difficultyFilter === "all" || quest.difficulty === difficultyFilter;
    
    // Apply status filter
    const questStatus = getUserQuestStatus(quest.id);
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "completed" && questStatus === "completed") || 
      (statusFilter === "in_progress" && (questStatus === "started" || questStatus === "in_progress")) ||
      (statusFilter === "available" && !questStatus);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });
  
  // Get unique categories for filter
  const categories = [...new Set(quests.map(quest => quest.category))];
  
  // Get unique difficulties for filter
  const difficulties = [...new Set(quests.map(quest => quest.difficulty))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-khadma-darkBlue">
            {t("quests.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            Complete quests to develop your skills and unlock new opportunities.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search quests..."
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
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={difficultyFilter}
            onValueChange={(value) => setDifficultyFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
              ))}
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="available">Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-khadma-blue" />
        </div>
      )}

      {/* Quest Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => {
              const questStatus = getUserQuestStatus(quest.id);
              const isCompleted = questStatus === "completed";
              const isInProgress = questStatus === "started" || questStatus === "in_progress";
              
              return (
                <Card key={quest.id} className="hover:shadow-md transition-shadow overflow-hidden">
                  {quest.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={quest.image_url} 
                        alt={quest.title} 
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{quest.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="blue">{quest.difficulty}</Badge>
                      <Badge variant="lightBlue">{quest.category}</Badge>
                      {isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          {t("quests.completed")}
                        </Badge>
                      )}
                      {isInProgress && (
                        <Badge className="bg-amber-100 text-amber-800">
                          {t("quests.inProgress")}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{quest.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {quest.required_skills && quest.required_skills.map((skill, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    {questStatus ? (
                      <Link to={`/quests/${quest.id}`}>
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          className={`w-full ${
                            isCompleted
                              ? "border-green-500 text-green-600 hover:bg-green-50"
                              : "bg-khadma-blue hover:bg-khadma-blue/90"
                          }`}
                        >
                          {isCompleted
                            ? t("quests.review")
                            : t("quests.continue")}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => handleStartQuest(quest.id)}
                        className="w-full bg-khadma-blue hover:bg-khadma-blue/90"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {t("quests.start")}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No quests found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestList;
