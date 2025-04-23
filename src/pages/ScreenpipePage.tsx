
import ScreenpipePanel from "@/components/screenpipe/ScreenpipePanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function ScreenpipePage() {
  return (
    <div className="min-h-screen space-gradient flex flex-col items-center py-8">
      <div className="container max-w-2xl mx-auto py-4 w-full">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Screenpipe Activity &amp; Search</h2>
        <p className="mb-6 text-slate-300 text-center">
          View recent screen or audio data captured with Screenpipe.<br />
          Your data stays private – everything is processed locally in your browser.
        </p>
        <Tabs defaultValue="latest" className="w-full mb-4">
          <TabsList className="w-full bg-black/50 border border-space-stellar-blue flex">
            <TabsTrigger value="latest" className="flex-1">Latest Activity</TabsTrigger>
            {/* More tabs such as 'Meetings', 'Search', or 'Realtime' could be added here */}
          </TabsList>

          <TabsContent value="latest">
            <ScreenpipePanel />
          </TabsContent>
        </Tabs>
        <Alert className="bg-black/30 border border-space-stellar-blue text-white mt-6">
          <InfoIcon className="h-4 w-4 text-space-stellar-blue" />
          <AlertTitle>How does it work?</AlertTitle>
          <AlertDescription className="text-slate-300">
            Screenpipe captures your screen or audio data <strong>locally</strong>. Results shown here never leave your device.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
