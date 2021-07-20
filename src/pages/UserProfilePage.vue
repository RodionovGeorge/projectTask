<template>
  <q-page>
    <div
      class="row justify-center"
    >
      <UserInformation
        v-bind="informationAboutUser"
        class="user-information"
      />
    </div>
  </q-page>
</template>

<script>
import UserInformation from 'components/UserInformation'
export default {
  name: 'UserProfilePage',
  components: { UserInformation },
  data () {
    return {
      informationAboutUser: {
        userAvatarPath: 'https://sun9-64.userapi.com/impf/c639727/v639727031/75932/__8JL6hjjPw.jpg?size=2560x1920&quality=96&sign=712e05f367d0a79d392e2f0c458e0365&type=album',
        userFullName: 'Родионов Георгий Витальевич',
        userEmail: 'lll@gmail.com'
      }
    }
  }
}
</script>

<style scoped>

</style>
