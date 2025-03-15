
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Sun, Moon, Bell, Settings as SettingsIcon, LogOut, User } from 'lucide-react';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/auth');
        return;
      }
      
      setUser(data.session.user);
      
      // Get the user's name from metadata
      if (data.session.user.user_metadata && data.session.user.user_metadata.name) {
        setUserName(data.session.user.user_metadata.name);
      } else {
        // Fallback to email prefix
        setUserName('');
      }
      
      setLoading(false);
      
      // Fetch user preferences
      try {
        const { data: preferences, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', data.session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching preferences:', error);
        }
        
        if (preferences) {
          setNotificationsEnabled(preferences.notification_enabled);
          // Now this property exists in the database
          setDailyReminderEnabled(preferences.daily_reminder_enabled || false);
        } else {
          // Create default preferences
          await supabase
            .from('user_preferences')
            .insert({
              user_id: data.session.user.id,
              dark_mode: theme === 'dark',
              notification_enabled: true,
              daily_reminder_enabled: false
            });
        }
      } catch (error) {
        console.error('Error setting up preferences:', error);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        } else if (session && event === 'SIGNED_IN') {
          setUser(session.user);
          
          // Get the user's name from metadata on auth state change
          if (session.user.user_metadata && session.user.user_metadata.name) {
            setUserName(session.user.user_metadata.name);
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, theme]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };
  
  const savePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dark_mode: theme === 'dark',
          notification_enabled: notificationsEnabled,
          daily_reminder_enabled: dailyReminderEnabled
        });
        
      if (error) throw error;
      
      toast({
        title: "Preferences saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateUserName = async () => {
    if (!user || !userName.trim()) return;
    
    setIsUpdatingName(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: userName.trim() }
      });
      
      if (error) throw error;
      
      toast({
        title: "Name updated",
        description: "Your display name has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating name",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6">
          <h1 className="font-serif text-2xl md:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your journal preferences and account settings.
          </p>
        </div>
        
        <Tabs defaultValue="appearance">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Customize how you appear in the app.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="name" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your display name"
                    />
                    <Button 
                      onClick={updateUserName} 
                      disabled={isUpdatingName || !userName.trim()}
                      size="sm"
                    >
                      {isUpdatingName ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is how you'll appear throughout the app.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how your journal looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-amber-500" />
                    <Switch 
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                    <Moon className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-0.5">
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable all notifications.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                    <Bell className={`h-5 w-5 ${notificationsEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </div>
                </motion.div>
                
                {notificationsEnabled && (
                  <motion.div 
                    className="flex items-center justify-between pl-6 border-l-2 border-l-muted"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-0.5">
                      <Label>Daily Reminder</Label>
                      <p className="text-sm text-muted-foreground">
                        Get a reminder to journal each day.
                      </p>
                    </div>
                    <Switch 
                      checked={dailyReminderEnabled}
                      onCheckedChange={setDailyReminderEnabled}
                    />
                  </motion.div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={savePreferences} 
                  disabled={isSaving}
                  className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            <Card className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
};

export default Settings;
