import { type TFunction } from 'i18next';
import * as Yup from 'yup';

export const SSH_PUBLIC_KEY_REGEX =
  /^(ssh-(rsa|dss|ed25519)|ecdsa-sha2-\S+|sk-(ssh-ed25519|ecdsa-sha2-\S+))\s+\S+(\s+\S+)?$/;

export const sshPublicKeySchema = (t: TFunction) =>
  Yup.string().test(
    'ssh-public-key',
    t('Must be a valid SSH public key (ssh-rsa, ssh-ed25519, ecdsa-sha2-*, or sk-* prefixed).'),
    (value) => !value?.trim() || SSH_PUBLIC_KEY_REGEX.test(value.trim()),
  );
