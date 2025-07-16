
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Wand2, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CodeGenerator = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { prompt, language }
      });

      if (error) throw error;
      
      setGeneratedCode(data.code);
      toast.success('Code generated successfully!');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const useThisCode = () => {
    // Store the generated code in localStorage to pass to the publish page
    localStorage.setItem('generatedCode', generatedCode);
    localStorage.setItem('generatedLanguage', language);
    localStorage.setItem('generatedPrompt', prompt);
    
    // Navigate to publish page
    navigate('/publish');
    toast.success('Code sent to publish page!');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto backdrop-blur-md bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Describe the component you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generateCode}
            disabled={loading || !prompt.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate
          </Button>
        </div>

        {generatedCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium">Generated Code:</h3>
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  onClick={useThisCode}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Use This Code
                </Button>
              </div>
            </div>
            <Textarea
              value={generatedCode}
              readOnly
              className="min-h-[300px] bg-black/20 border-white/20 text-white font-mono text-sm resize-none"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeGenerator;
