import React from 'react';
import PropTypes from 'prop-types';
import { computed, observable, extendObservable, action, autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import Label from './Label';
import { Icon, IconLink } from '../../../ui';
import t from '../../../../../i18n';

import './style.scss';

@inject("store") @observer
class LabelsEdit extends React.Component {

	@observable active = false;

	constructor(props) {
		super(props);
		this.store = props.store;
		this.task = props.task;
		this.labels = this.store.Label.list().list;
	}

	@computed get labelStates() {
		return this.labels.map(label => {
			const tasklabel = this.task.labels().list.find(tasklabel => tasklabel.label.id === label.id);
			return {label, tasklabel};
		});
	}

	@computed get sortedTaskLabels() {
		return this.task.labels().list.sort((a, b) => b.label.priority - a.label.priority)
	}

	toggleEditor(e) {
		console.log('toggleEditor');
		e.preventDefault();
		this.active = !this.active;
	}

	switchLabel(e, i) {
		const labelState = this.labelStates[i];
		if (!labelState.tasklabel) {
			labelState.tasklabel = {taskId: this.task.id, labelId: labelState.label.id};
			const tasklabel = new this.store.TaskLabel(labelState.tasklabel);
			tasklabel.save()
				.then(result => {
					tasklabel.id = result.data.id;
					console.log('TaskLabel.save result:', result.data, ', tasklabel:', tasklabel);
					this.task.labels().list.push(tasklabel);
					this.task.labels().list = this.task.labels().list.sort((a, b) => b.label.priority - a.label.priority);
					labelState.tasklabel = tasklabel;
					if (this.props.onChange) this.props.onChange();
				});
		}
		else {
			console.log('taskLabel delete:', labelState.tasklabel);
			const taskLabel = labelState.tasklabel;
			taskLabel.delete()
				.then(({ result, error }) => {
					if (!error) {
						const labels = this.task.labels().list;
						const index = labels.findIndex(_taskLabel => _taskLabel.id === taskLabel.id);
						labels.splice(index, 1);
						delete labelState.tasklabel;
						if (this.props.onChange) this.props.onChange();
					}
					else {
						console.error(error);
					}
				});
		}
	}

	render() {
		const labels = this.labels.map((label, i) => {
			const labelStates = this.labelStates;
				const selected = labelStates[i].tasklabel;
				return (
					<li key={i} onClick={e => this.switchLabel(e, i)} className={selected ? 'selected' : ''}>
						<div className="label-priority">{label.priority}</div>
						<div className="select-state">{selected ? <Icon icon="ok"/> : ''}</div>
						<div className="label-color" style={{background: label.color}} />
						<div className="label-name">{label.name}</div>
					</li>
				);
		});

		const popopver = this.active && (
				<div>
					<div className="labels-edit-popover">
						<ul className="labels-list">
							{labels}
						</ul>
					</div>
					<div className="cover" onClick={e => this.toggleEditor(e)}/>
				</div>
			);

		return this.task.labels().totalCount === 0 ?

			<div className="labels-add">
				<a href="#" onClick={e => this.toggleEditor(e)}>{t('add')}</a>
				{popopver}
			</div>

			:

			<div className="labels-edit">
				{this.sortedTaskLabels.map((tasklabel, i) => <Label key={i} label={tasklabel.label}/>)}
				<a href="#" onClick={e => this.toggleEditor(e)}>{t('edit')}</a>
				{popopver}
			</div>

	}

}

LabelsEdit.propTypes = {
	task: PropTypes.object,
	onChange: PropTypes.func,
};

export default LabelsEdit;
