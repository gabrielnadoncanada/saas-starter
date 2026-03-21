type AuthFlowHiddenFieldsProps = {
  redirect?: string | null;
  priceId?: string | null;
  pricingModel?: string | null;
  inviteId?: string | null;
};

export function AuthFlowHiddenFields({
  redirect,
  priceId,
  pricingModel,
  inviteId,
}: AuthFlowHiddenFieldsProps) {
  return (
    <>
      {redirect ? <input type="hidden" name="redirect" value={redirect} /> : null}
      {priceId ? <input type="hidden" name="priceId" value={priceId} /> : null}
      {pricingModel ? (
        <input type="hidden" name="pricingModel" value={pricingModel} />
      ) : null}
      {inviteId ? <input type="hidden" name="inviteId" value={inviteId} /> : null}
    </>
  );
}
