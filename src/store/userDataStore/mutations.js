/*
export function someMutation (state) {
}
*/
export function SET_USER_INFORMATION (state, userInformation) {
  state.userData = userInformation
}

export function SET_ACCOUNT_ACTIVATED (state, isActivated) {
  state.userData.accountActivated = isActivated
}
