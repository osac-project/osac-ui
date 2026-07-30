import { useMemo } from 'react';
import { Alert, Button, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import {
  INSTANCE_TYPE_ACTIVE_LIST_FILTER,
  useInstanceTypes,
} from '@osac/ui-components/api/v1/instance-types';
import UserDataField from '@osac/ui-components/components/catalogProvision/UserDataField';
import { isFieldEditable } from '@osac/ui-components/components/catalogProvision/utils';
import { InputField } from '@osac/ui-components/components/Form/InputField';
import OsacForm from '@osac/ui-components/components/Form/OsacForm';
import { SelectField } from '@osac/ui-components/components/Form/SelectField';
import { formatInstanceTypeOptionLabel } from '@osac/ui-components/components/vm/utils';
import { getErrorMessage } from '@osac/ui-components/utils/error';

import { useTranslation } from '../../../../hooks/useTranslation';
import type { ComputeInstanceWizardValues } from '../values';

export const VmConfigurationStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ComputeInstanceWizardValues>();

  const {
    data: instanceTypes = [],
    isLoading,
    error,
    refetch,
  } = useInstanceTypes({ filter: INSTANCE_TYPE_ACTIVE_LIST_FILTER });

  const instanceTypeOptions = useMemo(
    () =>
      instanceTypes.map((instanceType) => ({
        value: instanceType.id,
        label: formatInstanceTypeOptionLabel(instanceType, t(' (deprecated)')),
      })),
    [instanceTypes, t],
  );

  if (!values.catalogItem) {
    return null;
  }

  const fds = values.catalogItem.fieldDefinitions;

  return (
    <Stack hasGutter>
      {error ? (
        <StackItem>
          <Alert variant="danger" isInline title={t('Could not load instance types')}>
            {getErrorMessage(error)}
            <Button variant="link" isInline onClick={() => void refetch()}>
              {t('Retry')}
            </Button>
          </Alert>
        </StackItem>
      ) : null}
      <StackItem>
        <OsacForm>
          <SelectField
            name="spec.runStrategy"
            label={t('Run strategy')}
            fieldId="vm-run-strategy"
            isRequired
            autoSelectSingleOption={isFieldEditable('run_strategy', fds)}
            placeholder={t('Select a run strategy')}
            options={[
              { value: 'Always', label: t('Always') },
              { value: 'Halted', label: t('Halted') },
            ]}
            isDisabled={!isFieldEditable('run_strategy', fds)}
          />
          <InputField
            name="spec.image.sourceRef"
            label={t('VM image')}
            fieldId="vm-image-source-ref"
            isRequired
            helperText={t('OCI reference')}
            isDisabled={!isFieldEditable('image.source_ref', fds)}
          />
          <SelectField
            name="spec.instanceType"
            label={t('Instance type')}
            fieldId="vm-instance-type"
            isRequired
            autoSelectSingleOption={isFieldEditable('instance_type', fds)}
            isLoading={isLoading}
            placeholder={t('Select an instance type')}
            options={instanceTypeOptions}
            isDisabled={!isFieldEditable('instance_type', fds)}
          />
          <InputField
            name="spec.bootDisk.sizeGib"
            label={t('Boot disk size (GiB)')}
            fieldId="vm-boot-disk-size"
            type="number"
            isRequired
            isDisabled={!isFieldEditable('boot_disk.size_gib', fds)}
          />
          <UserDataField fieldDefinitions={fds} />
        </OsacForm>
      </StackItem>
    </Stack>
  );
};
