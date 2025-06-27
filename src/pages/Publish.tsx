
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'sonner';

const Publish = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    tags: [] as string[],
    tagInput: '',
  });
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleTagAdd = () => {
    const tag = formData.tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title.trim() || !formData.code.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let previewImageUrl = null;

      // Upload preview image if provided
      if (previewImage) {
        const fileExt = previewImage.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `previews/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('component-previews')
          .upload(filePath, previewImage);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from('component-previews')
            .getPublicUrl(filePath);
          previewImageUrl = urlData.publicUrl;
        }
      }

      // Insert component
      const { error } = await supabase
        .from('components')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          code: formData.code.trim(),
          tags: formData.tags,
          preview_image_url: previewImageUrl,
        });

      if (error) throw error;

      toast.success('Component published successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error publishing component:', error);
      toast.error('Failed to publish component');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              Publish Your Component
            </CardTitle>
            <p className="text-gray-300 text-center">
              Share your amazing UI component with the community
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Component Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Animated Button, Glass Card, etc."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Description
                </label>
                <Textarea
                  placeholder="Describe your component, its features, and use cases..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Component Code *
                </label>
                <Textarea
                  placeholder="Paste your component code here (JSX, HTML, CSS, etc.)"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[200px] font-mono"
                  rows={10}
                  required
                />
                {formData.code && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-white mb-2">Code Preview:</p>
                    <div className="rounded-lg overflow-hidden">
                      <SyntaxHighlighter
                        language="jsx"
                        style={tomorrow}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                        }}
                      >
                        {formData.code}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Tags
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Add a tag..."
                    value={formData.tagInput}
                    onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                  <Button
                    type="button"
                    onClick={handleTagAdd}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-white/10 text-white border-white/20 flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">
                  Preview Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPreviewImage(e.target.files?.[0] || null)}
                    className="bg-white/10 border-white/20 text-white file:bg-white/10 file:border-0 file:text-white"
                  />
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
                {previewImage && (
                  <p className="text-sm text-gray-300">
                    Selected: {previewImage.name}
                  </p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {loading ? 'Publishing...' : 'Publish Component'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Publish;
