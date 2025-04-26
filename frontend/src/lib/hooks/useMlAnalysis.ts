import { useState, useCallback } from 'react';
import mlService, { 
  SymptomAnalysisResult, 
  ImageAnalysisResult,
  DiagnosisData,
  SymptomSubmission,
  ImageSubmission
} from '@/services/mlService';

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
  
  // Diagnosis submission
  submitSymptomDiagnosis: (symptomData: SymptomSubmission, analysisResult: SymptomAnalysisResult) => Promise<{ diagnosisId: string }>;
  submitImageDiagnosis: (imageData: ImageSubmission, analysisResult: ImageAnalysisResult) => Promise<{ diagnosisId: string }>;
  isSubmittingDiagnosis: boolean;
  submissionError: Error | null;
  
  // Diagnosis retrieval
  getDiagnoses: () => Promise<DiagnosisData[]>;
  getDiagnosisById: (id: string) => Promise<DiagnosisData>;
  diagnoses: DiagnosisData[] | null;
  currentDiagnosis: DiagnosisData | null;
  isLoadingDiagnoses: boolean;
  diagnosesError: Error | null;
  
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
  
  // Diagnosis submission state
  const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);
  const [submissionError, setSubmissionError] = useState<Error | null>(null);
  
  // Diagnosis retrieval state
  const [diagnoses, setDiagnoses] = useState<DiagnosisData[] | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisData | null>(null);
  const [isLoadingDiagnoses, setIsLoadingDiagnoses] = useState(false);
  const [diagnosesError, setDiagnosesError] = useState<Error | null>(null);
  
  /**
   * Analyze symptoms using the ML API
   */
  const analyzeSymptoms = useCallback(async (symptoms: string): Promise<SymptomAnalysisResult> => {
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
  }, []);
  
  /**
   * Analyze an image using the ML API
   */
  const analyzeImage = useCallback(async (imageData: string): Promise<ImageAnalysisResult> => {
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
  }, []);
  
  /**
   * Submit a symptom diagnosis to the ML backend
   */
  const submitSymptomDiagnosis = useCallback(async (
    symptomData: SymptomSubmission,
    analysisResult: SymptomAnalysisResult
  ): Promise<{ diagnosisId: string }> => {
    setIsSubmittingDiagnosis(true);
    setSubmissionError(null);
    
    try {
      const result = await mlService.submitSymptomDiagnosis(symptomData, analysisResult);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to submit symptom diagnosis');
      setSubmissionError(err);
      throw err;
    } finally {
      setIsSubmittingDiagnosis(false);
    }
  }, []);
  
  /**
   * Submit an image diagnosis to the ML backend
   */
  const submitImageDiagnosis = useCallback(async (
    imageData: ImageSubmission,
    analysisResult: ImageAnalysisResult
  ): Promise<{ diagnosisId: string }> => {
    setIsSubmittingDiagnosis(true);
    setSubmissionError(null);
    
    try {
      const result = await mlService.submitImageDiagnosis(imageData, analysisResult);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to submit image diagnosis');
      setSubmissionError(err);
      throw err;
    } finally {
      setIsSubmittingDiagnosis(false);
    }
  }, []);
  
  /**
   * Get all diagnoses
   */
  const getDiagnoses = useCallback(async (): Promise<DiagnosisData[]> => {
    setIsLoadingDiagnoses(true);
    setDiagnosesError(null);
    
    try {
      const result = await mlService.getDiagnoses();
      setDiagnoses(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch diagnoses');
      setDiagnosesError(err);
      throw err;
    } finally {
      setIsLoadingDiagnoses(false);
    }
  }, []);
  
  /**
   * Get a diagnosis by ID
   */
  const getDiagnosisById = useCallback(async (id: string): Promise<DiagnosisData> => {
    setIsLoadingDiagnoses(true);
    setDiagnosesError(null);
    
    try {
      const result = await mlService.getDiagnosisById(id);
      setCurrentDiagnosis(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(`Failed to fetch diagnosis with ID: ${id}`);
      setDiagnosesError(err);
      throw err;
    } finally {
      setIsLoadingDiagnoses(false);
    }
  }, []);
  
  /**
   * Clear all analysis results
   */
  const clearResults = useCallback(() => {
    setSymptomResult(null);
    setImageResult(null);
    setSymptomError(null);
    setImageError(null);
    setSubmissionError(null);
    setDiagnosesError(null);
  }, []);
  
  return {
    analyzeSymptoms,
    symptomResult,
    isAnalyzingSymptoms,
    symptomError,
    
    analyzeImage,
    imageResult,
    isAnalyzingImage,
    imageError,
    
    submitSymptomDiagnosis,
    submitImageDiagnosis,
    isSubmittingDiagnosis,
    submissionError,
    
    getDiagnoses,
    getDiagnosisById,
    diagnoses,
    currentDiagnosis,
    isLoadingDiagnoses,
    diagnosesError,
    
    clearResults
  };
}