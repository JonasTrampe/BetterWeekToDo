<template>
  <div id="todo-item-active" class="todo-item" ref="currentTodo" draggable="true"
    @dragstart="startDrag($event, activeTodo.toDo, activeTodo.index)" @dragend="endDrag()" @wheel="movingWheel"
    :class="{ 'dragging': todoDragging }" @mouseleave="hideToDoItem">
    <div class="d-flex">
      <span class="noselect item-text" :class="{ 'checked-todo': activeTodo.toDo.checked }" style="flex-grow: 1"
        @click="checkTodoClickhandler" @click.middle="showToDoDetails">
        <span v-if="activeTodo.toDo.color != 'none'" class="cicle-icon" :style="'color: ' + activeTodo.toDo.color" :class="{
          'bi-check-circle-fill': activeTodo.toDo.checked,
          'bi-circle-fill': !activeTodo.toDo.checked,
        }"></span>
        <span v-else class="cicle-icon"
          :class="{ 'bi-check-circle': activeTodo.toDo.checked, 'bi-circle': !activeTodo.toDo.checked, }"></span>
        <span v-html="todoText"></span>
        <span class="time-details"> {{ timeFormat(activeTodo.toDo.time) }}
          <div class="alarm-indicator"
            :class="{ 'show-alarm-indicator': notificationIndicator && activeTodo.toDo.alarm }"></div>
        </span>
      </span>
      <button class="bi-three-dots todo-item-menu" type="button" aria-label="Task actions" @click.stop="menuOpen = !menuOpen"></button>
      <i class="bi-x todo-item-remove" @click="removeTodo"></i>
    </div>
    <div v-if="menuOpen" class="task-action-menu">
      <button type="button" @click="showToDoDetails">Edit task</button>
      <button type="button" @click="moveToDate(0)">Move to today</button>
      <button type="button" @click="moveToDate(1)">Move to tomorrow</button>
      <button v-for="list in $store.getters.cTodoListIds" :key="list.listId" type="button" @click="moveToList(list.listId)">Move to {{ list.listName || 'custom list' }}</button>
    </div>

    <div v-if="activeTodo.toDo.subTaskList && activeTodo.toDo.subTaskList.length > 0" class="todo-item-sub-tasks">
      <ul class="sub-tasks">
        <li v-for="(subTask, index) in activeTodo.toDo.subTaskList" :key="index" class="sub-task">
          <div class="d-flex flex-row mt-1" :class="{ 'checked-sub-task': subTask.checked }">
            <input class="form-check-input" type="checkbox" v-model="subTask.checked"
              @change="checkSubTask(subTask, index, $event)" />
            <label class="form-check-label" @click="checkSubTask(subTask, index, $event)">
              <span v-html="linkifyText(subTask.text)"></span>
            </label>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import toDoListRepository from "../repositories/toDoListRepository";
import { Modal, Toast } from "bootstrap";
import dateTime from "../helpers/dateTime";
import notifications from "../helpers/notifications";
import linkifyStr from 'linkify-string';
import ClickHandler from "../helpers/clickHandler";
import tasksHelper from "../helpers/tasksHelper";

export default {
  components: {},
  props: {
    activeTodo: { required: true, type: Object }
  },
  data() {
    return {
      editing: false,
      todoDragHover: false,
      todoDragging: false,
      menuOpen: false,
      options: { target: '_blank', defaultProtocol: 'https', attributes: { rel: 'noopener noreferrer' } },
      clickhandler: new ClickHandler(),
      scrollingTimeOut: null
    };
  },
  methods: {
    async moveToDate(days) {
      const destination = dateTime().add(days, 'day').format('YYYYMMDD');
      await this.moveToList(destination);
    },
    async moveToList(destination) {
      const origin = this.activeTodo.toDoListId;
      if (!destination || destination === origin) return;
      await this.$store.dispatch('loadTodoLists', destination);
      const [task] = this.$store.getters.todoLists[origin].splice(this.activeTodo.index, 1);
      task.listId = destination;
      this.$store.getters.todoLists[destination].unshift(task);
      toDoListRepository.update(origin, this.$store.getters.todoLists[origin]);
      toDoListRepository.update(destination, this.$store.getters.todoLists[destination]);
      this.menuOpen = false;
      this.hideToDoItem();
    },
    removeTodo: function () {
      this.$store.commit("setUndoElement", { type: 'task', todo: this.activeTodo.toDo, index: this.activeTodo.index });
      this.$store.commit("removeTodo", { toDoListId: this.activeTodo.toDoListId, index: this.activeTodo.index, });
      notifications.refreshDayNotifications(this, this.activeTodo.toDoListId);
      toDoListRepository.update(this.activeTodo.toDoListId, this.$store.getters.todoLists[this.activeTodo.toDoListId]);
      let toast = new Toast(document.getElementById("taskRemoved"));
      toast.show(); // The undo remove acction it's called in todoModal.vue:undoRemoveTask
      this.hideToDoItem();
    },
    showToDoDetails: function () {
      this.$store.commit("actionsSelectedTodoIdUpdate", {
        toDo: this.activeTodo.toDo,
        index: this.activeTodo.index,
      });

      let modal = new Modal(document.getElementById("toDoModal"), { keyboard: false });
      modal.show();
    },
    checkTodoClickhandler: function (e) {
      if (e.target.href) return;

      this.$store.commit("checkTodo", { toDoListId: this.activeTodo.toDoListId, index: this.activeTodo.index, });
      var id = this.activeTodo.toDoListId;
      var index = this.activeTodo.index;
      this.clickhandler.handle(() => { this.checkToDo(id, index) }, this.activeTodo.edit, `${this.activeTodo.toDoListId}${this.activeTodo.index}`);
    },
    checkToDo: function (toDoListId, index) {
      if (this.$store.getters.todoLists[toDoListId][index].checked && this.$store.getters.config.moveCompletedTaskToBottom) {
        this.$refs.currentTodo.style.display = `none`;
        this.$store.commit("moveTodoToEnd", { toDoListId: toDoListId, index: index, });
      }
      if (this.$store.getters.config.autoReorderTasks) {
        this.$refs.currentTodo.style.display = `none`;
        toDoListRepository.update(toDoListId, tasksHelper.reorderTasksList(this.$store.getters.todoLists[toDoListId]));
      } else {
        toDoListRepository.update(toDoListId, this.$store.getters.todoLists[toDoListId]);
      }
      notifications.refreshDayNotifications(this, this.activeTodo.toDoListId);
    },
    startDrag: function (event, item, index) {
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("item", JSON.stringify(item));
      event.dataTransfer.setData("index", index);
      event.dataTransfer.setDragImage(this.activeTodo.container, 0, 0);
      setTimeout(() => {
        this.$refs.currentTodo.style.display = `none`;
        this.todoDragging = true;
      }, 40);
      document.getElementById("app-container").classList.add("dragging-item");
    },
    endDrag: function () {
      this.todoDragging = false;
      document.getElementById("app-container").classList.remove("dragging-item");
    },
    onDragenter: function () {
      this.todoDragHover = true;
    },
    onDragleave: function () {
      this.todoDragHover = false;
    },
    checkSubTask: function (subTask, index, e) {
      if (e.target.href) return;

      if (!e.target.value) subTask.checked = !subTask.checked;
      var todoList = this.activeTodo.toDo.subTaskList;
      if (subTask.checked && this.moveSubtaskToBotttom) { todoList.push(todoList.splice(index, 1)[0]); }
      if (todoList.length && todoList.every((task) => task.checked)) {
        this.$store.getters.todoLists[this.activeTodo.toDoListId][this.activeTodo.index].checked = true;
      }
      toDoListRepository.update(this.activeTodo.toDoListId, this.$store.getters.todoLists[this.activeTodo.toDoListId]);
    },
    timeFormat: function (date) {
      if (date) {
        return dateTime(date, "HH:mm").format("hh:mm a");
      }
    },
    linkifyText: function (text) {
      return linkifyStr(text, this.options);
    },
    hideToDoItem: function () {
      this.$refs.currentTodo.style.display = `none`;
    },
    movingWheel() {
      this.$refs.currentTodo.style.display = `none`;
      this.$refs.currentTodo.classList.add("scrolling");
      document.getElementById("app-container").classList.add("scrolling");
      if (this.scrollingTimeOut != null) return;

      this.scrollingTimeOut = setTimeout(() => {
        this.scrollingTimeOut = null;
        document.onmousemove = function () {
          document.onmousemove = null;
          document.getElementById("todo-item-active").classList.remove("scrolling");
          document.getElementById("app-container").classList.remove("scrolling");
        }
      }, 400);
    }
  },
  computed: {
    todoText: function () {
      return linkifyStr(this.activeTodo.toDo.text, this.options);
    },
    notificationIndicator: function () {
      return this.$store.getters.config.notificationIndicator;
    },
    moveSubtaskToBotttom: function () {
      return this.$store.getters.config.moveCompletedSubTaskToBottom;
    },
  }
};
</script>

