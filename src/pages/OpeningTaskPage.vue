<template>
<q-page
  class="column items-center q-pt-md"
>
  <div
    class="column"
    v-if="isAdmin"
  >
    <div
      class="text-h4 text-center"
    >
      Новые задачи
    </div>
    <CompForOpTask
      v-for="task in newTasks"
      :key="task.authorFullName"
      v-bind="task"
    >
    </CompForOpTask>
  </div>
  <div
    v-if="!isAdmin"
    style="width: 850px"
  >
    <div
      class="text-h4 text-center"
    >
      А вы куда?
    </div>
  </div>
</q-page>
</template>

<script>
import CompForOpTask from 'components/CompForOpTask'
export default {
  name: 'OpeningTaskPage',
  components: { CompForOpTask },
  data () {
    return {
      newTasks: [{
        authorFullName: 'Для примера',
        authorCommentary: 'Комментарий111 111111111111111111 111111111111111111 11111111111111111111111 111111111111111111111111111111111111 111111111111111111111111111111111111111111 1111111111111111111111 11111111111'
      }, {
        authorFullName: 'Для примера1',
        authorCommentary: 'Комментарий1'
      }, {
        authorFullName: 'Для примера2',
        authorCommentary: 'Комментарий2'
      }]
    }
  },
  computed: {
    isAdmin: {
      get () {
        return this.$store.state.userDataStore.authUserData.isAdmin
      }
    }
  }
}
</script>
