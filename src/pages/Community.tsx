import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Heart, Share2, MessageCircle, CheckCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { discussionService, Discussion, HealthTopic } from "@/services/discussion-service";
import { formatDistanceToNow } from "date-fns";

const Community = () => {
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch discussions from Supabase using the discussion service
  const {
    data: discussions = [],
    isLoading: isDiscussionsLoading,
    error: discussionsError
  } = useQuery({
    queryKey: ['discussions'],
    queryFn: async () => {
      try {
        return await discussionService.getDiscussions();
      } catch (error) {
        console.error('Error fetching discussions:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
  
  // Fetch health topics from Supabase using the discussion service
  const {
    data: healthTopics = [],
    isLoading: isHealthTopicsLoading
  } = useQuery({
    queryKey: ['healthTopics'],
    queryFn: async () => {
      try {
        return await discussionService.getHealthTopics();
      } catch (error) {
        console.error('Error fetching health topics:', error);
        throw error;
      }
    }
  });

  const handleLike = async (postId: string) => {
    try {
      await discussionService.likeDiscussion(postId);
      // Refetch discussions to update the likes count
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast({
        title: "Post Liked",
        description: "You've liked this discussion post.",
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const [commentText, setCommentText] = useState("");
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  
  const handleComment = (postId: string) => {
    setActiveDiscussionId(postId);
    toast({
      title: "Add Comment",
      description: "Please enter your comment in the text field below.",
    });
  };
  
  const submitComment = async () => {
    if (!activeDiscussionId || !commentText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to comment.",
          variant: "destructive",
        });
        return;
      }
      
      await discussionService.addComment({
        discussion_id: activeDiscussionId,
        author_id: session.user.id,
        author_name: session.user.email?.split('@')[0] || 'Anonymous',
        content: commentText
      });
      
      // Refetch discussions to update the comments count
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
      
      setCommentText("");
      setActiveDiscussionId(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (postId: string) => {
    toast({
      title: "Share Post",
      description: "Share functionality would be implemented here.",
    });
  };

  const handleSubmitPost = async () => {
    if (!postTitle || !postContent || !selectedTopic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before posting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to create a post.",
          variant: "destructive",
        });
        return;
      }
      
      // Create the discussion using the service
      const newDiscussion = await discussionService.createDiscussion({
        author_id: session.user.id,
        author_name: session.user.email?.split('@')[0] || 'Anonymous',
        author_type: 'Patient', // Default to Patient, can be updated by admin later
        avatar_url: null,
        topic: selectedTopic,
        title: postTitle,
        content: postContent,
        verified: false
      });
      
      if (newDiscussion) {
        toast({
          title: "Post Submitted",
          description: "Your discussion post has been submitted successfully.",
        });
        
        // Use queryClient.setQueryData to update the cache without triggering a refetch
        queryClient.setQueryData(['discussions'], (oldData: Discussion[] = []) => {
          // Make sure we don't add duplicate entries
          const exists = oldData.some(discussion => discussion.id === newDiscussion.id);
          if (exists) return oldData;
          return [newDiscussion, ...oldData];
        });
        
        setShowNewPost(false);
        setPostTitle("");
        setPostContent("");
        setSelectedTopic("");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter discussions based on search term
  const filteredDiscussions = discussions.filter(
    (discussion) =>
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          {/* Hero section */}
          <div className="bg-gradient-to-br from-mediwrap-orange/10 to-mediwrap-blue/10 dark:from-mediwrap-orange/5 dark:to-mediwrap-blue/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  Health Community
                </h1>
                <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Connect with others, share experiences, and learn from health discussions
                </p>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left sidebar */}
              <div className="md:w-1/4 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Health Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {isHealthTopicsLoading ? (
                      <li className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      </li>
                    ) : (
                      healthTopics.map((topic) => (
                        <li key={topic.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setSearchTerm(topic.name)}
                          >
                            {topic.name}
                          </Button>
                        </li>
                      ))
                    )}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Community Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-mediwrap-green shrink-0" />
                        <span>Be respectful and supportive to others</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-mediwrap-green shrink-0" />
                        <span>Only share medically accurate information</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-mediwrap-green shrink-0" />
                        <span>Respect privacy and confidentiality</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-mediwrap-green shrink-0" />
                        <span>No promotion of products or services</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-mediwrap-green shrink-0" />
                        <span>Medical advice is for discussion only, not a substitute for professional care</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main content area */}
              <div className="md:w-3/4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                  <div className="w-full md:w-auto flex-grow relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search discussions..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full md:w-auto bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white"
                    onClick={() => setShowNewPost(true)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Start New Discussion
                  </Button>
                </div>
                
                <Tabs defaultValue="discussions" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="discussions">All Discussions</TabsTrigger>
                    <TabsTrigger value="doctor-posts">Doctor Posts</TabsTrigger>
                    <TabsTrigger value="patient-experiences">Patient Experiences</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="discussions" className="space-y-6">
                    {isDiscussionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue" />
                      </div>
                    ) : filteredDiscussions.length > 0 ? (
                      filteredDiscussions.map((discussion) => (
                        <Card key={discussion.id}>
                          <CardHeader>
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <Avatar className="mr-2">
                                  <AvatarImage src={discussion.avatar_url || ''} />
                                  <AvatarFallback>{discussion.author_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center">
                                    <span className="font-medium">{discussion.author_name}</span>
                                    {discussion.verified && (
                                      <CheckCircle className="ml-1 h-4 w-4 text-mediwrap-blue" />
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{discussion.author_type}</div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(discussion.created_at || ''), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded px-2 py-1">
                                {discussion.topic}
                              </span>
                              <CardTitle className="mt-2">{discussion.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              {discussion.content}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="flex space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-gray-600 dark:text-gray-400"
                                onClick={() => handleLike(discussion.id)}
                              >
                                <Heart className="mr-1 h-4 w-4" />
                                <span>{discussion.likes}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-gray-600 dark:text-gray-400"
                                onClick={() => handleComment(discussion.id)}
                              >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                <span>{discussion.comments}</span>
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 dark:text-gray-400"
                              onClick={() => handleShare(discussion.id)}
                            >
                              <Share2 className="mr-1 h-4 w-4" />
                              <span>Share</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No discussions found matching your search.</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="doctor-posts" className="space-y-6">
                    {isDiscussionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue" />
                      </div>
                    ) : filteredDiscussions
                      .filter((discussion) => discussion.author_type.includes("Doctor"))
                      .map((discussion) => (
                        <Card key={discussion.id}>
                          <CardHeader>
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <Avatar className="mr-2">
                                  <AvatarImage src={discussion.avatar_url || ''} />
                                  <AvatarFallback>{discussion.author_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center">
                                    <span className="font-medium">{discussion.author_name}</span>
                                    {discussion.verified && (
                                      <CheckCircle className="ml-1 h-4 w-4 text-mediwrap-blue" />
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{discussion.author_type}</div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(discussion.created_at || ''), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded px-2 py-1">
                                {discussion.topic}
                              </span>
                              <CardTitle className="mt-2">{discussion.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              {discussion.content}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="flex space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-gray-600 dark:text-gray-400"
                                onClick={() => handleLike(discussion.id)}
                              >
                                <Heart className="mr-1 h-4 w-4" />
                                <span>{discussion.likes}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-gray-600 dark:text-gray-400"
                                onClick={() => handleComment(discussion.id)}
                              >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                <span>{discussion.comments}</span>
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 dark:text-gray-400"
                              onClick={() => handleShare(discussion.id)}
                            >
                              <Share2 className="mr-1 h-4 w-4" />
                              <span>Share</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="patient-experiences" className="space-y-6">
                    {isDiscussionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-mediwrap-blue" />
                      </div>
                    ) : filteredDiscussions
                      .filter((discussion) => discussion.author_type.includes("Patient"))
                      .map((discussion) => (
                        <Card key={discussion.id}>
                          <CardHeader>
                            <div className="flex justify-between">
                              <div className="flex items-center">
                                <Avatar className="mr-2">
                                  <AvatarImage src={discussion.avatar_url || ''} />
                                  <AvatarFallback>{discussion.author_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center">
                                    <span className="font-medium">{discussion.author_name}</span>
                                    {discussion.verified && (
                                      <CheckCircle className="ml-1 h-4 w-4 text-mediwrap-blue" />
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{discussion.author_type}</div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(discussion.created_at || ''), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-medium rounded px-2 py-1">
                                {discussion.topic}
                              </span>
                              <CardTitle className="mt-2">{discussion.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">
                              {discussion.content}
                            </p>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="flex space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-gray-600 dark:text-gray-400"
                                onClick={() => handleLike(discussion.id)}
                              >
                                <Heart className="mr-1 h-4 w-4" />
                                <span>{discussion.likes}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center text-gray-600 dark:text-gray-400"
                                onClick={() => handleComment(discussion.id)}
                              >
                                <MessageCircle className="mr-1 h-4 w-4" />
                                <span>{discussion.comments}</span>
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 dark:text-gray-400"
                              onClick={() => handleShare(discussion.id)}
                            >
                              <Share2 className="mr-1 h-4 w-4" />
                              <span>Share</span>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
        
        {/* New Discussion Modal */}
        {showNewPost && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Start New Discussion</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowNewPost(false)}>
                    &times;
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Topic
                    </label>
                    <select 
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-800"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                    >
                      <option value="">Select a topic...</option>
                      {healthTopics.map((topic) => (
                        <option key={topic.id} value={topic.name}>{topic.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <Input
                      placeholder="Enter discussion title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Content
                    </label>
                    <Textarea
                      placeholder="Share your thoughts, questions, or experiences..."
                      className="min-h-[200px]"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-mediwrap-blue hover:bg-mediwrap-blue-light text-white"
                  onClick={handleSubmitPost}
                >
                  Post Discussion
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;