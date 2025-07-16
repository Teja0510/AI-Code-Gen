import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated!');
      navigate('/profile');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  // Optional: handle avatar upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    let { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Failed to upload avatar');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.success('Avatar uploaded!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <form
        onSubmit={handleSave}
        className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-2">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
              {user?.user_metadata?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <label className="text-white mb-2">Change Photo</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-1">Full Name</label>
          <Input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          disabled={uploading}
        >
          {uploading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full mt-2 text-white"
          onClick={() => navigate('/profile')}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};

export default EditProfile;
