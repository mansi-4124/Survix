import { Link } from "react-router-dom";

export const SiteFooter = () => (
  <footer className="bg-slate-900 text-slate-300">
    <div className="max-w-7xl mx-auto px-6 py-14">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/Survix_logo_transparent.png"
              alt="Survix"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-white">Survix</span>
          </div>
          <p className="text-sm text-slate-400">
            Research, feedback, and live engagement in one workspace.
          </p>
          <a
            href="mailto:survix.official@gmail.com"
            className="text-sm text-indigo-200 hover:text-white transition-colors"
          >
            survix.official@gmail.com
          </a>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/app"
                className="hover:text-white transition-colors"
              >
                Surveys
              </Link>
            </li>
            <li>
              <Link
                to="/app"
                className="hover:text-white transition-colors"
              >
                Polls
              </Link>
            </li>
            <li>
              <Link
                to="/app"
                className="hover:text-white transition-colors"
              >
                Organization
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">Resources</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/app/profile"
                className="hover:text-white transition-colors"
              >
                Profile
              </Link>
            </li>
            <li className="text-slate-400">Help Center</li>
            <li className="text-slate-400">Privacy & Terms</li>
          </ul>
        </div>
        <div>
          <h3 className="text-white font-medium mb-4">Contact</h3>
          <p className="text-sm text-slate-400">
            Get in touch for enterprise onboarding and custom research programs.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-10 pt-6 text-center text-xs text-slate-500">
        &copy; 2026 Survix. All rights reserved.
      </div>
    </div>
  </footer>
);
