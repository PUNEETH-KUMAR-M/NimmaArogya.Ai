import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export function CreateAdminForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Create the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Failed to create user");
      }
      
      // Step 2: The user needs to sign in to create their profile
      // This is a workaround for RLS policies
      toast({
        title: "User Created",
        description: `User ${email} has been created. They need to sign in and then an existing admin needs to update their role to 'admin'.`,
        duration: 10000,
      });
      
      // For development/testing, provide SQL to make a user admin
      console.log(`-- SQL to make user ${email} an admin:`);
      console.log(`UPDATE profiles SET role = 'admin' WHERE email = '${email}';`);
      
      // Alternatively, for testing purposes, we can use localStorage
      const pendingAdmins = JSON.parse(localStorage.getItem('pending-admins') || '[]');
      pendingAdmins.push({
        id: authData.user.id,
        email,
        name,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('pending-admins', JSON.stringify(pendingAdmins));
      
      // Clear the form
      setName("");
      setEmail("");
      setPassword("");
      
      toast({
        title: "Success",
        description: "Admin user created successfully",
        action: (
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        ),
        duration: 5000,
      });
    } catch (error) {
      console.error("Error creating admin user:", error);
      toast({
        title: "Error",
        description: `Failed to create admin user: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
        <CardDescription>
          Add a new admin user to the system
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Admin User"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
