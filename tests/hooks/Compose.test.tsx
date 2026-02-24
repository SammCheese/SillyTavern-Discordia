import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { setupGlobalImports } from '../utils/mockImports';

import Compose from '../../src/app/Compose';
import { createElement } from 'react';

describe('Compose', () => {
  beforeEach(async () => {
    vi.resetModules();

    setupGlobalImports();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the child component without any components', () => {
    const container = createElement('div');

    const res = render(<Compose>{container}</Compose>);

    expect(res.container.children.length).toBe(1);
  });

  it('should wrap the child component with the provided providers', () => {
    const container = createElement('div');
    const Wrapper1 = ({ children }: { children: React.ReactNode }) => (
      <div className="wrapper1">{children}</div>
    );
    const Wrapper2 = ({ children }: { children: React.ReactNode }) => (
      <div className="wrapper2">{children}</div>
    );
    const res = render(
      <Compose components={[Wrapper1, Wrapper2]}>{container}</Compose>,
    );

    expect(res.container.querySelector('.wrapper1')).toBeTruthy();
    expect(res.container.querySelector('.wrapper2')).toBeTruthy();
  });
});
