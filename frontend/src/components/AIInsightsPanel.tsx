import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AIInsight {
  type: 'prediction' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

const AIInsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis of recent data
    const mockInsights: AIInsight[] = [
      {
        type: 'prediction',
        title: 'Payment Pattern Anomaly',
        description: 'Water bill payments in Hobhouse suburb showing 15% decline - potential collection issue',
        confidence: 0.87,
        priority: 'high'
      },
      {
        type: 'recommendation',
        title: 'Service Demand Forecast',
        description: 'Expect 30% increase in waste collection requests next month - schedule additional resources',
        confidence: 0.92,
        priority: 'medium'
      },
      {
        type: 'anomaly',
        title: 'Unusual Request Volume',
        description: 'Spike in electricity outage reports in Chikanga area - investigate grid issues',
        confidence: 0.94,
        priority: 'high'
      },
      {
        type: 'prediction',
        title: 'Resource Optimization',
        description: 'Water usage patterns suggest opportunity for conservation campaign in Sakubva',
        confidence: 0.78,
        priority: 'low'
      }
    ];

    // Simulate processing delay
    setTimeout(() => {
      setInsights(mockInsights);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp size={16} />;
      case 'anomaly': return <AlertTriangle size={16} />;
      case 'recommendation': return <CheckCircle size={16} />;
      default: return <Brain size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
        <Brain style={{ width: '20px', color: '#09d6f1' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#001e3c', margin: 0 }}>
          AI Insights
        </h3>
        <span style={{
          fontSize: '0.7rem',
          padding: '0.2rem 0.5rem',
          background: '#f0f9ff',
          color: '#09d6f1',
          borderRadius: '999px',
          fontWeight: 600
        }}>
          BETA
        </span>
      </div>

      {isAnalyzing ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #09d6f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Analyzing municipal data...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {insights.map((insight, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: `1px solid ${getPriorityColor(insight.priority)}20`,
                borderLeft: `3px solid ${getPriorityColor(insight.priority)}`
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#09d6f1',
                flexShrink: 0
              }}>
                {getIcon(insight.type)}
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#001e3c', margin: 0 }}>
                    {insight.title}
                  </h4>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    background: `${getPriorityColor(insight.priority)}20`,
                    color: getPriorityColor(insight.priority),
                    borderRadius: '999px',
                    fontWeight: 600
                  }}>
                    {insight.priority}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0, lineHeight: 1.4 }}>
                  {insight.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: insight.confidence > 0.8 ? '#10b981' : insight.confidence > 0.6 ? '#f59e0b' : '#dc2626'
                    }} />
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    • {insight.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={generateInsights}
          disabled={isAnalyzing}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: '#f0f9ff',
            color: '#09d6f1',
            border: '1px solid #09d6f120',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: isAnalyzing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Clock size={14} />
          {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIInsightsPanel;
