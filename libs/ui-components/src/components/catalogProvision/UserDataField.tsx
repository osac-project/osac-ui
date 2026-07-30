import { type FieldDefinition } from '@osac/types';
import { InputField } from '@osac/ui-components/components/Form/InputField';
import { useTranslation } from '@osac/ui-components/hooks/useTranslation';

import { isFieldEditable } from './utils';

type UserDataFieldProps = {
  fieldDefinitions: FieldDefinition[];
};

const UserDataField = ({ fieldDefinitions }: UserDataFieldProps) => {
  const { t } = useTranslation();

  return (
    <InputField
      name={'spec.userData'}
      label={t('User data')}
      fieldId="bm-user-data"
      multiline
      rows={9}
      resizeOrientation="vertical"
      helperText={t('Optional cloud-init user data (max 64 KB).')}
      isDisabled={!isFieldEditable('user_data', fieldDefinitions)}
    />
  );
};

export default UserDataField;
