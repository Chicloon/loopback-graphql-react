import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class ProjectRoleList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.ProjectRole}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('projectRoles')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField property='name' label={t('name')} />
		</List>;
	}
}

export default ProjectRoleList;
