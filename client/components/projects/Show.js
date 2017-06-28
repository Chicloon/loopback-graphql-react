import React from 'react';
import {
    Show,
    TextField,
} from 'admin-on-rest/lib/mui';
import Title from './Title';
import t from '../../../i18n';

export default props => (
    <Show title={<Title/>} {...props}>
        <TextField label={t('name')} source='name' />
    </Show>
);
