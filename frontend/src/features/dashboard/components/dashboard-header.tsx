import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Public Surveys</h1>
        <p className="text-slate-600">
          Browse and respond to published public surveys.
        </p>
      </div>
      <Link to="/app/surveys/create">
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Survey
        </Button>
      </Link>
    </div>
  );
};

