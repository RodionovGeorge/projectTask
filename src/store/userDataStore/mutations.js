/*
export function someMutation (state) {
}
*/
export const updateAdminState = (state, isAdmin) => {
  state.authUserData.isAdmin = isAdmin
}
