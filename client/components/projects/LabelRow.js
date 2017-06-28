import React from 'react';
import { observer, inject } from 'mobx-react';
import t from '../../../i18n';
import { ColorPicker, IconLink } from '../ui';

@inject('newStore') @observer
class LabelRow extends React.Component {

	constructor(props) {
		super(props);
		this.store = props.newStore.mainStore;
		this.label = props.label;
		this.result = {
			editing: false,
			deleting: false,
		}
	}

	componentWillUpdate() {
	}

	render() {
		if (this.store.isLoading) {
			return (
				<div>Store is loading...</div>
			);
		}

		return !this.result.editing ? (
				<div>
					<div className="name">{this.label.name}</div>
					<div className="tasks-count">{this.label.tasksCount}</div>
					<div className="tasks-count">{this.label.name}</div>
				</div>
			) : (
				<div>
					edit
				</div>
			)

	}

}

export default LabelRow;
