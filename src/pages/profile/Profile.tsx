
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { t } = useTranslation("common");
  const { currentUser, profile, updateProfile, refreshProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills?.join(", ") || "");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const voiceInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const audioChunksRef = useRef<Blob[]>([]);
  
  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setLinkedinUrl(profile.linkedin_url || "");
      setGithubUrl(profile.github_url || "");
      setBio(profile.bio || "");
      setSkills(profile.skills?.join(", ") || "");
    }
  }, [profile]);
  
  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      
      setIsRecording(true);
      mediaRecorderRef.current.start();
      
      // Set up timer
      const startTime = Date.now();
      const timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        setRecordingTime(elapsedTime);
        
        // Stop recording after 30 seconds
        if (elapsedTime >= 30) {
          clearInterval(timerInterval);
          stopRecording();
        }
      }, 1000);
      
      // Clean up interval on stop
      mediaRecorderRef.current.onstart = () => {
        setRecordingTime(0);
      };
      
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
    }
  };
  
  // Upload file to Supabase Storage
  const uploadFile = async (file: File, storagePath: string) => {
    if (!currentUser) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${storagePath}/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };
  
  // Upload profile photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const downloadURL = await uploadFile(file, 'avatars');
      
      if (downloadURL) {
        // Update user profile
        await updateProfile({ avatar_url: downloadURL });
        
        toast({
          title: "Success",
          description: "Profile photo updated successfully"
        });
      } else {
        throw new Error("Failed to get download URL");
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Upload CV
  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const downloadURL = await uploadFile(file, 'cv');
      
      if (downloadURL) {
        // Update user profile
        await updateProfile({ cv_url: downloadURL });
        
        toast({
          title: "Success",
          description: "CV uploaded successfully"
        });
      } else {
        throw new Error("Failed to get download URL");
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: "Error",
        description: "Failed to upload CV",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Upload voice recording
  const handleVoiceUpload = async () => {
    if (!audioBlob || !currentUser) return;
    
    try {
      setLoading(true);
      const file = new File([audioBlob], 'voice-pitch.wav', { type: 'audio/wav' });
      const downloadURL = await uploadFile(file, 'voice-pitches');
      
      if (downloadURL) {
        // Update user profile
        await updateProfile({ voice_pitch_url: downloadURL });
        
        toast({
          title: "Success",
          description: "Voice pitch uploaded successfully"
        });
      } else {
        throw new Error("Failed to get download URL");
      }
    } catch (error) {
      console.error('Error uploading voice pitch:', error);
      toast({
        title: "Error",
        description: "Failed to upload voice pitch",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Save profile
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Prepare skills array
      const skillsArray = skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      await updateProfile({
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        bio,
        skills: skillsArray,
      });
      
      if (audioBlob) {
        await handleVoiceUpload();
      }
      
      // Refresh profile after updates
      await refreshProfile();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Create storage bucket if we haven't yet
  useEffect(() => {
    const createStorageBucket = async () => {
      try {
        // Check if buckets exist first to avoid errors
        const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
        
        if (getBucketsError) {
          console.error('Error checking buckets:', getBucketsError);
          return;
        }
        
        const profilesBucketExists = buckets.some(bucket => bucket.name === 'profiles');
        
        if (!profilesBucketExists) {
          const { error: createBucketError } = await supabase.storage.createBucket('profiles', {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          
          if (createBucketError) {
            console.error('Error creating bucket:', createBucketError);
            return;
          }
        }
      } catch (error) {
        console.error('Unexpected error setting up storage:', error);
      }
    };
    
    createStorageBucket();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-khadma-darkBlue">
            {t("profile.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            Complete your profile to get matched with the right opportunities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Profile Photo and Basic Info */}
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-khadma-blue text-white text-2xl">
                    {currentUser?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold">
                    {profile?.full_name || currentUser?.email?.split('@')[0]}
                  </h2>
                  <p className="text-gray-500">{currentUser?.email}</p>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border-khadma-blue text-khadma-blue hover:bg-khadma-blue hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t("profile.upload.photo")}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  className="w-full border-khadma-blue text-khadma-blue hover:bg-khadma-blue hover:text-white"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {profile?.cv_url ? "Update CV" : t("profile.upload.cv")}
                </Button>
                <input
                  type="file"
                  ref={cvInputRef}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleCVUpload}
                />
                {profile?.cv_url && (
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm text-green-600">CV uploaded</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(profile.cv_url, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  className={isRecording ? "w-full" : "w-full border-khadma-blue text-khadma-blue hover:bg-khadma-blue hover:text-white"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isRecording 
                    ? `${t("profile.upload.voice")} (${recordingTime}s)`
                    : audioBlob 
                      ? "Re-record Voice Pitch"
                      : t("profile.upload.voice")
                  }
                </Button>
                
                {audioBlob && !isRecording && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    </audio>
                  </div>
                )}
                
                <input
                  type="file"
                  ref={voiceInputRef}
                  accept="audio/*"
                  className="hidden"
                />
                
                {profile?.voice_pitch_url && !audioBlob && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Voice pitch uploaded</p>
                    <audio controls className="w-full mt-1">
                      <source src={profile.voice_pitch_url} type="audio/wav" />
                    </audio>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself, your background, and career goals..."
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              
              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin">{t("profile.links.linkedin")}</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
              
              {/* GitHub */}
              <div className="space-y-2">
                <Label htmlFor="github">{t("profile.links.github")}</Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>
              
              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">{t("profile.skills")}</Label>
                <Textarea
                  id="skills"
                  placeholder="JavaScript, React, UI Design, Project Management, etc. (separated by commas)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              
              <Button
                onClick={handleSaveProfile}
                className="w-full bg-khadma-blue hover:bg-khadma-blue/90 mt-4"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Saving..." : t("profile.save")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
