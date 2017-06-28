import React from 'react';
import { inject, observer } from 'mobx-react';

import './board.scss';

import BoardList from './BoardList';
import TaskCard from './TaskCard';
import TaskEdit from './TaskEdit';
import ListEdit from './ListEdit';

import { Icon, IconLink } from '../../ui';
import t from '../../../../i18n';

const defaultListPriority = 1000;
export const defaultTaskPriority = 1000;
export const transformTime = '250ms';

// export const transformEasing = 'cubic-bezier(.41,.17,.18,1.29)';
export const transformEasing = 'cubic-bezier(.41,.17,.14,1.27)';
// export const transformEasing = 'ease-out';

const DraggableTask = (props) => (
	<div id="draggable-task"
	     className="hidden"
	     ref={node => props.getRef(node)}>
		{props.task &&
			<TaskCard task={props.task} isDraggable={true} showDebugInfo={props.showDebugInfo}/>}
	</div>
);

const DraggableList = (props) => (
	<div id="draggable-list"
	     className="hidden"
	     ref={node => props.getRef(node)}>
		{props.list ? <BoardList list={props.list} isDraggable={true}/> : ''}
	</div>
);

@inject('store', 'uiStore', 'boardStore') @observer
class Board extends React.Component {

	constructor(props) {
		super(props);
		this.board = props.boardStore;
		this.uiStore = props.uiStore;
		this.store = props.store;
		this.project = this.props.project;
		this.bounds = {};

		this.boardLists = this.project.boardLists();
	}

	componentWillUpdate() {
		if (this.addListNode) {
			this.bounds['addList'] = this.addListNode.getBoundingClientRect();
		}
	}

	componentDidUpdate() {

		const oldAddBox = this.bounds['addList'];
		if (this.addListNode && oldAddBox) {
			const newAddBox = this.addListNode.getBoundingClientRect();
			const deltaX = oldAddBox.left - newAddBox.left;

			if (deltaX !== 0) {
				requestAnimationFrame(() => {
					this.addListNode.style.transform = `translate(${deltaX}px`;
					this.addListNode.style.transition = `transform 0s`;
					this.addListNode.style.zIndex = 10;

					requestAnimationFrame(() => {
						this.addListNode.style.transform = '';
						this.addListNode.style.transition = `transform ${transformTime} ${transformEasing}`;
						this.addListNode.addEventListener('transitionend', () => {
							this.addListNode.style.zIndex = 0;
						});
					});

				});
			}
		}

		if (this.board.newListProjectId && this.containerNode) {
			this.containerNode.scrollLeft = 10000;
		}

	}

	addList(e) {
		e.preventDefault();
		this.board.addList(this.project.id);
		setTimeout(() => this.addListText.focus(), 0);
	}

	onSubmitNewList(e) {
		e.preventDefault();
		const name = this.addListText.value.trim();
		const lists = this.boardLists.list;
		if (name.length > 0) {
			const newBoardList = new this.store.BoardList({
				projectId: this.project.id,
				private: true,
				name: name,
				priority: lists && lists.length > 0 ? lists[lists.length - 1].priority / 2 : defaultListPriority,
			});
			console.log('new bolardList:', newBoardList);
			this.board.endEditing();
			this.addListText.value = '';
			// this.board.saveNewList(newList, this.project);
			newBoardList.save().then(result => {
				console.log('saved new BoardTask:', result.data);
				newBoardList.id = result.data.id;
				this.boardLists.list.push(newBoardList);
			})
		}
		else {
			this.addListText.focus();
		}
	}

	onCancelAddList(e) {
		console.log('onCancelAddList');
		e.preventDefault();
		this.addListText.value = '';
		this.board.endEditing();
	}

	onListDelete(list) {
		if (list.tasks.length > 0) {
			alert('Невозможно удалить - в списке остались задачи');
			return;
		}
		if (confirm('Удалить? ' + list.id)) {
			this.board.deleteList(list);
		}
	}

	handleBoardMouseMove(e, touch) {
		const headerHeight = 0; //this.header.getBoundingClientRect().height;
		const { left: containerX, top: containerY } = this.containerNode.getBoundingClientRect();
		const deltaY = containerY - headerHeight - 10;

		const eX = touch ? e.targetTouches[0].clientX : e.clientX;
		const eY = touch ? e.targetTouches[0].clientY : e.clientY;

		if (this.board.dragTask && this.draggableTask) {
			const x = eX - this.board.dragTaskData.clickX - containerX;
			const y = eY - this.board.dragTaskData.clickY - deltaY;
			this.draggableTask.className = '';
			this.draggableTask.style.left = x + 'px';
			this.draggableTask.style.top = y + 'px';
		}

		if (this.board.dragList && this.draggableList) {
			const x = eX - this.board.dragListData.clickX - containerX;
			const y = eY - this.board.dragListData.clickY - deltaY;
			this.draggableList.className = '';
			this.draggableList.style.left = x - 20 + 'px';
			this.draggableList.style.top = headerHeight + 'px';
		}
	}

	handleBoardTouchMove (e) {
		console.log('handleBoardTouchMove');
		this.handleBoardMouseMove(e, true);
	}

	listEdit(list) {
		// this.board.editList(list);
		this.props.history.push('/boardlists/' + list.id);
	}

	handleBoardMouseUp(e) {
		this.board.endEditing();

		if (this.board.dragTask) {
			this.draggableTask.className = 'hidden';
			if (this.board.dragTaskChanged) {
				// this.board.saveTask(this.board.dragTask);
				this.board.dragTask.save();
			}
			this.board.endTaskDrag();
		}

		if (this.board.dragList) {
			this.draggableList.className = 'hidden';
			if (this.board.dragListChanged) {
				this.board.saveList(this.board.dragList);
			}
			this.board.endListDrag();
		}
	}

	handleBoardMouseLeave(e) {
	}

	render() {

		if (this.boardLists.isLoading) {
			return <div>Loading boardLists...</div>
		}

		console.log('Board render:', this.boardLists.list.map(list =>
			this.board.dragList && this.board.dragList.id === list.id ? '+'+list.id : list.id));

		// console.log('projectMembers:', this.project.members());

		const items = this.boardLists.list.map((list, i) => {
			return (
				<BoardList
					key={list.id}
					list={list}
					history={this.props.history}
					onListEdit={list => this.listEdit(list)}
					onListDelete={list => this.onListDelete(list)}
				/>
			);
		});

		return (
			<div className="board-page">
				<div className={"board-lists-container" + (this.board.dragTask || this.board.dragList ? ' dragging' : '')}
				     ref={node => this.containerNode = node}
				     onMouseMove={e => this.handleBoardMouseMove(e)}
				     onTouchMove={e => this.handleBoardTouchMove(e)}
				     onMouseLeave={e => this.handleBoardMouseLeave(e)}
				     onMouseUp={e => this.handleBoardMouseUp(e)}
				     onTouchEnd={e => this.handleBoardMouseUp(e)}>
					{items}
					{
						<div className={'board-add-list ' + (this.board.newListProjectId === this.project.id ? 'active' : '')}
						     onMouseUp={e => e.stopPropagation()}
						     ref={node => this.addListNode = node}>
							{this.uiStore.showDebugInfo && <div className="add-list-debug"/>}
							<IconLink href="#" icon="plus" className="add-list-btn" onClick={e => this.addList(e)}/>
							{/*<a href="#" className="add-list-btn" onClick={e => this.addList(e)}>{t('boardList.create')}</a>*/}
							<div className="add-list-form">
								<input type="text" size="20" ref={node => this.addListText = node} placeholder={t('boardList.name')}/>
								<a className="btn btn-primary" href="#" onClick={e => this.onSubmitNewList(e)}>Добавить</a>
								<a className="btn btn-default" href="#" onClick={e => this.onCancelAddList(e)}>Отмена</a>
							</div>
						</div>
					}
				</div>
				<DraggableTask
					getRef={node => this.draggableTask = node}
					task={this.board.dragTask}
					showDebugInfo={this.uiStore.showDebugInfo}
				/>
				<DraggableList
					getRef={node => this.draggableList = node}
					list={this.board.dragList}
				/>
				{this.board.editedTask && <TaskEdit task={this.board.editedTask}/>}
				{this.board.editedList && <ListEdit list={this.board.editedList}/>}
			</div>
		);

	}

}

export default Board;
