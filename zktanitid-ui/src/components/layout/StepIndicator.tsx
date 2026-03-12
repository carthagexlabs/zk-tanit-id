import React from "react";
import { Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="relative opacity-0 animate-fade-in">
      <div className="overflow-hidden px-4">
        {/* Background lines - always visible */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-700/30" />

        <div className="grid grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center animate-scale-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 transform group-hover:scale-105 backdrop-blur-sm relative z-10 ${
                    isCompleted
                      ? "bg-green-600 text-white shadow-lg shadow-green-600/30 animate-pulse-success"
                      : isCurrent
                      ? "bg-purple-600 text-white ring-4 ring-purple-600/30 shadow-lg shadow-purple-600/50 animate-pulse-current"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors duration-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 animate-scale-in" />
                  ) : (
                    <span className="transform transition-transform duration-300 group-hover:scale-110">
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Step text */}
                <div className="mt-4 text-center min-h-[3.5rem] flex flex-col items-center justify-start">
                  <p
                    className={`text-sm font-medium transition-all duration-300 ${
                      isCurrent
                        ? "text-purple-300"
                        : isCompleted
                        ? "text-green-400"
                        : "text-slate-500 group-hover:text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-xs mt-1 transition-all duration-300 ${
                      isCurrent
                        ? "text-slate-300"
                        : isCompleted
                        ? "text-green-300/70"
                        : "text-slate-600 group-hover:text-slate-500"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <>
                    {/* Static background line */}
                    <div
                      className="absolute top-5 left-[calc(50%+20px)] right-0 h-0.5 bg-slate-700/30 transform -translate-y-1/2"
                      style={{ width: "calc(100% - 20px)" }}
                    />

                    {/* Animated progress line */}
                    <div
                      className={`absolute top-5 left-[calc(50%+20px)] h-0.5 transition-all duration-700 ${
                        isCompleted
                          ? "bg-gradient-to-r from-green-500 via-green-400 to-purple-500 w-full animate-progress-glow"
                          : isCurrent
                          ? "bg-gradient-to-r from-purple-600 to-purple-500/30 w-0 animate-[progressLine_2s_ease-out_forwards]"
                          : "w-0"
                      }`}
                      style={{
                        transform: "translateY(-50%)",
                        width: isCompleted ? "calc(100% - 20px)" : "0",
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
