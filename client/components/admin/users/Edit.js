import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	DateInput,
	BooleanInput,
} from '../../ui/Form';
import t from '../../../../i18n';

@inject('store') @observer
class UserEdit extends React.PureComponent {

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
			<Form model={this.store.User} className="fixed-width" title={t('user.title')} {...this.props}>
				<TextInput property="username" label={t('user.username')}/>
				<TextInput property="email" label={t('user.email')}/>
				<TextInput property="status" label={t('user.status')}/>
				<BooleanInput property="emailVerified" label={t('user.emailVerified')}/>
				<DateInput property="created" label={t('created')}/>
				<DateInput property="lastUpdated" label={t('lastUpdated')}/>
			</Form>
		);
	}
}

export default UserEdit;
