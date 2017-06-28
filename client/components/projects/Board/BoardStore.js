import { computed, observable, extendObservable, action, autorun } from 'mobx';
import t from '../../../../i18n';

class BoardStore {

	@observable isLoading = true;

	@observable dragTask = null;
	@observable dragTaskData = null;
	@observable editedTask = null;
	@observable taskFetchStatus = null;
	@observable newTaskListId = null;

	@observable dragList = null;
	@observable dragListData = null;
	@observable editedList = null;
	@observable listFetchStatus = null;
	@observable newListProjectId = null;

	constructor() {

	}

	/* tasks */

	@action startTaskDrag(payload) {
		this.dragTask = payload.task;
		this.dragTaskData = payload.dragTaskData;
	}

	@action endTaskDrag() {
		this.dragTask = null;
		this.dragTaskData = null;
	}

	@action addTask(listId) {
		this.newTaskListId = listId;
	}

	@action editTask(task) {
		this.editedTask = task;
	}

	@computed get dragTaskChanged() {
		return this.dragTask && (
			this.dragTaskData.priority !== this.dragTask.priority ||
			this.dragTaskData.boardListId !== this.dragTask.boardListId
		);
	}

	updateListAndPriority({ boardList, newIndex, priority }) {
		const oldBoardListTasks = this.dragTask.boardList.tasks().list;
		const oldIndex = oldBoardListTasks.findIndex(task => task.id === this.dragTask.id);
		// console.log('oldIndex:', oldIndex);
		this.dragTask.boardList = boardList;
		this.dragTask.priority = priority;
		oldBoardListTasks.splice(oldIndex, 1);
		boardList.tasks().list.splice(newIndex, 0, this.dragTask);
	}

	/* boardlists */

	@action startListDrag(payload) {
		this.dragList = payload.list;
		this.dragListData = payload.dragListData;
	}

	@action updateDraggedList(payload) {
		// console.log('updateDraggedList', payload);
		const { boardList, leftHalf, priority } = payload;
		const boardLists = this.dragList.project.boardLists().list;
		this.dragList.update({priority});
		const oldIndex = boardLists.findIndex(list => list.id === this.dragList.id);
		const newIndex = boardLists.findIndex(list => list.id === boardList.id);

		boardLists[oldIndex] = boardList;
		boardLists[newIndex] = this.dragList;
	}

	@action endListDrag() {
		this.dragList = null;
		this.dragListData = null;
	}

	@action addList(projectId) {
		this.newListProjectId = projectId;
	}

	@action editList(list) {
		this.listFetchStatus = null;
		this.editedList = list;
	}

	@action saveList(list) {
		this.listFetchStatus = t('saving');
		list.save().then( ({error}) => {
			if (!error) {
				this.listFetchStatus = null;
			}
			else {
				this.listFetchStatus = t('error') + ': ' + error.message;
			}
		});
	}

	@action deleteList(list) {
		this.listFetchStatus = t('deleting');
		list.delete().then( ({error}) => {
			if (!error) {
				this.taskFetchStatus = null;
			}
			else {
				this.listFetchStatus = t('error') + ': ' + error.message;
			}
		});
	}

	@action fakeDeleteList(list) {
		list.fakeDelete();
	}

	@computed get dragListChanged() {
		return this.dragList && this.dragListData.priority !== this.dragList.priority;
	}

	/* common */

	@action endEditing() {
		this.editedTask = null;
		this.editedList = null;
		this.newTaskListId = null;
		this.newListProjectId = null;
	}

}

const boardStore = new BoardStore();

export default boardStore;
