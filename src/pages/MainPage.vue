<template>
  <q-page
    class="column items-center"
  >
      <MainTableOfProblems
        class="q-ma-sm"
      />
  </q-page>
</template>

<script>
import MainTableOfProblems from 'components/MainTableOfProblems'
export default {
  name: 'pageMain',
  components: { MainTableOfProblems },
  data () {
    return {
    }
  }
}
</script>
