// Navigation Test Utilities
// This file contains utilities to test navigation functionality in development

export interface NavigationTestResult {
  success: boolean;
  error?: string;
  route?: string;
  state?: any;
}

export class NavigationTester {
  private results: NavigationTestResult[] = [];

  // Test direct navigation to signin
  testSignInNavigation(): NavigationTestResult {
    try {
      const currentPath = window.location.pathname;
      const expectedPath = '/signin';
      
      const result: NavigationTestResult = {
        success: currentPath === expectedPath,
        route: currentPath
      };

      if (!result.success) {
        result.error = `Expected path ${expectedPath}, got ${currentPath}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: NavigationTestResult = {
        success: false,
        error: (error as Error).message
      };
      this.results.push(result);
      return result;
    }
  }

  // Test navigation to signup with seller pre-selection
  testSellerSignUpNavigation(): NavigationTestResult {
    try {
      const currentPath = window.location.pathname;
      const expectedPath = '/signup';
      
      // Check if we're on the signup page
      const pathCorrect = currentPath === expectedPath;
      
      // Check if seller is pre-selected (this would need to be checked in the component)
      const result: NavigationTestResult = {
        success: pathCorrect,
        route: currentPath,
        state: history.state
      };

      if (!result.success) {
        result.error = `Expected path ${expectedPath}, got ${currentPath}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: NavigationTestResult = {
        success: false,
        error: (error as Error).message
      };
      this.results.push(result);
      return result;
    }
  }

  // Test URL parameter parsing
  testUrlParameterParsing(searchParams: string): NavigationTestResult {
    try {
      const params = new URLSearchParams(searchParams);
      const userType = params.get('userType');
      
      const result: NavigationTestResult = {
        success: userType === 'seller' || userType === 'buyer' || userType === null,
        route: `?${searchParams}`,
        state: { userType }
      };

      if (!result.success) {
        result.error = `Invalid userType parameter: ${userType}`;
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: NavigationTestResult = {
        success: false,
        error: (error as Error).message
      };
      this.results.push(result);
      return result;
    }
  }

  // Test form validation
  testFormValidation(formData: any): NavigationTestResult {
    try {
      const errors: string[] = [];

      if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
      }

      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.push('Valid email is required');
      }

      if (!formData.password || formData.password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }

      if (!formData.userType || !['buyer', 'seller'].includes(formData.userType)) {
        errors.push('Valid user type is required');
      }

      const result: NavigationTestResult = {
        success: errors.length === 0,
        state: { errors, formData }
      };

      if (!result.success) {
        result.error = errors.join(', ');
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: NavigationTestResult = {
        success: false,
        error: (error as Error).message
      };
      this.results.push(result);
      return result;
    }
  }

  // Test accessibility attributes
  testAccessibilityAttributes(element: HTMLElement): NavigationTestResult {
    try {
      const errors: string[] = [];

      // Check for aria-label or aria-labelledby
      if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        errors.push('Missing aria-label or aria-labelledby');
      }

      // Check for proper role if it's a button
      if (element.tagName === 'BUTTON' && !element.getAttribute('role')) {
        // Buttons have implicit role, so this is okay
      }

      // Check for keyboard accessibility
      if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
        errors.push('Element may not be keyboard accessible');
      }

      const result: NavigationTestResult = {
        success: errors.length === 0,
        state: { 
          tagName: element.tagName,
          attributes: Array.from(element.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          }))
        }
      };

      if (!result.success) {
        result.error = errors.join(', ');
      }

      this.results.push(result);
      return result;
    } catch (error) {
      const result: NavigationTestResult = {
        success: false,
        error: (error as Error).message
      };
      this.results.push(result);
      return result;
    }
  }

  // Get all test results
  getResults(): NavigationTestResult[] {
    return this.results;
  }

  // Get summary of test results
  getSummary(): { total: number; passed: number; failed: number; passRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, failed, passRate };
  }

  // Clear all results
  clearResults(): void {
    this.results = [];
  }

  // Log results to console
  logResults(): void {
    console.group('Navigation Test Results');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`Test ${index + 1}: ${status}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
      if (result.route) {
        console.log(`  Route: ${result.route}`);
      }
      if (result.state) {
        console.log(`  State:`, result.state);
      }
    });
    
    const summary = this.getSummary();
    console.log(`\nSummary: ${summary.passed}/${summary.total} tests passed (${summary.passRate.toFixed(1)}%)`);
    console.groupEnd();
  }
}

// Export a singleton instance for easy use
export const navigationTester = new NavigationTester();
