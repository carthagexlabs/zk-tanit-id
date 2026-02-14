import React, { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { VerificationFlow } from "./components/VerificationFlow";
import { PresentationRequestFlow } from "./components/openid/PresentationRequestFlow";
import { Footer } from "./components/Footer";

type AppView = 'hero' | 'zk-verification' | 'openid-present';

export default function App() {
  const [appView, setAppView] = useState<AppView>('hero');
  const [currentStep, setCurrentStep] = useState(0);

  const handleStartZk = () => {
    setCurrentStep(1);
    setAppView('zk-verification');
  };

  const handleStartOpenID = () => {
    setAppView('openid-present');
  };

  const handleBackToHero = () => {
    setAppView('hero');
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 animate-gradient-shift">
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50 animate-float"></div>

        <Header />

        <main className="relative z-10 overflow-hidden">
          {appView === 'hero' && (
            <Hero onStart={handleStartZk} onStartOpenID={handleStartOpenID} />
          )}
          {appView === 'zk-verification' && (
            <VerificationFlow
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onReset={handleBackToHero}
            />
          )}
          {appView === 'openid-present' && (
            <PresentationRequestFlow onBack={handleBackToHero} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
