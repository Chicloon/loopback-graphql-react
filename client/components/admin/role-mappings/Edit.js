import React from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';

import {
	Form,
	RelationInput,
	SelectInput,
	ModelInput,
} from '../../ui/Form';
import t from '../../../../i18n';
import data from '../../acls/data';

const mapToSelect = row => ({ value: row.id, label: row.name });

@inject('store') @observer
class RoleMappingEdit extends React.PureComponent {

	@observable principalType = null;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
		this.principalTypes = data.PRINCIPAL_TYPE.map(mapToSelect);
		this.principalInputs = {
			'APP': null,
			'ROLE': (
				<ModelInput key='role' listModel={this.store.Role} outProperty='name'
				            property='principalId' label={t('acl.principalId')}/>
			),
			'USER': (
				<ModelInput key='user' listModel={this.store.User} outProperty='email'
				            property='principalId' label={t('acl.principalId')}/>
			),
		};
	}

	fullName (person) {
		return (person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '');
	}

	setPrincipalType ({ record, value }, onMount) {
		this.principalType = value;
		console.log('principalType:', value);
		if (!onMount) record.principalId = null;
	}

	render () {
		return (
			<Form model={this.store.RoleMapping} className="fixed-width" title={t('roleMapping.title')} {...this.props}>
				<SelectInput property="principalType"
				             items={this.principalTypes}
				             onMount={payload => this.setPrincipalType(payload, true)}
				             onChange={payload => this.setPrincipalType(payload)}
				             label={t('acl.principalType')}/>
				{this.principalInputs[this.principalType]}
				<RelationInput relation="role" property="name" label={t('role.title')}/>
			</Form>
		);
	}
}

export default RoleMappingEdit;
