import React from 'react';
import {
	Create,
    ReferenceInput,
    SelectInput,
	AutocompleteInput,
    BooleanInput,
    LongTextInput,
    TextInput,
	DateInput,
	SimpleForm,
} from 'admin-on-rest/lib/mui';
import { renderer as personRenderer } from '../persons/renderer';
import { getParamByName } from '../utils';
import t from '../i18n';

export default props => (
    <Create title={t('_model_.create')} {...props}>
		<SimpleForm>
		</SimpleForm>
    </Create>
);
