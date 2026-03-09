type PostSignInParams = {
  redirect?: string | null;
  priceId?: string | null;
  inviteId?: string | null;
};

export function getPostSignInCallbackUrl({
  redirect,
  priceId,
  inviteId,
}: PostSignInParams) {
  const params = new URLSearchParams();

  if (redirect === "checkout" && priceId) {
    params.set("redirect", redirect);
    params.set("priceId", priceId);
  }

  if (inviteId) {
    params.set("inviteId", inviteId);
  }

  const query = params.toString();

  return query ? `/post-sign-in?${query}` : "/post-sign-in";
}
