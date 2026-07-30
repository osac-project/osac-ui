import { useFormikContext } from 'formik';

import NameField from '@osac/ui-components/components/catalogProvision/NameField';
import SshKeyField from '@osac/ui-components/components/catalogProvision/SshKeyField';
import OsacForm from '@osac/ui-components/components/Form/OsacForm';

import { ComputeInstanceWizardValues } from '../values';

const VmGeneralStep = () => {
  const { values } = useFormikContext<ComputeInstanceWizardValues>();

  if (!values.catalogItem) {
    return null;
  }

  return (
    <OsacForm>
      <NameField />
      <SshKeyField fieldDefinitions={values.catalogItem.fieldDefinitions} />
    </OsacForm>
  );
};

export default VmGeneralStep;
