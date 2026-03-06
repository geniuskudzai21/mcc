// @ts-ignore
import * as tf from '@tensorflow/tfjs';

// Simple text classification for service requests
export class ServiceRequestClassifier {
  private model: tf.LayersModel | null = null;

  async loadModel() {
    // Create a simple text classification model
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 6, activation: 'softmax' }) // 6 categories
      ]
    });

    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  // Simple keyword-based text preprocessing
  preprocessText(text: string): tf.Tensor {
    const keywords = [
      'water', 'electricity', 'bill', 'payment', 'leak', 'power',
      'waste', 'garbage', 'road', 'street', 'light', 'sewer',
      'park', 'noise', 'building', 'permit', 'inspection'
    ];
    
    const features = new Array(100).fill(0);
    const words = text.toLowerCase().split(' ');
    
    keywords.forEach((keyword, index) => {
      if (words.includes(keyword)) {
        features[index] = 1;
      }
    });
    
    return tf.tensor2d([features]);
  }

  async classifyRequest(description: string): Promise<{
    category: string;
    confidence: number;
  }> {
    if (!this.model) await this.loadModel();

    const categories = [
      'Water Services', 'Electricity', 'Billing', 'Waste Management',
      'Infrastructure', 'General Inquiry'
    ];

    const input = this.preprocessText(description);
    const prediction = this.model!.predict(input) as tf.Tensor;
    const probabilities = await prediction.data() as Float32Array;
    
    const maxIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
    const confidence = probabilities[maxIndex];
    
    input.dispose();
    prediction.dispose();
    
    return {
      category: categories[maxIndex],
      confidence: confidence
    };
  }

  // Simple urgency detection
  detectUrgency(text: string): 'high' | 'medium' | 'low' {
    const urgentKeywords = ['emergency', 'urgent', 'immediate', 'critical', 'danger', 'leak', 'outage'];
    const mediumKeywords = ['soon', 'within', 'days', 'week'];
    
    const lowerText = text.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }
}

// Usage example in your service request component
export const useAIRequestProcessor = () => {
  const classifier = new ServiceRequestClassifier();

  const processRequest = async (description: string) => {
    const [classification, urgency] = await Promise.all([
      classifier.classifyRequest(description),
      Promise.resolve(classifier.detectUrgency(description))
    ]);

    return {
      ...classification,
      urgency,
      suggestedPriority: urgency === 'high' ? 1 : urgency === 'medium' ? 2 : 3
    };
  };

  return { processRequest };
};
