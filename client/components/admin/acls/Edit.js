import React from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	SelectInput,
	ModelInput,
} from '../../ui/Form';
import t from '../../../../i18n';
import data from '../../acls/data';

const mapToSelect = row => ({ value: row.id, label: row.name });

@inject('store') @observer
class ACLEdit extends React.PureComponent {

	@observable principalType = null;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;

		this.data = {
			models: data.MODEL.map(mapToSelect),
			accessTypes: data.ACCESS_TYPE.map(mapToSelect),
			permissions: data.PERMISSION.map(mapToSelect),
			principalTypes: data.PRINCIPAL_TYPE.map(mapToSelect),
		};
	}

	// componentDidMount() {
	// 	console.log('componentDidMount');
	// }

	// componentDidUpdate() {
	// 	console.log('componentDidUpdate');
	// }

	setPrincipalType({ record, property, value }, onMount) {
		if (onMount) console.log('onMount:', record, property, value);
		this.principalType = value;
		if (!onMount) record.principalId = null;
	}

	render() {
		this.principalInputs = this.principalInputs || {
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

		console.log('principalType:', this.principalType);
		// console.log('principalInputs:', this.principalInputs);
		// if (this.principalType) console.log('input', this.principalInputs[this.principalType]);

		return (
			<Form model={this.store.ACL} title={t('acl.title')} {...this.props}>
				<SelectInput property="model" items={this.data.models} label={t('acl.model.title')}/>
				<TextInput property="property" label={t('acl.property')}/>
				<SelectInput property="accessType" items={this.data.accessTypes} label={t('acl.accessType')}/>
				<SelectInput property="permission" items={this.data.permissions} label={t('acl.permission')}/>
				<SelectInput property="principalType"
				             items={this.data.principalTypes}
				             onMount={payload => this.setPrincipalType(payload, true)}
				             onChange={payload => this.setPrincipalType(payload)}
				             label={t('acl.principalType')}/>
				{this.principalInputs[this.principalType]}
			</Form>
		);
	}
}

export default ACLEdit;
