import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionInput } from './QuestionInput';
import { AppStateContext } from '../../state/AppProvider';

const mockOnSend = jest.fn();
const mockDispatch = jest.fn();

jest.mock('../../state/AppProvider', () => ({
    AppStateContext: {
        state: {
            documentSections: [],
            researchTopic: 'Test Topic',
            showInitialChatMessage: true,
            sidebarSelection: null,
        },
        dispatch: jest.fn(),
    },
}));

describe('QuestionInput Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly with placeholder', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} placeholder="Ask a question" />);
        expect(screen.getByPlaceholderText('Ask a question')).toBeInTheDocument();
    });

    test('does not call onSend when disabled', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={true} placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(mockOnSend).not.toHaveBeenCalled();
    });

    test('calls onSend with question and conversationId when enter is pressed', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} conversationId="123" placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(mockOnSend).toHaveBeenCalledWith('Test question', '123');
    });

    test('calls onSend without conversationId when enter is pressed', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(mockOnSend).toHaveBeenCalledWith('Test question');
    });

    test('clears question input if clearOnSend is true', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} clearOnSend={true} placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(input).toHaveValue('');
    });

    test('does not clear question input if clearOnSend is false', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} clearOnSend={false} placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(input).toHaveValue('Test question');
    });

    test('disables send button when question is empty or disabled', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={true} placeholder="Ask a question" />);
        expect(screen.getByRole('button')).toBeDisabled();

        render(<QuestionInput onSend={mockOnSend} disabled={false} placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: '' } });
        expect(screen.getByRole('button')).toBeDisabled();
    });

    test('calls onSend on send button click when not disabled', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} placeholder="Ask a question" />);
        const input = screen.getByPlaceholderText('Ask a question');
        fireEvent.change(input, { target: { value: 'Test question' } });
        fireEvent.click(screen.getByRole('button'));
        expect(mockOnSend).toHaveBeenCalledWith('Test question');
    });

    test('does not call onSend when send button is clicked and disabled', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={true} />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockOnSend).not.toHaveBeenCalled();
    });

    test('calls sendQuestion when Enter or Space is pressed on send button', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} />);
        const button = screen.getByRole('button');
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(mockOnSend).toHaveBeenCalled();

        fireEvent.keyDown(button, { key: ' ', code: 'Space', charCode: 32 });
        expect(mockOnSend).toHaveBeenCalledTimes(2);
    });

    test('sets question to empty string when showInitialChatMessage is false', () => {
        jest.mock('../../state/AppProvider', () => ({
            AppStateContext: {
                state: {
                    documentSections: [],
                    researchTopic: '',
                    showInitialChatMessage: false, // Now it's false
                    sidebarSelection: null,
                },
                dispatch: mockDispatch,
            },
        }));

        render(<QuestionInput onSend={mockOnSend} disabled={false} placeholder="Ask a question" />);
        expect(screen.getByPlaceholderText('Ask a question')).toHaveValue('');
    });

    test('sets question based on researchTopic when showInitialChatMessage is true', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} placeholder="Ask a question" />);
        expect(screen.getByPlaceholderText('Ask a question')).toHaveValue('test topic');
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_SHOW_INITIAL_CHAT_MESSAGE_FLAG', payload: false });
    });

    test('send button shows SendRegular icon when disabled', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={true} />);
        expect(screen.getByTestId('send-icon')).toBeInTheDocument();
    });

    test('send button shows Send SVG when enabled', () => {
        render(<QuestionInput onSend={mockOnSend} disabled={false} />);
        expect(screen.getByAltText('Send Button')).toBeInTheDocument();
    });
});
