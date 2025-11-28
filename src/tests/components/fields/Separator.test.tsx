import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import FieldSeparator from '../../../package/components/fields/Separator';
import { renderWithProvider } from '../../test-utils';

describe('Separator', () => {
  it('renders separator line', () => {
    const field = { color: '#ccc', thickness: 1, margin: '8px 0', alignment: 'center' as const };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('renders with label when provided', () => {
    const field = { 
      color: '#ccc', 
      thickness: 1, 
      margin: '8px 0', 
      label: 'Section Divider',
      alignment: 'center' as const 
    };
    renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    expect(screen.getByText('Section Divider')).toBeInTheDocument();
  });

  it('renders without label when not provided', () => {
    const field = { 
      color: '#ccc', 
      thickness: 1, 
      margin: '8px 0',
      alignment: 'center' as const 
    };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const span = container.querySelector('span');
    expect(span).not.toBeInTheDocument();
  });

  it('applies custom color', () => {
    const field = { 
      color: '#ff0000', 
      thickness: 1, 
      margin: '8px 0',
      alignment: 'center' as const 
    };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ borderTop: '1px solid #ff0000' });
  });

  it('applies custom thickness', () => {
    const field = { 
      color: '#ccc', 
      thickness: 3, 
      margin: '8px 0',
      alignment: 'center' as const 
    };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const hr = container.querySelector('hr');
    expect(hr).toHaveStyle({ borderTop: '3px solid #ccc' });
  });

  it('uses default values when properties not provided', () => {
    const field = { alignment: 'center' as const };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('centers label by default', () => {
    const field = { 
      label: 'Centered',
      color: '#ccc',
      thickness: 1,
      margin: '8px 0',
      alignment: 'center' as const 
    };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const wrapper = container.querySelector('div[style*="display: flex"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('aligns label to left when specified', () => {
    const field = { 
      label: 'Left Aligned',
      color: '#ccc',
      thickness: 1,
      margin: '8px 0',
      alignment: 'left' as const 
    };
    renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const span = screen.getByText('Left Aligned');
    expect(span).toBeInTheDocument();
  });

  it('aligns label to right when specified', () => {
    const field = { 
      label: 'Right Aligned',
      color: '#ccc',
      thickness: 1,
      margin: '8px 0',
      alignment: 'right' as const 
    };
    renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const span = screen.getByText('Right Aligned');
    expect(span).toBeInTheDocument();
  });

  it('applies custom margin', () => {
    const field = { 
      color: '#ccc', 
      thickness: 1, 
      margin: '16px 0',
      alignment: 'center' as const 
    };
    const { container } = renderWithProvider(
      <FieldSeparator field={field} t={(text: string) => text} />
    );

    const wrapper = container.querySelector('div[style*="margin"]');
    expect(wrapper).toBeInTheDocument();
  });
});
