import { Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { isFieldEditable } from '@osac/ui-components/components/catalogProvision/utils';

import { useTranslation } from '../../../../hooks/useTranslation';
import { InputField } from '../../../Form/InputField';
import OsacForm from '../../../Form/OsacForm';
import { type ClusterWizardValues } from '../values';

const ClusterNetworkingStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ClusterWizardValues>();

  if (!values.catalogItem) {
    return null;
  }

  const fds = values.catalogItem.fieldDefinitions;

  return (
    <Stack hasGutter>
      <StackItem>
        <OsacForm>
          <InputField
            name="spec.network.podCidr"
            label={t('Pod CIDR')}
            fieldId="cluster-pod-cidr"
            isDisabled={!isFieldEditable('network.pod_cidr', fds)}
            helperText={t('Use IPv4 CIDR notation (for example 10.128.0.0/14).')}
          />
          <InputField
            name="spec.network.serviceCidr"
            label={t('Service CIDR')}
            fieldId="cluster-service-cidr"
            isDisabled={!isFieldEditable('network.service_cidr', fds)}
            helperText={t('Use IPv4 CIDR notation (for example 172.30.0.0/16).')}
          />
        </OsacForm>
      </StackItem>
    </Stack>
  );
};

export default ClusterNetworkingStep;
