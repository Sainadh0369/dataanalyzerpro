import { Trophy, Star, Book, Target, CheckCircle, Lock, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: {
    id: string;
    title: string;
    description: string;
    action: string;
    completed?: boolean;
  }[];
  badge: {
    name: string;
    icon: React.ElementType;
    color: string;
  };
  completed?: boolean;
  locked?: boolean;
}

export function TutorialSystem() {
  const [tutorials, setTutorials] = React.useState<Tutorial[]>([
    {
      id: 'basics',
      title: 'Getting Started',
      description: 'Learn the basics of data analysis',
      steps: [
        {
          id: 'upload',
          title: 'Upload Your First Dataset',
          description: 'Learn how to upload and validate your data',
          action: 'Upload a CSV or Excel file'
        },
        {
          id: 'analyze',
          title: 'Run Your First Analysis',
          description: 'Discover insights from your data',
          action: 'Click "Analyze Data"'
        },
        {
          id: 'visualize',
          title: 'Create Visualizations',
          description: 'Turn your data into beautiful charts',
          action: 'Create a chart'
        }
      ],
      badge: {
        name: 'Data Explorer',
        icon: Star,
        color: 'text-yellow-500'
      }
    },
    {
      id: 'advanced',
      title: 'Advanced Analysis',
      description: 'Master advanced analysis techniques',
      steps: [
        {
          id: 'ml',
          title: 'Machine Learning Basics',
          description: 'Understand ML predictions',
          action: 'Run ML analysis'
        },
        {
          id: 'correlations',
          title: 'Correlation Analysis',
          description: 'Find relationships in your data',
          action: 'View correlations'
        },
        {
          id: 'export',
          title: 'Export & Share',
          description: 'Share insights with your team',
          action: 'Export analysis'
        }
      ],
      badge: {
        name: 'Data Scientist',
        icon: Trophy,
        color: 'text-purple-500'
      },
      locked: true
    },
    {
      id: 'expert',
      title: 'Expert Techniques',
      description: 'Become a data analysis expert',
      steps: [
        {
          id: 'custom',
          title: 'Custom Analysis',
          description: 'Create custom analysis pipelines',
          action: 'Create custom analysis'
        },
        {
          id: 'automate',
          title: 'Automation',
          description: 'Automate your analysis workflow',
          action: 'Set up automation'
        },
        {
          id: 'collaborate',
          title: 'Team Collaboration',
          description: 'Work effectively with your team',
          action: 'Invite team members'
        }
      ],
      badge: {
        name: 'Data Master',
        icon: Target,
        color: 'text-indigo-500'
      },
      locked: true
    }
  ]);

  const [activeTutorial, setActiveTutorial] = React.useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [showCongrats, setShowCongrats] = React.useState(false);

  const handleStepComplete = (tutorialId: string, stepId: string) => {
    setTutorials(prev => prev.map(tutorial => {
      if (tutorial.id === tutorialId) {
        const updatedSteps = tutorial.steps.map(step =>
          step.id === stepId ? { ...step, completed: true } : step
        );
        const allCompleted = updatedSteps.every(step => step.completed);
        return {
          ...tutorial,
          steps: updatedSteps,
          completed: allCompleted
        };
      }
      return tutorial;
    }));

    // Check if all steps are completed
    const tutorial = tutorials.find(t => t.id === tutorialId);
    if (tutorial && tutorial.steps.every(step => step.completed)) {
      setShowCongrats(true);
      // Unlock next tutorial if available
      const currentIndex = tutorials.findIndex(t => t.id === tutorialId);
      if (currentIndex < tutorials.length - 1) {
        setTutorials(prev => prev.map((t, i) =>
          i === currentIndex + 1 ? { ...t, locked: false } : t
        ));
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold">Learning Center</h2>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">
            {tutorials.filter(t => t.completed).length} / {tutorials.length} Completed
          </span>
        </div>
      </div>

      {/* Tutorial List */}
      <div className="grid gap-6">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className={`border rounded-lg p-4 ${
              tutorial.locked
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-teal-200 cursor-pointer'
            }`}
            onClick={() => !tutorial.locked && setActiveTutorial(tutorial)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {tutorial.locked ? (
                  <Lock className="w-6 h-6 text-gray-400" />
                ) : tutorial.completed ? (
                  <tutorial.badge.icon className={`w-6 h-6 ${tutorial.badge.color}`} />
                ) : (
                  <tutorial.badge.icon className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{tutorial.title}</h3>
                  <p className="text-sm text-gray-500">{tutorial.description}</p>
                </div>
              </div>
              
              {tutorial.completed && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600">Completed</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {!tutorial.locked && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Progress</span>
                  <span className="text-sm font-medium">
                    {((tutorial.steps.filter(s => s.completed).length / tutorial.steps.length) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(tutorial.steps.filter(s => s.completed).length / tutorial.steps.length) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Tutorial */}
      {activeTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <activeTutorial.badge.icon className={`w-6 h-6 ${activeTutorial.badge.color}`} />
                  <h3 className="text-lg font-semibold">{activeTutorial.title}</h3>
                </div>
                <button
                  onClick={() => setActiveTutorial(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-2 text-gray-600">{activeTutorial.description}</p>
            </div>

            <div className="p-6 space-y-6">
              {activeTutorial.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 ${
                    index < currentStep ? 'opacity-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-green-100'
                      : index === currentStep
                      ? 'bg-teal-100'
                      : 'bg-gray-100'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    {index === currentStep && !step.completed && (
                      <button
                        onClick={() => handleStepComplete(activeTutorial.id, step.id)}
                        className="text-sm text-teal-600 hover:text-teal-700"
                      >
                        {step.action}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
            <p className="text-gray-600 mb-6">
              You've earned the {activeTutorial?.badge.name} badge!
            </p>
            <button
              onClick={() => {
                setShowCongrats(false);
                setActiveTutorial(null);
              }}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}