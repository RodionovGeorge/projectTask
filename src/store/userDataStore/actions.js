/*
export function someAction (context) {
}
*/
export function setUserInformation (context, userInformation) {
  context.commit('SET_USER_INFORMATION', userInformation)
}
