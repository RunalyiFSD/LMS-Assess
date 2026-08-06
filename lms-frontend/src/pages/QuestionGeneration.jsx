import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import { Sparkles } from 'lucide-react';
import QuestionConfigurationCard from '../components/ai/QuestionConfigurationCard';
import EmptyState from '../components/ai/EmptyState';
import LoadingState from '../components/ai/LoadingState';
import ErrorState from '../components/ai/ErrorState';
import SuccessState from '../components/ai/SuccessState';
import aiService from '../services/aiService';
import api from '../services/api';
import { mapAIToQuestionSchema } from '../utils/aiSchemaMapper';

const QuestionGeneration = () => {
  const [form, setForm] = useState({
    topic: '',
    subject: '', // ObjectId
    marksPerQuestion: 1, // configurable marks
    type: 'mcq',
    difficulty: 'medium',
    count: 1,
    language: 'javascript', // only for coding
    instructions: '',
  });

  const [errors, setErrors] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [result, setResult] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Selection & Saving State
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  
  // Fetch subjects on mount
  React.useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        if (res.data?.status === 'success') {
          // API may return { data: { subjects: [] } } or { data: [] } — normalise both
          const list = res.data.data.subjects || res.data.data || [];
          setSubjects(list);
          if (list.length > 0) {
            setForm(prev => ({ ...prev, subject: list[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      }
    };
    fetchSubjects();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!form.topic.trim()) {
      newErrors.topic = 'Topic is required.';
    }
    if (!form.subject) {
      newErrors.subject = 'Subject is required.';
    }
    if (form.count < 1 || form.count > 10) {
      newErrors.count = 'Count must be between 1 and 10.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setIsGenerating(true);
    setApiError(null);
    setResult(null);
    setSaveResult(null);
    setSelectedIndices([]);

    try {
      const payloadTopic = form.type === 'coding' ? `${form.language} - ${form.topic}` : form.topic;
      const payload = {
        topic: payloadTopic,
        type: form.type,
        difficulty: form.difficulty,
        count: parseInt(form.count, 10)
      };

      const res = await aiService.generateQuestions(payload);
      setResult(res.data);
      // Select all by default when generated
      if (res.data?.questions) {
        setSelectedIndices(res.data.questions.map((_, i) => i));
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setForm({
      topic: '',
      subject: subjects.length > 0 ? subjects[0]._id : '',
      marksPerQuestion: 1,
      type: 'mcq',
      difficulty: 'medium',
      count: 1,
      language: 'javascript',
      instructions: '',
    });
    setErrors({});
    setIsGenerating(false);
    setApiError(null);
    setResult(null);
    setSaveResult(null);
    setSelectedIndices([]);
  };

  const handleToggleSelection = (index) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedIndices.length === result.questions.length) {
      setSelectedIndices([]); // deselect all
    } else {
      setSelectedIndices(result.questions.map((_, i) => i)); // select all
    }
  };

  const handleSaveToBank = async (saveAll = false) => {
    if (!result || !result.questions) return;
    setIsSaving(true);
    setSaveResult(null);

    const indicesToSave = saveAll ? result.questions.map((_, i) => i) : selectedIndices;
    let savedCount = 0;
    let failedCount = 0;
    let duplicateCount = 0;

    try {
      // Pre-fetch existing questions to detect duplicates
      const existingReq = await api.get(`/questions?type=${form.type}&subject=${form.subject}`);
      const existingQuestions = existingReq.data?.data?.questions || [];

      // Sequential processing — one at a time so each failure is clearly isolated
      for (const idx of indicesToSave) {
        const aiQuestion = result.questions[idx];
        const mappedPayload = mapAIToQuestionSchema(aiQuestion, form);

        // Duplicate detection
        const isDuplicate = existingQuestions.some(eq => {
          if (form.type === 'coding') {
            return eq.title === mappedPayload.title && eq.description === mappedPayload.description;
          }
          return eq.question === mappedPayload.question;
        });

        if (isDuplicate) {
          duplicateCount++;
          continue;
        }

        try {
          const saveRes = await api.post(`/questions/${form.type}`, mappedPayload);
          savedCount++;
        } catch (err) {
          console.error(`[handleSaveToBank] idx=${idx} FAILED — status:`, err?.response?.status);
          console.error(`[handleSaveToBank] idx=${idx} ERROR:`, err?.response?.data);
          failedCount++;
        }
      }

      setSaveResult({
        saved: savedCount,
        failed: failedCount,
        duplicates: duplicateCount
      });
    } catch (err) {
      console.error('Error during save process:', err);
      setSaveResult({ saved: 0, failed: indicesToSave.length, duplicates: 0 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-brand-500" /> AI Question Generator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Instantly draft high-quality questions for your assessments using AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-1 space-y-6">
          <QuestionConfigurationCard 
            form={form}
            errors={errors}
            subjects={subjects}
            isGenerating={isGenerating}
            handleChange={handleChange}
            handleGenerate={handleGenerate}
            handleReset={handleReset}
          />
        </div>

        {/* Right Column: Preview Area */}
        <div className="lg:col-span-2">
          <Card title="Generated Output" bodyClassName="p-0 h-full flex flex-col relative" style={{ minHeight: '500px' }}>
            {isGenerating ? (
              <LoadingState count={form.count} difficulty={form.difficulty} type={form.type} topic={form.topic} />
            ) : apiError ? (
              <ErrorState message={apiError} onRetry={handleGenerate} />
            ) : result ? (
              <SuccessState 
                result={result} 
                type={form.type} 
                selectedIndices={selectedIndices}
                onToggleSelection={handleToggleSelection}
                onSelectAll={handleSelectAll}
                onSave={handleSaveToBank}
                isSaving={isSaving}
                saveResult={saveResult}
              />
            ) : (
              <EmptyState />
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default QuestionGeneration;
