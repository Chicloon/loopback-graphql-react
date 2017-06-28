import React from 'react';
import t from '../../../i18n';

export default ({ record }) => <span>{t('project.title')}: {record ? `${record.name}` : ''}</span>;
