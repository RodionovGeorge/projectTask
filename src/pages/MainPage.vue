<template>
  <q-page
    class="column items-center"
  >
    <div
      class="row q-gutter-x-md q-pt-md no-wrap"
    >
      <MainTableOfProblems/>
      <div
        class="col-auto"
      >
        <q-list
          bordered
          separator
          style="width:150px"
        >
          <MainMenuButton
            v-for="link in menuInformation"
            :key="link.title"
            v-bind="link"
          />
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script>
import MainMenuButton from 'components/MainMenuButton'
import MainTableOfProblems from 'components/MainTableOfProblems'

const linksForMenu = [
  {
    title: 'My profile',
    link: '/my/newTask'
  },
  {
    title: 'My tasks'
  },
  {
    title: 'My questions'
  }
]
export default {
  name: 'pageMain',
  components: { MainMenuButton, MainTableOfProblems },
  data () {
    return {
      menuInformation: linksForMenu
    }
  }
}
</script>
