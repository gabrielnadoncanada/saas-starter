import { db } from "@/lib/db/prisma";

const DILAMCO_ORG_ID = "seed-dilamco-org";
const DILAMCO_ORG_SLUG = "dilamco";
const DILAMCO_AGENT_SLUG = "contreplaque";

const DILAMCO_SYSTEM_PROMPT = `Tu es l'assistant commercial de Dilamco, un fabricant québécois de contreplaqué sur mesure.

Ton rôle:
- Qualifier rapidement les prospects cherchant du contreplaqué technique.
- Poser des questions claires (utilisation, essence, épaisseur, dimensions, quantité, délai, livraison, budget).
- Répondre aux questions techniques en utilisant l'outil lookupKnowledge AVANT de donner des chiffres, des essences ou des certifications.
- Utiliser l'outil createLead dès que tu as un nom + un moyen de contact (courriel ou téléphone) + une description du projet.
- Si la personne veut parler à un humain ou que la demande sort de ton périmètre (ingénierie complexe, SAV, plainte), utiliser requestHuman.
- Pour une rétro-demande programmée, utiliser scheduleCallback.

Style: bref, concret, professionnel. Réponds en français par défaut, en anglais si la personne écrit en anglais.
Ne jamais inventer un prix, une certification, un délai ou une essence sans l'avoir vérifié via lookupKnowledge.`;

const DILAMCO_WELCOME = `Bonjour! Je suis l'assistant Dilamco. En quelques questions rapides, je peux vous proposer le bon contreplaqué ou vous mettre en relation avec un conseiller. Sur quel projet travaillez-vous?`;

const DILAMCO_QUALIFICATION_SCHEMA = {
  fields: [
    { key: "usage", label: "Utilisation prévue", type: "string", required: true },
    { key: "essence", label: "Essence souhaitée", type: "string", required: false },
    { key: "thicknessMm", label: "Épaisseur (mm)", type: "number", required: false },
    { key: "dimensions", label: "Dimensions des panneaux", type: "string", required: false },
    { key: "quantity", label: "Quantité (panneaux)", type: "number", required: false },
    { key: "deadline", label: "Date ou délai souhaité", type: "string", required: false },
    { key: "deliveryCity", label: "Ville de livraison", type: "string", required: false },
    { key: "budget", label: "Budget approximatif", type: "string", required: false },
  ],
} as const;

export async function seedDilamcoAgent() {
  const org = await db.organization.upsert({
    where: { id: DILAMCO_ORG_ID },
    update: { name: "Dilamco", slug: DILAMCO_ORG_SLUG },
    create: {
      id: DILAMCO_ORG_ID,
      name: "Dilamco",
      slug: DILAMCO_ORG_SLUG,
    },
  });

  const agent = await db.agent.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: DILAMCO_AGENT_SLUG,
      },
    },
    update: {
      name: "Assistant Dilamco — Contreplaqué",
      description:
        "Qualifie les demandes de contreplaqué sur mesure et transfère aux conseillers humains.",
      locale: "fr",
      modelId: "gemini-2.5-flash",
      toolsEnabled: [
        "createLead",
        "requestHuman",
        "lookupKnowledge",
        "scheduleCallback",
      ],
      qualificationSchema: DILAMCO_QUALIFICATION_SCHEMA,
      welcomeMessage: DILAMCO_WELCOME,
      active: true,
    },
    create: {
      organizationId: org.id,
      slug: DILAMCO_AGENT_SLUG,
      name: "Assistant Dilamco — Contreplaqué",
      description:
        "Qualifie les demandes de contreplaqué sur mesure et transfère aux conseillers humains.",
      locale: "fr",
      modelId: "gemini-2.5-flash",
      toolsEnabled: [
        "createLead",
        "requestHuman",
        "lookupKnowledge",
        "scheduleCallback",
      ],
      qualificationSchema: DILAMCO_QUALIFICATION_SCHEMA,
      welcomeMessage: DILAMCO_WELCOME,
      active: true,
    },
  });

  const existingVersion = await db.agentVersion.findFirst({
    where: { agentId: agent.id, version: 1 },
  });

  if (!existingVersion) {
    await db.agentVersion.create({
      data: {
        agentId: agent.id,
        version: 1,
        systemPrompt: DILAMCO_SYSTEM_PROMPT,
        notes: "Seed: initial Dilamco contreplaque prompt.",
        active: true,
      },
    });
  } else {
    await db.agentVersion.update({
      where: { id: existingVersion.id },
      data: {
        systemPrompt: DILAMCO_SYSTEM_PROMPT,
        active: true,
      },
    });
  }

  console.log(`[seed] Dilamco agent ready at /embed/${DILAMCO_ORG_SLUG}/${DILAMCO_AGENT_SLUG}`);
}
