import React from 'react';
import {
    Datagrid,
    List,
	Filter,
	EditButton,
	DeleteButton,
    ReferenceInput,
    AutocompleteInput,
    TextInput,
    BooleanField,
    NumberField,
    TextField,
	DateField,
    ReferenceField,
} from 'admin-on-rest/lib/mui';
import NumberField from '../field/NumberField';
import PersonField from '../field/PersonField';
import { renderer as personRenderer } from '../persons/renderer';
import t from '../i18n';

const _Model_Filter = (props) => (
    <Filter {...props}>
    </Filter>
);

export default props => (
    <List {...props} filter={<_Model_Filter/>} title={t('_model_.list')} perPage={t('perPage')}>
        <Datagrid>
			<EditButton />
			<DeleteButton />
        </Datagrid>
    </List>
);
