import React from 'react';
import { Bot, Zap, BarChart3, Users } from 'lucide-react';

const features = [
  {
    name: 'AI-Powered Automation',
    description: 'Automate repetitive tasks and provide instant responses to common customer inquiries.',
    icon: Bot,
  },
  {
    name: 'Lightning Fast Resolution',
    description: 'Reduce response times and resolve customer issues more quickly than ever before.',
    icon: Zap,
  },
  {
    name: 'Advanced Analytics',
    description: 'Gain valuable insights into customer behavior and support team performance.',
    icon: BarChart3,
  },
  {
    name: 'Team Collaboration',
    description: 'Enable seamless collaboration between AI and human agents for optimal results.',
    icon: Users,
  },
];

const Features = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Powerful Features for Modern Support
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Everything you need to deliver exceptional customer service at scale.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="relative bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="absolute top-6 left-6">
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;