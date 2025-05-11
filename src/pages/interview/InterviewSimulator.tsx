
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface FeedbackResponse {
  score: number; // 1-10
  strengths: string[];
  areas_to_improve: string[];
  suggestions: string;
  overall_feedback: string;
}

const InterviewSimulator = () => {
  const { t } = useTranslation("common");
  const { currentUser } = useAuth();
  
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  
  // References for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Interview questions
  const interviewQuestions = [
    "Tell me about yourself and your experience in this field.",
    "What is your greatest professional achievement?",
    "How do you handle difficult situations or conflicts at work?",
    "Why do you want to work for our company?",
    "Where do you see yourself in 5 years?",
    "Tell me about a time you failed and what you learned from it.",
    "What are your strengths and weaknesses?",
    "How do you stay updated with industry trends?",
    "Describe a challenging project you worked on.",
    "What questions do you have for us?"
  ];
  
  // Get random question
  const getRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * interviewQuestions.length);
    setQuestion(interviewQuestions[randomIndex]);
    setAnswer("");
    setFeedback(null);
  };
  
  // Start voice recording
  const startRecording = async () => {
    try {
      // Reset previous recording data
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Use Speech-to-Text service (in a real app)
        // For now, we'll just use the answer from the text area
        // In a production app, you would send the audio to a speech-to-text service
        
        // Stop timer if it's running
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);
        
        // Automatically stop after 2 minutes
        if (seconds >= 120) {
          stopRecording();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Submit answer for feedback
  const submitAnswer = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please select an interview question.",
        variant: "destructive"
      });
      return;
    }
    
    if (!answer.trim()) {
      toast({
        title: "Error",
        description: "Please provide an answer to the question.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // For demo purposes, simulate AI feedback without requiring login
      setTimeout(() => {
        const demoFeedback: FeedbackResponse = {
          score: Math.floor(Math.random() * 3) + 7, // 7-9 range
          strengths: [
            "Good articulation of key points",
            "Clear structure in your answer",
            "Effective use of specific examples"
          ],
          areas_to_improve: [
            "Consider being more concise in your introduction",
            "Add more quantifiable achievements when possible",
            "Work on closing statements that reinforce your main points"
          ],
          suggestions: "Try to structure your answers using the STAR method (Situation, Task, Action, Result) for more impactful responses. This helps interviewers follow your thinking process clearly.",
          overall_feedback: "Your answer demonstrates solid communication skills and relevant experience. With some refinement in structure and more specific examples, you could make your responses even more memorable and impactful."
        };
        
        setFeedback(demoFeedback);
        setIsProcessing(false);
        
        toast({
          title: "Feedback Ready",
          description: "Your interview answer has been analyzed."
        });
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting interview answer:', error);
      toast({
        title: "Error",
        description: "Failed to analyze your answer. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
  
  // Reset the interview
  const resetInterview = () => {
    getRandomQuestion();
    setAnswer("");
    setFeedback(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-bold text-khadma-darkBlue mb-4">
          AI Interview Simulator
        </h1>
        <p className="text-gray-600 text-center max-w-3xl mb-6">
          Practice your interview skills with our AI-powered simulator. Get real-time feedback on your responses to common interview questions.
        </p>
        <div className="flex gap-4">
          <Button 
            onClick={getRandomQuestion}
            className="bg-khadma-blue hover:bg-khadma-blue/90"
            disabled={isRecording || isProcessing}
          >
            New Question
          </Button>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Interview Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
            <p className="text-lg font-medium text-khadma-darkBlue">
              {question || "Click 'New Question' to start the interview simulation."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Answer Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Recording Button */}
          <div className="flex justify-center mb-4">
            <Button
              size="lg"
              className={`rounded-full p-6 ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-khadma-blue hover:bg-khadma-blue/90"
              }`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!question || isProcessing}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            {isRecording && (
              <div className="absolute mt-20 bg-white px-4 py-2 rounded-full shadow-md text-sm font-medium flex items-center">
                <span className="animate-pulse mr-2 h-2 w-2 bg-red-500 rounded-full"></span>
                Recording: {formatTime(recordingTime)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Type or edit your answer:</Label>
            <Textarea 
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here or record using the microphone button above..."
              rows={6}
              disabled={isRecording || isProcessing}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={resetInterview}
              disabled={isRecording || isProcessing || !question}
            >
              Reset
            </Button>
            <Button
              onClick={submitAnswer}
              disabled={!question || !answer || isRecording || isProcessing}
              className="bg-khadma-blue hover:bg-khadma-blue/90"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit for Feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div>
              <h3 className="text-lg font-medium text-khadma-darkBlue mb-2">Score</h3>
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full h-6 w-full">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-khadma-blue rounded-full h-6" 
                    style={{ width: `${(feedback.score / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-3 font-bold text-lg text-khadma-darkBlue">
                  {feedback.score}/10
                </span>
              </div>
            </div>
            
            {/* Strengths */}
            <div>
              <h3 className="text-lg font-medium text-green-700 mb-2">Strengths</h3>
              <ul className="list-disc list-inside space-y-1">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))}
              </ul>
            </div>
            
            {/* Areas to Improve */}
            <div>
              <h3 className="text-lg font-medium text-amber-700 mb-2">Areas to Improve</h3>
              <ul className="list-disc list-inside space-y-1">
                {feedback.areas_to_improve.map((area, index) => (
                  <li key={index} className="text-gray-700">{area}</li>
                ))}
              </ul>
            </div>
            
            {/* Suggestions */}
            <div>
              <h3 className="text-lg font-medium text-khadma-darkBlue mb-2">Suggestions</h3>
              <p className="text-gray-700">{feedback.suggestions}</p>
            </div>
            
            {/* Overall Feedback */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-lg font-medium text-khadma-darkBlue mb-2">Overall Feedback</h3>
              <p className="text-gray-700">{feedback.overall_feedback}</p>
            </div>
            
            <Button
              onClick={resetInterview}
              className="w-full bg-khadma-blue hover:bg-khadma-blue/90"
            >
              Try Another Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InterviewSimulator;
