import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Check, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrganizationVisibility } from "@/features/organization/constants/organization-visibility";
import { OrganizationForm } from "@/features/organization/components/organizationForm";
import type { OrganizationFormValues } from "@/features/organization/components/organizationForm";
import type { CreateOrganizationDtoRequest } from "@/api";
import { useCreateOrganization } from "@/features/organization/hooks/useCreateOrganization";
import { useCreatePersonalWorkspace } from "@/features/organization/hooks/useCreatePersonalWorkspace";
import { slugify } from "@/features/organization/utils/slugify";
import { useOrganizationStore } from "@/features/organization/store/organization.store";
import { Pressable } from "@/components/common/pressable";
import { PageReveal } from "@/components/common/page-reveal";
import { toast } from "@/lib/toast";

type OnboardingStep = "welcome" | "accountType" | "organizationDetails";
type AccountType = "organization" | "personal";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const createOrganization = useCreateOrganization();
  const createPersonalWorkspace = useCreatePersonalWorkspace();
  const setActiveOrganizationId = useOrganizationStore(
    (state) => state.setActiveOrganizationId,
  );
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const organizationForm = useForm<OrganizationFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      visibility: OrganizationVisibility.PRIVATE,
      description: "",
      industry: "",
      size: "",
      websiteUrl: "",
      contactEmail: "",
    },
  });

  const steps: OnboardingStep[] = [
    "welcome",
    "accountType",
    "organizationDetails",
  ];
  const currentStepIndex = steps.indexOf(step);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleSkip = async () => {
    try {
      const workspace = await createPersonalWorkspace.mutateAsync();
      setActiveOrganizationId(workspace.id);
      navigate(`/app/org/${workspace.id}/dashboard`);
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message ??
          "Failed to create workspace.",
      );
    }
  };

  const handleContinue = async () => {
    if (step === "welcome") {
      setStep("accountType");
      return;
    }

    if (step === "accountType") {
      if (!accountType) {
        return;
      }
      if (accountType === "personal") {
        try {
          const workspace = await createPersonalWorkspace.mutateAsync();
          setActiveOrganizationId(workspace.id);
          navigate(`/app/org/${workspace.id}/dashboard`);
        } catch (error) {
          toast.error(
            (error as { message?: string })?.message ??
              "Failed to create workspace.",
          );
        }
        return;
      }
      setStep("organizationDetails");
      return;
    }
  };

  const handleCreateOrganization = async (values: OrganizationFormValues) => {
    try {
      const organization = await createOrganization.mutateAsync({
        name: values.name.trim(),
        slug: slugify(values.slug || values.name) || `org-${Date.now()}`,
        visibility: values.visibility as CreateOrganizationDtoRequest.visibility,
        description: values.description || undefined,
        industry: values.industry || undefined,
        size: values.size || undefined,
        websiteUrl: values.websiteUrl || undefined,
        contactEmail: values.contactEmail || undefined,
      });

      setActiveOrganizationId(organization.id);
      navigate(`/app/org/${organization.id}/dashboard`);
    } catch (error) {
      toast.error(
        (error as { message?: string })?.message ??
          "Failed to create organization.",
      );
    }
  };

  return (
    <PageReveal asChild>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Skip for now
              </button>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-xl">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Card className="p-8 md:p-12 shadow-2xl border-slate-200/50 backdrop-blur-xl bg-white/95">
            <AnimatePresence mode="wait">
              {step === "welcome" && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Welcome to Survix</h1>
                  <p className="text-xl text-slate-600 mb-8">
                    Choose how you want to start: personal workspace or team
                    organization.
                  </p>
                  <Pressable asChild>
                    <Button
                      size="lg"
                      onClick={handleContinue}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Get Started
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Pressable>
                </motion.div>
              )}

            {step === "accountType" && (
              <motion.div
                key="accountType"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-bold mb-2 text-center">
                  Select account type
                </h2>
                <p className="text-slate-600 mb-8 text-center">
                  You can create more organizations later.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    {
                      id: "organization",
                      icon: Building2,
                      title: "Organization",
                      description: "For teams and multi-member collaboration",
                    },
                    {
                      id: "personal",
                      icon: User,
                      title: "Personal Use",
                      description: "For your own private workspace",
                    },
                  ].map((option) => (
                    <Pressable
                      key={option.id}
                      asChild
                      onClick={() => setAccountType(option.id as AccountType)}
                      className="cursor-pointer"
                    >
                      <Card
                        className={`p-6 border-2 transition-all ${
                          accountType === option.id
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                            <option.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold mb-1">{option.title}</h3>
                            <p className="text-sm text-slate-600">
                              {option.description}
                            </p>
                          </div>
                          {accountType === option.id && (
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </Card>
                    </Pressable>
                  ))}
                </div>

                <Pressable asChild>
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!accountType}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {createPersonalWorkspace.isPending
                      ? "Creating..."
                      : "Continue"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Pressable>
              </motion.div>
            )}

            {step === "organizationDetails" && (
              <motion.div
                key="organizationDetails"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-center">
                    Organization details
                  </h2>
                  <p className="text-slate-600 text-center">
                    Fill your workspace profile to complete onboarding.
                  </p>
                </div>

                <OrganizationForm
                  form={organizationForm}
                  onSubmit={handleCreateOrganization}
                  submitLabel="Create Organization"
                  submitting={createOrganization.isPending}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </Card>
        </div>
      </div>
    </PageReveal>
  );
};

export default OnboardingPage;
