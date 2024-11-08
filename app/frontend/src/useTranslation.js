import { useIntl } from 'react-intl';

export const useTranslation = () => {
  const { formatMessage } = useIntl();

  const t = (id, defaultMessage = '', values = {}) => {
    return formatMessage({ id, defaultMessage }, values);
  };

  return { t };
};
