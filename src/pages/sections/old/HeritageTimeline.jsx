// components/LandingPage/sections/HeritageTimeline.jsx
import React, { useState } from 'react';
import './HeritageTimeline.css';

const HeritageTimeline = ({ handleDemoAction }) => {
  const [selectedYear, setSelectedYear] = useState(null);

  const timelineEvents = [
    {
      year: '1952',
      title: 'The First Seed',
      description: 'Grandfather Ramesh plants the first pomegranate tree on 2 acres of ancestral land in Maharashtra',
      era: 'The Foundation Era',
      icon: '🌱',
      color: 'amber',
      milestones: ['First harvest: 150kg', 'Local market success', 'Traditional farming methods']
    },
    {
      year: '1978', 
      title: 'The Growth Phase',
      description: 'Father Suresh introduces modern farming techniques and expands operations across Maharashtra',
      era: 'The Expansion Era',
      icon: '🚜',
      color: 'orange',
      milestones: ['Expanded to 25 acres', 'First quality certifications', 'Regional distribution network']
    },
    {
      year: '1995',
      title: 'Scientific Revolution',
      description: 'Introduction of drip irrigation, soil testing, and partnership with agricultural universities',
      era: 'The Innovation Era',
      icon: '🔬',
      color: 'red',
      milestones: ['40% yield increase', 'First organic certification', 'Research partnerships']
    },
    {
      year: '2008',
      title: 'Global Expansion',
      description: 'Current generation takes over, launching international exports and quality certifications',
      era: 'The Global Era',
      icon: '🌍',
      color: 'purple',
      milestones: ['First international export', 'HACCP certification', 'Cold chain infrastructure']
    },
    {
      year: '2020',
      title: 'Digital Revolution',
      description: 'Launch of IoT monitoring, blockchain traceability, and AI-powered farming systems',
      era: 'The Technology Era',
      icon: '💻',
      color: 'blue',
      milestones: ['Live farm monitoring', 'Blockchain transparency', 'AI yield optimization']
    },
    {
      year: '2024',
      title: 'The Trust Engine',
      description: 'Saffron Emporial becomes the golden standard with radical transparency and B2B innovation',
      era: 'The Trust Era',
      icon: '🏆',
      color: 'gold',
      milestones: ['47 global B2B partners', '100% supply chain transparency', 'Industry-leading platform']
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      amber: 'bg-amber-500 text-amber-700 border-amber-200',
      orange: 'bg-orange-500 text-orange-700 border-orange-200', 
      red: 'bg-red-500 text-red-700 border-red-200',
      purple: 'bg-purple-500 text-purple-700 border-purple-200',
      blue: 'bg-blue-500 text-blue-700 border-blue-200',
      gold: 'bg-gradient-to-br from-gold to-saffron text-white border-gold'
    };
    return colors[color] || colors.amber;
  };

  const getBackgroundColor = (color) => {
    const colors = {
      amber: 'bg-amber-50',
      orange: 'bg-orange-50',
      red: 'bg-red-50', 
      purple: 'bg-purple-50',
      blue: 'bg-blue-50',
      gold: 'bg-gradient-to-br from-gold to-saffron'
    };
    return colors[color] || colors.amber;
  };

  return (
    <section id="heritage" className="heritage py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">🌳 Our Generational Journey</h2>
          <p className="text-xl text-gray-600">Four generations of agricultural excellence and innovation</p>
        </div>
        
        {/* Interactive Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 hidden lg:block"></div>
          
          {/* Timeline Events */}
          <div className="space-y-16 lg:space-y-24">
            {timelineEvents.map((event, index) => (
              <div key={event.year} className={`timeline-event flex flex-col lg:flex-row items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                {/* Event Content */}
                <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8'} mb-8 lg:mb-0`}>
                  <div 
                    className={`timeline-card bg-white rounded-2xl p-6 shadow-xl border border-${event.color}-200 hover:scale-105 transition-transform cursor-pointer`}
                    onClick={() => setSelectedYear(selectedYear === event.year ? null : event.year)}
                  >
                    <div className="text-3xl mb-3">{event.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.year} - {event.title}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    <div className={`text-sm font-semibold text-${event.color}-600`}>{event.era}</div>
                    
                    {/* Expanded Details */}
                    {selectedYear === event.year && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Key Milestones:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {event.milestones.map((milestone, idx) => (
                            <li key={idx}>• {milestone}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Timeline Marker */}
                <div className="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-0 lg:transform-none">
                  <div className={`timeline-marker w-8 h-8 lg:w-12 lg:h-12 ${getColorClasses(event.color)} rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10`}>
                    {event.year === '2024' ? (
                      <span className="text-white font-bold text-xs lg:text-sm">NOW</span>
                    ) : (
                      <span className="text-white font-bold text-xs lg:text-sm">{event.year.slice(2)}</span>
                    )}
                  </div>
                </div>
                
                {/* Milestone Info */}
                <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-8' : 'lg:pr-8 lg:text-right'} mt-4 lg:mt-0`}>
                  <div className={`${getBackgroundColor(event.color)} p-4 rounded-lg ${event.color === 'gold' ? 'text-white' : 'text-gray-600'}`}>
                    <div className="font-semibold mb-1">Key Achievement{event.year === '2024' ? 's' : ''}:</div>
                    {event.milestones.slice(0, 2).map((milestone, idx) => (
                      <div key={idx} className="text-sm">• {milestone}</div>
                    ))}
                    {event.milestones.length > 2 && (
                      <div className="text-sm mt-1">+{event.milestones.length - 2} more</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            🌟 Four generations of dedication to quality and innovation in natural produce
          </p>
          <button 
            onClick={() => handleDemoAction('view_ledger', 'Company Heritage')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-700 transition-all transform hover:scale-105"
          >
            📖 Read Our Complete Story
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeritageTimeline;