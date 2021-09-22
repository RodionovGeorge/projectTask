/*
export function someGetter (state) {
}
*/
export function userInformationGetter (state) {
  return state.userData
}

export function userFullName (state) {
  return [state.userData.lastName, state.userData.firstName, state.userData.middleName].join(' ')
}
