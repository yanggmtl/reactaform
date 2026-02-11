import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Description from '../../../src/components/fields/ui-elements/Description';
import { renderWithProvider } from '../../test-utils';

describe('Description', () => {
  it('renders description text', () => {
    const field = { 
      displayText: 'This is a description', 
      textAlign: 'left' as const,
      margin: '8px 0',
    };
    renderWithProvider(
      <Description field={field} />
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('applies left text alignment', () => {
    const field = { 
      displayText: 'Left aligned text', 
      textAlign: 'left' as const,
    };
    const { container } = renderWithProvider(
      <div data-testid="wrapper">
        <Description field={field} />
      </div>
    );

    const descDiv = container.querySelector('[data-testid="wrapper"] > div');
    expect(descDiv).toHaveClass('reactaform-description');
    expect(descDiv).toHaveStyle({ textAlign: 'left' });
  });

  it('applies center text alignment', () => {
    const field = { 
      displayText: 'Center aligned text', 
      textAlign: 'center' as const,
    };
    const { container } = renderWithProvider(
      <div data-testid="wrapper">
        <Description field={field} />
      </div>
    );

    const descDiv = container.querySelector('[data-testid="wrapper"] > div');
    expect(descDiv).toHaveClass('reactaform-description');
    expect(descDiv).toHaveStyle({ textAlign: 'center' });
  });

  it('applies right text alignment', () => {
    const field = { 
      displayText: 'Right aligned text', 
      textAlign: 'right' as const,
    };
    const { container } = renderWithProvider(
      <div data-testid="wrapper">
        <Description field={field} />
      </div>
    );

    const descDiv = container.querySelector('[data-testid="wrapper"] > div');
    expect(descDiv).toHaveClass('reactaform-description');
    expect(descDiv).toHaveStyle({ textAlign: 'right' });
  });
  it('uses default values when properties are not provided', () => {
    const field = { 
      displayText: 'Simple description',
    };
    const { container } = renderWithProvider(
      <div data-testid="wrapper">
        <Description field={field} />
      </div>
    );

    const descDiv = container.querySelector('[data-testid="wrapper"] > div');
    expect(descDiv).toHaveClass('reactaform-description');
    expect(descDiv).toHaveStyle({ textAlign: 'left' });
  });

  it('handles empty displayText', () => {
    const field = { 
      displayText: '',
      textAlign: 'left' as const,
    };
    const { container } = renderWithProvider(
      <div data-testid="wrapper">
        <Description field={field} />
      </div>
    );

    const descDiv = container.querySelector('[data-testid="wrapper"] > div');
    expect(descDiv).toBeInTheDocument();
    expect(descDiv).toHaveTextContent('');
  });
});
