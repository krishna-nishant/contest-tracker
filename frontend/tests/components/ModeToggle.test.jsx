import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle } from '../../src/components/ModeToggle';
import { useTheme } from '../../src/components/theme-provider';

// Mock the useTheme hook
vi.mock('../../src/components/theme-provider', () => ({
  useTheme: vi.fn()
}));

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }) => (
    <button 
      onClick={onClick} 
      data-variant={variant} 
      data-size={size}
      aria-label="Toggle theme"
    >
      {children}
    </button>
  )
}));

// Mock the Lucide icons
vi.mock('lucide-react', () => ({
  Moon: () => <span data-testid="moon-icon">🌙</span>,
  Sun: () => <span data-testid="sun-icon">☀️</span>
}));

describe('ModeToggle Component', () => {
  it('renders the moon icon when theme is light', () => {
    // Mock the theme as light
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn()
    });
    
    render(<ModeToggle />);
    
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });
  
  it('renders the sun icon when theme is dark', () => {
    // Mock the theme as dark
    useTheme.mockReturnValue({
      theme: 'dark',
      setTheme: vi.fn()
    });
    
    render(<ModeToggle />);
    
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });
  
  it('toggles the theme when clicked', () => {
    // Mock the theme as light and create a mock for setTheme
    const setThemeMock = vi.fn();
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: setThemeMock
    });
    
    render(<ModeToggle />);
    
    // Find the button and click it
    const button = screen.getByRole('button', { name: 'Toggle theme' });
    fireEvent.click(button);
    
    // Expect setTheme to have been called with 'dark'
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });
  
  it('has the correct button variant and size', () => {
    useTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn()
    });
    
    render(<ModeToggle />);
    
    const button = screen.getByRole('button', { name: 'Toggle theme' });
    expect(button).toHaveAttribute('data-variant', 'ghost');
    expect(button).toHaveAttribute('data-size', 'icon');
  });
});