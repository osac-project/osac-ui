import { useFormikContext } from 'formik';

import NameField from '@osac/ui-components/components/catalogProvision/NameField';
import SshKeyField from '@osac/ui-components/components/catalogProvision/SshKeyField';
import OsacForm from '@osac/ui-components/components/Form/OsacForm';

import { BareMetalInstanceWizardValues } from '../values';

const BareMetalGeneralStep = () => {
  const { values } = useFormikContext<BareMetalInstanceWizardValues>();

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

export default BareMetalGeneralStep;
