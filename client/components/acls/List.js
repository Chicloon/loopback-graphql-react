import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	SelectField,
	ModelField,
} from '../ui/List';

import data from './data';
import t from '../../../i18n';
import SelectInput from "../ui/Form/SelectInput";

const mapToSelect = row => ({ value: row.id, label: row.name });

const aclsData = {
	models: data.MODEL.map(mapToSelect),
	accessTypes: data.ACCESS_TYPE.map(mapToSelect),
	permissions: data.PERMISSION.map(mapToSelect),
	principalTypes: data.PRINCIPAL_TYPE.map(mapToSelect),
};

@inject('store') @observer
class ACLList extends React.PureComponent {

	constructor (props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		return <List model={this.store.ACL}
		             inline={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('acls')}
		             {...this.props}>
			{/*<NumberField property='id' label={t('ID')} width='50px' className='left' headerClass='left' />*/}
			<SelectField property="model" items={aclsData.models} label={t('acl.model.title')}/>
			<TextField editable={true} property='property' label={t('acl.property')}/>
			<SelectField property="accessType" items={aclsData.accessTypes} label={t('acl.accessType')}/>
			<SelectField property="permission" items={aclsData.permissions} label={t('acl.permission')}/>
			<SelectField property="principalType" items={aclsData.principalTypes} label={t('acl.principalType')}/>
			<PrincipalIdField label={t('acl.principalId')} />
		</List>;
	}
}

export default ACLList;



@inject('store', 'recordData') @observer
class PrincipalIdField extends React.PureComponent {

	constructor (props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
		this.record = this.props.recordData.record;
		// console.log('PrincipalIdField:', props);
	}

	render () {
		let field = <td>-</td>;
		switch (this.record.principalType) {
			case 'ROLE':
				// field = 'role';
				field = <ModelField key={'role-'+this.record.id} listModel={this.store.Role} property="principalId" outProperty="name" {...this.props} />;
				break;
			case 'USER':
				// field = 'user';
				field = <ModelField key={'user-'+this.record.id} listModel={this.store.User} property="principalId" outProperty="email" {...this.props} />;
				break;
			default:
				break;
		}
		return field;
	}

}

