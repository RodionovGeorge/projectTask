<template>
  <q-item>
    <q-item-section
      avatar
    >
      <q-avatar>
        <img
          :src="avatarPath"
          alt="123"
        />
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <q-item-label>
        {{ authorFullName }} - {{ commentaryDate }}
      </q-item-label>
      <q-item-label>
        {{ commentaryText }}
      </q-item-label>
    </q-item-section>
    <q-item-section
      side
    >
      <q-btn
        icon="delete"
        dense
        flat
        size="15px"
        @click="deleted"
      />
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'Commentary',
  data () {
    return {
      isHidden: false
    }
  },
  props: {
    commentaryID: {
      type: Number,
      default: 1
    },
    avatarPath: {
      type: String,
      default: 'https://cdn.quasar.dev/img/avatar2.jpg'
    },
    authorFullName: {
      type: String,
      default: 'Некто Нектович'
    },
    commentaryDate: {
      type: String,
      default: 'Четверг, 12.04.21, 21:12'
    },
    commentaryText: {
      type: String,
      default: 'Hello world!'
    }
  },
  methods: {
    deleted () {
      this.$emit('deleted', this.commentaryID)
    }
  }
}
</script>

<style scoped>

</style>
