'use server';

import type { ActionState } from '@/lib/auth/middleware';

import {
  requestPasswordResetAction,
  resetPasswordAction,
  signInAction,
  signOutAction,
  signUpAction
} from './server-actions/auth-actions';
import {
  deleteAccountAction,
  unlinkAuthProviderAction,
  updateAccountAction,
  updatePasswordAction
} from './server-actions/account-actions';
import {
  inviteTeamMemberAction,
  removeTeamMemberAction
} from './server-actions/team-actions';

export async function signIn(prevState: ActionState, formData: FormData) {
  return signInAction(prevState, formData);
}

export async function signUp(prevState: ActionState, formData: FormData) {
  return signUpAction(prevState, formData);
}

export async function requestPasswordReset(
  prevState: ActionState,
  formData: FormData
) {
  return requestPasswordResetAction(prevState, formData);
}

export async function signOut() {
  return signOutAction();
}

export async function resetPassword(prevState: ActionState, formData: FormData) {
  return resetPasswordAction(prevState, formData);
}

export async function updatePassword(prevState: ActionState, formData: FormData) {
  return updatePasswordAction(prevState, formData);
}

export async function deleteAccount(prevState: ActionState, formData: FormData) {
  return deleteAccountAction(prevState, formData);
}

export async function updateAccount(prevState: ActionState, formData: FormData) {
  return updateAccountAction(prevState, formData);
}

export async function unlinkAuthProvider(
  prevState: ActionState,
  formData: FormData
) {
  return unlinkAuthProviderAction(prevState, formData);
}

export async function removeTeamMember(
  prevState: ActionState,
  formData: FormData
) {
  return removeTeamMemberAction(prevState, formData);
}

export async function inviteTeamMember(
  prevState: ActionState,
  formData: FormData
) {
  return inviteTeamMemberAction(prevState, formData);
}
