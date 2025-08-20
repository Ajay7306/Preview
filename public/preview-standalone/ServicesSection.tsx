import React, { useState } from 'react';

interface Service {
  title: string;
  description: string;
  features: string[];
  price: string;
  popular?: boolean;
  icon: React.ReactNode;
}

interface ServicesSectionProps {
  title?: string;
  subtitle?: string;
  services?: Service[];
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  title = "Choose Your Perfect Plan",
  subtitle = "Flexible solutions designed to grow with your business. From startups to enterprise, we have the right plan for you.",
  services = [
    {
      title: "Starter",
      description: "Perfect for individuals and small teams getting started",
      price: "$29",
      features: [
        "Up to 5 projects",
        "10GB storage",
        "Basic analytics",
        "Email support",
        "Mobile app access"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      title: "Professional",
      description: "Ideal for growing businesses and teams",
      price: "$79",
      popular: true,
      features: [
        "Unlimited projects",
        "100GB storage",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations",
        "Team collaboration"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      title: "Enterprise",
      description: "Advanced features for large organizations",
      price: "$199",
      features: [
        "Everything in Professional",
        "Unlimited storage",
        "White-label solution",
        "Dedicated support",
        "Custom development",
        "SLA guarantee",
        "Advanced security"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    }
  ]
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-gray-400 leading-relaxed mb-12">
            {subtitle}
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`relative group ${
                service.popular 
                  ? 'transform scale-105 z-10' 
                  : ''
              }`}
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              {/* Card */}
              <div className={`relative p-8 rounded-2xl transition-all duration-500 h-full ${
                service.popular
                  ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-blue-500'
                  : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
              } group-hover:transform group-hover:-translate-y-2`}>
                
                {/* Background gradient */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                  service.popular 
                    ? 'bg-gradient-to-b from-blue-500 to-purple-600'
                    : 'bg-gradient-to-b from-gray-600 to-gray-800'
                }`}></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${
                    service.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                  }`}>
                    {service.icon}
                  </div>
                  
                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 mb-6">{service.description}</p>
                  
                  {/* Price */}
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-white">{service.price}</span>
                    <span className="text-gray-400 ml-2">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-400 mt-1">
                        Save ${Math.round(parseFloat(service.price.replace(',', '')) * 12 * 0.2)}/year
                      </div>
                    )}
                  </div>
                  
                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-300 ml-3">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <button className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    service.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  } transform hover:scale-105`}>
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button className="px-8 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors duration-300">
              Compare All Features
            </button>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;