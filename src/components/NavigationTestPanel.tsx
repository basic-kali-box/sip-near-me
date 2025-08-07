import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { createNavigationHelpers } from '@/utils/navigationHelpers';
import { navigationTester, NavigationTestResult } from '@/utils/navigationTest';
import { TestTube, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

// This component is only for development testing
export const NavigationTestPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [testResults, setTestResults] = useState<NavigationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const navigationHelpers = createNavigationHelpers(navigate);

  const runAllTests = async () => {
    setIsRunning(true);
    navigationTester.clearResults();

    // Test URL parameter parsing
    navigationTester.testUrlParameterParsing('userType=seller');
    navigationTester.testUrlParameterParsing('userType=buyer');
    navigationTester.testUrlParameterParsing('invalid=test');

    // Test form validation
    navigationTester.testFormValidation({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      userType: 'buyer'
    });

    navigationTester.testFormValidation({
      name: '',
      email: 'invalid-email',
      password: '123',
      userType: 'invalid'
    });

    // Test accessibility (mock element)
    const mockButton = document.createElement('button');
    mockButton.setAttribute('aria-label', 'Test button');
    navigationTester.testAccessibilityAttributes(mockButton);

    const mockButtonBad = document.createElement('button');
    navigationTester.testAccessibilityAttributes(mockButtonBad);

    const results = navigationTester.getResults();
    setTestResults(results);
    setIsRunning(false);
  };

  const testNavigation = (type: 'signin' | 'signup' | 'seller-signup') => {
    switch (type) {
      case 'signin':
        navigationHelpers.navigateToSignIn();
        break;
      case 'signup':
        navigationHelpers.navigateToSignUp();
        break;
      case 'seller-signup':
        navigationHelpers.navigateToSellerSignUp('test-panel');
        break;
    }
  };

  const summary = testResults.length > 0 ? {
    total: testResults.length,
    passed: testResults.filter(r => r.success).length,
    failed: testResults.filter(r => !r.success).length
  } : null;

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 p-4 bg-background/95 backdrop-blur-md border shadow-lg z-50">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Navigation Test Panel</h3>
          <Badge variant="outline" className="text-xs">DEV</Badge>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Current: {location.pathname}
            {location.search && ` (${location.search})`}
          </p>
          
          {location.state && (
            <div className="text-xs bg-muted p-2 rounded">
              State: {JSON.stringify(location.state, null, 2)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Test Navigation:</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => testNavigation('signin')}
              className="text-xs"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => testNavigation('signup')}
              className="text-xs"
            >
              Sign Up
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => testNavigation('seller-signup')}
              className="text-xs"
            >
              Seller
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Validation Tests:</h4>
            <Button
              size="sm"
              onClick={runAllTests}
              disabled={isRunning}
              className="text-xs"
            >
              {isRunning ? (
                <RotateCcw className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <TestTube className="w-3 h-3 mr-1" />
              )}
              Run Tests
            </Button>
          </div>

          {summary && (
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={summary.failed === 0 ? "default" : "destructive"}>
                {summary.passed}/{summary.total} passed
              </Badge>
            </div>
          )}

          {testResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-xs p-1 rounded bg-muted/50"
                >
                  {result.success ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="flex-1 truncate">
                    Test {index + 1}
                    {result.error && `: ${result.error}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
