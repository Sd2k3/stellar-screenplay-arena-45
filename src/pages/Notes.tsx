
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const Notes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch notes for the logged-in user
  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching notes",
          description: error.message,
        });
      } else if (data) {
        setNotes(data);
      }
    };
    fetchNotes();
  }, [toast]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from("notes").insert([
      { title, content },
    ]);
    setLoading(false);
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to add note",
        description: error.message,
      });
    } else {
      setTitle("");
      setContent("");
      toast({
        title: "Note added",
        description: "Your note has been saved.",
      });
      // Refetch notes
      const { data: allNotes } = await supabase
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });
      setNotes(allNotes || []);
    }
  };

  return (
    <div className="min-h-screen space-gradient text-white">
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Home
        </Button>
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2">My Notes</h1>
          <p className="text-lg text-slate-300">
            Create and store your personal notes.
          </p>
        </header>
        <form onSubmit={handleAddNote} className="mb-8 max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add a New Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  required
                />
                <Button
                  type="submit"
                  disabled={loading || !title.trim() || !content.trim()}
                >
                  {loading ? "Saving..." : "Add Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
        <section className="max-w-2xl mx-auto space-y-4">
          {notes.length === 0 && (
            <div className="text-center text-slate-400">No notes yet.</div>
          )}
          {notes.map(note => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line mb-2">{note.content}</div>
                <div className="text-xs text-slate-400">
                  Created: {new Date(note.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Notes;