<style scoped lang="scss">
.task-action-menu { display: flex; flex-wrap: wrap; gap: .25rem; padding: .35rem .5rem .5rem; border-top: 1px solid #d8d5ca; background: #fcfaf5; }
.task-action-menu button { min-height: 2rem; border: 1px solid #b8c5b5; border-radius: 5px; background: transparent; color: #263a2d; padding: .2rem .45rem; font-size: .72rem; }
.task-action-menu button:hover,.task-action-menu button:focus-visible { background: #e7eee4; outline: 2px solid #c86d3e; outline-offset: 1px; }
.dark-theme .task-action-menu { border-color: #405443; background: #1c2a20; }
.dark-theme .task-action-menu button { border-color: #718670; color: #e3ebe0; }
.dark-theme .task-action-menu button:hover,.dark-theme .task-action-menu button:focus-visible { background: #2b3d2e; }
.todo-item {
  background-color: #ffffff;
  color: #1e1e1e;
  border-radius: 7px;
  position: relative;
  box-shadow: 0px 2px 13px 0px rgba(0, 0, 0, 0.15);
  z-index: 6;
  position: absolute;
  display: none;

  &:hover {
    display: block;
  }

  * {
    transition: all 0.4s cubic-bezier(0.2, 1, 0.1, 1) 0s;
    pointer-events: all;
  }

  .dark-theme & {
    box-shadow: 0 0px 0 1px #4c4c4c;
    background-color: #21262d;
    color: #f7f7f7;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.1);
  }

  .item-text {
    white-space: unset;
    word-break: normal;
    height: unset;
    overflow-wrap: break-word;
    word-wrap: break-word;
    z-index: 1;
  }
}

.todo-item.scrolling {
  display: none !important;
}

.item-text {
  transition: width 2s, height 2s, transform 2s;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 1rem;
  height: 1.2rem;
  line-height: 1.3rem;
  font-size: 0.865rem;
  margin: 2px 0px 2px 0px;
  padding: 0 3px 0 7px;
}

.item-time {
  transition: width 2s, height 2s, transform 2s;
  height: 1.2rem;
  line-height: 1.3rem;
  font-size: 0.865rem;
  margin: 2px 0px 2px 0px;
  padding: 0 7px 0 0px;
  opacity: 0.6;
}

.item-time.checked-todo {
  opacity: unset;
}

.time-details {
  opacity: 0.6;
  display: inline;
  margin-left: 5px;
}

.todo-item.checked-todo .time-details {
  opacity: unset;
}

.checked-todo {
  color: #acacac;
  text-decoration: line-through;

  .dark-theme & {
    color: #636363;
  }
}

.checked-sub-task {
  color: #c4c4c4;
  text-decoration: line-through;

  .dark-theme & {
    color: #3a3a40;
  }

  input {
    opacity: 0.5;
  }
}

.todo-item-remove {
  font-size: 1.3rem;
  cursor: pointer;
  margin-top: 1px;
  margin-left: 5px;
  margin-right: 5px;
  color: grey;
  height: 1.3rem;
  flex-grow: 0;
}

.todo-item-menu {
  font-size: 1rem;
  cursor: pointer;
  margin-top: 3px;
  margin-left: 5px;
  margin-right: 0px;
  color: grey;
  height: 1.1rem;
  flex-grow: 0;
}

.todo-item-remove:hover,
.todo-item-menu:hover {
  color: black;
}

.dark-theme .todo-item-remove,
.dark-theme .todo-item-menu {
  color: #c9d1d9;
}

.dark-theme .todo-item-remove:hover,
.dark-theme .todo-item-menu:hover {
  color: white;
}

.drag-hover {
  color: rgba(157, 157, 157, 0.43);
  box-shadow: rgb(244, 243, 243) 0px 0px 4px 1px inset;
  background-color: rgb(250, 249, 249);
}

.dark-theme .drag-hover {
  color: rgb(69, 69, 69);
  box-shadow: #0b0d12 0px 0px 4px 1px inset;
  background-color: #0c0d14;
}

.dragging.todo-item {
  display: none;
}

.sub-tasks {
  list-style: none;
  padding: 0px;
  font-size: 0.865rem;

  li {
    margin: 0px 10px 0px 10px;
  }

  li:last-child {
    margin: 0px 10px 10px 10px;
  }

  input {
    min-width: 14px;
    width: 14px;
    min-height: 14px;
    height: 14px;
    margin-right: 8px;
  }

  label {
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.cicle-icon {
  font-size: 10px;
  margin-right: 5px;
}

.bi-check-circle-fill,
.bi-check-circle {
  opacity: 0.7;
}
</style>
