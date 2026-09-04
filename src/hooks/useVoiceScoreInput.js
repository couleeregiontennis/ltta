import { useState, useEffect, useRef } from 'react';
import api from '../scripts/apiClient';

export const useVoiceScoreInput = (onScoreParsed) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionError, setRecognitionError] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSuccess, setAiSuccess] = useState('');
  const [aiError, setAiError] = useState('');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionRef = useRef(null);

  // Keep references to prevent stale closures and excessive useEffect re-runs
  const onScoreParsedRef = useRef(onScoreParsed);
  onScoreParsedRef.current = onScoreParsed;

  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const parseTranscriptWithAI = async (text) => {
    setAiProcessing(true);
    setAiError('');
    setAiSuccess('');
    try {
      const parsedData = await api.post('/ai/parse-score', { transcript: text });

      setAiSuccess('Transcript parsed successfully by AI!');
      if (onScoreParsedRef.current) {
        onScoreParsedRef.current(parsedData);
      }
      return parsedData;
    } catch (err) {
      setAiError('Error parsing score with AI: ' + err.message);
      return null;
    } finally {
      setAiProcessing(false);
    }
  };

  useEffect(() => {
    if (!SpeechRecognition) {
      setRecognitionError('Speech Recognition not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recognitionRef.current = rec;

    rec.onstart = () => {
      setIsListening(true);
      setRecognitionError('');
      setAiSuccess('');
      setAiError('');
      setTranscript('');
      transcriptRef.current = '';
    };

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const newTranscript = finalTranscript || interimTranscript;
      setTranscript(newTranscript);
      transcriptRef.current = newTranscript;
    };

    rec.onerror = (event) => {
      setRecognitionError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      // Retrieve the latest value from the ref to avoid stale closure
      const currentText = transcriptRef.current;
      if (currentText && currentText.trim()) {
        parseTranscriptWithAI(currentText);
      }
    };
  }, [SpeechRecognition, transcript, onScoreParsed]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    transcript,
    recognitionError,
    aiProcessing,
    aiSuccess,
    aiError,
    startListening,
    stopListening,
    isSpeechRecognitionSupported: !!SpeechRecognition
  };
};
