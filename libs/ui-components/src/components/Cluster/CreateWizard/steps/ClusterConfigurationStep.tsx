import { FormSection, Stack, StackItem } from '@patternfly/react-core';
import { useFormikContext } from 'formik';

import { isFieldEditable } from '@osac/ui-components/components/catalogProvision/utils';

import { useTranslation } from '../../../../hooks/useTranslation';
import { InputField } from '../../../Form/InputField';
import OsacForm from '../../../Form/OsacForm';
import { type ClusterWizardValues } from '../values';

const ClusterConfigurationStep = () => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ClusterWizardValues>();

  if (!values.catalogItem) {
    return null;
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <OsacForm>
          <InputField
            name="spec.releaseImage"
            label={t('Release image')}
            fieldId="cluster-release-image"
            isRequired
            isDisabled={!isFieldEditable('release_image', values.catalogItem.fieldDefinitions)}
          />
          <FormSection title={t('Node Sets')} titleElement="h2">
            {values.spec.nodeSetRows.map((ns, index) => (
              <InputField
                key={index}
                name={`spec.nodeSetRows[${index}].size`}
                label={t('{{name}} size', { name: ns.name })}
                fieldId={`cluster-node-set-size-${ns.name}`}
                isRequired
                isDisabled={
                  !isFieldEditable(
                    `node_sets.${ns.name}.size`,
                    values.catalogItem?.fieldDefinitions || [],
                  )
                }
                type="number"
              />
            ))}
          </FormSection>
        </OsacForm>
      </StackItem>
    </Stack>
  );
};

export default ClusterConfigurationStep;
