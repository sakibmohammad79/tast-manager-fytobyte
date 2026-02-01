'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
 
  const responseEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (aiResponse) {
      scrollToBottom();
    }
  }, [aiResponse]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!userInput.trim()) return;

    setLoading(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userInput })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAiResponse('Error: ' + errorData.error);
        setLoading(false);
        return;
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setAiResponse('Error: No response stream');
        setLoading(false);
        return;
      }

      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setAiResponse(fullText); 
      }

    } catch (error) {
      console.error('Error:', error);
      setAiResponse('Failed to get response from AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2 text-gray-800">
          Gemini AI Chat
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Ask anything to Gemini AI - Real-time Streaming
        </p>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write your question here
              </label>
              <textarea
                placeholder="example: What is JavaScript?"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                rows={4}
                disabled={loading}
              />
            </div >
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Send to Gemini'}
            </button>
          </form>
        </div>

        {/* AI Response */}
        {(aiResponse || loading) && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 max-h-150 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2 sticky top-0 bg-white pb-2">
              Gemini Response:
            </h2>
            <div className="prose max-w-none">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {aiResponse}
                {loading && (
                  <span className="inline-block w-2 h-5 bg-purple-600 animate-pulse ml-1"></span>
                )}
                {/* Auto-scroll anchor */}
                <div ref={responseEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}