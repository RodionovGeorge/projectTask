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
        {{ authorFullName }} - {{ commentaryDateString }}
      </q-item-label>
      <q-item-label>
        {{ commentaryText }}
      </q-item-label>
    </q-item-section>
    <q-item-section
      side
      v-if="showDeleteButton"
    >
      <q-btn
        icon="bi-trash"
        dense
        flat
        :loading="loading"
        @click="deleted"
      >
        <template
          v-slot:loading
        >
          <q-spinner
            :thickness="2"
          />
        </template>
      </q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'Commentary',
  props: {
    userStatus: {
      type: String
    },
    commentaryID: {
      type: Number
    },
    authorID: {
      type: Number
    },
    showDeleteButton: {
      type: Boolean
    },
    avatarPath: {
      type: String
    },
    authorFullName: {
      type: String
    },
    commentaryDate: {
      type: String
    },
    commentaryText: {
      type: String
    },
    loading: {
      type: Boolean
    }
  },
  methods: {
    deleted () {
      this.$emit('deleted', this.commentaryID)
    }
  },
  computed: {
    cDate () {
      return new Date(this.commentaryDate)
    },
    commentaryDateString () {
      const x = this.cDate
      const day = x.getDate() < 10 ? '' + 0 + x.getDate() : x.getDate()
      const month = (x.getMonth() + 1) < 10 ? '' + 0 + (x.getMonth() + 1) : (x.getMonth() + 1)
      const hour = x.getHours() < 10 ? '' + 0 + x.getHours() : x.getHours()
      const minute = x.getMinutes() < 10 ? '' + 0 + x.getMinutes() : x.getMinutes()
      return day + '/' + month + '/' + x.getFullYear() + ' ' + hour + ':' + minute
    }
  }
}
</script>

<style scoped>

</style>
