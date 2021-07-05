<template>
  <q-page class="flex flex-center">
    <TaskEditor></TaskEditor>
  </q-page>
</template>

<script>
import TaskEditor from 'components/TaskEditor'
export default {
  name: 'PageIndex',
  components: { TaskEditor }
}
</script>
