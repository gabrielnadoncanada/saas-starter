export type FeatureId = "auth" | "orgs" | "billing" | "admin" | "ai" | "dx";

const wrapClass =
  "min-h-[280px] rounded-[10px] border border-border bg-[#0b0b0e] p-5 font-mono text-xs leading-[1.7] text-foreground";
const dim = "text-muted-foreground/60";
const kw = "text-[#c594c5]";
const fn = "text-[#7cafc2]";
const str = "text-[#ffc58b]";
const accent = "text-brand";

export function FeatureCodePreview({ id }: { id: FeatureId }) {
  if (id === "auth")
    return (
      <div className={wrapClass}>
        <div className={dim}>// lib/auth/auth-config.ts</div>
        <div>
          <span className={kw}>export const</span> auth ={" "}
          <span className={fn}>betterAuth</span>({"{"}
        </div>
        <div>
          &nbsp;&nbsp;emailAndPassword: {"{ enabled: "}
          <span className={str}>true</span>
          {" },"}
        </div>
        <div>&nbsp;&nbsp;socialProviders: {"{"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;google: {"{ clientId, clientSecret },"}</div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;github: {"{ clientId, clientSecret },"}</div>
        <div>&nbsp;&nbsp;{"},"}</div>
        <div>&nbsp;&nbsp;plugins: {"["}</div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className={fn}>magicLink</span>({"{ sendMagicLink }"}),
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className={fn}>organization</span>(
          {"{ allowUserToCreateOrganization: "}
          <span className={str}>true</span>
          {" }"}),
        </div>
        <div>&nbsp;&nbsp;{"],"}</div>
        <div>{"});"}</div>
      </div>
    );

  if (id === "orgs")
    return (
      <div className={wrapClass}>
        <div className={dim}>// server action scoped to active org</div>
        <div>
          <span className={kw}>export async function</span>{" "}
          <span className={fn}>listTasks</span>() {"{"}
        </div>
        <div>
          &nbsp;&nbsp;<span className={kw}>const</span> {"{ activeOrgId, role }"} ={" "}
          <span className={kw}>await</span>{" "}
          <span className={fn}>requireOrgSession</span>();
        </div>
        <div>
          &nbsp;&nbsp;<span className={fn}>assertRole</span>(role,{" "}
          <span className={str}>&quot;member&quot;</span>);
        </div>
        <div>
          &nbsp;&nbsp;<span className={kw}>return</span> db.task.
          <span className={fn}>findMany</span>({"{"}
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;where: {"{ organizationId: activeOrgId }"},
        </div>
        <div>&nbsp;&nbsp;{"});"}</div>
        <div>{"}"}</div>
        <div className={`mt-2.5 ${dim}`}>
          // every query scoped. no leaks between tenants.
        </div>
      </div>
    );

  if (id === "billing")
    return (
      <div className={wrapClass}>
        <div className={dim}>// config/billing.config.ts</div>
        <div>{"{"}</div>
        <div>
          &nbsp;&nbsp;id: <span className={str}>&quot;pro&quot;</span>,
        </div>
        <div>&nbsp;&nbsp;capabilities: {"["}</div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className={str}>&quot;task.create&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className={str}>&quot;task.export&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className={str}>&quot;team.invite&quot;</span>,
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <span className={str}>&quot;ai.assistant&quot;</span>,
        </div>
        <div>&nbsp;&nbsp;{"],"}</div>
        <div>
          &nbsp;&nbsp;limits: {"{ tasksPerMonth: "}
          <span className={str}>1000</span>
          {", aiCredits: "}
          <span className={str}>1000</span>
          {" }"}
        </div>
        <div>{"}"}</div>
        <div className={`mt-2.5 ${dim}`}>// then, anywhere in your app:</div>
        <div>
          <span className={fn}>assertCapability</span>(planId,{" "}
          <span className={str}>&quot;ai.assistant&quot;</span>);
        </div>
      </div>
    );

  if (id === "admin")
    return (
      <div className={wrapClass}>
        <div className={dim}>// features/users/server/admin.ts</div>
        <div>
          <span className={kw}>export async function</span>{" "}
          <span className={fn}>impersonateUser</span>(id:{" "}
          <span className={kw}>string</span>) {"{"}
        </div>
        <div>
          &nbsp;&nbsp;<span className={kw}>const</span> admin ={" "}
          <span className={kw}>await</span>{" "}
          <span className={fn}>requireAdmin</span>();
        </div>
        <div>
          &nbsp;&nbsp;<span className={kw}>await</span>{" "}
          <span className={fn}>logAudit</span>({"{"}
        </div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;actorId: admin.id,</div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;action:{" "}
          <span className={str}>&quot;user.impersonate&quot;</span>,
        </div>
        <div>&nbsp;&nbsp;&nbsp;&nbsp;targetId: id,</div>
        <div>&nbsp;&nbsp;{"});"}</div>
        <div>
          &nbsp;&nbsp;<span className={kw}>return</span>{" "}
          <span className={fn}>startSession</span>(id);
        </div>
        <div>{"}"}</div>
      </div>
    );

  if (id === "ai")
    return (
      <div className={wrapClass}>
        <div className={dim}>// features/assistant/server/chat.ts</div>
        <div>
          <span className={kw}>const</span> result ={" "}
          <span className={kw}>await</span>{" "}
          <span className={fn}>streamText</span>({"{"}
        </div>
        <div>
          &nbsp;&nbsp;model: <span className={fn}>google</span>(
          <span className={str}>&quot;gemini-2.0-flash&quot;</span>),
        </div>
        <div>
          &nbsp;&nbsp;system: <span className={fn}>buildSystemPrompt</span>(org),
        </div>
        <div>&nbsp;&nbsp;tools: {"{"}</div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className={accent}>searchTasks</span>:{" "}
          {"{ parameters, execute },"}
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className={accent}>createTask</span>:{" "}
          {"{ parameters, execute },"}
        </div>
        <div>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className={accent}>draftEmail</span>:{" "}
          {"{ parameters, execute },"}
        </div>
        <div>&nbsp;&nbsp;{"},"}</div>
        <div>&nbsp;&nbsp;messages,</div>
        <div>{"});"}</div>
        <div className={`mt-2.5 ${dim}`}>
          // org-scoped. credits tracked. you ship it.
        </div>
      </div>
    );

  return (
    <div className={wrapClass}>
      <div className={dim}>
        // project structure — features/&lt;name&gt;/ every time
      </div>
      <div>features/</div>
      <div>&nbsp;&nbsp;tasks/</div>
      <div>
        &nbsp;&nbsp;&nbsp;&nbsp;actions/{" "}
        <span className={dim}>// server actions</span>
      </div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;components/</div>
      <div>
        &nbsp;&nbsp;&nbsp;&nbsp;server/ <span className={dim}>// data access</span>
      </div>
      <div>
        &nbsp;&nbsp;&nbsp;&nbsp;schemas/ <span className={dim}>// zod</span>
      </div>
      <div>&nbsp;&nbsp;&nbsp;&nbsp;types/</div>
      <div>&nbsp;&nbsp;billing/ · assistant/ · auth/ · organizations/</div>
      <div className={`mt-3 ${dim}`}>
        // every feature same shape. every time.
      </div>
    </div>
  );
}
