import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CidrDisplay } from './CidrDisplay';

describe('CidrDisplay', () => {
  it('renders IPv4 CIDR when only IPv4 is provided', () => {
    render(<CidrDisplay ipv4Cidr="10.0.0.0/16" />);
    expect(screen.getByText('10.0.0.0/16')).toBeInTheDocument();
  });

  it('renders IPv6 CIDR when only IPv6 is provided', () => {
    render(<CidrDisplay ipv6Cidr="fd00::/48" />);
    expect(screen.getByText('fd00::/48')).toBeInTheDocument();
  });

  it('renders both CIDRs with labels when dual-stack', () => {
    render(<CidrDisplay ipv4Cidr="10.0.0.0/16" ipv6Cidr="fd00::/48" />);
    expect(screen.getByText('IPv4: 10.0.0.0/16')).toBeInTheDocument();
    expect(screen.getByText('IPv6: fd00::/48')).toBeInTheDocument();
  });

  it('renders em dash when neither CIDR is provided', () => {
    const { container } = render(<CidrDisplay />);
    expect(container.textContent).toBe('—');
  });

  it('renders em dash when both CIDRs are empty strings', () => {
    const { container } = render(<CidrDisplay ipv4Cidr="" ipv6Cidr="" />);
    expect(container.textContent).toBe('—');
  });
});
