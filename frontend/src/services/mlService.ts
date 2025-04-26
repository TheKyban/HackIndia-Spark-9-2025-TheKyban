import axios from 'axios';

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5001';

export interface SymptomAnalysisResult {
  diagnosis: string;
  confidence: number;
  recommendation: string;
  model_used: string;
  differential_diagnosis?: Record<string, number>;
}

export interface ImageAnalysisResult {
  diagnosis: string;
  confidence: number;
  all_probabilities: Record<string, number>;
}

/**
 * Service for interacting with the ML API
 */
const mlService = {
  /**
   * Analyze patient symptoms using the ML API
   * @param symptoms - Description of symptoms
   */
  analyzeSymptoms: async (symptoms: string): Promise<SymptomAnalysisResult> => {
    try {
      const response = await axios.post(`${ML_API_URL}/api/symptoms`, {
        symptoms
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw error;
    }
  },
  
  /**
   * Analyze medical images using the ML API
   * @param imageData - Base64 encoded image data
   */
  analyzeImage: async (imageData: string): Promise<ImageAnalysisResult> => {
    try {
      const formData = new FormData();
      
      // Convert base64 to blob
      const base64Response = await fetch(imageData);
      const imageBlob = await base64Response.blob();
      
      // Append the blob to the form data
      formData.append('image', imageBlob);
      
      const response = await axios.post(`${ML_API_URL}/api/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }
};

export default mlService; 