import { useFormikContext } from 'formik';

import { FieldDefinition } from '@osac/types';
import NameField from '@osac/ui-components/components/catalogProvision/NameField';
import SshKeyField from '@osac/ui-components/components/catalogProvision/SshKeyField';
import { isFieldEditable } from '@osac/ui-components/components/catalogProvision/utils';
import { InputField } from '@osac/ui-components/components/Form/InputField';

import { useTranslation } from '../../../../hooks/useTranslation';
import OsacForm from '../../../Form/OsacForm';
import { type ClusterWizardValues } from '../values';

interface PullSecretFieldProps {
  fieldDefinitions: FieldDefinition[];
}

const PullSecretField = ({ fieldDefinitions }: PullSecretFieldProps) => {
  const { t } = useTranslation();

  return (
    <InputField
      name="spec.pullSecret"
      label={t('Pull secret')}
      fieldId="spec-pullSecret"
      isRequired
      isDisabled={!isFieldEditable('pull_secret', fieldDefinitions)}
      multiline
      rows={9}
      resizeOrientation="vertical"
      helperText={t(
        'Pull secrets download OpenShift components and connect clusters to your Red Hat account. Copy the full JSON from OpenShift Cluster Manager (console.redhat.com/openshift/install/pull-secret).',
      )}
    />
  );
};

const ClusterGeneralStep = () => {
  const { values } = useFormikContext<ClusterWizardValues>();
  if (!values.catalogItem) {
    return null;
  }

  return (
    <OsacForm>
      <NameField />
      <SshKeyField fieldDefinitions={values.catalogItem.fieldDefinitions} />
      <PullSecretField fieldDefinitions={values.catalogItem.fieldDefinitions} />
    </OsacForm>
  );
};

export default ClusterGeneralStep;
