/*
export function someAction (context) {
}
*/
export function setUserInformation (context, userInformation) {
  context.commit('SET_USER_INFORMATION', userInformation)
}

export function setAccountActivatedStatus (context, isActivated) {
  context.commit('SET_ACCOUNT_ACTIVATED', isActivated)
}
