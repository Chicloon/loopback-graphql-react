import React from 'react';
import {
    Edit,
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
import Title from './Title';
import t from '../i18n';

export default props => (
    <Edit title={<Title/>} {...props}>
		<SimpleForm>
		</SimpleForm>
    </Edit>
);
