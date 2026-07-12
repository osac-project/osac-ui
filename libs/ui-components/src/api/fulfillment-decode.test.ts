import { describe, expect, it } from 'vitest';

import {
  BareMetalInstanceRunStrategy,
  BareMetalInstanceSchema,
  ClusterSchema,
  ComputeInstanceSchema,
  ComputeInstanceState,
} from '@osac/types';

import { decodeFulfillmentResponse, encodeFulfillmentBody } from './fulfillment-decode';

describe('decodeFulfillmentResponse', () => {
  it('decodes ComputeInstance template_parameters with google.protobuf.StringValue wrappers', () => {
    const payload = {
      id: '019ef96a-0b25-7eb0-a23e-c0ec5afbda2a',
      metadata: { name: 'smoke-test-vm' },
      spec: {
        template: 'osac.templates.ocp_virt_vm',
        template_parameters: {
          user_data: {
            '@type': 'type.googleapis.com/google.protobuf.StringValue',
            value: '#cloud-config\nusers: []',
          },
        },
        cores: 5,
        memory_gib: 5,
      },
    };

    const decoded = decodeFulfillmentResponse(ComputeInstanceSchema, payload);

    expect(decoded).toMatchObject({
      id: '019ef96a-0b25-7eb0-a23e-c0ec5afbda2a',
      spec: {
        template: 'osac.templates.ocp_virt_vm',
        cores: 5,
        memoryGib: 5,
        templateParameters: {
          user_data: expect.objectContaining({
            typeUrl: 'type.googleapis.com/google.protobuf.StringValue',
          }),
        },
      },
    });
  });

  it('passes through data when no schema is provided', () => {
    const payload = { id: 'abc' };
    expect(decodeFulfillmentResponse(undefined, payload)).toBe(payload);
  });
});

describe('encodeFulfillmentBody', () => {
  it('outputs camelCase field names in proto JSON format', () => {
    const body = encodeFulfillmentBody(ClusterSchema, {
      metadata: { name: 'my-cluster' },
      spec: { catalogItem: 'cat-1', pullSecret: 'secret', releaseImage: '4.17.0' },
    });

    expect(body).toMatchObject({
      metadata: { name: 'my-cluster' },
      spec: { catalogItem: 'cat-1', pullSecret: 'secret', releaseImage: '4.17.0' },
    });
  });

  it('serializes enum values as their proto string names', () => {
    const body = encodeFulfillmentBody(BareMetalInstanceSchema, {
      spec: { runStrategy: BareMetalInstanceRunStrategy.ALWAYS },
    });

    expect((body as { spec: { runStrategy: string } }).spec.runStrategy).toBe(
      'BARE_METAL_INSTANCE_RUN_STRATEGY_ALWAYS',
    );
  });

  it('omits unset optional fields', () => {
    const body = encodeFulfillmentBody(ClusterSchema, {
      metadata: { name: 'sparse' },
      spec: { catalogItem: 'cat-1' },
    });

    const spec = (body as { spec: Record<string, unknown> }).spec;
    expect(spec).not.toHaveProperty('pullSecret');
    expect(spec).not.toHaveProperty('sshPublicKey');
    expect(spec).not.toHaveProperty('template');
  });

  it('serializes nested messages with camelCase field names (proto JSON format)', () => {
    const body = encodeFulfillmentBody(ClusterSchema, {
      spec: {
        catalogItem: 'cat-1',
        network: { podCidr: '10.0.0.0/8', serviceCidr: '172.16.0.0/12' },
      },
    });

    expect((body as { spec: { network: unknown } }).spec.network).toEqual({
      podCidr: '10.0.0.0/8',
      serviceCidr: '172.16.0.0/12',
    });
  });

  it('serializes bigint fields as strings', () => {
    const body = encodeFulfillmentBody(BareMetalInstanceSchema, {
      spec: { restartTrigger: 7n },
    });

    expect((body as { spec: { restartTrigger: string } }).spec.restartTrigger).toBe('7');
  });

  it('serializes ComputeInstanceState enum in status', () => {
    const body = encodeFulfillmentBody(ComputeInstanceSchema, {
      spec: { runStrategy: 'Halted' },
      status: { state: ComputeInstanceState.STOPPED },
    });

    expect((body as { status: { state: string } }).status.state).toBe(
      'COMPUTE_INSTANCE_STATE_STOPPED',
    );
  });

  it('wraps encoding errors with a contextual message', () => {
    expect(() =>
      encodeFulfillmentBody(ClusterSchema, {
        spec: { catalogItem: 123 as unknown as string },
      }),
    ).toThrow('Protobuf encode failed:');
  });
});
