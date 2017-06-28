import React from 'react';
import { observable, computed, action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { IconLink, PersonAvatar } from '../../../ui';
import t from '../../../../../i18n';
import { LabelsEdit } from '../Labels';

import './style.scss';

const pad = number => '00'.substring(0, 2 - ('' + number).length) + number;
const curTime = () => {
	const date = new Date();
	return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
};

@inject('store', 'uiStore', 'boardStore') @observer
class TaskEdit extends React.Component {

	@observable editTask = null;
	@observable editField = null;
	@observable persons = null;
	@observable status = {};

	constructor(props) {
		super(props);
		this.task = props.task;
		const { name, description, person } = this.task;
		this.editTask = { name, description, person };
		this.store = props.store;
		this.board = props.boardStore;
		this.changed = false;
		this.projectMembers = this.task.project.members();
	}

	@action getUniquePersons() {
		const projectPersons = this.projectMembers.list.map(member => member.person);
		this.persons = [...new Set(projectPersons)];
	}

	componentDidUpdate() {
		console.log('componentDidUpdate');
		if (this.editField === 'description') {
			this.descriptionTextarea.focus();
		}
	}

	componentDidMount() {
		if (this.nameTextarea) this.updateTextareaHeight(this.nameTextarea);
		if (this.descriptionTextarea) this.updateTextareaHeight(this.descriptionTextarea);
		document.addEventListener('keyup', this.handleKeyUp);
		document.addEventListener('keydown', this.handleKeyDown);
		this.getUniquePersons();
	}

	componentWillUnmount() {
		document.removeEventListener('keyup', this.handleKeyUp);
		document.removeEventListener('keydown', this.handleKeyDown);
	}

	handleKeyUp = (e) => {
		// console.log('keyUp:', e.keyCode);
		switch (e.keyCode) {
		}
	};

	handleKeyDown = (e) => {
		// console.log('keyDown:', e.keyCode, _this);
		switch (e.keyCode) {
			case 27:
				this.cancelEditing(e);
				break;
			case 13:
				// if (e.target.classList.contains('task-name')) {
				// 	e.preventDefault();
				// 	e.target.blur();
				// 	this.saveTask();
				// 	break;
				// }
				if (e.ctrlKey) {
					e.target.blur();
					this.saveTask();
				}
				break;
		}
	};

	cancelEditing(e) {
		e.preventDefault();
		this.board.endEditing();
	}

	saveTask() {
		if (!this.changed) return false;
		console.log('------------- saveTask:', this.editTask);

		if (this.editTask.name.length < 1) {
			this.nameTextarea.focus();
			return false;
		}

		Object.assign(this.task, {...this.editTask});

		const editField = this.editField;
		this.editField = null;
		this.status = {
			[editField]: t('saving')
		};

		this.task.save().then(result => {
			if (result.ok) {
				this.changed = false;
				this.status[editField] = t('savedAt') + ' ' + curTime();
			}
			else {
				this.status[editField] = result.statusText;
			}
		});

	}

	deleteTask(e) {
		e.preventDefault();
		if (confirm('Удалить?')) {
			const listTasks = this.task.boardList.tasks().list;
			const index = listTasks.findIndex(task => task.id === this.task.id);
			listTasks.splice(index, 1);
			this.task.delete();
			this.board.endEditing();
		}
	}

	updateTextareaHeight(textarea, limit) {
		textarea.style.height = "";
		if (limit) {
			const heightLimit = limit * 17 + 10;
			textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
		}
		else {
			textarea.style.height = textarea.scrollHeight + "px";
		}
	}

	@action handleChange(e, field) {
		const value = e.target.value;
		if (e.target.tagName.toLowerCase() === 'textarea') this.updateTextareaHeight(e.target);
		this.editTask[field] = value;
		this.editField = field;
		this.changed = true;
	}

	@action setEditField(e, field) {
		console.log('setEditField:', field);
		e.preventDefault();
		this.editField = field;
	}

	@action handleLabelsChange() {
		console.log('handleLabelsChange');
		this.editField = 'labels';
		this.status['labels'] = t('savedAt') + ' ' + curTime();
	}

	@action setPerson(e, person, active) {
		e.preventDefault();
		console.log('setPerson:', person, ' to ', !active);
		this.changed = true;
		this.editField = 'person';
		// this.editTask.personId = active ? null : personId;
		this.editTask.person = active ? null : person;
		this.saveTask();
	}

	fieldStatus = field =>
		<div className={'status ' + (this.status && this.status[field] ? 'done' : 'empty')}>
			{this.status && this.status[field]}
		</div>;

	render() {
		console.log('+ TaskEdit render:');

		return (
			<div ref={node => this.container = node}
			     className="cover task-edit-cover"
			     onKeyUp={e => this.handleKeyUp(e)}
			     onKeyDown={e => this.handleKeyDown(e)}
			     onClick={e => this.cancelEditing(e)}>
				<div className="task-edit" onClick={e => {
					e.stopPropagation()
				}}>
					<div className="task-name">
						<textarea className="task-name"
						          rows={1} onChange={e => this.handleChange(e, 'name')}
						          onBlur={e => this.saveTask()}
						          ref={node => this.nameTextarea = node}
						          value={this.editTask.name || ''}/>
						{this.fieldStatus('name')}
					</div>
					<hr />

					<div>
						{
							this.persons ?
							this.persons.map((person, i) => {
								const active = this.editTask.person === person;
								return <a href="#" key={i} onClick={e => this.setPerson(e, person, active)}>
									<PersonAvatar person={person} size="medium" style={{opacity: active ? 1 : 0.3}} /></a>
							})
							: '...'
						}
						{this.fieldStatus('person')}
					</div>
					<hr />

					<div className="task-labels">
						<div className="field-label">Метки
							<LabelsEdit task={this.task}
							            onChange={() => this.handleLabelsChange()}/>
						</div>
						<div className="clearfix">
						</div>
						{this.fieldStatus('labels')}
					</div>
					<hr />

					<div className="task-description">
						<div className="field-label">
							Описание
							{this.editField !== 'description' &&
							(!this.editTask.description ||
							(this.editTask.description && this.editTask.description.length < 1)) ?
								<a href="#" onClick={e => this.setEditField(e, 'description')}>{t('add')}</a>
								: ''
							}
						</div>
						{this.editField === 'description' ||
						(this.editTask.description && this.editTask.description.length > 0) ?
							<textarea rows={this.editField === 'description' ? 5 : 1}
							          onChange={e => this.handleChange(e, 'description')}
							          onFocus={e => this.setEditField(e, 'description')}
							          onBlur={e => this.saveTask()}
							          ref={node => this.descriptionTextarea = node}
							          value={this.editTask.description || ''}/>
							: ''}
						{this.fieldStatus('description')}
					</div>
					<hr />

					<div>{this.status && this.status.all}</div>
					<div>
						<div className="edit-actions">
							<IconLink href="#" icon="trash" style={{color: '#000', float: 'right', fontSize: 20}} onClick={e => this.deleteTask(e)}/>
						</div>
					</div>
				</div>
			</div>
		)
	}

}

export default TaskEdit;
