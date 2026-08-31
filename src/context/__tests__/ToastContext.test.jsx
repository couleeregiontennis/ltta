import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider, useToast } from '../ToastContext';


// Test component that uses the hook
const TestComponent = ({ message, type, duration }) => {
  const { addToast } = useToast();

  return (
    <button
      onClick={() => addToast(message, type, duration)}
    >
      Add Toast
    </button>
  );
};

// Component to test the error when useToast is used outside provider
const ErrorComponent = () => {
  useToast();
  return null;
};

describe('ToastContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides the addToast function', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent message="Test Message" type="success" />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');
    await user.click(button);

    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('removes the toast after the specified duration', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent message="Auto Remove" type="info" duration={3000} />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');
    await user.click(button);

    // Toast should be visible initially
    expect(screen.getByText('Auto Remove')).toBeInTheDocument();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Toast should be removed
    expect(screen.queryByText('Auto Remove')).not.toBeInTheDocument();
  });

  it('allows manual removal of toast', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent message="Manual Remove" type="error" />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');
    await user.click(button);

    expect(screen.getByText('Manual Remove')).toBeInTheDocument();

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    expect(screen.queryByText('Manual Remove')).not.toBeInTheDocument();
  });

  it('throws an error when useToast is used outside of ToastProvider', () => {
    // Suppress console.error for this expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<ErrorComponent />)).toThrow('useToast must be used within a ToastProvider');

    consoleSpy.mockRestore();
  });

  it('handles multiple toasts correctly', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <ToastProvider>
        <TestComponent message="Toast 1" type="info" duration={5000} />
      </ToastProvider>
    );

    const button = screen.getByText('Add Toast');

    await user.click(button);
    await user.click(button);
    await user.click(button);

    const toasts = screen.getAllByText('Toast 1');
    expect(toasts).toHaveLength(3);

    // Close the first one
    const closeButtons = screen.getAllByText('✕');
    await user.click(closeButtons[0]);

    expect(screen.getAllByText('Toast 1')).toHaveLength(2);
  });
});
