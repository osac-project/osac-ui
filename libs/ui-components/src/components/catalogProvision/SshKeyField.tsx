import { useField, useFormikContext } from 'formik';

import { FieldDefinition } from '@osac/types';

import { isFieldEditable } from './utils';
import { useTranslation } from '../../hooks/useTranslation';
import { InputField } from '../Form/InputField';

interface SshKeyFieldProps {
  path?: string;
  fieldDefinitions: FieldDefinition[];
}

const fieldName = 'spec.sshPublicKey';

const SshKeyField = ({ fieldDefinitions }: SshKeyFieldProps) => {
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext();
  const [field] = useField<string>(fieldName);

  const handleBlur = () => {
    const trimmed = (field.value ?? '').trim();
    if (trimmed !== field.value) {
      void setFieldValue(fieldName, trimmed);
    }
  };

  return (
    <InputField
      name={fieldName}
      label={t('SSH public key')}
      fieldId={fieldName.replace(/\./g, '-')}
      isDisabled={!isFieldEditable('ssh_public_key', fieldDefinitions)}
      multiline
      rows={9}
      resizeOrientation="vertical"
      helperText={t(
        'Paste a public SSH key for remote access. Supported types: ssh-rsa, ssh-ed25519, and ecdsa-sha2-nistp256/384/521.',
      )}
      onBlur={handleBlur}
    />
  );
};

export default SshKeyField;
