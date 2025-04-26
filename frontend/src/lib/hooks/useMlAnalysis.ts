import { useState } from 'react';
import mlService, { SymptomAnalysisResult, ImageAnalysisResult } from '@/services/mlService';

interface UseMlAnalysisResult {
  // Symptom analysis
  analyzeSymptoms: (symptoms: string) => Promise<SymptomAnalysisResult>;
  symptomResult: SymptomAnalysisResult | null;
  isAnalyzingSymptoms: boolean;
  symptomError: Error | null;
  
  // Image analysis
  analyzeImage: (imageData: string) => Promise<ImageAnalysisResult>;
  imageResult: ImageAnalysisResult | null;
  isAnalyzingImage: boolean;
  imageError: Error | null;
  
  // Clear results
  clearResults: () => void;
}

/**
 * Hook for analyzing symptoms and images using the ML API
 */
export function useMlAnalysis(): UseMlAnalysisResult {
  // Symptom analysis state
  const [symptomResult, setSymptomResult] = useState<SymptomAnalysisResult | null>(null);
  const [isAnalyzingSymptoms, setIsAnalyzingSymptoms] = useState(false);
  const [symptomError, setSymptomError] = useState<Error | null>(null);
  
  // Image analysis state
  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState<Error | null>(null);
  
  /**
   * Analyze symptoms using the ML API
   */
  const analyzeSymptoms = async (symptoms: string): Promise<SymptomAnalysisResult> => {
    setIsAnalyzingSymptoms(true);
    setSymptomError(null);
    
    try {
      const result = await mlService.analyzeSymptoms(symptoms);
      setSymptomResult(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to analyze symptoms');
      setSymptomError(err);
      throw err;
    } finally {
      setIsAnalyzingSymptoms(false);
    }
  };
  
  /**
   * Analyze an image using the ML API
   */
  const analyzeImage = async (imageData: string): Promise<ImageAnalysisResult> => {
    setIsAnalyzingImage(true);
    setImageError(null);
    
    try {
      const result = await mlService.analyzeImage(imageData);
      setImageResult(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to analyze image');
      setImageError(err);
      throw err;
    } finally {
      setIsAnalyzingImage(false);
    }
  };
  
  /**
   * Clear all analysis results
   */
  const clearResults = () => {
    setSymptomResult(null);
    setImageResult(null);
    setSymptomError(null);
    setImageError(null);
  };
  
  return {
    analyzeSymptoms,
    symptomResult,
    isAnalyzingSymptoms,
    symptomError,
    
    analyzeImage,
    imageResult,
    isAnalyzingImage,
    imageError,
    
    clearResults
  };
} 