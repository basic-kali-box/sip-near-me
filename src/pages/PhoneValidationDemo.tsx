import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoroccanPhoneInput } from '@/components/ui/moroccan-phone-input';
import { validateAndNormalizeMoroccanPhone, testMoroccanPhoneValidation } from '@/utils/moroccanPhoneValidation';
import { sendWhatsAppMessage } from '@/utils/whatsapp';
import { useToast } from '@/hooks/use-toast';
import { Phone, MessageCircle, TestTube, CheckCircle, XCircle } from 'lucide-react';

const PhoneValidationDemo: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  const testCases = [
    { input: '212606060606', description: 'International format (correct)' },
    { input: '2120606060606', description: 'International with leading 0 (needs normalization)' },
    { input: '0606060606', description: 'Local format with leading 0' },
    { input: '606060606', description: 'Local format without leading 0' },
    { input: '0706060606', description: 'Local format starting with 07' },
    { input: '+212 606 060 606', description: 'Formatted international' },
    { input: '212506060606', description: 'Invalid - starts with 5' },
    { input: '21260606060', description: 'Invalid - too short' },
    { input: '2126060606066', description: 'Invalid - too long' },
  ];

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    const result = validateAndNormalizeMoroccanPhone(value);
    setValidationResult(result);
  };

  const handleTestWhatsApp = () => {
    if (validationResult?.isValid) {
      const message = "🧪 Test message from Sip Near Me phone validation demo!";
      sendWhatsAppMessage(phoneNumber, message);
      toast({
        title: "Opening WhatsApp",
        description: `Testing with normalized number: ${validationResult.normalizedNumber}`,
      });
    }
  };

  const runAllTests = () => {
    testMoroccanPhoneValidation();
    toast({
      title: "Test Results",
      description: "Check the browser console for detailed test results",
    });
  };

  const testSpecificCase = (testCase: string) => {
    setPhoneNumber(testCase);
    handlePhoneChange(testCase);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-matcha-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🇲🇦 Moroccan Phone Validation Demo
          </h1>
          <p className="text-gray-600">
            Test phone number validation and normalization for WhatsApp API
          </p>
        </div>

        {/* Main Input */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Phone Number Input
            </h2>
            
            <MoroccanPhoneInput
              value={phoneNumber}
              onChange={handlePhoneChange}
              label="Enter Moroccan Phone Number"
              required
              showValidationFeedback
              showFormattedPreview
            />

            {/* Validation Results */}
            {validationResult && phoneNumber && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  Validation Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Valid:</strong> {validationResult.isValid ? '✅ Yes' : '❌ No'}
                  </div>
                  <div>
                    <strong>Input Format:</strong> <Badge variant="outline">{validationResult.inputFormat}</Badge>
                  </div>
                  <div>
                    <strong>Normalized:</strong> <code className="bg-white px-2 py-1 rounded">{validationResult.normalizedNumber || 'N/A'}</code>
                  </div>
                  <div>
                    <strong>Display:</strong> <code className="bg-white px-2 py-1 rounded">{validationResult.displayNumber || 'N/A'}</code>
                  </div>
                  {validationResult.errorMessage && (
                    <div className="md:col-span-2">
                      <strong>Error:</strong> <span className="text-red-600">{validationResult.errorMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleTestWhatsApp}
                disabled={!validationResult?.isValid}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Test WhatsApp
              </Button>
              <Button
                onClick={runAllTests}
                variant="outline"
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                Run All Tests
              </Button>
            </div>
          </div>
        </Card>

        {/* Test Cases */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testCases.map((testCase, index) => {
              const result = validateAndNormalizeMoroccanPhone(testCase.input);
              return (
                <button
                  key={index}
                  onClick={() => testSpecificCase(testCase.input)}
                  className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                    phoneNumber === testCase.input ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {testCase.input}
                    </code>
                    {result.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{testCase.description}</p>
                  {result.isValid && (
                    <p className="text-xs text-green-600 mt-1">→ {result.displayNumber}</p>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Documentation */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Validation Rules</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">✅ Supported Formats:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• <code>0606060606</code> - Local with leading 0</li>
                  <li>• <code>606060606</code> - Local without leading 0</li>
                  <li>• <code>212606060606</code> - International format</li>
                  <li>• <code>+212 606 060 606</code> - Formatted</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎯 WhatsApp Requirements:</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Must start with <code>+212</code></li>
                  <li>• Followed by 9 digits</li>
                  <li>• First digit must be 6 or 7</li>
                  <li>• No leading 0 after country code</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PhoneValidationDemo;
