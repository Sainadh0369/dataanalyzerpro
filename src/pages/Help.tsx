import React from 'react';
import { Book, Video, MessageCircle, FileText, ExternalLink, ChevronRight } from 'lucide-react';
import { TutorialSystem } from '@/components/onboarding/TutorialSystem';

export function Help() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Help & Documentation</h1>

      {/* Tutorial System */}
      <TutorialSystem />

      {/* Documentation */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Book className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold">Documentation & Resources</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard
            title="Getting Started"
            description="Learn the basics of data analysis with our platform"
            icon={FileText}
            link="/docs/getting-started"
          />
          <ResourceCard
            title="Video Tutorials"
            description="Watch step-by-step guides for common tasks"
            icon={Video}
            link="/tutorials"
          />
          <ResourceCard
            title="API Reference"
            description="Detailed documentation for developers"
            icon={Book}
            link="/docs/api"
          />
        </div>
      </div>

      {/* Support */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold">Support & Community</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Contact Support</h3>
            <p className="text-gray-600 mb-4">
              Get help from our support team with any questions or issues.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium border border-teal-200 rounded-lg hover:bg-teal-50">
              <MessageCircle className="w-4 h-4" />
              Open Support Ticket
            </button>
          </div>

          <div className="p-4 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Community Forum</h3>
            <p className="text-gray-600 mb-4">
              Connect with other users and share knowledge.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium border border-teal-200 rounded-lg hover:bg-teal-50">
              <ExternalLink className="w-4 h-4" />
              Visit Forum
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-teal-600" />
          <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          <FAQItem
            question="How do I start a new analysis?"
            answer="Click the 'New Analysis' button on the dashboard or Analysis page, then upload your data file to begin."
          />
          <FAQItem
            question="What file formats are supported?"
            answer="We support CSV and Excel files (xlsx, xls) for data upload."
          />
          <FAQItem
            question="How can I share my analysis?"
            answer="Open your analysis and click the 'Share' button to invite team members or generate a shareable link."
          />
          <FAQItem
            question="Can I export my results?"
            answer="Yes, you can export your analysis results as PDF reports or PowerPoint presentations."
          />
          <FAQItem
            question="How do I create a custom model?"
            answer="Navigate to Tools > Custom Models and click 'Create Model' to start building your custom analysis model."
          />
          <FAQItem
            question="What integrations are available?"
            answer="We support integrations with popular platforms like Slack, Microsoft Teams, and Notion. Check the Tools > Integrations page for more details."
          />
        </div>
      </div>
    </div>
  );
}

function ResourceCard({ 
  title, 
  description, 
  icon: Icon, 
  link 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  link: string;
}) {
  return (
    <a
      href={link}
      className="block p-4 rounded-lg border border-gray-200 hover:border-teal-200 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-teal-600" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex items-center gap-1 mt-2 text-sm text-teal-600">
        <span>Learn more</span>
        <ExternalLink className="w-4 h-4" />
      </div>
    </a>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
          isOpen ? 'rotate-90' : ''
        }`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
}