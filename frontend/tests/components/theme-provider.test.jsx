import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../src/components/theme-provider';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock matchMedia
const setupMatchMedia = (matches) => {
  const listeners = new Set();
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: (event, listener) => listeners.add(listener),
      removeEventListener: (event, listener) => listeners.delete(listener),
      dispatchEvent: vi.fn(),
      _listeners: listeners, // expose listeners for testing
    })),
  });
};

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    document.documentElement.classList.remove('dark', 'light');
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('provides default theme when no theme is stored', () => {
    setupMatchMedia(false);
    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('current-theme').textContent).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('updates theme when setTheme is called', () => {
    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    fireEvent.click(screen.getByText('Set Light'));
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('handles system theme preference correctly', async () => {
    // Start with system theme and dark preference
    setupMatchMedia(true);
    
    render(
      <ThemeProvider defaultTheme="system">
        <TestComponent />
      </ThemeProvider>
    );
    
    // With system theme and dark preference, document should have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Change to light mode preference and notify listeners
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listeners = mediaQuery._listeners;
    
    act(() => {
      setupMatchMedia(false);
      // Notify all registered listeners about the change
      listeners.forEach(listener => {
        listener({ matches: false });
      });
    });
    
    // Document should no longer have dark class
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
}); 