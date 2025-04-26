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

export interface DiagnosisData {
  id: string;
  diagnosisDate: string;
  type: string;
  aiDiagnosis: string;
  confidence: number;
  status: string;
  symptoms: string;
  doctorName: string;
  doctorFeedback: string;
  imageSrc?: string;
  aiModelData?: {
    modelVersion: string;
    analysisTimestamp: string;
    processingTime: string;
    featuresAnalyzed: string;
  };
  treatmentRecommendations?: string[];
  riskFactors?: string[];
  aiResponse?: {
    fullText: string;
    sections: Record<string, string>;
  };
}

export interface SymptomSubmission {
  description: string;
  duration: string;
  severity: string;
  medicalHistory?: string;
}

export interface ImageSubmission {
  imageData: string;
  imageType: string;
  bodyPart: string;
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
  },
  
  /**
   * Submit a symptom diagnosis to the ML backend
   * @param symptomData - Symptom data
   * @param analysisResult - Result from symptom analysis
   */
  submitSymptomDiagnosis: async (
    symptomData: SymptomSubmission,
    analysisResult: SymptomAnalysisResult
  ): Promise<{ diagnosisId: string }> => {
    try {
      const response = await axios.post(`${ML_API_URL}/api/diagnoses`, {
        type: 'symptoms',
        data: {
          ...symptomData,
          mlAnalysis: {
            diagnosis: analysisResult.diagnosis,
            confidence: analysisResult.confidence,
            recommendation: analysisResult.recommendation,
            modelUsed: analysisResult.model_used,
            differentialDiagnosis: analysisResult.differential_diagnosis
          }
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting diagnosis:', error);
      throw error;
    }
  },
  
  /**
   * Submit an image diagnosis to the ML backend
   * @param imageData - Image submission data
   * @param analysisResult - Result from image analysis
   */
  submitImageDiagnosis: async (
    imageData: ImageSubmission,
    analysisResult: ImageAnalysisResult
  ): Promise<{ diagnosisId: string }> => {
    try {
      const response = await axios.post(`${ML_API_URL}/api/diagnoses`, {
        type: 'image',
        data: {
          ...imageData,
          mlAnalysis: {
            diagnosis: analysisResult.diagnosis,
            confidence: analysisResult.confidence,
            allProbabilities: analysisResult.all_probabilities
          }
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting diagnosis:', error);
      throw error;
    }
  },
  
  /**
   * Get all diagnoses
   */
  getDiagnoses: async (): Promise<DiagnosisData[]> => {
    try {
      const response = await axios.get(`${ML_API_URL}/api/diagnoses`);
      return response.data.diagnoses;
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      throw error;
    }
  },
  
  /**
   * Get a diagnosis by ID
   * @param id - Diagnosis ID
   */
  getDiagnosisById: async (id: string): Promise<DiagnosisData> => {
    try {
      const response = await axios.get(`${ML_API_URL}/api/diagnoses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching diagnosis:', error);
      throw error;
    }
  }
};

export default mlService; 