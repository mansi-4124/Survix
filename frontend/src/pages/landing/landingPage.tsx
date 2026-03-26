import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { PageReveal } from "@/components/common/page-reveal";

const features = [
  {
    icon: Sparkles,
    title: "8+ Question Types",
    description:
      "Multiple choice, text, rating scales, and more for comprehensive data collection.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Organizations",
    description:
      "Manage teams with role-based permissions for Owners, Admins, and Members.",
  },
  {
    icon: Globe,
    title: "Public & Private Surveys",
    description:
      "Control visibility with public links or private organization-only surveys.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Track responses, view trends, and generate insights from your data.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Secure authentication with OAuth, OTP verification, and password recovery.",
  },
  {
    icon: Zap,
    title: "Role based survey management",
    description:
      "Surveys can be managed by company through collaborators with different roles and permissions.",
  },
];

const benefits = [
  "Create unlimited surveys and polls",
  "Real-time response tracking",
  "Team collaboration tools",
  "Advanced analytics dashboard",
  "Custom branding options",
  "Export data in multiple formats",
];

const stats = [
  { label: "Surveys Created", value: "10K+" },
  { label: "Responses", value: "1M+" },
  { label: "Satisfaction", value: "98%" },
];

const LandingPage = () => {
  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/40 to-purple-50">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-transparent" />
          <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                  <Rocket className="w-4 h-4" />
                  Modern Survey Platform
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Create surveys that
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                    {" "}
                    drive results
                  </span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Survix helps teams launch fast, collect feedback, and turn
                  insights into action with a beautiful, collaborative
                  workspace.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all font-medium text-lg"
                  >
                    Start Creating Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Free forever plan</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-3xl blur-3xl opacity-20" />
                <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-indigo-100">
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded w-3/4" />
                    <div className="h-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded w-1/2" />
                    <div className="grid grid-cols-3 gap-4 py-6">
                      {stats.map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-indigo-50 rounded-xl p-4 text-center"
                        >
                          <div className="text-2xl font-bold text-indigo-600">
                            {stat.value}
                          </div>
                          <div className="text-xs text-slate-600">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="h-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Powerful features to create, distribute, and analyze surveys
                with your team.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  Why teams choose Survix
                </h2>
                <p className="text-indigo-100 text-lg mb-8">
                  Join thousands of teams already using Survix to gather
                  feedback, conduct research, and make data-driven decisions.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <TrendingUp className="w-16 h-16 text-white mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Growing fast
                    </h3>
                    <p className="text-indigo-100">
                      Used by organizations worldwide
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-white">500+</div>
                      <div className="text-xs text-indigo-100">Companies</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-white">1M+</div>
                      <div className="text-xs text-indigo-100">Responses</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-white">50+</div>
                      <div className="text-xs text-indigo-100">Countries</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join Survix today and start creating surveys that drive results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all font-medium text-lg"
              >
                Start free trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-indigo-200 text-indigo-600 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageReveal>
  );
};

export default LandingPage;
