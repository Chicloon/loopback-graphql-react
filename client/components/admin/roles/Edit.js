import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	DateInput,
} from '../../ui/Form';
import t from '../../../../i18n';

@inject('store') @observer
class TaskEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.Role} className="fixed-width" title={t('role.title')} {...this.props}>
				<TextInput property="name" label={t('name')}/>
				<TextInput rows={5} property="description" label={t('description')}/>
				<DateInput property="created" label={t('role.created')}/>
				<DateInput property="modified" label={t('role.modified')}/>
			</Form>
		);
	}
}

export default TaskEdit;
