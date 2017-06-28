import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class BoardListList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' +
			(person.firstName ? person.firstName.charAt(0) + '.' : '') +
			(person.middleName ? person.middleName.charAt(0) + '.' : '');
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.BoardList}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('boardLists')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField property='name' label={t('name')} />
			<TextField relation='project' property='name' label={t('project.title')} />
			<TextField property='color' label={t('color')} />
			<TextField relation='person' computed={this.fullName} label={t('person.title')} />
			<NumberField property='priority' label={t('priority')} width='130px' />
		</List>;
	}
}

export default BoardListList;
