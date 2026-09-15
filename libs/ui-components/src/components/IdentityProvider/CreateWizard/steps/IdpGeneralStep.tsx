import {
  FormGroup,
  Stack,
  StackItem,
  TextInput,
  Title,
} from '@patternfly/react-core';

import NameField from '@osac/ui-components/components/catalogProvision/wizard/fields/NameField';
import { InputField } from '@osac/ui-components/components/Form/InputField';
import OsacForm from '@osac/ui-components/components/Form/OsacForm';

import { useTranslation } from '../../../../hooks/useTranslation';

interface IdpGeneralStepProps {
  isEdit: boolean;
  tenant?: string;
}

const IdpGeneralStep = ({ isEdit, tenant }: IdpGeneralStepProps) => {
  const { t } = useTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2" size="lg">
          {t('General')}
        </Title>
      </StackItem>
      <StackItem>
        <OsacForm>
          <NameField isDisabled={isEdit} />
          <InputField
            name="spec.title"
            label={t('Title')}
            helperText={t('Human-friendly short title for this IdP')}
            fieldId="idp-title"
          />
          <InputField
            name="spec.description"
            label={t('Description')}
            fieldId="idp-description"
            multiline
            rows={3}
          />
          {isEdit && tenant && (
            <FormGroup label={t('Tenant')} fieldId="idp-tenant">
              <TextInput
                id="idp-tenant"
                value={tenant}
                isDisabled
                aria-label={t('Tenant')}
              />
            </FormGroup>
          )}
        </OsacForm>
      </StackItem>
    </Stack>
  );
};

export default IdpGeneralStep;
