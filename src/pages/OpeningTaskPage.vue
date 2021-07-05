<template>
<q-page class="column items-center q-pt-md">
  <div class="row q-gutter-x-md no-wrap">
    <div class="column" v-if="isAdmin">
      <div class="text-h4 text-center">Новые задачи</div>
      <CompForOpTask v-for="task in newTasks" :key="task.authorFullName" v-bind="task"></CompForOpTask>
    </div>
    <div v-if="!isAdmin" style="width: 850px">
      <div class="text-h4 text-center">А вы куда?</div>
    </div>
    <div>
      <q-list bordered separator style="width:150px">
        <MainMenuButton v-for="link in menuInformation" :key="link.title" v-bind="link"/>
      </q-list>
    </div>
  </div>
</q-page>
</template>

<script>
import CompForOpTask from 'components/CompForOpTask'
import MainMenuButton from 'components/MainMenuButton'
export default {
  name: 'OpeningTaskPage',
  components: { CompForOpTask, MainMenuButton },
  data () {
    return {
      newTasks: [{ authorFullName: 'Для примера', authorCommentary: 'Комментарий111 111111111111111111 111111111111111111 11111111111111111111111 111111111111111111111111111111111111 111111111111111111111111111111111111111111 1111111111111111111111 11111111111' }, { authorFullName: 'Для примера1', authorCommentary: 'Комментарий1' }, { authorFullName: 'Для примера2', authorCommentary: 'Комментарий2' }],
      menuInformation: [{ title: 'My profile', link: '/my/NewTask' },
        { title: 'My tasks', link: '/my' },
        { title: 'My questions' }]
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
