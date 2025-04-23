
import { ScreenpipeEvents } from "@/components/screenpipe/ScreenpipeEvents";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen space-gradient flex flex-col items-center py-8">
      <div className="container max-w-2xl mx-auto py-4 w-full">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Screenpipe Activity</h2>
        <p className="mb-6 text-slate-300 text-center">
          View your recent screen activity and live events captured by Screenpipe.
        </p>
        <ScreenpipeEvents />
        <div className="mt-6 text-center">
          <Link 
            to="/screenpipe" 
            className="text-space-stellar-blue hover:text-space-nova-yellow transition-colors"
          >
            View full Screenpipe dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
