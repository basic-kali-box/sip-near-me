import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ListView } from '../ListView';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: [
                {
                  id: '1',
                  name: 'Espresso',
                  description: 'Strong coffee',
                  price: 15,
                  category: 'hot-drinks',
                  is_available: true,
                  seller_id: 'seller1',
                  seller: {
                    id: 'seller1',
                    business_name: 'Coffee Shop',
                    specialty: 'coffee',
                    rating_average: 4.5
                  }
                },
                {
                  id: '2',
                  name: 'Matcha Latte',
                  description: 'Creamy matcha',
                  price: 25,
                  category: 'hot-drinks',
                  is_available: true,
                  seller_id: 'seller2',
                  seller: {
                    id: 'seller2',
                    business_name: 'Matcha House',
                    specialty: 'matcha',
                    rating_average: 4.8
                  }
                }
              ],
              error: null
            }))
          }))
        }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn()
      }))
    })),
    removeChannel: jest.fn()
  }
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </BrowserRouter>
);

describe('ListView Filter Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders filter button', async () => {
    render(
      <TestWrapper>
        <ListView />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();
    });
  });

  test('opens filter sheet when filter button is clicked', async () => {
    render(
      <TestWrapper>
        <ListView />
      </TestWrapper>
    );

    await waitFor(() => {
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Sort By')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Seller Specialties')).toBeInTheDocument();
      expect(screen.getByText(/Price Range/)).toBeInTheDocument();
    });
  });

  test('shows active filter indicator when filters are applied', async () => {
    render(
      <TestWrapper>
        <ListView />
      </TestWrapper>
    );

    await waitFor(() => {
      const filterButton = screen.getByRole('button', { name: /filter/i });
      fireEvent.click(filterButton);
    });

    // Select a category filter
    await waitFor(() => {
      const hotDrinksCheckbox = screen.getByLabelText(/Hot Drinks/);
      fireEvent.click(hotDrinksCheckbox);
    });

    // Check if filter button shows active state
    await waitFor(() => {
      const filterButton = screen.getByRole('button', { name: /filter/i });
      expect(filterButton).toHaveClass('bg-primary/10');
    });
  });
});
