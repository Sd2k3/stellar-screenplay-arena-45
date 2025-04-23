
import React, { useState } from "react";
import { Button } from "../ui/button";
import { AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ScreenpipeInstaller() {
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { toast } = useToast();

  const installScreenpipe = async () => {
    setInstalling(true);
    
    try {
      // Check if navigator.clipboard is available (secure context)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText('iwr get.screenpi.pe/cli.ps1 | iex');
        
        toast({
          title: "Installation command copied",
          description: "Open PowerShell and paste the command to install Screenpipe",
        });
        
        setInstalled(true);
      } else {
        // Fallback if clipboard API is not available
        toast({
          title: "Manual installation required",
          description: "Copy this command: iwr get.screenpi.pe/cli.ps1 | iex",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to copy installation command:", error);
      toast({
        title: "Copy failed",
        description: "Please manually copy the installation command: iwr get.screenpi.pe/cli.ps1 | iex",
        variant: "destructive",
      });
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2 mt-2">
      <Button 
        onClick={installScreenpipe} 
        disabled={installing || installed}
        className="bg-space-stellar-blue hover:bg-space-stellar-blue/80 text-white"
      >
        {installing ? (
          "Copying command..."
        ) : installed ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Command copied
          </>
        ) : (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Copy installation command
          </>
        )}
      </Button>
      
      {installed && (
        <div className="text-xs text-space-stellar-blue">
          Open PowerShell and paste the copied command to install Screenpipe
        </div>
      )}
      
      <div className="text-xs text-white/70">
        After installation, run:
        <pre className="bg-black/30 p-2 my-1 rounded font-mono text-white/90">
          screenpipe.exe
        </pre>
      </div>
    </div>
  );
}
