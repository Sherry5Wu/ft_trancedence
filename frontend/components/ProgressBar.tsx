// components/ProgressBar.tsx

import React from 'react';
import clsx from 'clsx'; // clsx is a utility library used to conditionally combine class names

interface Setup2faProgressBarProps {
  currentStep: 1 | 2 | 3;
  stepCompletion?: {
    1?: boolean;
    2?: boolean;
    3?: boolean;
  };
}

const Setup2faProgressBar: React.FC<Setup2faProgressBarProps> = ({
  currentStep,
  stepCompletion = {},
}) => {
  const steps = [1, 2, 3].map((step) => {
    const completed = !!stepCompletion[step];
    const active = step === currentStep;
    const label = completed ? '✓' : String(step);

    return { label, completed, active };
  });

  return (
    <div className="flex items-center justify-center my-4">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div
            className={clsx(
              'w-12 h-12 flex items-center justify-center rounded-full border-2',
              {
                'bg-black text-white': step.active || step.completed,
                'text-black': !step.active && !step.completed,
              }
            )}
          >
            <span className="text-lg">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className="h-0.5 w-20 bg-black" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Setup2faProgressBar;
