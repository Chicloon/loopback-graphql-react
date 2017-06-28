import React from 'react';
import { computed, observable, extendObservable, action, autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import { ColorPicker, IconLink } from '../../../ui';
import './style.scss';
import t from '../../../../../i18n';

const pad = number => '00'.substring(0, 2 - ('' + number).length) + number;
const curTime = () => {
	const date = new Date();
	return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
};

@inject('store', 'uiStore', 'boardStore') @observer
class ListEdit extends React.Component {

	@observable editList = null;
	@observable editField = null;
	@observable persons = null;
	@observable status = {};

	constructor(props) {
		super(props);
		this.list = props.list;
		const { name, description } = this.list;
		this.editList = { name, description };
		this.editList.color = this.list.color || ColorPicker.defaultColor;
		this.store = props.store;
		this.board = props.boardStore;
		this.changed = false;
		console.log(this.editList);
	}

	componentDidMount() {
		if (this.descriptionTextarea) this.updateTextareaHeight(this.descriptionTextarea);
	}

	componentDidUpdate() {
		console.log('componentDidUpdate');
		if (this.editField === 'description') {
			this.descriptionTextarea.focus();
		}
	}

	handlePopupClick(e) {
		e.stopPropagation();
	}

	handleOverlayClick(e) {
		e.preventDefault();
		this.board.endEditing();
	}

	saveList() {
		if (!this.changed) return false;

		if (this.editList.name.length < 1) {
			this.nameInput.focus();
			return false;
		}

		Object.assign(this.list, {...this.editList});

		const editField = this.editField;
		this.editField = null;
		this.status = {
			[editField]: t('saving')
		};

		this.list.save().then(result => {
			if (result.ok) {
				this.changed = false;
				this.status[editField] = t('savedAt') + ' ' + curTime();
			}
			else {
				this.status[editField] = result.statusText;
			}
		});
	}

	deleteList(e) {
		e.preventDefault();
		const tasks = this.list.tasks().list;
		if (tasks.length > 0) {
			console.log(tasks);
			alert('Невозможно удалить - в списке остались задачи (1)');
			return;
		}
		if (confirm('Удалить?')) {
			const boardLists = this.list.project.boardLists().list;
			const index = boardLists.findIndex(list => list.id === this.list.id);
			console.log(boardLists, index);
			boardLists.splice(index, 1);
			this.list.delete();
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
		this.editList[field] = value;
		this.editField = field;
		this.changed = true;
	}

	@action setEditField(e, field) {
		console.log('setEditField:', field);
		e.preventDefault();
		this.editField = field;
	}

	onPickColor(color) {
		console.log('onPickColor:', color);
		this.changed = true;
		this.editField = 'color';
		this.editList.color = color;
		this.saveList();
	}

	fieldStatus = field =>
		<div className={'status ' + (this.status && this.status[field] ? 'done' : 'empty')}>
			{this.status && this.status[field]}
		</div>;

	render() {
		return (
			<div className="cover" onClick={e => this.handleOverlayClick(e)}>
				<div className="list-edit" onClick={e => this.handlePopupClick(e)}>

					<div className="list-name">
						<input onChange={e => this.handleChange(e, 'name')}
						       onFocus={e => this.setEditField(e, 'name')}
						       onBlur={e => this.saveList()}
						       ref={node => this.nameInput = node}
						       value={this.editList.name || ''}/>
						{this.fieldStatus('name')}
					</div>
					<hr />

					<div className="list-description">
						<div className="field-label">
							Описание
							{this.editField !== 'description' &&
							(!this.editList.description ||
							(this.editList.description && this.editList.description.length < 1)) ?
								<a href="#" onClick={e => this.setEditField(e, 'description')}>{t('add')}</a>
								: ''
							}
						</div>
						{this.editField === 'description' ||
						(this.editList.description && this.editList.description.length > 0) ?
							<textarea rows={this.editField === 'description' ? 5 : 1}
							          onChange={e => this.handleChange(e, 'description')}
							          onFocus={e => this.setEditField(e, 'description')}
							          onBlur={e => this.saveList()}
							          ref={node => this.descriptionTextarea = node}
							          value={this.editList.description || ''}/>
							: ''}
						{this.fieldStatus('description')}
					</div>
					<hr />

					<div>
						<label htmlFor="list-color">Цвет списка</label>
						<input id="list-color" type="hidden"
						       onChange={e => this.handleChange(e, 'color')}
						       value={this.editList.color}/>
						<ColorPicker color={this.editList.color}
						             onPickColor={color => this.onPickColor(color)}/>
						{this.fieldStatus('color')}
					</div>
					<hr />

					<div>{this.status && this.status.all}</div>
					<div>
						{
							<div className="edit-actions">
								<IconLink href="#" icon="trash" style={{color: '#000', float: 'right', fontSize: 20}} onClick={e => this.deleteList(e)}/>
							</div>
						}
					</div>
				</div>
			</div>
		)
	}

}

export default ListEdit;
